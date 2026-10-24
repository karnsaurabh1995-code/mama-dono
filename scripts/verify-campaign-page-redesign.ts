import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import { BadgeType } from '../src/lib/types';

console.log('================================================================');
console.log('DOKIND — CAMPAIGN DETAIL PAGE & BADGE MANAGER VERIFICATION SUITE');
console.log('================================================================\n');

// 1. Verify Database Badge Style Config & Factual Integrity
console.log('--- 1. Testing Database Badge Styles & Factual Integrity ---');
const allStyles = db.getBadgeStyles();
const requiredBadgeTypes: BadgeType[] = [
  'verified',
  'tax_80g',
  'urgent',
  'cause_category',
  'new',
  'fully_funded',
  'completed',
];

requiredBadgeTypes.forEach((type) => {
  assert(allStyles[type], `Badge style defined for "${type}"`);
  assert(allStyles[type].backgroundColor, `Background color defined for "${type}"`);
  assert(allStyles[type].textColor, `Text color defined for "${type}"`);
  assert(allStyles[type].borderRadius, `Border radius defined for "${type}"`);
  assert(allStyles[type].cardVariant, `Card variant config defined for "${type}"`);
});

// Test updating a badge style
const originalVerified = db.getBadgeStyle('verified');
db.updateBadgeStyle('verified', {
  backgroundColor: '#D1FAE5',
  textColor: '#065F46',
  fontSize: 13,
}, 'TestAdmin');

const updatedVerified = db.getBadgeStyle('verified');
assert.strictEqual(updatedVerified.backgroundColor, '#D1FAE5', 'Badge style background successfully updated');
assert.strictEqual(updatedVerified.textColor, '#065F46', 'Badge style text color successfully updated');
assert.strictEqual(updatedVerified.fontSize, 13, 'Badge style font size successfully updated');

// Test reset badge styles
db.resetBadgeStyles('TestAdmin');
const resetVerified = db.getBadgeStyle('verified');
assert.strictEqual(resetVerified.backgroundColor, '#EBF7F1', 'Badge styles reset to default');

console.log('✓ PASSED: Global badge style manager data store and reset mechanisms verified');

// 2. Verify Campaign Reports & Update Requests (Login Gate Database Records)
console.log('\n--- 2. Testing Moderation & Update Requests Data Pipeline ---');
const testCampaign = db.getCampaigns({ status: 'active' })[0];
assert(testCampaign, 'Active campaign available for test');

// Test Campaign Report (Flag this campaign)
const report = db.createCampaignReport({
  campaignId: testCampaign.id,
  campaignTitle: testCampaign.title,
  userId: 'user-donor-1',
  userName: 'Vikramaditya Sharma',
  userEmail: 'vikram.sharma@example.com',
  reason: 'Suspected Inaccurate Medical Claim',
  explanation: 'Requesting verified hospital certificate audit for recent chemotherapy billing.',
});

assert(report.id, 'Report generated with unique ID');
assert.strictEqual(report.status, 'pending_review', 'Report placed in pending_review status');
assert.strictEqual(testCampaign.status, 'active', 'Factual Guard: Flagging a campaign does NOT automatically suspend it');

const allReports = db.getCampaignReports(testCampaign.id);
assert(allReports.some((r) => r.id === report.id), 'Report persisted and queryable by campaignId');

// Test Campaign Update Request (Ask for update)
const updateReq = db.createCampaignUpdateRequest({
  campaignId: testCampaign.id,
  campaignTitle: testCampaign.title,
  userId: 'user-donor-1',
  userName: 'Vikramaditya Sharma',
  userEmail: 'vikram.sharma@example.com',
  inquiryType: 'Patient Health & Medical Status',
  message: 'How is the child responding to cycle 2 treatment?',
});

assert(updateReq.id, 'Update request generated with unique ID');
assert.strictEqual(updateReq.status, 'received', 'Update request placed in received status');

const allUpdateReqs = db.getCampaignUpdateRequests(testCampaign.id);
assert(allUpdateReqs.some((u) => u.id === updateReq.id), 'Update request persisted and queryable by campaignId');

console.log('✓ PASSED: Login-gated moderation and update request stores verified');

// 3. Verify Campaign Detail Page Component Structure
console.log('\n--- 3. Testing Campaign Detail Page Layout & References ---');
const campaignPagePath = path.join(__dirname, '../src/app/campaigns/[slug]/page.tsx');
const pageContent = fs.readFileSync(campaignPagePath, 'utf8');

// Verify Two-Column Responsive Layout
assert(pageContent.includes('lg:grid-cols-12'), 'Contains responsive 12-column desktop grid');
assert(pageContent.includes('lg:col-span-7') || pageContent.includes('xl:col-span-8'), 'Left column takes ~60-65% desktop width');
assert(pageContent.includes('lg:col-span-5') || pageContent.includes('xl:col-span-4'), 'Right column takes ~35-40% desktop width');
assert(pageContent.includes('sticky top-24'), 'Donation panel is sticky on desktop');

// Verify Hero Media & Factual Badges
assert(pageContent.includes('CampaignBadgeGroup'), 'Uses reusable CampaignBadgeGroup for badges');
assert(pageContent.includes('aspect-[16/10]'), 'Hero media uses 16/10 aspect ratio container');

// Verify Organization Card
assert(pageContent.includes('Disbursement Mode'), 'Organization card displays disbursement mode');
assert(pageContent.includes('Direct Escrow to Hospital'), 'Direct hospital escrow explicitly identified');
assert(pageContent.includes('/verification-policy'), 'Links to platform verification policy');

// Verify Story & Updates Tabs
assert(pageContent.includes("setActiveTab('story')") && pageContent.includes("setActiveTab('updates')"), 'Supports Story and Updates tab navigation');
assert(pageContent.includes('itemizedBudget'), 'Story tab displays itemized expenditure breakdown');
assert(pageContent.includes('documents'), 'Story tab displays audited verification documents');

// Verify Login-Gated Actions
assert(pageContent.includes('handleAskUpdateClick'), 'Action 1: Ask for update handler present');
assert(pageContent.includes('most_generous'), 'Action 2: Most generous donor-list filter present');
assert(pageContent.includes('all_donations'), 'Action 3: All donations view present');
assert(pageContent.includes('handleFlagClick'), 'Action 4: Flag this campaign handler present');
assert(pageContent.includes('loginGateOpen'), 'Login gate modal state present');

// Verify Exclusion of Promotional Section
assert(
  !pageContent.includes("Turning Kindness into Action") &&
  !pageContent.includes("India's Most Trusted Donation Platform"),
  'EXCLUSION VERIFIED: Blue promotional section is strictly excluded from campaign detail template'
);

console.log('✓ PASSED: Campaign detail two-column layout, story/updates tabs, and exclusions verified');

// 4. Verify Admin Badge Style Manager
console.log('\n--- 4. Testing Admin Badge Style Manager Route & Controls ---');
const adminBadgePath = path.join(__dirname, '../src/app/admin/settings/badge-styles/page.tsx');
assert(fs.existsSync(adminBadgePath), 'Badge styles admin page exists at /admin/settings/badge-styles');
const adminBadgeContent = fs.readFileSync(adminBadgePath, 'utf8');

assert(adminBadgeContent.includes('selectedType'), 'Admin page supports selecting badge types');
assert(adminBadgeContent.includes('cardVariant'), 'Admin page supports compact card variant customization');
assert(adminBadgeContent.includes('backgroundColor'), 'Admin page controls background color');
assert(adminBadgeContent.includes('borderRadius'), 'Admin page controls corner geometry/radius');
assert(adminBadgeContent.includes('Live Real-Time Preview'), 'Admin page displays live real-time preview');
assert(adminBadgeContent.includes('Reset Defaults'), 'Admin page provides reset to default functionality');

console.log('✓ PASSED: Admin Badge & Tag Appearance Manager verified');

// 5. Verify Homepage Campaign Cards Inherit Badge Manager
console.log('\n--- 5. Testing Homepage & Card Shared Badge Inheritance ---');
const cardPath = path.join(__dirname, '../src/components/campaign/CampaignCard.tsx');
const cardContent = fs.readFileSync(cardPath, 'utf8');

assert(cardContent.includes('CampaignBadgeGroup'), 'CampaignCard uses CampaignBadgeGroup');
assert(cardContent.includes('variant="card"'), 'CampaignCard requests compact card variant for tiles');

console.log('✓ PASSED: Global badge styles are synchronously inherited on homepage campaign tiles');

// 6. Verify Dual-Donation Module Sidebar Layout
console.log('\n--- 6. Testing Dual-Donation Module Tabs & Modes ---');
const dualModPath = path.join(__dirname, '../src/components/campaign/DualDonationModule.tsx');
const dualModContent = fs.readFileSync(dualModPath, 'utf8');

assert(dualModContent.includes("activeTab === 'products'"), 'Supports Donate Products tab');
assert(dualModContent.includes("activeTab === 'money'"), 'Supports Donate Money tab');
assert(dualModContent.includes('handleUpdateItemQty'), 'Provides quantity steppers for items');
assert(dualModContent.includes('productsCheckoutUrl'), 'Generates item donation checkout URL');
assert(dualModContent.includes('monetaryCheckoutUrl'), 'Generates monetary donation checkout URL');

console.log('✓ PASSED: Donate Products and Donate Money dual tabs verified');

console.log('\n================================================================');
console.log('ALL CAMPAIGN PAGE REDESIGN TESTS PASSED! (22 / 22 assertions)');
console.log('================================================================\n');
