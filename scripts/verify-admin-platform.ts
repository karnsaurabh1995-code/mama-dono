import { db } from '../src/lib/db';
import { formatINR, formatINRCompact } from '../src/lib/utils';
import { PageSection } from '../src/lib/types';

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
console.log('SEVASETU PLATFORM — ADMIN DASHBOARD & BUILDER VERIFICATION');
console.log('================================================================\n');

// 1. Database Store & Admin Metrics
console.log('--- 1. Testing Financial Accounting & Ledger Metrics ---');
const metrics = db.getAdminMetrics();
assert(typeof metrics.grossSuccessfulAmount === 'number', 'Gross successful amount calculated');
assert(metrics.netRecognizedAmount === metrics.grossSuccessfulAmount - metrics.totalRefundedAmount, 'Net recognized follows accounting formula: Gross - Refunds');
assert(metrics.totalSuccessfulCount > 0, 'Successful donations count positive');
assert(metrics.averageDonationAmount > 0, 'Average donation amount calculated');
assert(metrics.trafficSources.length === 5, 'Traffic sources and UTM conversion funnels loaded');

// 2. Universal Website Builder
console.log('\n--- 2. Testing Universal Website Builder Engine ---');
const homeSections = db.getPageSections('home');
assert(homeSections.length >= 8, 'Default homepage sections loaded');
assert(homeSections[0].type === 'hero', 'First section is hero banner');

// Add a test section
const testSection: PageSection = {
  id: 'sec-test-banner',
  pageSlug: 'home',
  type: 'cta_box',
  title: 'Test CSR Support Banner',
  order: homeSections.length,
  isVisible: true,
  settings: { bgColor: '#FAF9F6', padding: 'normal' },
};
const updatedSections = db.updatePageSections('home', [...homeSections, testSection], 'Test Suite');
assert(updatedSections.length === homeSections.length + 1, 'New section added to draft');

// Publish version
const pubResult = db.publishPageSections('home', 'Test Suite');
assert(pubResult.success === true, 'Page published cleanly');
assert(pubResult.version >= 2, 'Version incremented in history');

// Restore version 1
const restored = db.restorePageVersion('home', 1, 'Test Suite');
assert(restored.length === homeSections.length, 'Version 1 restored with original section count');

// 3. Theme & Appearance Manager
console.log('\n--- 3. Testing Theme & Global Design Tokens ---');
const initialTheme = db.getThemeConfig();
assert(initialTheme.primaryColor === '#E84B45', 'Initial primary color is brand vermilion');

db.updateThemeConfig({ primaryColor: '#D93832' }, 'Theme Admin');
assert(db.getThemeConfig().primaryColor === '#D93832', 'Theme primary color updated to custom shade');

db.resetThemeConfig('Theme Admin');
assert(db.getThemeConfig().primaryColor === '#E84B45', 'Theme reset back to factory defaults');

// 4. Media Library
console.log('\n--- 4. Testing Media Library & Asset Storage ---');
const initialMedia = db.getMediaItems();
assert(initialMedia.length >= 6, 'Initial media assets loaded');

const newAsset = db.addMediaItem({
  title: 'Test Hospital Estimation Slip',
  url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982',
  filename: 'test-estimate.jpg',
  fileType: 'image',
  mimeType: 'image/jpeg',
  fileSizeKB: 210,
  altText: 'Test medical estimate letter',
  tags: ['test', 'medical'],
  usedIn: [],
}, 'Test Operator');

assert(db.getMediaItemById(newAsset.id) !== undefined, 'New media asset retrieved by ID');
assert(db.deleteMediaItem(newAsset.id, 'Test Operator') === true, 'Media asset cleanly deleted');

// 5. Campaign Moderation, Pause & Rejection
console.log('\n--- 5. Testing Campaign Control & Donation Ingestion Guard ---');
const activeCampaign = db.getCampaigns({ status: 'active' })[0];
assert(activeCampaign !== undefined, 'Found active campaign');

// Pause campaign
db.updateCampaign(activeCampaign.id, { status: 'paused' }, 'Ops Admin');
const pausedCamp = db.getCampaignById(activeCampaign.id);
assert(pausedCamp?.status === 'paused', 'Campaign status updated to paused');

// Verify that creating a donation order against paused campaign throws error
let threwOnPaused = false;
try {
  db.createDonationOrder({
    campaignId: activeCampaign.id,
    donorName: 'Test Donor',
    donorEmail: 'test@example.com',
    amount: 1000,
    tipAmount: 0,
    isAnonymous: false,
    paymentMethod: 'upi',
  });
} catch (err: any) {
  threwOnPaused = true;
  assert(err.message.includes('paused'), 'Donation order rejected when campaign is paused');
}
assert(threwOnPaused, 'Enforced donation stoppage on paused campaign');

// Resume campaign
db.updateCampaign(activeCampaign.id, { status: 'active' }, 'Ops Admin');
assert(db.getCampaignById(activeCampaign.id)?.status === 'active', 'Campaign resumed to active');

// 6. Payment Gateways & Webhooks
console.log('\n--- 6. Testing Payment Gateways & Webhook Simulator ---');
const gateways = db.getGateways();
assert(gateways.length === 4, '4 gateway adapters loaded (Razorpay, Stripe, Cashfree, Wire)');
const rzp = db.getGatewayById('razorpay');
assert(rzp?.isEnabled === true, 'Razorpay gateway enabled');

const simRes = db.simulateGatewayWebhook('razorpay', 'payment.captured', { test: true });
assert(simRes.success === true, 'Simulated gateway webhook processed');
assert(rzp?.recentWebhooks[0].event === 'payment.captured', 'Webhook logged in recent history');

// 7. Manual Offline Donations & Reconciliation
console.log('\n--- 7. Testing Manual Bank Wire & Reconciliation ---');
const testCamp = db.getCampaigns({ status: 'active' })[0];
const initialCampRaised = testCamp.raisedAmount;

const offlineWire = db.createManualDonation({
  campaignId: testCamp.id,
  campaignTitle: testCamp.title,
  donorName: 'Birla CSR Trust',
  donorEmail: 'csr@birla.org',
  donorPan: 'AAABB1122C',
  amount: 100000,
  paymentReference: 'NEFT-SBI-N99281928',
  bankName: 'SBI Parliament Street',
  depositDate: '2026-10-23',
  taxExemption80G: true,
}, 'Finance Operator');

assert(offlineWire.status === 'pending', 'Offline donation initially marked pending');

// Reconcile and approve
const reconciled = db.reconcileManualDonation(offlineWire.id, 'approved', 'Finance Lead', 'Verified with SBI passbook');
assert(reconciled?.status === 'approved', 'Offline donation status reconciled to approved');
assert(db.getCampaignById(testCamp.id)!.raisedAmount === initialCampRaised + 100000, 'Campaign raised amount increased by ₹1,00,000');

// 8. Refunds Engine
console.log('\n--- 8. Testing Refunds Engine & Ledger Reversal ---');
// Create and settle a test donation
const donOrder = db.createDonationOrder({
  campaignId: testCamp.id,
  donorName: 'Test Refund Donor',
  donorEmail: 'refund.test@example.com',
  amount: 5000,
  tipAmount: 0,
  isAnonymous: false,
  paymentMethod: 'upi',
});
const settledDon = db.verifyAndCompletePayment({
  razorpayOrderId: donOrder.razorpayOrderId,
  razorpayPaymentId: 'pay_test_refund_target',
});
assert(settledDon.status === 'succeeded', 'Donation settled successfully');
const campAmountBeforeRefund = db.getCampaignById(testCamp.id)!.raisedAmount;

// Execute Refund
const refundRes = db.processRefund(settledDon.id, 'Duplicate donor transaction', 'Finance Admin');
assert(refundRes.status === 'refunded', 'Donation marked as refunded');
assert(db.getCampaignById(testCamp.id)!.raisedAmount === campAmountBeforeRefund - 5000, 'Campaign raised amount cleanly reversed by ₹5,000');

// 9. Redirects & Audit Log
console.log('\n--- 9. Testing SEO Redirects & Audit Logs ---');
const initialHit = db.getRedirectRules().find(r => r.fromPath === '/covid-relief')?.hits || 0;
db.recordRedirectHit('/covid-relief');
const afterHit = db.getRedirectRules().find(r => r.fromPath === '/covid-relief')?.hits || 0;
assert(afterHit === initialHit + 1, 'Redirect hit counter incremented');

const logs = db.getAuditLogs();
assert(logs.length >= 5, 'Audit trail tracks administrative events');

// 10. System Backup & Restore
console.log('\n--- 10. Testing Database JSON Backup Snapshot & Restore ---');
const snapshot = db.exportDatabaseSnapshot();
assert(snapshot.includes('"version": "2.0.0"'), 'Snapshot contains version schema');
assert(snapshot.includes('campaigns'), 'Snapshot contains campaigns');

const restoreSuccess = db.importDatabaseSnapshot(snapshot, 'System Restore Test');
assert(restoreSuccess === true, 'Database state cleanly restored from JSON snapshot');

console.log('\n================================================================');
console.log(`ALL TESTS PASSED! (${passedTests}/${totalTests} assertions verified)`);
console.log('================================================================');
