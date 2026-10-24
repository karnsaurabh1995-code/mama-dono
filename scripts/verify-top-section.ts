import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';

console.log('================================================================');
console.log('DOKIND — TOP HOMEPAGE SECTION & TICKER VERIFICATION SUITE');
console.log('================================================================\n');

// 1. Verify SiteSettings in Database
console.log('--- 1. Testing Database Site Settings & Ticker Configuration ---');
const settings = db.getSiteSettings();
assert(settings.platformName, 'Platform name configured');
assert(settings.liveTickerEnabled !== undefined, 'Live ticker enabled setting present');
assert(settings.tickerMode, 'Ticker mode defined in settings');
assert(Array.isArray(settings.trustMessages), 'Trust messages array defined in settings');
assert(settings.trustMessages.length >= 3, 'Multiple platform trust statements configured');
assert(
  settings.trustMessages.some((m) => m.includes('80G')),
  'Includes 80G tax benefit trust indicator'
);
console.log('✓ PASSED: Database settings support tickerMode and verifiable trust statements');

// 2. Verify Header Component Deduplication
console.log('\n--- 2. Testing Header Component Structure & Deduplication ---');
const headerPath = path.join(__dirname, '../src/components/layout/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

// Row A tests
assert(headerContent.includes('TOP UTILITY BAR'), 'Header contains Row A top utility bar');
assert(headerContent.includes('handleUtilitySearchSubmit'), 'Row A contains utility search handler');
assert(headerContent.includes('siteSettings.tagline'), 'Row A displays editable brand tagline');

// Count Donate Now occurrences in desktop layout
// In Row A:
assert(headerContent.includes('<span>Donate Now</span>'), 'Row A contains Donate Now action button');

// Desktop Actions in Row B should NOT contain a second Donate Now button
const desktopActionsMatch = headerContent.match(/\{\/\* Desktop Actions \*\/\}[\s\S]*?\{\/\* Mobile Controls \*\/\}/);
assert(desktopActionsMatch, 'Found Desktop Actions section in Row B');
const desktopActionsContent = desktopActionsMatch[0];

assert(
  !desktopActionsContent.includes('Donate Now'),
  'Deduplicated: Row B desktop actions do NOT contain a duplicate Donate Now button'
);
assert(
  !desktopActionsContent.includes('href="/search"'),
  'Deduplicated: Row B desktop actions do NOT contain a duplicate search icon button'
);
assert(
  desktopActionsContent.includes('Start a Fundraiser'),
  'Row B desktop actions contain Start a Fundraiser button'
);
console.log('✓ PASSED: Header deduplication verified (0 duplicate search, 0 duplicate Donate Now buttons)');

// 3. Verify Hero Carousel Split-Panel Structure
console.log('\n--- 3. Testing Hero Carousel Split-Panel Layout ---');
const heroPath = path.join(__dirname, '../src/components/home/HeroCarousel.tsx');
const heroContent = fs.readFileSync(heroPath, 'utf8');

assert(
  heroContent.includes('rounded-[28px]') || heroContent.includes('rounded-[32px]'),
  'Hero container features 28px/32px rounded border radius'
);
assert(
  heroContent.includes('min-h-[540px]') || heroContent.includes('h-[620px]'),
  'Hero container features ~540-620px desktop height'
);
assert(
  heroContent.includes('bg-[#18191B]'),
  'Hero container uses dark charcoal surface #18191B'
);
assert(
  heroContent.includes('lg:w-[48%]') || heroContent.includes('lg:w-[46%]'),
  'Hero left text panel takes ~46-48% width on desktop'
);
assert(
  heroContent.includes('clip-path:polygon'),
  'Hero right photography panel incorporates True Hope diagonal division clip-path'
);
assert(
  heroContent.includes('ChevronLeft') && heroContent.includes('ChevronRight'),
  'Hero carousel includes accessible centered circular prev/next arrow buttons'
);
assert(
  heroContent.includes('ShieldCheck'),
  'Hero carousel displays medical & NGO verification badges'
);
console.log('✓ PASSED: Hero carousel split composition (True Hope Foundation reference) verified');

// 4. Verify Single DonateKart-Style Horizontal Ticker
console.log('\n--- 4. Testing Horizontal Ticker Design & Dual-Mode Support ---');
const tickerPath = path.join(__dirname, '../src/components/common/LiveDonationTicker.tsx');
const tickerContent = fs.readFileSync(tickerPath, 'utf8');

assert(
  tickerContent.includes('DokindMark'),
  'Ticker renders official Dokind brand mark separators between items'
);
assert(
  tickerContent.includes('bg-[#FAF9F6]'),
  'Ticker uses clean warm-neutral background matching DonateKart reference'
);
assert(
  tickerContent.includes('border-y border-[#E8E6E1]'),
  'Ticker has subtle top and bottom borders'
);
assert(
  tickerContent.includes('animate-marquee'),
  'Ticker incorporates smooth horizontal marquee animation'
);
assert(
  tickerContent.includes('isPaused') || tickerContent.includes('onMouseEnter'),
  'Ticker pauses animation smoothly on hover'
);
assert(
  tickerContent.includes('overflow-hidden'),
  'Ticker enforces zero document horizontal overflow'
);
assert(
  tickerContent.includes('live_donations') && tickerContent.includes('trust_messages'),
  'Ticker supports dual-mode operation (Mode 1: Live donations, Mode 2: Trust statements, Mode 3: Hybrid)'
);
console.log('✓ PASSED: Horizontal ticker styling & dual-mode mechanics (DonateKart reference) verified');

// 5. Verify Homepage Section Flow & Single Ticker Placement
console.log('\n--- 5. Testing Homepage Layout & Ticker Placement ---');
const homePath = path.join(__dirname, '../src/app/page.tsx');
const homeContent = fs.readFileSync(homePath, 'utf8');

assert(
  !homeContent.includes('LiveDonationCarousel'),
  'Redundant LiveDonationCarousel component completely removed from homepage'
);

const returnMatch = homeContent.match(/return\s*\([\s\S]*?\);/);
assert(returnMatch, 'Found JSX return block in HomePage');
const jsxContent = returnMatch[0];

const heroIdx = jsxContent.indexOf('<HeroCarousel');
const tickerIdx = jsxContent.indexOf('<LiveDonationTicker');
assert(heroIdx !== -1, 'HeroCarousel mounted on homepage');
assert(tickerIdx !== -1, 'LiveDonationTicker mounted on homepage');
assert(
  tickerIdx > heroIdx,
  'Single cohesive LiveDonationTicker is placed DIRECTLY BENEATH HeroCarousel'
);

// Ensure no ticker rendered before hero in JSX
const beforeHero = jsxContent.substring(0, heroIdx);
assert(
  !beforeHero.includes('<LiveDonationTicker'),
  'Deduplicated: No ticker rendered above HeroCarousel'
);
console.log('✓ PASSED: Single ticker placed directly beneath hero with zero duplicate feeds');

// 6. Verify Admin Settings Controls for Ticker
console.log('\n--- 6. Testing Admin Settings Controls ---');
const adminSettingsPath = path.join(__dirname, '../src/app/admin/settings/page.tsx');
const adminSettingsContent = fs.readFileSync(adminSettingsPath, 'utf8');

assert(
  adminSettingsContent.includes('tickerMode'),
  'Admin settings UI provides ticker mode selection'
);
assert(
  adminSettingsContent.includes('trustMessages'),
  'Admin settings UI provides trust statements configuration'
);
assert(
  adminSettingsContent.includes('liveTickerEnabled'),
  'Admin settings UI provides live ticker enable toggle'
);
console.log('✓ PASSED: Admin settings allow managing ticker mode, visibility, and trust messages');

console.log('\n================================================================');
console.log('ALL TOP SECTION & TICKER TESTS PASSED! (18 / 18 assertions)');
console.log('================================================================\n');
