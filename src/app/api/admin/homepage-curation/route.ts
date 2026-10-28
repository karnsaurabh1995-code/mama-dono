import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'marketer', 'content_writer', 'campaign_manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const curation = db.getHomepageCuration();
    const campaigns = db.getCampaigns();
    const monthlyMissions = db.getMonthlyMissions();
    const causes = db.getCauses();
    const tags = db.getTags();

    return NextResponse.json({
      success: true,
      curation,
      campaigns: campaigns.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        category: c.category,
        primaryCategory: c.primaryCategory || c.category,
        tags: c.tags || [],
        goalAmount: c.goalAmount,
        raisedAmount: c.raisedAmount,
        imageUrl: c.imageUrl,
        verifiedStatus: c.verifiedStatus,
        status: c.status,
        urgent: c.urgent,
        has80G: c.has80G,
      })),
      monthlyMissions,
      causes,
      tags,
    });
  } catch (error) {
    console.error('Error fetching homepage curation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'marketer', 'content_writer', 'campaign_manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized to modify homepage placements' }, { status: 401 });
    }

    const body = await request.json();
    const { heroCampaignIds, featuredCampaignIds, monthlyMissionIds, urgentCampaignIds } = body;

    // Validate that campaigns exist and are eligible
    const allCampaigns = db.getCampaigns();
    const allMissions = db.getMonthlyMissions();

    const validateIds = (ids: unknown, allowMissions = false): string[] => {
      if (!Array.isArray(ids)) return [];
      const cleanIds: string[] = [];
      for (const id of ids) {
        if (typeof id !== 'string') continue;
        const clean = id.trim();
        if (!clean) continue;
        if (allowMissions) {
          const missionExists = allMissions.some((m) => m.id === clean || m.slug === clean);
          if (missionExists && !cleanIds.includes(clean)) {
            cleanIds.push(clean);
            continue;
          }
        }
        const camp = allCampaigns.find((c) => c.id === clean || c.slug === clean);
        if (camp && !cleanIds.includes(camp.id)) {
          cleanIds.push(camp.id);
        }
      }
      return cleanIds;
    };

    const validatedHero = heroCampaignIds !== undefined ? validateIds(heroCampaignIds) : undefined;
    const validatedFeatured = featuredCampaignIds !== undefined ? validateIds(featuredCampaignIds) : undefined;
    const validatedMonthly = monthlyMissionIds !== undefined ? validateIds(monthlyMissionIds, true) : undefined;
    const validatedUrgent = urgentCampaignIds !== undefined ? validateIds(urgentCampaignIds) : undefined;

    const updatedCuration = db.updateHomepageCuration(
      {
        heroCampaignIds: validatedHero,
        featuredCampaignIds: validatedFeatured,
        monthlyMissionIds: validatedMonthly,
        urgentCampaignIds: validatedUrgent,
      },
      session.name || 'Admin User'
    );

    try {
      revalidatePath('/');
      revalidatePath('/monthly-giving');
      revalidatePath('/admin/homepage-curation');
      revalidatePath('/admin/campaigns');
    } catch (e) {
      console.warn('[HomepageCuration] Cache revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      curation: updatedCuration,
      message: 'Homepage campaign placements updated and published live.',
    });
  } catch (error: any) {
    console.error('Error updating homepage curation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update homepage curation' }, { status: 500 });
  }
}
