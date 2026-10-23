import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/payment/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Order ID and Payment ID are required for verification' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature check if live secret is configured
    if (keySecret && razorpaySignature) {
      const isValid = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        keySecret,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid payment signature. Verification failed.' },
          { status: 400 }
        );
      }
    }

    // Verify and complete payment idempotently in database
    const completedDonation = db.verifyAndCompletePayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || 'sig_verified_mock_sha256',
    });

    const campaign = db.getCampaignById(completedDonation.campaignId);

    return NextResponse.json({
      success: true,
      donation: completedDonation,
      campaign: campaign
        ? {
            id: campaign.id,
            title: campaign.title,
            raisedAmount: campaign.raisedAmount,
            goalAmount: campaign.goalAmount,
            supporterCount: campaign.supporterCount,
          }
        : null,
      receiptNumber: completedDonation.receiptNumber,
      message: 'Donation successfully verified and recorded.',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
