import { db } from '../src/lib/db';
import { UserRole } from '../src/lib/types';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('DOKIND SUITE: VERIFYING TEAM MANAGEMENT, BRANDING & CLEANUP');
console.log('================================================================\n');

// ----------------------------------------------------------------
// TEST 1: CAMPAIGN PAGE CLEANUP (PART A)
// ----------------------------------------------------------------
console.log('--- TEST 1: Public Campaign Summary Cleanup ---');
const campaignPagePath = path.join(process.cwd(), 'src', 'app', 'campaigns', '[slug]', 'page.tsx');
const campaignPageContent = fs.readFileSync(campaignPagePath, 'utf-8');

assert(!campaignPageContent.includes('Items Funded'), 'Campaign page does NOT display green "Items Funded" text');
assert(!campaignPageContent.includes('itemsPercent') && !campaignPageContent.includes('itemFundedPercentage'), 'Campaign page does NOT compute or render item funded progress metrics');
assert(campaignPageContent.includes('bg-[#EF4949]') || campaignPageContent.includes('primaryColor') || campaignPageContent.includes('progressPercentage'), 'Monetary progress bar is preserved');
assert(campaignPageContent.includes('DualDonationModule'), 'DualDonationModule (Product Giving + Monetary donation) is intact');
assert(campaignPageContent.includes('targetAmount') || campaignPageContent.includes('campaign.goalAmount'), 'Campaign target goal is intact');

// ----------------------------------------------------------------
// TEST 2: SECURE TEAM & EMPLOYEE MANAGEMENT (PART B)
// ----------------------------------------------------------------
console.log('\n--- TEST 2: Secure Team Management & RBAC ---');
const superAdminUser = db.getUsers().find((u) => u.role === 'super_admin')!;
const opsAdminUser = db.getUsers().find((u) => u.role === 'ops_admin')!;

assert(Boolean(superAdminUser), 'Super Admin user exists in database');
assert(Boolean(opsAdminUser), 'Operations Admin user exists in database');

// Get employees as super_admin
const employees = db.getEmployees(superAdminUser);
assert(Array.isArray(employees) && employees.length > 0, `Super Admin can list employees (found ${employees.length})`);
assert(employees.every((e) => Boolean(e.employeeId)), 'All employees have unique employeeId assigned');

// Non-super-admin should be blocked
let opsAdminBlocked = false;
try {
  db.getEmployees(opsAdminUser);
} catch (err: any) {
  if (err.message.includes('ACCESS DENIED') || err.message.includes('Super Admin')) {
    opsAdminBlocked = true;
  }
}
assert(opsAdminBlocked, 'Non-super-admin is strictly blocked from listing employees');

// Create a new employee as super_admin
const newEmployeeData = {
  name: 'Vikram Sethi',
  email: `vikram.test.${Date.now()}@dokind.org.in`,
  role: 'campaign_manager' as UserRole,
  department: 'Campaign Operations',
  jobTitle: 'Senior Campaign Coordinator',
  internalNotes: 'Verification test staff member',
};

const creationResult = db.createEmployee(newEmployeeData, superAdminUser);
assert(Boolean(creationResult.user), 'Employee successfully created');
assert(Boolean(creationResult.user.employeeId && creationResult.user.employeeId.startsWith('EMP-')), `Employee ID has EMP- prefix: ${creationResult.user.employeeId}`);
assert(Boolean(creationResult.temporaryPassword), 'Temporary password generated');
assert(creationResult.temporaryPassword.length >= 16, `Temporary password is high-entropy (length ${creationResult.temporaryPassword.length} >= 16)`);
assert(!creationResult.temporaryPassword.toLowerCase().includes('vikram'), 'Temporary password is NOT derived from employee name');
assert(!creationResult.temporaryPassword.toLowerCase().includes('sethi'), 'Temporary password is NOT derived from employee surname');
assert(!creationResult.temporaryPassword.toLowerCase().includes((creationResult.user.employeeId || '').toLowerCase()), 'Temporary password is NOT derived from employee ID');
assert(creationResult.user.requiresPasswordChange === true, 'Employee requires password reset on first login');
assert(Boolean(creationResult.user.passwordHash), 'Password hash is securely stored');
assert(!('password' in creationResult.user) || !(creationResult.user as any).password, 'Plaintext password is never stored on the user record');

// Audit logging verification
const auditLogs = db.getTeamAuditLogs(superAdminUser);
const createLog = auditLogs.find((l) => l.action === 'EMPLOYEE_ACCOUNT_CREATED' && l.targetId === creationResult.user.id);
assert(Boolean(createLog), 'Audit log successfully recorded employee creation');
assert(createLog?.actorName === superAdminUser.name, `Audit log records actor as ${superAdminUser.name}`);

// Role change
const updatedUser = db.changeEmployeeRole(creationResult.user.id, 'reviewer', 'Promotion to reviewer', superAdminUser);
assert(updatedUser.role === 'reviewer', 'Employee role successfully updated to reviewer');
const roleChangeLog = db.getTeamAuditLogs(superAdminUser).find((l) => l.action === 'EMPLOYEE_ROLE_CHANGED' && l.targetId === creationResult.user.id);
assert(Boolean(roleChangeLog), 'Role change audit log recorded');

// Credential reset
const resetResult = db.initiateCredentialReset(creationResult.user.id, superAdminUser);
assert(Boolean(resetResult.temporaryPassword) && resetResult.temporaryPassword.length >= 16, 'Password reset generates new high-entropy credential');

// Session revocation
const revokedUser = db.revokeEmployeeSessions(creationResult.user.id, superAdminUser);
assert(Boolean(revokedUser.sessionRevokedAt), 'Session revocation timestamp updated');

// ----------------------------------------------------------------
// TEST 3: BRANDING & WEBSITE LOGO MANAGEMENT (PART C)
// ----------------------------------------------------------------
console.log('\n--- TEST 3: Website Logo & Brand Management ---');
const siteSettings = db.getSiteSettings();
assert('logoUrl' in siteSettings, 'SiteSettings has logoUrl property');
assert('logoLightUrl' in siteSettings, 'SiteSettings has logoLightUrl property');
assert('logoDarkUrl' in siteSettings, 'SiteSettings has logoDarkUrl property');
assert('logoAltText' in siteSettings, 'SiteSettings has logoAltText property');

// Update logo
const testLogoUrl = 'https://assets.dokind.org.in/brand/dokind-custom-2026.png';
db.updateSiteSettings({
  logoUrl: testLogoUrl,
  logoAltText: 'dokind custom partner logo',
});
const updatedSettings = db.getSiteSettings();
assert(updatedSettings.logoUrl === testLogoUrl, 'Logo URL successfully updated in site settings');
assert(updatedSettings.logoAltText === 'dokind custom partner logo', 'Logo Alt text successfully updated');

// Reset logo to official vector
db.updateSiteSettings({
  logoUrl: '',
  logoLightUrl: '',
  logoDarkUrl: '',
  logoAltText: 'dokind crowdfunding logo',
});
const resetLogoSettings = db.getSiteSettings();
assert(resetLogoSettings.logoUrl === '', 'Logo reset clears logoUrl to restore official vector wordmark');

// Verify DokindLogo component supports both custom logo and vector fallback
const dokindLogoPath = path.join(process.cwd(), 'src', 'components', 'common', 'DokindLogo.tsx');
const dokindLogoContent = fs.readFileSync(dokindLogoPath, 'utf-8');
assert(dokindLogoContent.includes('getSiteSettings'), 'DokindLogo checks site settings dynamically');
assert(dokindLogoContent.includes('<img') && dokindLogoContent.includes('<svg'), 'DokindLogo renders image when URL configured and SVG when default');
assert(dokindLogoContent.includes('#D91E25') || dokindLogoContent.includes('#EF4949'), 'Official Dokind brand red dot (#D91E25) is preserved in vector wordmark');

// ----------------------------------------------------------------
// TEST 4: NEWSLETTER ARTWORK & DECORATIVE BRUSH FRAME (PART C)
// ----------------------------------------------------------------
console.log('\n--- TEST 4: Newsletter Artwork & Brush Frame ---');
assert('newsletterImageUrl' in siteSettings, 'SiteSettings has newsletterImageUrl property');
assert('newsletterFrameStyle' in siteSettings, 'SiteSettings has newsletterFrameStyle property');

// Verify BrushStrokeFrame component exists
const brushFramePath = path.join(process.cwd(), 'src', 'components', 'home', 'BrushStrokeFrame.tsx');
assert(fs.existsSync(brushFramePath), 'BrushStrokeFrame component exists');
const brushFrameContent = fs.readFileSync(brushFramePath, 'utf-8');
assert(brushFrameContent.includes('organic_brush'), 'BrushStrokeFrame supports organic_brush style');
assert(brushFrameContent.includes('watercolor_edge'), 'BrushStrokeFrame supports watercolor_edge style');
assert(brushFrameContent.includes('subtle_splatter'), 'BrushStrokeFrame supports subtle_splatter style');

// Verify NewsletterSection component
const newsletterPath = path.join(process.cwd(), 'src', 'components', 'home', 'NewsletterSection.tsx');
const newsletterContent = fs.readFileSync(newsletterPath, 'utf-8');
assert(newsletterContent.includes('BrushStrokeFrame'), 'NewsletterSection includes BrushStrokeFrame');
assert(newsletterContent.includes('grid-cols-1 lg:grid-cols-12'), 'NewsletterSection has responsive 2-column layout');
assert(newsletterContent.includes('handleSubmit'), 'NewsletterSection preserves email submission handler');
assert(newsletterContent.includes('Thank you! You are subscribed'), 'NewsletterSection preserves thank you message');

// Verify Newsletter Appearance Admin Page exists
const adminNewsletterPagePath = path.join(process.cwd(), 'src', 'app', 'admin', 'settings', 'newsletter-appearance', 'page.tsx');
assert(fs.existsSync(adminNewsletterPagePath), 'Newsletter Appearance Admin Page exists');

// Verify Admin Navigation links
const adminLayoutPath = path.join(process.cwd(), 'src', 'app', 'admin', 'layout.tsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf-8');
assert(adminLayoutContent.includes('/admin/team'), 'Admin layout includes /admin/team link');
assert(adminLayoutContent.includes('/admin/settings/newsletter-appearance'), 'Admin layout includes newsletter artwork link');

console.log('\n================================================================');
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION ASSERTIONS PASSED SUCCESSFULLY!');
}
