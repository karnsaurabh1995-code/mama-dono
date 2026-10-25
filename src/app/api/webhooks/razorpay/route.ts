import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/payment/razorpay';

export async function POST(request: Request) {
  try {
    // 1. Read exact raw request text before JSON parsing
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const dbGateway = db.getDecryptedGateway('razorpay');
    const webhookSecret = dbGateway?.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    // 2. Strict Cryptographic Signature Gate
    if (isProduction) {
      if (!webhookSecret) {
        console.error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is not configured on production server.');
        return NextResponse.json({ error: 'Webhook secret not configured on server' }, { status: 500 });
      }
      if (!signature) {
        return NextResponse.json({ error: 'Missing X-Razorpay-Signature header' }, { status: 400 });
      }
      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
        webhookSecret,
      });
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    } else {
      // Non-production environment
      if (webhookSecret) {
        if (!signature) {
          return NextResponse.json({ error: 'Missing X-Razorpay-Signature header' }, { status: 400 });
        }
        const isValid = verifyWebhookSignature({
          rawBody,
          signature,
          webhookSecret,
        });
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
        }
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    // Construct unique event ID for deduplication
    const eventId =
      payload.id ||
      `${event}_${orderId || ''}_${paymentId || ''}_${payload.created_at || ''}`;

    // 3. Webhook Idempotency & Replay Resistance
    if (db.isWebhookEventProcessed(eventId)) {
      return NextResponse.json({
        received: true,
        duplicate: true,
        message: 'Webhook event was already processed (idempotent ignore)',
      });
    }

    // 4. Handle events
    if (event === 'payment.captured' || event === 'order.paid') {
      if (orderId && paymentId) {
        const donation = db.getDonations().find((d) => d.razorpayOrderId === orderId);
        if (donation) {
          db.verifyAndCompletePayment({
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: 'webhook_verified',
          });
        }
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

    // Mark event as processed in database idempotency ledger
    db.recordWebhookEvent(eventId);

    // Sanitized logging (no secret tokens or donor PAN cards)
    console.log(`[Razorpay Webhook] Successfully processed event: "${event}" for order: "${orderId || 'N/A'}"`);

    return NextResponse.json({ success: true, processedEvent: event });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error.message);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
