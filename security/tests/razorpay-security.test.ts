import assert from 'assert';
import crypto from 'crypto';
import { db } from '../../src/lib/db';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../../src/lib/payment/razorpay';
import { sanitizeHtml } from '../../src/lib/security/sanitize';

console.log('🧪 Starting Razorpay Payment Integrity & Security Regression Test Suite...\n');

const testSecret = 'rzp_test_secret_998877665544332211';
const testWebhookSecret = 'rzp_webhook_secret_aabbccddeeff1122';
const orderId = `order_test_${Date.now()}`;
const paymentId = `pay_test_${Date.now()}`;

// 1. Signature generation & verification
const validSignature = crypto
  .createHmac('sha256', testSecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

assert.strictEqual(
  verifyRazorpaySignature({
    orderId,
    paymentId,
    signature: validSignature,
    keySecret: testSecret,
  }),
  true,
  'Valid Razorpay signature must verify successfully'
);
console.log('✅ PASS 1: Valid signature correctly verified via HMAC-SHA256.');

// 2. Tampered signature rejection
const tamperedSig = validSignature.substring(0, 60) + 'ffff';
assert.strictEqual(
  verifyRazorpaySignature({
    orderId,
    paymentId,
    signature: tamperedSig,
    keySecret: testSecret,
  }),
  false,
  'Tampered signature must be rejected'
);
console.log('✅ PASS 2: Tampered cryptographic signature rejected.');

// 3. Tampered order ID rejection
assert.strictEqual(
  verifyRazorpaySignature({
    orderId: 'order_forged_123',
    paymentId,
    signature: validSignature,
    keySecret: testSecret,
  }),
  false,
  'Signature for mismatched order ID must be rejected'
);
console.log('✅ PASS 3: Mismatched / substituted order ID rejected.');

// 4. Webhook signature raw body verification
const webhookPayload = JSON.stringify({
  id: `evt_test_${Date.now()}`,
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: paymentId,
        order_id: orderId,
        amount: 50000,
        currency: 'INR',
        status: 'captured',
      },
    },
  },
});

const webhookSig = crypto
  .createHmac('sha256', testWebhookSecret)
  .update(webhookPayload)
  .digest('hex');

assert.strictEqual(
  verifyWebhookSignature({
    rawBody: webhookPayload,
    signature: webhookSig,
    webhookSecret: testWebhookSecret,
  }),
  true,
  'Valid raw body webhook signature must verify'
);
console.log('✅ PASS 4: Valid raw body webhook signature verified.');

// 5. Tampered webhook body rejection
assert.strictEqual(
  verifyWebhookSignature({
    rawBody: webhookPayload + ' ',
    signature: webhookSig,
    webhookSecret: testWebhookSecret,
  }),
  false,
  'Modified webhook payload must be rejected'
);
console.log('✅ PASS 5: Tampered webhook body rejected.');

// 6. Database payment completion idempotency test
const campaign = db.getCampaigns().find((c) => db.getCampaignItemNeeds(c.id).length > 0) || db.getCampaigns()[0];
const initialRaised = campaign.raisedAmount;
const initialSupporters = campaign.supporterCount;

const donation = db.createDonationOrder({
  campaignId: campaign.id,
  donorName: 'Regression Test Donor',
  donorEmail: 'test-idem@dokind.test',
  amount: 250,
  tipAmount: 25,
  paymentMethod: 'upi',
  isAnonymous: false,
});

// Complete payment 1st time
db.verifyAndCompletePayment({
  razorpayOrderId: donation.razorpayOrderId,
  razorpayPaymentId: `pay_idem_${Date.now()}`,
  razorpaySignature: 'sig_valid_test_hash',
});

const raisedAfterComplete = campaign.raisedAmount;

// Replay payment completion 2nd time
db.verifyAndCompletePayment({
  razorpayOrderId: donation.razorpayOrderId,
  razorpayPaymentId: `pay_idem_${Date.now()}`,
  razorpaySignature: 'sig_valid_test_hash',
});

assert.strictEqual(
  campaign.raisedAmount,
  raisedAfterComplete,
  'Idempotent payment completion must not double-credit campaign raisedAmount'
);
console.log('✅ PASS 6: Payment completion idempotency confirmed (no double-crediting).');

// 7. Payment amount & item price tampering prevention
const itemNeeds = db.getCampaignItemNeeds(campaign.id);
assert.ok(itemNeeds.length > 0, 'Campaign must have item needs for test');
const targetItem = itemNeeds[0];

let tamperingCaught = false;
try {
  // Attacker attempts to fund 2 items (worth 2 * targetItem.unitPrice) while paying only ₹50
  db.createDonationOrder({
    campaignId: campaign.id,
    donorName: 'Price Attacker',
    donorEmail: 'attacker-price@dokind.test',
    amount: 50,
    tipAmount: 0,
    paymentMethod: 'upi',
    isAnonymous: false,
    itemAllocations: [
      {
        itemId: targetItem.id,
        itemName: targetItem.name,
        unitPrice: 1, // Forged client unit price of ₹1
        quantity: 2,
      },
    ],
  });
} catch (err: any) {
  tamperingCaught = err.message.includes('less than the required item allocation cost');
}

assert.strictEqual(
  tamperingCaught,
  true,
  'Server must authoritatively reject donation amount lower than catalog item cost'
);
console.log('✅ PASS 7: Client-controlled price tampering successfully prevented.');

// 8. Valid item allocation order succeeds and derives unit prices strictly from catalog
const validItemDonation = db.createDonationOrder({
  campaignId: campaign.id,
  donorName: 'Legitimate Item Donor',
  donorEmail: 'item-donor@dokind.test',
  amount: targetItem.unitPrice * 2, // Exactly pays for 2 items
  tipAmount: 50,
  paymentMethod: 'upi',
  isAnonymous: false,
  itemAllocations: [
    {
      itemId: targetItem.id,
      itemName: 'Client Name (Should Be Overwritten)',
      unitPrice: 999999, // Should be replaced with targetItem.unitPrice
      quantity: 2,
    },
  ],
});

assert.strictEqual(
  validItemDonation.itemAllocations?.[0].unitPrice,
  targetItem.unitPrice,
  'Item unit price must be derived authoritatively from database catalog'
);
assert.strictEqual(
  validItemDonation.itemAllocations?.[0].itemName,
  targetItem.name,
  'Item name must be derived authoritatively from database catalog'
);
console.log('✅ PASS 8: Valid item donation correctly derives authoritative catalog price and details.');

// 9. Webhook event deduplication
const testEventId = `evt_dedup_${Date.now()}`;
assert.strictEqual(
  db.isWebhookEventProcessed(testEventId),
  false,
  'New event ID should not be marked as processed'
);
db.recordWebhookEvent(testEventId);
assert.strictEqual(
  db.isWebhookEventProcessed(testEventId),
  true,
  'Recorded event ID must be identified as processed (replay prevention)'
);
console.log('✅ PASS 9: Webhook event deduplication ledger verified.');

// 10. Role-based refund authorization: Unauthorized role rejection
// First mark donation succeeded so it is in a refundable state
db.verifyAndCompletePayment({
  razorpayOrderId: validItemDonation.razorpayOrderId,
  razorpayPaymentId: `pay_refund_test_${Date.now()}`,
  razorpaySignature: 'sig_valid_hash',
});

let unauthorizedRefundBlocked = false;
try {
  db.processRefund(
    validItemDonation.id,
    'Attempt unauthorized refund',
    { id: 'user-donor-1', name: 'Random Donor', role: 'donor' }
  );
} catch (err: any) {
  unauthorizedRefundBlocked = err.message.includes('Unauthorized');
}
assert.strictEqual(
  unauthorizedRefundBlocked,
  true,
  'Donors and non-finance roles must be rejected from initiating refunds'
);
console.log('✅ PASS 10: Unauthorized role refund attempt strictly rejected.');

// 11. Role-based refund authorization: Authorized finance role execution
const raisedBeforeRefund = campaign.raisedAmount;

const refundedRecord = db.processRefund(
  validItemDonation.id,
  'Customer requested refund within 24h window',
  { id: 'user-finance-1', name: 'Anand Kulkarni', role: 'finance' }
);
assert.strictEqual(refundedRecord.status, 'refunded', 'Donation must be marked refunded');
assert.strictEqual(
  campaign.raisedAmount,
  raisedBeforeRefund - validItemDonation.amount,
  'Campaign balance must be reversed in ledger'
);
console.log('✅ PASS 11: Authorized finance officer refund executed and ledger reversed.');

// 12. HTML Sanitization security tests
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '<a href="javascript:alert(1)">Click Me</a>',
  '<iframe src="https://evil.com"></iframe>',
];

for (const payload of xssPayloads) {
  const sanitized = sanitizeHtml(payload);
  assert.strictEqual(
    sanitized.includes('<script>'),
    false,
    `Sanitizer must remove script tags: ${sanitized}`
  );
  assert.strictEqual(
    sanitized.includes('onerror='),
    false,
    `Sanitizer must remove onerror handlers: ${sanitized}`
  );
  assert.strictEqual(
    sanitized.includes('javascript:'),
    false,
    `Sanitizer must block javascript pseudo-protocol: ${sanitized}`
  );
  assert.strictEqual(
    sanitized.includes('<iframe'),
    false,
    `Sanitizer must remove iframes: ${sanitized}`
  );
}
console.log('✅ PASS 12: HTML sanitizer effectively neutralizes script injection, event handlers, and dangerous URIs.');

// Cleanup test fixtures
campaign.raisedAmount = initialRaised;
campaign.supporterCount = initialSupporters;
(db as any).donations = (db as any).donations.filter(
  (d: any) =>
    !d.donorEmail.includes('@dokind.test') &&
    d.donorEmail !== 'test-idem@dokind.test' &&
    d.id !== validItemDonation.id &&
    d.id !== donation.id
);

console.log('\n🎉 ALL 12 SECURITY INTEGRITY & REGRESSION TESTS PASSED CLEANLY!\n');
