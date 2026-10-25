import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/payment/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // Fail closed: Order ID and Payment ID are mandatory
    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Order ID and Payment ID are required for verification' },
        { status: 400 }
      );
    }

    // 1. Authoritative server-side order lookup
    const pendingDonation = db.getDonations().find((d) => d.razorpayOrderId === razorpayOrderId);
    if (!pendingDonation) {
      return NextResponse.json(
        { error: `Donation order ${razorpayOrderId} not found in database records.` },
        { status: 404 }
      );
    }

    // 2. Webhook / client idempotency: if already completed, return existing record
    if (pendingDonation.status === 'succeeded') {
      const campaign = db.getCampaignById(pendingDonation.campaignId);
      return NextResponse.json({
        success: true,
        donation: pendingDonation,
        campaign: campaign
          ? {
              id: campaign.id,
              title: campaign.title,
              raisedAmount: campaign.raisedAmount,
              goalAmount: campaign.goalAmount,
              supporterCount: campaign.supporterCount,
            }
          : null,
        receiptNumber: pendingDonation.receiptNumber,
        message: 'Donation was already verified and recorded.',
      });
    }

    // 3. Confirm valid initial transaction state
    if (pendingDonation.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot verify donation with non-pending status: "${pendingDonation.status}"` },
        { status: 400 }
      );
    }

    // 4. Strict Cryptographic Signature Gate
    const isProduction = process.env.NODE_ENV === 'production';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (isProduction) {
      // Production mode: Key secret MUST be configured
      if (!keySecret) {
        console.error('CRITICAL GATEWAY ERROR: RAZORPAY_KEY_SECRET is missing in production environment.');
        return NextResponse.json(
          { error: 'Payment gateway configuration error. Verification failed.' },
          { status: 500 }
        );
      }

      // Production mode: Signature is strictly mandatory
      if (!razorpaySignature) {
        return NextResponse.json(
          { error: 'Cryptographic payment signature is strictly required in production.' },
          { status: 400 }
        );
      }

      // Verify HMAC-SHA256 signature
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
    } else {
      // Non-production / test mode
      if (keySecret) {
        // When secret is configured, require and verify signature
        if (!razorpaySignature) {
          return NextResponse.json(
            { error: 'Cryptographic payment signature is required when gateway secret is configured.' },
            { status: 400 }
          );
        }

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
    }

    // 5. Verify and complete payment idempotently in database
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
