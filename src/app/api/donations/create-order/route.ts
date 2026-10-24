import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      campaignId,
      amount,
      tipAmount = 0,
      donorName,
      donorEmail,
      donorPhone,
      donorPan,
      isAnonymous = false,
      paymentMethod = 'upi',
      isRecurring = false,
      message,
      itemAllocations,
      dokindContributionPercent,
      dokindContributionAmount,
      platformFeePercent,
    } = body;

    // Server-side validation
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 50) {
      return NextResponse.json(
        { error: 'Minimum donation amount is ₹50' },
        { status: 400 }
      );
    }
    if (!donorEmail || !donorEmail.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required for receipts and verification' },
        { status: 400 }
      );
    }

    const campaign = db.getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: `This campaign is currently ${campaign.status} and cannot accept donations.` },
        { status: 400 }
      );
    }

    // Create database donation order
    const donation = db.createDonationOrder({
      campaignId,
      donorName: donorName || (isAnonymous ? 'Generous Donor' : 'Well Wisher'),
      donorEmail,
      donorPhone,
      donorPan,
      isAnonymous,
      amount: numAmount,
      tipAmount: Number(tipAmount) || 0,
      paymentMethod,
      isRecurring: Boolean(isRecurring),
      message,
      itemAllocations,
      dokindContributionPercent: dokindContributionPercent !== undefined ? Number(dokindContributionPercent) : undefined,
      dokindContributionAmount: dokindContributionAmount !== undefined ? Number(dokindContributionAmount) : undefined,
      platformFeePercent: platformFeePercent !== undefined ? Number(platformFeePercent) : undefined,
    });

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SevaSetu2026';
    const isLiveGatewayConfigured = Boolean(
      process.env.RAZORPAY_KEY_SECRET && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    );

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      orderId: donation.razorpayOrderId,
      amount: donation.amount,
      grossAmount: donation.grossAmount,
      platformFeeAmount: donation.platformFeeAmount,
      platformFeePercent: donation.platformFeePercent,
      netCampaignAmount: donation.netCampaignAmount,
      dokindContributionAmount: donation.dokindContributionAmount,
      dokindContributionPercent: donation.dokindContributionPercent,
      tipAmount: donation.tipAmount,
      totalAmount: donation.totalAmount,
      currency: donation.currency,
      receiptNumber: donation.receiptNumber,
      isTestMode: !isLiveGatewayConfigured,
      razorpayKeyId,
      campaignTitle: campaign.title,
    });
  } catch (error: any) {
    console.error('Error creating donation order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize donation order' },
      { status: 500 }
    );
  }
}
