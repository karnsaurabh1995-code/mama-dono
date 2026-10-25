import { db } from '../src/lib/db';
import { formatINR, formatINRCompact, isValidPAN, calculatePercentage, maskContact } from '../src/lib/utils';
import { verifyRazorpaySignature } from '../src/lib/payment/razorpay';
import crypto from 'crypto';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log('================================================================');
console.log('SEVASETU PLATFORM — COMPREHENSIVE VERIFICATION & TEST SUITE');
console.log('================================================================\n');

// 1. Indian Currency Formatter Tests
console.log('--- 1. Testing Indian Currency & Number Formatting ---');
assert(formatINR(500).includes('500'), '₹500 correctly formatted');
assert(formatINR(150000).replace(/\s/g, '').includes('1,50,000'), '₹1,50,000 Indian comma system');
assert(formatINRCompact(150000) === '₹1.5 L', 'Format 1.5 Lakhs compact');
assert(formatINRCompact(25000000) === '₹2.5 Cr', 'Format 2.5 Crores compact');

// 2. PAN Validation Tests
console.log('\n--- 2. Testing Section 80G Indian PAN Validation ---');
assert(isValidPAN('ABCDE1234F') === true, 'Valid 10-char PAN accepted');
assert(isValidPAN('abcde1234f') === true, 'Lowercase valid PAN accepted');
assert(isValidPAN('ABCDE12345') === false, 'Invalid PAN ending in digit rejected');
assert(isValidPAN('12345ABCDE') === false, 'Invalid PAN starting with digits rejected');
assert(isValidPAN('') === false, 'Empty PAN rejected');

// 3. Campaign Moderation Lifecycle
console.log('\n--- 3. Testing Campaign Lifecycle & Moderation ---');
const newCamp = db.createCampaign({
  slug: 'test-emergency-pediatric-surgery',
  title: 'Test Pediatric Cardiac Surgery',
  shortDescription: 'Testing emergency cardiac support',
  story: 'Full story test',
  category: 'medical',
  campaignType: 'one-time',
  goalAmount: 500000,
  featured: false,
  urgent: true,
  status: 'submitted',
  verifiedStatus: 'pending',
  has80G: true,
  imageUrl: 'https://example.com/test.jpg',
  beneficiaryName: 'Master Devendra',
  beneficiaryLocation: 'AIIMS New Delhi',
  organizerName: 'Ramesh Devendra',
  organizerRole: 'individual',
  organizerId: 'user-test-1',
  itemizedBudget: [{ id: '1', item: 'Valve Repair', amount: 500000 }],
  useOfFunds: 'Direct AIIMS patient welfare account',
});

assert(newCamp.status === 'submitted', 'Campaign initial status is submitted');
assert(newCamp.raisedAmount === 0, 'Initial raised amount is 0');

// Approve campaign
const approvedCamp = db.updateCampaign(newCamp.id, { status: 'active', verifiedStatus: 'verified' });
assert(approvedCamp?.status === 'active', 'Campaign successfully approved and set active');

// Pause campaign
const pausedCamp = db.updateCampaign(newCamp.id, { status: 'paused' });
assert(pausedCamp?.status === 'paused', 'Campaign successfully paused');

// Unpause
db.updateCampaign(newCamp.id, { status: 'active' });

// 4. Donation Checkout & Order Creation
console.log('\n--- 4. Testing Donation Order Creation & Input Validation ---');
const donationOrder = db.createDonationOrder({
  campaignId: newCamp.id,
  donorName: 'Radha Sharma',
  donorEmail: 'radha.sharma@example.com',
  donorPan: 'ABCDE1234F',
  isAnonymous: false,
  amount: 10000,
  tipAmount: 500,
  paymentMethod: 'upi',
  isRecurring: false,
  message: 'God bless the child',
});

assert(donationOrder.status === 'pending', 'Order created in pending state');
assert(donationOrder.totalAmount === 10500, 'Total amount calculates amount + tip');
assert(donationOrder.taxExemption80G === true, '80G tax exemption active with PAN');
assert(donationOrder.receiptNumber.startsWith('SEVA-80G-'), 'Generated Form 10BE receipt number');

// 5. Cryptographic Razorpay Signature Verification
console.log('\n--- 5. Testing Cryptographic Razorpay HMAC Signature Verification ---');
const testOrderId = donationOrder.razorpayOrderId;
const testPaymentId = 'pay_test_secret_999';
const mockSecret = process.env.TEST_RAZORPAY_SECRET || 'test_local_mock_key';

const expectedSig = crypto
  .createHmac('sha256', mockSecret)
  .update(`${testOrderId}|${testPaymentId}`)
  .digest('hex');

assert(
  verifyRazorpaySignature({
    orderId: testOrderId,
    paymentId: testPaymentId,
    signature: expectedSig,
    keySecret: mockSecret,
  }) === true,
  'Valid HMAC SHA256 payment signature verified successfully'
);

assert(
  verifyRazorpaySignature({
    orderId: testOrderId,
    paymentId: testPaymentId,
    signature: 'forged_fake_signature_hex',
    keySecret: mockSecret,
  }) === false,
  'Tampered or forged signature rejected'
);

// 6. Payment Completion, Idempotency & Campaign Total Recalculation
console.log('\n--- 6. Testing Payment Completion, Idempotency & Campaign Totals ---');
const campBefore = db.getCampaignById(newCamp.id);
const raisedBefore = campBefore?.raisedAmount || 0;
const supportersBefore = campBefore?.supporterCount || 0;

// Verify and mark paid
const paidDonation = db.verifyAndCompletePayment({
  razorpayOrderId: donationOrder.razorpayOrderId,
  razorpayPaymentId: testPaymentId,
  razorpaySignature: expectedSig,
});

assert(paidDonation.status === 'succeeded', 'Donation marked as succeeded');

const campAfter = db.getCampaignById(newCamp.id);
assert(campAfter?.raisedAmount === raisedBefore + 10000, 'Campaign raised amount correctly incremented by ₹10,000');
assert(campAfter?.supporterCount === supportersBefore + 1, 'Campaign supporter count incremented by 1');

// Test Idempotency (calling verify again with same order ID MUST NOT increment campaign total)
db.verifyAndCompletePayment({
  razorpayOrderId: donationOrder.razorpayOrderId,
  razorpayPaymentId: testPaymentId,
  razorpaySignature: expectedSig,
});

const campAfterDuplicate = db.getCampaignById(newCamp.id);
assert(
  campAfterDuplicate?.raisedAmount === campAfter?.raisedAmount,
  'Idempotent duplicate webhook does not double-count funds'
);
assert(
  campAfterDuplicate?.supporterCount === campAfter?.supporterCount,
  'Idempotent duplicate webhook does not double-count supporters'
);

// 7. Refund & Reversal Accounting
console.log('\n--- 7. Testing Refund Processing & Balance Reversal ---');
db.processRefund(paidDonation.id, 'Duplicate payment requested by donor');
const campAfterRefund = db.getCampaignById(newCamp.id);
assert(
  campAfterRefund?.raisedAmount === raisedBefore,
  'Refunded donation accurately reversed from campaign total'
);
assert(
  campAfterRefund?.supporterCount === supportersBefore,
  'Refunded donation accurately reversed from campaign supporter count'
);

// 8. Recurring Monthly Mandate Lifecycle
console.log('\n--- 8. Testing Recurring Monthly Giving Lifecycle ---');
const recurringOrder = db.createDonationOrder({
  campaignId: newCamp.id,
  donorName: 'Sanjay Dutt',
  donorEmail: 'sanjay.dutt@example.com',
  isAnonymous: false,
  amount: 1500,
  tipAmount: 0,
  paymentMethod: 'upi',
  isRecurring: true,
});

db.verifyAndCompletePayment({
  razorpayOrderId: recurringOrder.razorpayOrderId,
  razorpayPaymentId: 'pay_rec_001',
});

const activePlans = db.getRecurringPlans('sanjay.dutt@example.com');
assert(activePlans.length >= 1, 'Recurring plan activated for monthly donor');
assert(activePlans[0].status === 'active', 'Plan status is active');

// Cancel plan
db.cancelRecurringPlan(activePlans[0].id, 'sanjay.dutt@example.com');
const cancelledPlan = db.getRecurringPlans('sanjay.dutt@example.com')[0];
assert(cancelledPlan.status === 'cancelled', 'Recurring plan successfully cancelled by donor');

// 9. Organization Verification
console.log('\n--- 9. Testing NGO Darpan & 80G Verification Queue ---');
const newOrg = db.createOrganization({
  name: 'Seva Shakti Trust',
  slug: 'seva-shakti-trust',
  tagline: 'Healthcare for slum children',
  description: 'Operating medical dispensaries in eastern UP.',
  logoUrl: 'https://example.com/logo.jpg',
  coverUrl: 'https://example.com/cover.jpg',
  website: 'https://sevashakti.org',
  darpanId: 'UP/2021/0291039',
  panNumber: 'AABTS1122K',
  fcraRegistered: false,
  verificationStatus: 'pending',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  foundedYear: 2019,
  causes: ['medical', 'children'],
});

assert(newOrg.verificationStatus === 'pending', 'New NGO created with pending status');
db.updateOrganizationVerification(newOrg.id, 'verified');
const verifiedOrg = db.getOrganizationBySlug(newOrg.slug);
assert(verifiedOrg?.verificationStatus === 'verified', 'NGO successfully verified with Darpan credentials');

// 10. Audit Logging Ledger
console.log('\n--- 10. Testing Administrative Audit Trail ---');
const logs = db.getAuditLogs();
assert(logs.length >= 5, 'Comprehensive audit entries recorded for all administrative actions');

console.log('\n================================================================');
console.log(`ALL TESTS PASSED! (${passedTests} / ${totalTests} assertions passed)`);
console.log('================================================================\n');
