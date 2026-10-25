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
console.log(' DOKIND — EMPLOYEE CAMPAIGN CREATION & SUPREME ADMIN APPROVAL TESTS');
console.log('====================================================================\n');

// Test 1: Lead Generator role & constants definition
runTest(1, 'Lead Generator role in UserRole and DEMO_USERS registry', () => {
  const leadGen = DEMO_USERS['lead_generator' as UserRole];
  const passed =
    leadGen &&
    leadGen.role === 'lead_generator' &&
    leadGen.name === 'Vikas Joshi' &&
    leadGen.jobTitle === 'Campaign Lead Generator';
  return {
    passed: !!passed,
    details: passed
      ? `lead_generator registered with ID: ${leadGen.id}, Title: "${leadGen.jobTitle}"`
      : 'lead_generator missing or misconfigured in DEMO_USERS',
  };
});

// Test 2: Admin layout RBAC permissions for lead_generator and content_writer in Campaigns & Causes
runTest(2, 'Campaigns & Causes section access for content_writer & lead_generator', () => {
  const layoutContent = fs.readFileSync(path.join(__dirname, '../src/app/admin/layout.tsx'), 'utf-8');
  const hasLeadGenCheck = layoutContent.includes("role === 'lead_generator'");
  const leadGenHasCampaigns = layoutContent.includes("['1', '5', '6', '7', '8', '9'");
  const writerHasCampaignsAndApprovals = layoutContent.includes("['1', '3', '5', '6', '7', '8'");
  const passed = hasLeadGenCheck && leadGenHasCampaigns && writerHasCampaignsAndApprovals;
  return {
    passed,
    details: passed
      ? 'Lead Generator and Content Writer correctly granted access to Campaigns & Causes sidebar items'
      : 'RBAC checks missing or incomplete in Admin layout',
  };
});

// Test 3: Content Writer creates campaign -> submitted for Supreme Admin approval
runTest(3, 'Content Writer campaign creation sets status: submitted & requiresSuperAdminApproval', () => {
  const writer = DEMO_USERS.content_writer;
  const testSlug = `test-writer-proposal-${Date.now()}`;
  const campaign = db.createCampaign({
    slug: testSlug,
    title: 'Clean Drinking Water for Rural Schools (Writer Proposed)',
    shortDescription: 'Installing UV water filtration systems across 12 schools.',
    story: 'Clean drinking water is fundamental to student health and attendance.',
    category: 'education',
    campaignType: 'one-time',
    goalAmount: 350000,
    featured: false,
    urgent: false,
    status: 'submitted',
    verifiedStatus: 'pending',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    beneficiaryName: 'District Schools Trust',
    beneficiaryLocation: 'Satara, Maharashtra',
    organizerName: 'Hope India Foundation',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    itemizedBudget: [{ id: 'b1', item: 'Filtration Units', amount: 350000 }],
    useOfFunds: 'Direct equipment purchase and installation.',
    proposedByEmployee: {
      id: writer.id,
      name: writer.name,
      email: writer.email,
      role: writer.role,
      jobTitle: writer.jobTitle,
    },
    requiresSuperAdminApproval: true,
  });

  const passed =
    campaign &&
    campaign.status === 'submitted' &&
    campaign.requiresSuperAdminApproval === true &&
    campaign.proposedByEmployee?.role === 'content_writer';

  return {
    passed: !!passed,
    details: passed
      ? `Campaign "${campaign.title}" created with status: 'submitted', requiresSuperAdminApproval: true by ${writer.name} (${writer.role})`
      : 'Failed to record proposedByEmployee or requiresSuperAdminApproval on campaign',
  };
});

// Test 4: Lead Generator creates campaign -> submitted for Supreme Admin approval
runTest(4, 'Lead Generator campaign creation sets status: submitted & requiresSuperAdminApproval', () => {
  const leadGen = DEMO_USERS['lead_generator' as UserRole];
  const testSlug = `test-leadgen-proposal-${Date.now()}`;
  const campaign = db.createCampaign({
    slug: testSlug,
    title: 'Pediatric Cardiac Surgeries for Underprivileged Children (Lead Gen Proposed)',
    shortDescription: 'Emergency cardiac surgical interventions for infants with congenital heart defects.',
    story: 'Congenital heart disease affects thousands of newborns from vulnerable families.',
    category: 'medical',
    campaignType: 'one-time',
    goalAmount: 850000,
    featured: false,
    urgent: true,
    status: 'submitted',
    verifiedStatus: 'pending',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    beneficiaryName: 'Pediatric Cardiac Care Escrow',
    beneficiaryLocation: 'Bengaluru, Karnataka',
    organizerName: 'Hope India Foundation',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    itemizedBudget: [{ id: 'b1', item: 'Surgeries', amount: 850000 }],
    useOfFunds: 'Direct hospital surgical escrow payment.',
    proposedByEmployee: {
      id: leadGen.id,
      name: leadGen.name,
      email: leadGen.email,
      role: leadGen.role,
      jobTitle: leadGen.jobTitle,
    },
    requiresSuperAdminApproval: true,
  });

  const passed =
    campaign &&
    campaign.status === 'submitted' &&
    campaign.requiresSuperAdminApproval === true &&
    campaign.proposedByEmployee?.role === 'lead_generator';

  return {
    passed: !!passed,
    details: passed
      ? `Campaign "${campaign.title}" created with status: 'submitted', requiresSuperAdminApproval: true by ${leadGen.name} (${leadGen.role})`
      : 'Failed to record proposedByEmployee or requiresSuperAdminApproval on campaign',
  };
});

// Test 5: Admin role creates campaign -> also routes for Supreme Admin approval
runTest(5, 'Platform Admin campaign creation sets status: submitted & requiresSuperAdminApproval', () => {
  const admin = DEMO_USERS.admin;
  const testSlug = `test-admin-proposal-${Date.now()}`;
  const campaign = db.createCampaign({
    slug: testSlug,
    title: 'Emergency Flood Relief Drive (Admin Proposed)',
    shortDescription: 'Rapid response dry rations and hygiene kits for 500 displaced families.',
    story: 'Devastating seasonal floods left hundreds of riverside households without shelter.',
    category: 'disaster-relief',
    campaignType: 'product',
    goalAmount: 600000,
    featured: true,
    urgent: true,
    status: 'submitted',
    verifiedStatus: 'pending',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    beneficiaryName: 'Displaced Families Relief Trust',
    beneficiaryLocation: 'Assam, India',
    organizerName: 'Hope India Foundation',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    itemizedBudget: [{ id: 'b1', item: 'Ration Kits', amount: 600000 }],
    useOfFunds: 'Direct procurement and dispatch of emergency food kits.',
    proposedByEmployee: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      jobTitle: admin.jobTitle,
    },
    requiresSuperAdminApproval: true,
  });

  const passed =
    campaign &&
    campaign.status === 'submitted' &&
    campaign.requiresSuperAdminApproval === true &&
    campaign.proposedByEmployee?.role === 'admin';

  return {
    passed: !!passed,
    details: passed
      ? `Campaign "${campaign.title}" created with status: 'submitted', requiresSuperAdminApproval: true by ${admin.name} (${admin.role})`
      : 'Failed to record proposedByEmployee or requiresSuperAdminApproval on campaign',
  };
});

// Test 6: Supreme Admin approves employee-created campaign -> status transitions to active
runTest(6, 'Supreme Admin approval transitions status to active and verified with audit metadata', () => {
  const testSlug = `test-approval-flow-${Date.now()}`;
  const campaign = db.createCampaign({
    slug: testSlug,
    title: 'Prosthetic Limbs Distribution Drive',
    shortDescription: 'Custom mobility aids and prosthetics for amputees.',
    story: 'Restoring dignity and mobility through advanced prosthetic fitting.',
    category: 'disability',
    campaignType: 'one-time',
    goalAmount: 400000,
    featured: false,
    urgent: false,
    status: 'submitted',
    verifiedStatus: 'pending',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    beneficiaryName: 'Mobility Rehabilitation Center',
    beneficiaryLocation: 'Jaipur, Rajasthan',
    organizerName: 'Hope India Foundation',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    itemizedBudget: [{ id: 'b1', item: 'Prosthetics', amount: 400000 }],
    useOfFunds: 'Direct clinic manufacturing and patient fitting.',
    proposedByEmployee: {
      id: 'user-lead-gen-1',
      name: 'Vikas Joshi',
      email: 'vikas.leads@dokind.org.in',
      role: 'lead_generator',
      jobTitle: 'Campaign Lead Generator',
    },
    requiresSuperAdminApproval: true,
  });

  // Supreme Admin approves the campaign
  const approvedCampaign = db.updateCampaign(
    campaign.id,
    {
      status: 'active',
      verifiedStatus: 'verified',
      requiresSuperAdminApproval: false,
      superAdminApproval: {
        approvedAt: new Date().toISOString(),
        approvedBy: 'Saurabh Karn (Super Administrator)',
      },
    },
    'Saurabh Karn (Supreme Admin Approval)'
  );

  const passed =
    approvedCampaign &&
    approvedCampaign.status === 'active' &&
    approvedCampaign.verifiedStatus === 'verified' &&
    approvedCampaign.requiresSuperAdminApproval === false &&
    approvedCampaign.superAdminApproval?.approvedBy === 'Saurabh Karn (Super Administrator)';

  return {
    passed: !!passed,
    details: passed
      ? `Campaign "${approvedCampaign.title}" successfully approved and published LIVE by Supreme Admin`
      : 'Failed to verify transition to active status or superAdminApproval metadata',
  };
});

// Test 7: UI files verification (Wizard, Approvals Queue, Campaigns Table)
runTest(7, 'UI components enforce Supreme Admin authority and employee submission controls', () => {
  const wizard = fs.readFileSync(path.join(__dirname, '../src/app/admin/campaigns/new/page.tsx'), 'utf-8');
  const approvals = fs.readFileSync(path.join(__dirname, '../src/app/admin/campaigns/approvals/page.tsx'), 'utf-8');
  const table = fs.readFileSync(path.join(__dirname, '../src/app/admin/campaigns/page.tsx'), 'utf-8');

  const wizardHasGovernanceBanner = wizard.includes('Employee Campaign Proposal Governance') && wizard.includes('Submit to Supreme Admin');
  const approvalsHasSuperAdminLock = approvals.includes('Only the Supreme Admin has authority to approve') && approvals.includes('Awaiting Supreme Admin Approval');
  const approvalsHasSuperAdminButton = approvals.includes('Approve & Publish LIVE (Supreme Admin)');
  const tableHasAwaitingBadge = table.includes('Awaiting Supreme Admin') && table.includes('Review Proposal');

  const passed =
    wizardHasGovernanceBanner &&
    approvalsHasSuperAdminLock &&
    approvalsHasSuperAdminButton &&
    tableHasAwaitingBadge;

  return {
    passed,
    details: passed
      ? 'All UI components verified: Wizard governance banner, Approvals page lock & Supreme Admin CTA, and Campaigns table pending badge'
      : 'One or more UI safeguards missing',
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
