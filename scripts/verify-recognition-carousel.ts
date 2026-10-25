import { db } from '../src/lib/db';
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
console.log('DOKIND SUITE: VERIFYING RECOGNITION CAROUSEL & TAG CLEANUP');
console.log('================================================================\n');

// ----------------------------------------------------------------
// TEST 1: TAG REMOVAL FROM NAVIGATION & FOOTER
// ----------------------------------------------------------------
console.log('--- TEST 1: Removal of Give.do and DonateKart style tags ---');
const footerPath = path.join(process.cwd(), 'src', 'components', 'layout', 'Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf-8');

assert(!footerContent.includes('Give.do style'), 'Footer does NOT contain "Give.do style" badge');
assert(!footerContent.includes('DonateKart style'), 'Footer does NOT contain "DonateKart style" badge');
assert(footerContent.includes('Monthly Giving'), 'Footer preserves clean "Monthly Giving" navigation link');
assert(footerContent.includes('Product Giving'), 'Footer preserves clean "Product Giving" navigation link');

const headerPath = path.join(process.cwd(), 'src', 'components', 'layout', 'Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf-8');
assert(!headerContent.includes("badge: 'Monthly'"), 'Header does NOT attach "Monthly" tag to Monthly Giving');

// ----------------------------------------------------------------
// TEST 2: MEDIA RECOGNITION DATABASE OPERATIONS
// ----------------------------------------------------------------
console.log('\n--- TEST 2: Media Recognition Database Pipeline ---');
const initialRecs = db.getMediaRecognitions();
assert(Array.isArray(initialRecs) && initialRecs.length >= 5, `Database initialized with media recognitions (found ${initialRecs.length})`);

const featuredRecs = db.getMediaRecognitions({ onlyFeatured: true });
assert(featuredRecs.length > 0, `Database has featured recognitions: ${featuredRecs.length}`);
assert(featuredRecs.every((r) => r.isFeatured), 'All filtered items have isFeatured === true');

// Outlet properties
const toi = initialRecs.find((r) => r.outletName === 'The Times of India');
assert(Boolean(toi), 'The Times of India exists in media recognitions');
assert(Boolean(toi?.quote), `TOI quote is present: "${toi?.quote}"`);
assert(Boolean(toi?.logoUrl), 'TOI logoUrl is present');

// CRUD: Create
const newRec = db.createMediaRecognition({
  outletName: 'Forbes India',
  logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=240&q=80',
  quote: 'Redefining measurable philanthropic capital allocation through escrow technology.',
  articleUrl: 'https://forbesindia.com',
  publishedOn: 'Nov 2026',
  category: 'Business & Finance',
  isFeatured: true,
  sortOrder: 99,
});
assert(Boolean(newRec.id), `Successfully created new recognition with ID: ${newRec.id}`);
assert(db.getMediaRecognitionById(newRec.id)?.outletName === 'Forbes India', 'getMediaRecognitionById returns created record');

// CRUD: Update
const updated = db.updateMediaRecognition(newRec.id, { quote: 'Updated Forbes headline quote' });
assert(updated.quote === 'Updated Forbes headline quote', 'Updated quote persisted');

// CRUD: Delete
const deleted = db.deleteMediaRecognition(newRec.id);
assert(deleted === true, 'Successfully deleted created recognition');
assert(db.getMediaRecognitionById(newRec.id) === undefined, 'Deleted recognition is no longer in database');

// ----------------------------------------------------------------
// TEST 3: CONTINUOUS CAROUSEL COMPONENT (HOMEPAGE)
// ----------------------------------------------------------------
console.log('\n--- TEST 3: Continuous Recognition Carousel Component ---');
const mediaSectionPath = path.join(process.cwd(), 'src', 'components', 'home', 'AwardsAndMediaSection.tsx');
assert(fs.existsSync(mediaSectionPath), 'AwardsAndMediaSection component file exists');
const mediaSectionContent = fs.readFileSync(mediaSectionPath, 'utf-8');

assert(mediaSectionContent.includes('animate-marquee'), 'AwardsAndMediaSection uses continuous CSS animate-marquee');
assert(mediaSectionContent.includes('getMediaRecognitions'), 'AwardsAndMediaSection queries db.getMediaRecognitions');
assert(mediaSectionContent.includes('onMouseEnter') && mediaSectionContent.includes('setIsPaused(true)'), 'Carousel supports pause on hover for easy reading');
assert(mediaSectionContent.includes('Featured In National Media'), 'Header displays "Featured In National Media"');
assert(mediaSectionContent.includes('TRUST & RECOGNITION'), 'Header displays "TRUST & RECOGNITION"');
assert(mediaSectionContent.includes('displayItems = [...items, ...items, ...items]'), 'Items are duplicated for smooth seamless infinite scroll');

// ----------------------------------------------------------------
// TEST 4: DEDICATED ADMIN RECOGNITION MANAGEMENT SECTION
// ----------------------------------------------------------------
console.log('\n--- TEST 4: Dedicated Admin Media Recognition Management ---');
const adminRecognitionPath = path.join(process.cwd(), 'src', 'app', 'admin', 'recognition', 'page.tsx');
assert(fs.existsSync(adminRecognitionPath), 'Admin Media Recognition page (/admin/recognition) exists');

const adminRecognitionContent = fs.readFileSync(adminRecognitionPath, 'utf-8');
assert(adminRecognitionContent.includes('National Media Recognition & Press Quotes'), 'Admin page displays correct title');
assert(adminRecognitionContent.includes('MEDIA_PRESETS'), 'Admin page includes quick fill Indian media presets');
assert(adminRecognitionContent.includes('handleToggleFeatured'), 'Admin page supports toggling visibility on carousel');
assert(adminRecognitionContent.includes('handleMove'), 'Admin page supports reordering carousel sequence');
assert(adminRecognitionContent.includes('AwardsAndMediaSection'), 'Admin page renders live continuous carousel simulation');

// Check admin layout navigation link
const adminLayoutPath = path.join(process.cwd(), 'src', 'app', 'admin', 'layout.tsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf-8');
assert(adminLayoutContent.includes('/admin/recognition'), 'Admin sidebar layout includes link to /admin/recognition');

console.log('\n================================================================');
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION ASSERTIONS PASSED SUCCESSFULLY!');
}
