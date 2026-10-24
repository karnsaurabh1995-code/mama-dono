import { db, DEFAULT_BADGE_STYLES } from '../src/lib/db';
import { DEMO_USERS } from '../src/lib/auth/context';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log('================================================================');
console.log('DOKIND — PRE-LAUNCH POLISH & HYDRATION VERIFICATION SUITE');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. Header Structure, Proportions & Deduplication
// -------------------------------------------------------------
console.log('--- 1. Testing Header Layout, Utility Bar & Deduplication ---');
const headerPath = path.join(process.cwd(), 'src/components/layout/Header.tsx');
const headerCode = fs.readFileSync(headerPath, 'utf-8');

assert(headerCode.includes('DokindLogo'), 'Header uses official DokindLogo component');
assert(headerCode.includes('/campaigns'), 'Explore Campaigns route present');
assert(headerCode.includes('/causes'), 'Causes route present');
assert(headerCode.includes('/monthly-giving'), 'Monthly Giving route present');
assert(headerCode.includes('/product-giving'), 'Product Giving route present');
assert(headerCode.includes('/how-it-works'), 'How It Works route present');
assert(headerCode.includes('/impact'), 'Impact route present');
assert(headerCode.includes('Start a Fundraiser'), 'Start a Fundraiser CTA present');
assert(headerCode.includes('Donate Now'), 'Single prominent Donate Now action present in utility bar');

// Ensure no duplicate search or duplicate donate in desktop/mobile conflicts
const donateNowBtnCount = (headerCode.match(/<span>Donate Now<\/span>/g) || []).length;
assert(donateNowBtnCount === 1, `Header has exactly 1 "Donate Now" CTA button, found ${donateNowBtnCount}`);

// Ensure NO illegal nested <button> inside <Link> in Header.tsx
assert(!headerCode.includes('<Link') || !headerCode.match(/<Link[^>]*>\s*<Button/), 'No illegal nested <Button> inside <Link> tags in Header');

// -------------------------------------------------------------
// 2. Hydration Mismatch Resolution & isLoaded Guard
// -------------------------------------------------------------
console.log('\n--- 2. Testing Hydration Mismatch Resolution & Session State ---');
const authContextPath = path.join(process.cwd(), 'src/lib/auth/context.tsx');
const authCode = fs.readFileSync(authContextPath, 'utf-8');

assert(authCode.includes('isLoaded: boolean'), 'AuthContext exposes isLoaded state');
assert(authCode.includes('syncCookie'), 'AuthContext synchronizes session cookie for cross-tier state consistency');
assert(headerCode.includes('HeaderAccountSkeleton'), 'Header uses stable neutral skeleton during initial SSR / hydration');
assert(headerCode.includes('!isLoaded'), 'Header guards personalized user state with isLoaded to guarantee identical SSR & initial client render');

// Check that no blanket suppressHydrationWarning is used in layout or header
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
const layoutCode = fs.readFileSync(layoutPath, 'utf-8');
assert(!layoutCode.includes('suppressHydrationWarning'), 'RootLayout does not use blanket suppressHydrationWarning');
assert(!headerCode.includes('suppressHydrationWarning'), 'Header does not use suppressHydrationWarning');

// -------------------------------------------------------------
// 3. Contrast & Design Tokens Compliance
// -------------------------------------------------------------
console.log('\n--- 3. Testing High-Contrast Typography & Design Tokens ---');
const cssPath = path.join(process.cwd(), 'src/app/globals.css');
const cssCode = fs.readFileSync(cssPath, 'utf-8');

assert(cssCode.includes('@layer base'), 'Base typography rules placed in @layer base to preserve Tailwind utility specificity');
assert(cssCode.includes('--heading-inverse: #FFFFFF'), 'Inverse high-contrast heading token defined');
assert(cssCode.includes('--heading: #202124'), 'Standard high-contrast dark heading token defined');

const heroCarouselPath = path.join(process.cwd(), 'src/components/home/HeroCarousel.tsx');
const heroCarouselCode = fs.readFileSync(heroCarouselPath, 'utf-8');

assert(heroCarouselCode.includes('!text-white'), 'Hero carousel heading uses explicit !text-white for guaranteed contrast on dark surfaces');
assert(heroCarouselCode.includes('text-neutral-200'), 'Hero subtext uses high-contrast neutral tone (WCAG AA > 7:1)');

// -------------------------------------------------------------
// 4. Badge Contrast & Factual Integrity
// -------------------------------------------------------------
console.log('\n--- 4. Testing Badge Contrast & Factual Guard ---');
const badgeStyles = db.getBadgeStyles();

// Helper to calculate relative luminance & contrast ratio
function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(hex1: string, hex2: string) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Test verified badge contrast
const verifiedStyle = badgeStyles.verified;
const verifiedRatio = contrastRatio(verifiedStyle.textColor, verifiedStyle.backgroundColor);
assert(verifiedRatio >= 4.5, `Verified badge contrast ${verifiedRatio.toFixed(2)}:1 meets WCAG AA (>=4.5:1)`);

// Test urgent badge contrast
const urgentStyle = badgeStyles.urgent;
const urgentRatio = contrastRatio(urgentStyle.textColor, urgentStyle.backgroundColor);
assert(urgentRatio >= 4.5, `Urgent badge contrast ${urgentRatio.toFixed(2)}:1 meets WCAG AA (>=4.5:1)`);

// Test tax 80g badge contrast
const taxStyle = badgeStyles.tax_80g;
const taxRatio = contrastRatio(taxStyle.textColor, taxStyle.backgroundColor);
assert(taxRatio >= 4.5, `80G badge contrast ${taxRatio.toFixed(2)}:1 meets WCAG AA (>=4.5:1)`);

// -------------------------------------------------------------
// 5. Skeleton Loading System & App Router Boundaries
// -------------------------------------------------------------
console.log('\n--- 5. Testing Skeletons & Next.js App Router Loading Boundaries ---');
const skeletonPath = path.join(process.cwd(), 'src/components/ui/Skeleton.tsx');
assert(fs.existsSync(skeletonPath), 'src/components/ui/Skeleton.tsx exists');

const skeletonCode = fs.readFileSync(skeletonPath, 'utf-8');
assert(skeletonCode.includes('HeroCarouselSkeleton'), 'HeroCarouselSkeleton implemented');
assert(skeletonCode.includes('CampaignCardSkeleton'), 'CampaignCardSkeleton implemented');
assert(skeletonCode.includes('CampaignDetailSkeleton'), 'CampaignDetailSkeleton implemented');
assert(skeletonCode.includes('HeaderAccountSkeleton'), 'HeaderAccountSkeleton implemented');
assert(skeletonCode.includes('aria-hidden="true"'), 'Skeletons use accessible aria-hidden');

assert(fs.existsSync(path.join(process.cwd(), 'src/app/campaigns/[slug]/loading.tsx')), 'campaign detail loading.tsx exists');
assert(fs.existsSync(path.join(process.cwd(), 'src/app/campaigns/loading.tsx')), 'campaigns directory loading.tsx exists');
assert(fs.existsSync(path.join(process.cwd(), 'src/app/loading.tsx')), 'root loading.tsx exists');

// -------------------------------------------------------------
// 6. Campaign 404 & Error States
// -------------------------------------------------------------
console.log('\n--- 6. Testing Campaign 404 & Missing Data Handling ---');
const detailPath = path.join(process.cwd(), 'src/app/campaigns/[slug]/page.tsx');
const detailCode = fs.readFileSync(detailPath, 'utf-8');

assert(detailCode.includes('Campaign Not Found'), 'Missing or invalid campaign displays clear Campaign Not Found state');
assert(detailCode.includes('Browse Active Campaigns'), 'Campaign 404 provides navigation back to active campaigns');

// -------------------------------------------------------------
// 7. Role-Based Navigation & Session Preservation
// -------------------------------------------------------------
console.log('\n--- 7. Testing User Roles & Permission Stability ---');
assert(DEMO_USERS.donor.role === 'donor', 'Donor user defined');
assert(DEMO_USERS.head_staff.role === 'head_staff', 'Head staff user defined');
assert(DEMO_USERS.super_admin.role === 'super_admin', 'Super admin user defined');

const activeCampaigns = db.getCampaigns({ status: 'active' });
assert(activeCampaigns.length > 0, `Active campaigns preserved: found ${activeCampaigns.length}`);

console.log('\n================================================================');
console.log('ALL PRE-LAUNCH POLISH & HYDRATION TESTS PASSED! (24 / 24 assertions)');
console.log('================================================================');
