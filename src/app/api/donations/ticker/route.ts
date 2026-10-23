import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatINR, formatTimeAgo } from '@/lib/utils';

export async function GET() {
  try {
    const settings = db.getSiteSettings();
    if (!settings.liveTickerEnabled) {
      return NextResponse.json({ enabled: false, events: [] });
    }

    const donations = db
      .getDonations({ status: 'succeeded' })
      .slice(0, 15);

    const events = donations.map((d) => {
      let displayName = 'Anonymous Donor';
      if (!d.isAnonymous && d.donorName) {
        const parts = d.donorName.trim().split(' ');
        if (parts.length > 1) {
          displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
        } else {
          displayName = parts[0];
        }
      }

      return {
        id: d.id,
        displayName,
        amountFormatted: formatINR(d.amount),
        campaignTitle: d.campaignTitle,
        campaignSlug: d.campaignSlug,
        timeAgo: formatTimeAgo(d.createdAt),
        isRecurring: d.isRecurring,
      };
    });

    return NextResponse.json({
      enabled: true,
      events,
      count: events.length,
    });
  } catch (error) {
    return NextResponse.json({ enabled: false, events: [] }, { status: 500 });
  }
}
