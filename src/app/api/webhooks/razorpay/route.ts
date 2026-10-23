import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/payment/razorpay';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
        webhookSecret,
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ received: true });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    if (event === 'payment.captured' || event === 'order.paid') {
      if (orderId && paymentId) {
        db.verifyAndCompletePayment({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: 'webhook_verified',
        });
      }
    } else if (event === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity;
      if (refundEntity && refundEntity.payment_id) {
        const donation = db.getDonations().find((d) => d.razorpayPaymentId === refundEntity.payment_id);
        if (donation && donation.status === 'succeeded') {
          db.processRefund(donation.id, 'Refund processed via Razorpay Webhook', 'Razorpay Webhook');
        }
      }
    }

    return NextResponse.json({ success: true, processedEvent: event });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
