import assert from 'assert';
import { db } from '../src/lib/db';
import { DEMO_USERS, INITIAL_SUPER_ADMIN_ACCOUNTS } from '../src/lib/auth/context';

console.log('🧪 Verifying Advanced Team Management, Super Admin Bootstrap, and Campaign Operations...');

// 1. Super Admin Bootstrap
console.log('1. Checking Super Admin Bootstrap...');
assert(db.isDesignatedSuperAdmin('karnsaurabh1995@gmail.com'), 'karnsaurabh1995@gmail.com is designated super admin');
assert(db.isDesignatedSuperAdmin('sarthakraj726@gmail.com'), 'sarthakraj726@gmail.com is designated super admin');
assert(!db.isDesignatedSuperAdmin('random.user@gmail.com'), 'Random user is not designated super admin');

const bootstrapResult = db.bootstrapSuperAdmins('Test Bootstrap');
console.log('   Bootstrap verified/provisioned:', bootstrapResult);
const sa1 = db.getUserByEmail('karnsaurabh1995@gmail.com');
const sa2 = db.getUserByEmail('sarthakraj726@gmail.com');
assert(sa1 && sa1.role === 'super_admin' && sa1.status === 'active', 'SA1 is active super admin in db');
assert(sa2 && sa2.role === 'super_admin' && sa2.status === 'active', 'SA2 is active super admin in db');

// 2. Super Admin Protection Logic
console.log('2. Checking Super Admin Protection & Immutability...');
assert.throws(() => {
  db.changeEmployeeRole(sa1.id, 'donor', { id: 'sa2', name: 'Sarthak', role: 'super_admin' });
}, /PROTECTION LOCK/, 'Changing designated super admin role must throw');

assert.throws(() => {
  db.setEmployeeStatus(sa1.id, 'suspended', { id: 'sa2', name: 'Sarthak', role: 'super_admin' });
}, /PROTECTION LOCK/, 'Deactivating designated super admin must throw');

assert.throws(() => {
  db.deleteEmployee(sa1.id, { id: 'sa2', name: 'Sarthak', role: 'super_admin' });
}, /PROTECTION LOCK/, 'Deleting designated super admin must throw');

// 3. Team Management Access Control
console.log('3. Checking Team Management Access Controls...');
assert.throws(() => {
  db.getEmployees({ id: 'user-donor', name: 'Donor', role: 'donor' });
}, /ACCESS DENIED/, 'Non-super-admin cannot access employee records');

const staff = db.getEmployees({ id: sa1.id, name: sa1.name, role: 'super_admin' });
assert(staff.length >= 2, 'Super admin can view staff list');

// 4. Reset Credentials with Single-Use Temporary Password
console.log('4. Checking Credential Reset...');
const employeeResult = db.createEmployee({
  name: 'Test Reviewer',
  email: `test.reviewer.${Date.now()}@dokind.org.in`,
  role: 'reviewer',
  department: 'Trust & Safety',
  jobTitle: 'Verification Officer',
}, { id: sa1.id, name: sa1.name, role: 'super_admin' });

assert(employeeResult && employeeResult.user && employeeResult.user.id, 'New employee created');
assert(employeeResult.temporaryPassword.startsWith('Dk#'), 'Initial temporary password generated');

const tempCreds = db.initiateCredentialReset(employeeResult.user.id, { id: sa1.id, name: sa1.name, role: 'super_admin' });
assert(tempCreds.temporaryPassword.startsWith('Dk#'), 'Temporary password generated on reset');

// 5. Campaign Operations Hub & Media Management
console.log('5. Checking Campaign Operations Hub & Media...');
const campaign = db.getCampaignById('camp-aarav-cancer');
assert(campaign, 'camp-aarav-cancer exists');

const updatedCamp = db.updateCampaignMedia('camp-aarav-cancer', {
  artwork: {
    mainPosterUrl: 'https://images.unsplash.com/photo-poster-test',
    heroImageUrl: 'https://images.unsplash.com/photo-hero-test',
    thumbnailSquareUrl: 'https://images.unsplash.com/photo-thumb-test',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    gallery: ['https://images.unsplash.com/photo-g1', 'https://images.unsplash.com/photo-g2'],
  },
}, 'Saurabh Karn');
assert(updatedCamp && updatedCamp.artwork?.videoUrl === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Artwork updated');

// 6. Campaign Status Transition with Mandatory Reason
console.log('6. Checking Campaign Status Transition...');
const paused = db.setCampaignStatus('camp-aarav-cancer', 'suspended', 'Saurabh Karn', 'Temporary medical document re-audit');
assert(paused && paused.status === 'suspended', 'Campaign suspended with logged reason');
db.setCampaignStatus('camp-aarav-cancer', 'active', 'Saurabh Karn', 'Re-audit passed, resumed');

// 7. Safe Delete Guard
console.log('7. Checking Safe Delete Campaign Guard...');
assert.throws(() => {
  db.safeDeleteCampaign('camp-aarav-cancer', 'Saurabh Karn');
}, /CANNOT DELETE CAMPAIGN/, 'Safe delete must block deleting campaigns with donations');

// 8. Evidence Vault Management (Public vs Internal)
console.log('8. Checking Evidence Vault Document Management...');
const campWithDoc = db.addCampaignEvidenceDocument('camp-aarav-cancer', {
  title: 'Hospital Verification Certificate',
  type: 'medical_estimate',
  url: 'https://dokind.org/docs/med-cert-01.pdf',
  isPublic: true,
  status: 'verified',
  reviewerNotes: 'CONFIDENTIAL: Verified directly with Max Hospital billing desk on Oct 24',
  cloudProvider: 'google_drive',
  fileSize: '2.4 MB',
}, 'Saurabh Karn');

assert(campWithDoc && campWithDoc.documents, 'Campaign documents exist');
const addedDoc = campWithDoc.documents.find((d) => d.title === 'Hospital Verification Certificate');
assert(addedDoc && addedDoc.isPublic === true && addedDoc.verified === true, 'Public doc verified');

// 9. Campaign Milestone Updates with Photos, Video & Cloud Links
console.log('9. Checking Campaign Updates System...');
const newUpdate = db.createCampaignUpdate({
  campaignId: 'camp-aarav-cancer',
  title: 'Chemotherapy Cycle 2 Completed Successfully',
  content: 'Little Aarav completed round 2 with strong vital signs. Thank you to all donors!',
  authorName: 'Saurabh Karn',
  authorRole: 'super_admin',
  milestoneType: 'milestone_achieved',
  publishedAt: new Date().toISOString(),
  eventDate: '2026-10-24',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  mediaUrls: [
    'https://images.unsplash.com/photo-recovery-1',
    'https://images.unsplash.com/photo-recovery-2',
  ],
  cloudLinks: [
    {
      id: 'cloud-1',
      label: 'Doctor Daily Rounds Folder',
      url: 'https://drive.google.com/drive/folders/sample',
      provider: 'google_drive',
      isPublic: true,
    },
  ],
  evidenceAttachments: [
    {
      id: 'ev-1',
      title: 'Cycle 2 Hospital Receipt',
      fileUrl: 'https://dokind.org/receipts/cycle2.pdf',
      evidenceCategory: 'medical_bill',
      isPublic: true,
      status: 'verified',
      uploadedAt: '2026-10-24T10:00:00Z',
    },
  ],
});

assert(newUpdate && newUpdate.id, 'Campaign update authored');
assert(newUpdate.status === 'pending_review', 'Update defaults to pending review for governance');

const approved = db.approveCampaignUpdate(newUpdate.id, 'Saurabh Karn');
assert(approved && approved.status === 'published', 'Update successfully approved for publication');

const published = db.getCampaignUpdates('camp-aarav-cancer', false);
const foundUpd = published.find((u) => u.id === newUpdate.id);
assert(foundUpd, 'Published update found');
assert(foundUpd.mediaUrls?.length === 2, '2 ground photos attached');
assert(foundUpd.cloudLinks?.[0].isPublic === true, 'Public cloud link attached');

console.log('🎉 ALL ADVANCED TEAM & CAMPAIGN OPERATIONS CHECKS PASSED PERFECTLY!');
