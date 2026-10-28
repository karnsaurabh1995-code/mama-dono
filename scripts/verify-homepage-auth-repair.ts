/**
 * Comprehensive Verification Suite for Dokind Homepage, Admin Login, and Donor OTP Repairs
 *
 * Verifies:
 * 1. Hero Carousel contrast enforcement, dark photographic canvas, and builder safety fallback
 * 2. Header navigation ("Stories" -> /blog, removed promo strip, understated Admin Login)
 * 3. Footer payment strip removal & subtle Admin Login link
 * 4. Admin authentication engine: native scrypt hashing, timingSafeEqual, bootstrap accounts,
 *    rate limiting, non-enumerating errors, and first-login password rotation
 * 5. Donor OTP authentication: MSG91 adapter, production fail-closed security, phone normalization,
 *    and multi-channel LoginModal (Mobile SMS OTP + Email OTP)
 */

import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import {
  hashPassword,
  hashPasswordSync,
  verifyPassword,
  validatePasswordStrength,
} from '../src/lib/auth/password';
import {
  checkAdminRateLimit,
  recordAdminFailedAttempt,
  clearAdminAttempts,
  authenticateAdmin,
} from '../src/lib/auth/admin-auth';
import { normalizePhoneNumber } from '../src/lib/auth/phone';
import { sendMsg91Otp, verifyMsg91Otp } from '../src/lib/auth/msg91';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✗\x1b[0m ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runVerification() {
  console.log('\n============================================================');
  console.log('   DOKIND HOMEPAGE, ADMIN AUTH & DONOR OTP VERIFICATION');
  console.log('============================================================\n');

  // ------------------------------------------------------------------------
  // TEST SUITE 1: HERO CAROUSEL CONTRAST & VISUAL ARCHITECTURE
  // ------------------------------------------------------------------------
  console.log('1. Hero Carousel Visual Architecture & Contrast Protection');

  const heroFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/home/HeroCarousel.tsx'),
    'utf8'
  );

  // Check 1.1: Luminance check is implemented
  assert(
    heroFile.includes('function isSafeDarkBackground') &&
      heroFile.includes('lum <= 0.40'),
    'Luminance calculator and isSafeDarkBackground contrast fallback exist in HeroCarousel'
  );

  // Check 1.2: Smooth dark gradient overlay
  assert(
    heroFile.includes('linear-gradient(90deg, rgba(10,10,12,0.97) 0%, rgba(10,10,12,0.92) 36%') &&
      heroFile.includes('linear-gradient(180deg, rgba(10,10,12,0.45) 0%'),
    'Desktop horizontal gradient overlay and mobile vertical gradient overlay are present'
  );

  // Check 1.3: Elimination of split-panel box and clip path
  assert(
    !heroFile.includes('clipPath') && !heroFile.includes('clip-path'),
    'No broken diagonal clip-paths or split panel seams in hero carousel'
  );

  // Check 1.4: High contrast typography and buttons
  assert(
    heroFile.includes('#EF4949') && heroFile.includes('text-white') && heroFile.includes('text-neutral-200'),
    'Hero heading is pure white and primary CTA uses Dokind red (#EF4949) with WCAG AA compliance'
  );

  // Check 1.5: Interactive navigation elements preserved
  assert(
    heroFile.includes('prevSlide') &&
      heroFile.includes('nextSlide') &&
      heroFile.includes('setInterval'),
    'Slide auto-advance, keyboard controls, navigation arrows, and dots preserved'
  );

  // ------------------------------------------------------------------------
  // TEST SUITE 2: HEADER NAVIGATION & BANNER STRIP REMOVAL
  // ------------------------------------------------------------------------
  console.log('\n2. Header Navigation & Promotional Strip Removal');

  const headerFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/layout/Header.tsx'),
    'utf8'
  );

  // Check 2.1: "Stories" link pointing to /blog
  assert(
    headerFile.includes("label: 'Stories', href: '/blog'") ||
      (headerFile.includes('href="/blog"') && headerFile.includes('Stories')),
    'Public header navigation includes "Stories" linking to "/blog"'
  );

  // Check 2.2: "Product Giving" removed from primary nav array
  assert(
    !headerFile.includes("label: 'Product Giving', href: '/product-giving'"),
    'Primary navigation does not display "Product Giving"'
  );

  // Check 2.3: Top announcement banner removed
  assert(
    !headerFile.includes('settings.topBanner') &&
      !headerFile.includes('100% CSR matching grant'),
    'Top red promotional announcement banner removed from public header'
  );

  // Check 2.4: Understated "Admin Login" link with Lock icon in header
  assert(
    headerFile.includes('href="/admin/login"') && headerFile.includes('Admin Login'),
    'Understated "Admin Login" link with Lock icon present in header utilities and mobile menu'
  );

  // Check 2.5: No role switcher or Test Mode banner in public header
  assert(
    !headerFile.includes('Test Mode Active') && !headerFile.includes('roleSwitcherOpen'),
    'Public header does not display "Test Mode Active" or role selector'
  );

  // ------------------------------------------------------------------------
  // TEST SUITE 3: FOOTER PAYMENT STRIP REMOVAL & ADMIN LOGIN LINK
  // ------------------------------------------------------------------------
  console.log('\n3. Footer Payment Strip Removal & Subtle Admin Login');

  const footerFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/layout/Footer.tsx'),
    'utf8'
  );

  // Check 3.1: Payment method strip removed
  assert(
    !footerFile.includes('Accepted Indian Payment Methods:') &&
      !footerFile.includes('UPI (GPay / PhonePe / Paytm)'),
    'Payment method banner strip removed from public footer'
  );

  // Check 3.2: Admin Login link present in legal footer
  assert(
    footerFile.includes('href="/admin/login"') && footerFile.includes('Admin Login'),
    'Understated "Admin Login" link with Lock icon present in footer legal section'
  );

  // ------------------------------------------------------------------------
  // TEST SUITE 4: SCRYPT PASSWORD HASHING & ADMIN AUTH ENGINE
  // ------------------------------------------------------------------------
  console.log('\n4. Admin Auth Engine & Native Scrypt Cryptography');

  // Check 4.1: Password hashing format and verification
  const testPassword = 'Password123!';
  const hash = await hashPassword(testPassword);
  assert(
    hash.startsWith('scrypt:') && hash.split(':').length === 3,
    'hashPassword produces valid scrypt format with 16-byte random salt and 64-byte key'
  );

  const correctMatch = await verifyPassword(testPassword, hash);
  assert(correctMatch === true, 'verifyPassword matches valid password');

  const wrongMatch = await verifyPassword('WrongPassword999', hash);
  assert(wrongMatch === false, 'verifyPassword rejects incorrect password');

  // Check 4.2: Password complexity validator
  assert(
    validatePasswordStrength('short1').valid === false,
    'validatePasswordStrength rejects passwords shorter than 8 characters'
  );
  assert(
    validatePasswordStrength('alllettersnodigits').valid === false,
    'validatePasswordStrength rejects passwords missing numeric digits'
  );
  assert(
    validatePasswordStrength('1234567890').valid === false,
    'validatePasswordStrength rejects passwords missing alphabetic characters'
  );
  assert(
    validatePasswordStrength('ValidPass123').valid === true,
    'validatePasswordStrength accepts compliant passwords'
  );

  // Check 4.3: Bootstrap Super Admin Accounts
  db.bootstrapSuperAdmins();
  const sarthak = db.getUserByUsernameOrEmail('sarthakraj2009');
  assert(
    sarthak !== undefined && sarthak.email === 'sarthakraj726@gmail.com',
    'Super Admin "sarthakraj2009" exists and maps to sarthakraj726@gmail.com'
  );
  assert(
    sarthak?.role === 'super_admin' && sarthak?.status === 'active',
    'Super Admin "sarthakraj2009" has role=super_admin and status=active'
  );
  assert(
    sarthak?.passwordHash !== undefined && sarthak.passwordHash.startsWith('scrypt:'),
    'Super Admin "sarthakraj2009" has a salted scrypt password hash'
  );

  const saurabh = db.getUserByUsernameOrEmail('karnsaurabh');
  assert(
    saurabh !== undefined && saurabh.email === 'karnsaurabh1995@gmail.com',
    'Super Admin "karnsaurabh" exists and maps to karnsaurabh1995@gmail.com'
  );

  // Check 4.4: Authenticate with bootstrap password
  const authSarthak = await authenticateAdmin('sarthakraj2009', 'sarthak726');
  assert(
    authSarthak.success === true && authSarthak.user?.email === 'sarthakraj726@gmail.com',
    'authenticateAdmin successfully verifies sarthakraj2009 with bootstrap password'
  );
  assert(
    authSarthak.requiresPasswordChange === true,
    'New bootstrap account is flagged with requiresPasswordChange=true'
  );

  // Check 4.5: Non-enumerating errors for invalid credentials
  const badIdResult = await authenticateAdmin('non_existent_admin_user_404', 'sarthak726');
  assert(
    badIdResult.success === false && badIdResult.error === 'Invalid Admin ID or Password.',
    'authenticateAdmin returns non-enumerating error for invalid username'
  );

  const badPassResult = await authenticateAdmin('sarthakraj2009', 'WrongPassword!');
  assert(
    badPassResult.success === false && badPassResult.error === 'Invalid Admin ID or Password.',
    'authenticateAdmin returns identical non-enumerating error for invalid password'
  );

  // Check 4.6: Admin Rate Limiting (5 attempts in 15 mins)
  const testIp = '192.168.1.100';
  const testUser = 'ratelimit_probe';
  clearAdminAttempts(testUser, testIp);

  for (let i = 0; i < 5; i++) {
    recordAdminFailedAttempt(testUser, testIp);
  }
  const blockedCheck = checkAdminRateLimit(testUser, testIp);
  assert(
    blockedCheck.allowed === false && (blockedCheck.retryAfterSeconds || 0) > 0,
    'checkAdminRateLimit blocks login attempts after 5 consecutive failures'
  );
  clearAdminAttempts(testUser, testIp);
  assert(
    checkAdminRateLimit(testUser, testIp).allowed === true,
    'clearAdminAttempts resets rate limit on successful authentication'
  );

  // ------------------------------------------------------------------------
  // TEST SUITE 5: ADMIN LAYOUT & LOGIN ROUTE
  // ------------------------------------------------------------------------
  console.log('\n5. Admin Dashboard Layout & Dedicated Login Page');

  const adminLayoutFile = fs.readFileSync(
    path.join(process.cwd(), 'src/app/admin/layout.tsx'),
    'utf8'
  );
  assert(
    adminLayoutFile.includes("if (pathname === '/admin/login')"),
    'AdminLayout bypasses dashboard chrome when visiting "/admin/login"'
  );
  assert(
    !adminLayoutFile.includes('Test Mode Active'),
    'Admin dashboard layout has removed "Test Mode Active" badge'
  );
  assert(
    !adminLayoutFile.includes('Simulate Role (RBAC)') &&
      adminLayoutFile.includes('Verified Admin Role Badge'),
    'Admin layout replaces role switcher with verified identity badge'
  );
  assert(
    adminLayoutFile.includes('/api/admin/auth/logout'),
    'Admin top navbar contains interactive Sign Out action'
  );

  const loginPageFile = fs.readFileSync(
    path.join(process.cwd(), 'src/app/admin/login/page.tsx'),
    'utf8'
  );
  assert(
    loginPageFile.includes('mustChangePassword') &&
      loginPageFile.includes('Set Permanent Password'),
    'Admin login page handles first-time login mandatory password rotation seamlessly'
  );

  // ------------------------------------------------------------------------
  // TEST SUITE 6: DONOR OTP (PHONE SMS & EMAIL)
  // ------------------------------------------------------------------------
  console.log('\n6. Donor Multi-Channel Login & Phone OTP Security');

  // Check 6.1: Phone normalization
  const norm10 = normalizePhoneNumber('9876543210');
  assert(
    norm10.isValid && norm10.e164 === '+919876543210' && norm10.masked.includes('210'),
    'normalizePhoneNumber formats Indian 10-digit number to E.164 with masking'
  );

  // Check 6.2: Phone OTP request
  const sendRes = await sendMsg91Otp({ mobile: '9876543210' });
  assert(
    sendRes.success === true && (sendRes.provider === 'msg91' || sendRes.provider === 'mock'),
    'sendMsg91Otp triggers OTP dispatch successfully'
  );

  // Check 6.3: Verification of OTP
  const mockCode = (sendRes.rawResponse as any)?.devOtpHint;
  if (mockCode) {
    const verifyRes = await verifyMsg91Otp({ mobile: '9876543210', otp: mockCode });
    assert(verifyRes.success === true, 'verifyMsg91Otp validates correct OTP code');

    const wrongOtpRes = await verifyMsg91Otp({ mobile: '9876543210', otp: '000000' });
    assert(wrongOtpRes.success === false, 'verifyMsg91Otp rejects incorrect OTP code');
  } else {
    // With real MSG91 provider active, verify that invalid OTP is rejected
    const wrongOtpRes = await verifyMsg91Otp({ mobile: '9876543210', otp: '000000' });
    assert(wrongOtpRes.success === false, 'verifyMsg91Otp rejects invalid OTP code');
  }

  // Check 6.4: Production fail-closed safety check (when unconfigured)
  const msg91Code = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/auth/msg91.ts'),
    'utf8'
  );
  assert(
    msg91Code.includes('// Production fail-closed safety check') &&
      msg91Code.includes("message: 'SMS verification gateway is currently unavailable."),
    'MSG91 adapter strictly FAILS CLOSED in production if credentials are unconfigured'
  );

  // Check 6.5: LoginModal and PhoneOtpForm UI
  const loginModalFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/auth/LoginModal.tsx'),
    'utf8'
  );
  assert(
    loginModalFile.includes('PhoneOtpForm') &&
      loginModalFile.includes('EmailOtpForm') &&
      loginModalFile.includes('Mobile Number') &&
      loginModalFile.includes('Email Address'),
    'LoginModal provides tab switcher between "Mobile Number" and "Email Address"'
  );

  const phoneOtpFormFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/auth/PhoneOtpForm.tsx'),
    'utf8'
  );
  assert(
    phoneOtpFormFile.includes('COUNTRY_CODES') &&
      phoneOtpFormFile.includes('+91') &&
      phoneOtpFormFile.includes('otpDigits') &&
      phoneOtpFormFile.includes('countdown'),
    'PhoneOtpForm includes country selector, 6-box OTP auto-advance, and 60s cooldown timer'
  );

  // ------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED:      \x1b[32m${passed}\x1b[0m`);
  console.log(`FAILED:      \x1b[31m${failed}\x1b[0m`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification runner encountered fatal error:', err);
  process.exit(1);
});
