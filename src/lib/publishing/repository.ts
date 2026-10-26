import { PageSection, PageVersion } from '@/lib/types';
import { db } from '@/lib/db';
import { getServerSupabaseClient } from '@/lib/supabase/server';
import { getInitialSectionsForSlug } from '@/lib/data/builder-sections';

export interface IPublishingRepository {
  getDraftSections(slug: string): Promise<PageSection[]>;
  getPublishedSections(slug: string): Promise<PageSection[]>;
  saveDraft(slug: string, sections: PageSection[], actorName?: string): Promise<PageSection[]>;
  publish(slug: string, sections?: PageSection[], actorName?: string): Promise<{ version: number; publishedSections: PageSection[] }>;
  getVersions(slug: string): Promise<PageVersion[]>;
  restoreVersion(slug: string, versionNumber: number, actorName?: string): Promise<PageSection[]>;
  resetToDefault(slug: string, actorName?: string): Promise<PageSection[]>;
}

class PublishingRepositoryImpl implements IPublishingRepository {
  async getDraftSections(slug: string): Promise<PageSection[]> {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('page_drafts')
          .select('sections')
          .eq('page_slug', slug)
          .maybeSingle();

        if (!error && data && Array.isArray(data.sections) && data.sections.length > 0) {
          return [...data.sections].sort((a: PageSection, b: PageSection) => a.order - b.order);
        }
      } catch (err) {
        console.warn(`[PublishingRepo] Supabase getDraftSections fallback for "${slug}":`, err);
      }
    }

    // Authoritative fallback: Local DatabaseStore with auto-disk sync
    return db.getPageSections(slug);
  }

  async getPublishedSections(slug: string): Promise<PageSection[]> {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('page_published_versions')
          .select('sections, version_number')
          .eq('page_slug', slug)
          .eq('is_active', true)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data && Array.isArray(data.sections) && data.sections.length > 0) {
          return [...data.sections].sort((a: PageSection, b: PageSection) => a.order - b.order);
        }
      } catch (err) {
        console.warn(`[PublishingRepo] Supabase getPublishedSections fallback for "${slug}":`, err);
      }
    }

    // Authoritative fallback: Local DatabaseStore with auto-disk sync
    return db.getPublishedPageSections(slug);
  }

  async saveDraft(slug: string, sections: PageSection[], actorName = 'Admin'): Promise<PageSection[]> {
    const cleanSections = sections.map((s, idx) => ({ ...s, order: idx }));

    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('page_drafts').upsert(
          {
            page_slug: slug,
            sections: cleanSections,
            updated_at: new Date().toISOString(),
            updated_by: actorName,
          },
          { onConflict: 'page_slug' }
        );

        if (error) {
          console.error('[PublishingRepo] Supabase saveDraft error:', error);
          throw new Error(`Failed to persist draft in shared storage: ${error.message}`);
        }
      } catch (err: any) {
        if (!err.message?.includes('Failed to persist draft')) {
          console.error('[PublishingRepo] Supabase saveDraft exception:', err);
        }
        throw err;
      }
    }

    // Always mirror to and persist in DatabaseStore
    const result = db.updatePageSections(slug, cleanSections, actorName);
    return result;
  }

  async publish(
    slug: string,
    sections?: PageSection[],
    actorName = 'Admin'
  ): Promise<{ version: number; publishedSections: PageSection[] }> {
    let cleanSectionsToPublish: PageSection[];

    if (Array.isArray(sections) && sections.length > 0) {
      cleanSectionsToPublish = sections.map((s, idx) => ({ ...s, order: idx }));
      // Save draft first
      await this.saveDraft(slug, cleanSectionsToPublish, actorName);
    } else {
      cleanSectionsToPublish = await this.getDraftSections(slug);
    }

    const supabase = getServerSupabaseClient();
    let assignedVersion = 1;

    if (supabase) {
      try {
        // 1. Fetch latest version number
        const { data: latestData } = await supabase
          .from('page_published_versions')
          .select('version_number')
          .eq('page_slug', slug)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        assignedVersion = latestData ? latestData.version_number + 1 : 1;

        // 2. Set existing active versions to false
        await supabase
          .from('page_published_versions')
          .update({ is_active: false })
          .eq('page_slug', slug)
          .eq('is_active', true);

        // 3. Insert new active published snapshot
        const { error: insertErr } = await supabase.from('page_published_versions').insert({
          page_slug: slug,
          version_number: assignedVersion,
          sections: cleanSectionsToPublish,
          is_active: true,
          published_at: new Date().toISOString(),
          published_by: actorName,
        });

        if (insertErr) {
          throw new Error(`Supabase publish insertion failed: ${insertErr.message}`);
        }

        // 4. Update page_drafts to match
        await supabase.from('page_drafts').upsert({
          page_slug: slug,
          sections: cleanSectionsToPublish,
          updated_at: new Date().toISOString(),
          updated_by: actorName,
        });
      } catch (supabaseErr: any) {
        console.error('[PublishingRepo] Supabase publish failed:', supabaseErr);
        throw new Error(`Durable cloud publish failed: ${supabaseErr.message}`);
      }
    }

    // Always mirror to and atomically commit in DatabaseStore
    const dbPublishRes = db.publishPageSections(slug, actorName);
    const finalVersion = supabase ? assignedVersion : dbPublishRes.version;

    // Read back to authoritatively verify committed state
    const verifiedPublished = await this.getPublishedSections(slug);
    if (!verifiedPublished || verifiedPublished.length === 0) {
      throw new Error('Committed published sections could not be read back from storage.');
    }

    return {
      version: finalVersion,
      publishedSections: verifiedPublished,
    };
  }

  async getVersions(slug: string): Promise<PageVersion[]> {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('page_published_versions')
          .select('id, page_slug, version_number, sections, published_at, published_by')
          .eq('page_slug', slug)
          .order('version_number', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((v) => ({
            id: v.id,
            pageSlug: v.page_slug,
            versionNumber: v.version_number,
            publishedAt: v.published_at,
            publishedBy: v.published_by,
            sections: v.sections,
          }));
        }
      } catch (err) {
        console.warn(`[PublishingRepo] Supabase getVersions fallback for "${slug}":`, err);
      }
    }

    return db.getPageVersions(slug);
  }

  async restoreVersion(slug: string, versionNumber: number, actorName = 'Admin'): Promise<PageSection[]> {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        // Find historical version snapshot
        const { data: targetVer, error } = await supabase
          .from('page_published_versions')
          .select('sections')
          .eq('page_slug', slug)
          .eq('version_number', versionNumber)
          .maybeSingle();

        if (error || !targetVer || !targetVer.sections) {
          throw new Error(`Version #${versionNumber} not found for page "${slug}".`);
        }

        // Publish target snapshot as a new version
        const { publishedSections } = await this.publish(slug, targetVer.sections, actorName);
        return publishedSections;
      } catch (err: any) {
        console.error('[PublishingRepo] Supabase restoreVersion error:', err);
        throw err;
      }
    }

    // Fallback: DatabaseStore
    const restored = db.restorePageVersion(slug, versionNumber, actorName);
    // Publish the restored version to make it active
    db.publishPageSections(slug, actorName);
    return restored;
  }

  async resetToDefault(slug: string, actorName = 'Admin'): Promise<PageSection[]> {
    const defaults = getInitialSectionsForSlug(slug);
    await this.saveDraft(slug, defaults, actorName);
    db.resetPageSectionsToDefault(slug, actorName);
    return defaults;
  }
}

export const publishingRepo = new PublishingRepositoryImpl();
