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
    const campaigns = db.getCampaigns({ status: 'active' });

    return NextResponse.json({
      success: true,
      curation,
      campaigns: campaigns.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        category: c.category,
        goalAmount: c.goalAmount,
        raisedAmount: c.raisedAmount,
        imageUrl: c.imageUrl,
        verifiedStatus: c.verifiedStatus,
        urgent: c.urgent,
        has80G: c.has80G,
      })),
    });
  } catch (error) {
    console.error('Error fetching homepage curation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'marketer', 'content_writer'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized to modify homepage placements' }, { status: 401 });
    }

    const body = await request.json();
    const { heroCampaignIds, featuredCampaignIds, monthlyMissionIds, urgentCampaignIds } = body;

    const updatedCuration = db.updateHomepageCuration(
      {
        heroCampaignIds: Array.isArray(heroCampaignIds) ? heroCampaignIds : undefined,
        featuredCampaignIds: Array.isArray(featuredCampaignIds) ? featuredCampaignIds : undefined,
        monthlyMissionIds: Array.isArray(monthlyMissionIds) ? monthlyMissionIds : undefined,
        urgentCampaignIds: Array.isArray(urgentCampaignIds) ? urgentCampaignIds : undefined,
      },
      session.name || 'Admin User'
    );

    try {
      revalidatePath('/');
      revalidatePath('/admin/homepage-curation');
    } catch (e) {
      console.warn('[HomepageCuration] Cache revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      curation: updatedCuration,
      message: 'Homepage campaign placements updated and published live.',
    });
  } catch (error) {
    console.error('Error updating homepage curation:', error);
    return NextResponse.json({ error: 'Failed to update homepage curation' }, { status: 500 });
  }
}
