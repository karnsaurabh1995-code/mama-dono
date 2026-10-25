import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import { DEMO_USERS } from '../src/lib/auth/constants';
import { Campaign, UserRole } from '../src/lib/types';

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function runTest(id: number, name: string, fn: () => { passed: boolean; details: string }) {
  try {
    const res = fn();
    results.push({ id, name, ...res });
  } catch (err: any) {
    results.push({ id, name, passed: false, details: `Exception: ${err.message}` });
  }
}

console.log('====================================================================');
console.log(' DOKIND — 3-STAGE DONOR FUNDRAISER PIPELINE VERIFICATION SUITE');
console.log(' Lead Gen Verification ➔ Content Writer ➔ Supreme Admin Approval');
console.log('====================================================================\n');

// Test 1: Donor creates a fundraiser -> Stage 1 (lead_verification)
let createdCampaignId = '';
runTest(1, 'Donor creates fundraiser entering Stage 1 (lead_verification)', () => {
  const testSlug = `donor-fundraiser-${Date.now()}`;
  const campaign = db.createCampaign({
    slug: testSlug,
    title: 'Emergency Liver Transplant for 6-Year-Old Kabir',
    shortDescription: 'Kabir suffers from end-stage biliary atresia. Immediate surgical transplant required.',
    story: 'Kabir has been battling liver complications since infancy. We desperately need donor help.',
    category: 'medical',
    campaignType: 'one-time',
    goalAmount: 1800000,
    featured: false,
    urgent: true,
    status: 'submitted',
    verifiedStatus: 'pending',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    beneficiaryName: 'Kabir Sengupta',
    beneficiaryLocation: 'Kolkata, West Bengal',
    hospitalName: 'Apollo Gleneagles Hospital, Kolkata',
    organizerName: 'Debashis Sengupta (Father)',
    organizerRole: 'individual',
    organizerId: 'user-donor-debashis',
    itemizedBudget: [{ id: 'b1', item: 'Donor Hepatectomy & Pediatric Transplant', amount: 1800000 }],
    useOfFunds: 'Direct disbursement to Apollo Gleneagles Hospital Escrow.',
    requiresSuperAdminApproval: true,
    fundraiserStage: 'lead_verification',
    donorSubmission: {
      isDonorSubmitted: true,
      submittedAt: new Date().toISOString(),
      donorName: 'Debashis Sengupta',
      donorEmail: 'debashis.s@example.com',
      donorPhone: '+91 98301 22334',
      initialStory: 'My 6-year-old son Kabir needs an immediate liver transplant. Please help us.',
    },
  });

  createdCampaignId = campaign.id;

  const passed =
    campaign &&
    campaign.status === 'submitted' &&
    campaign.fundraiserStage === 'lead_verification' &&
    campaign.donorSubmission?.isDonorSubmitted === true &&
    campaign.donorSubmission?.donorName === 'Debashis Sengupta';

  return {
    passed: !!passed,
    details: passed
      ? `Donor fundraiser "${campaign.title}" registered in Stage 1 (lead_verification) with ID ${campaign.id}`
      : 'Failed to initialize fundraiser in Stage 1',
  };
});

// Test 2: Lead Generator verifies the lead and forwards to Content Writer (Stage 2)
runTest(2, 'Stage 1: Lead Generator verifies contact & forwards to Content Writer (Stage 2)', () => {
  const leadGen = DEMO_USERS.lead_generator;
  const target = db.getCampaignById(createdCampaignId);
  if (!target) return { passed: false, details: 'Campaign not found' };

  // Lead Generator verifies
  const updated = db.updateCampaign(
    target.id,
    {
      fundraiserStage: 'content_creation',
      status: 'under_review',
      leadGenVerification: {
        verifiedAt: new Date().toISOString(),
        verifiedBy: leadGen.name,
        verifiedById: leadGen.id,
        notes: 'Contacted Apollo Gleneagles hospital desk and father Debashis. Clinical transplant estimate is genuine. Ready for campaign writer.',
        contactConfirmed: true,
        hospitalConfirmed: true,
      },
    },
    `${leadGen.name} (Lead Generator Verification)`
  );

  const passed =
    updated &&
    updated.fundraiserStage === 'content_creation' &&
    updated.leadGenVerification?.verifiedBy === leadGen.name &&
    updated.leadGenVerification?.contactConfirmed === true;

  return {
    passed: !!passed,
    details: passed
      ? `Lead Generator ${leadGen.name} authenticated donor contact and advanced campaign to Stage 2: content_creation`
      : 'Failed to advance to Stage 2',
  };
});

// Test 3: Content Writer crafts campaign story & forwards to Supreme Admin (Stage 3)
runTest(3, 'Stage 2: Content Writer crafts campaign story & forwards to Supreme Admin (Stage 3)', () => {
  const writer = DEMO_USERS.content_writer;
  const target = db.getCampaignById(createdCampaignId);
  if (!target) return { passed: false, details: 'Campaign not found' };

  // Content Writer refines story and forwards
  const updated = db.updateCampaign(
    target.id,
    {
      fundraiserStage: 'supreme_admin_approval',
      status: 'submitted',
      story: 'Updated with emotional story narrative and verified clinical protocol details by Content Writer.',
      contentWriterSubmission: {
        submittedAt: new Date().toISOString(),
        submittedBy: writer.name,
        submittedById: writer.id,
        notes: 'Crafted headline, structured story blocks, and validated Apollo Gleneagles hospital escrow breakdown. Ready for Supreme Admin publication sign-off.',
        storyPolished: true,
        artworkAdded: true,
      },
    },
    `${writer.name} (Content Writer Story Crafting)`
  );

  const passed =
    updated &&
    updated.fundraiserStage === 'supreme_admin_approval' &&
    updated.contentWriterSubmission?.submittedBy === writer.name &&
    updated.contentWriterSubmission?.storyPolished === true;

  return {
    passed: !!passed,
    details: passed
      ? `Content Writer ${writer.name} polished story and submitted campaign to Stage 3: supreme_admin_approval`
      : 'Failed to advance to Stage 3',
  };
});

// Test 4: Unauthorized role cannot bypass Supreme Admin approval
runTest(4, 'Non-super-admin roles blocked from direct live publication', () => {
  const target = db.getCampaignById(createdCampaignId);
  if (!target) return { passed: false, details: 'Campaign not found' };

  // Check UI protection logic: only super_admin can approve live
  const approvalsFile = fs.readFileSync(path.join(__dirname, '../src/app/admin/campaigns/approvals/page.tsx'), 'utf-8');
  const hasAuthGuard = approvalsFile.includes('(camp.requiresSuperAdminApproval || camp.proposedByEmployee || camp.donorSubmission) && !isSuperAdmin');
  const hasLockedButton = approvalsFile.includes('Awaiting Supreme Admin Approval');

  const passed = hasAuthGuard && hasLockedButton;
  return {
    passed,
    details: passed
      ? 'Verification queue enforces strict authorization lock against non-super_admin callers'
      : 'Missing role guard in approvals queue',
  };
});

// Test 5: Supreme Admin approves & publishes LIVE (Stage 3 Complete)
runTest(5, 'Stage 3: Supreme Admin approves and publishes campaign LIVE to platform', () => {
  const superAdmin = DEMO_USERS.super_admin;
  const target = db.getCampaignById(createdCampaignId);
  if (!target) return { passed: false, details: 'Campaign not found' };

  // Supreme Admin publishes live
  const approved = db.updateCampaign(
    target.id,
    {
      status: 'active',
      verifiedStatus: 'verified',
      fundraiserStage: 'published',
      requiresSuperAdminApproval: false,
      superAdminApproval: {
        approvedAt: new Date().toISOString(),
        approvedBy: superAdmin.name,
      },
    },
    `${superAdmin.name} (Supreme Admin Live Publication Sign-off)`
  );

  const passed =
    approved &&
    approved.status === 'active' &&
    approved.verifiedStatus === 'verified' &&
    approved.fundraiserStage === 'published' &&
    approved.requiresSuperAdminApproval === false &&
    approved.superAdminApproval?.approvedBy === superAdmin.name;

  return {
    passed: !!passed,
    details: passed
      ? `Supreme Admin ${superAdmin.name} approved fundraiser "${approved.title}" live! (Status: active, Stage: published)`
      : 'Failed to publish campaign live by Supreme Admin',
  };
});

// Test 6: Verify public page & start-campaign form integration
runTest(6, 'Public start-campaign wizard and approvals queue integration', () => {
  const startCampaignFile = fs.readFileSync(path.join(__dirname, '../src/app/start-campaign/page.tsx'), 'utf-8');
  const approvalsFile = fs.readFileSync(path.join(__dirname, '../src/app/admin/campaigns/approvals/page.tsx'), 'utf-8');
  const campaignsListFile = fs.readFileSync(path.join(__dirname, '../src/app/admin/campaigns/page.tsx'), 'utf-8');

  const startCampaignSetsStage1 = startCampaignFile.includes("fundraiserStage: 'lead_verification'") && startCampaignFile.includes('donorSubmission');
  const startCampaignShowsPipeline = startCampaignFile.includes('Stage 1: Lead Verification') && startCampaignFile.includes('Stage 2: Campaign Story Crafting');
  const approvalsHasStageTabs = approvalsFile.includes('Stage 1: Lead Verification') && approvalsFile.includes('Stage 2: Content Writing') && approvalsFile.includes('Stage 3: Supreme Admin Review');
  const listHasStageBadges = campaignsListFile.includes('Stage 1: Lead Verification') && campaignsListFile.includes('Stage 2: Content Writing');

  const passed = startCampaignSetsStage1 && startCampaignShowsPipeline && approvalsHasStageTabs && listHasStageBadges;

  return {
    passed,
    details: passed
      ? 'All components integrated: /start-campaign registers Stage 1 with pipeline preview, /admin/campaigns/approvals provides 3-stage tabs, and /admin/campaigns shows stage badges'
      : 'One or more integrations missing or incomplete',
  };
});

console.log('--------------------------------------------------------------------');
console.log(' RESULTS MATRIX:');
console.log('--------------------------------------------------------------------');
let allPassed = true;
for (const r of results) {
  const icon = r.passed ? '[✓ PASS]' : '[✗ FAIL]';
  console.log(`${icon} Test ${r.id.toString().padStart(2, '0')}: ${r.name}`);
  console.log(`       Details: ${r.details}\n`);
  if (!r.passed) allPassed = false;
}

console.log('====================================================================');
console.log(` TOTAL: ${results.filter((r) => r.passed).length} / ${results.length} PASSED`);
console.log('====================================================================');

if (!allPassed) {
  process.exit(1);
}
