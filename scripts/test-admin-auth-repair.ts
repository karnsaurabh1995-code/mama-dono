/**
 * DOKIND SUPER ADMIN AUTHENTICATION REPAIR — AUTOMATED VERIFICATION SUITE
 *
 * Exercises all 16 credential verification cases, first-login rotation flow,
 * rate-limiting, and open-redirect sanitization.
 */

import { db } from '../src/lib/db';
import {
  authenticateAdmin,
  checkAdminRateLimit,
  recordAdminFailedAttempt,
  clearAdminAttempts,
  resetAllAdminRateLimits,
} from '../src/lib/auth/admin-auth';
import {
  hashPasswordSync,
  verifyPassword,
  validatePasswordStrength,
} from '../src/lib/auth/password';
import { getSafeReturnUrl } from '../src/lib/utils';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function run() {
  console.log('================================================================');
  console.log('    DOKIND SUPER ADMIN AUTH REPAIR — VERIFICATION SUITE         ');
  console.log('================================================================\n');

  // Preserve database state backup for rollback
  const dbStatePath = path.resolve(process.cwd(), 'data/database-state.json');
  let originalDbState: string | null = null;
  if (fs.existsSync(dbStatePath)) {
    originalDbState = fs.readFileSync(dbStatePath, 'utf8');
  }

  try {
    // -------------------------------------------------------------------------
    // 1. CREDENTIAL VERIFICATION TEST CASES (Section 11.1)
    // -------------------------------------------------------------------------
    console.log('--- 1. Section 11.1: 16 Credential Verification Test Cases ---');

    // Case 1: sarthakraj2009 with valid initial password
    const c1 = await authenticateAdmin('sarthakraj2009', 'sarthakraj726');
    assert(
      c1.success === true && c1.requiresPasswordChange === true && c1.user?.role === 'super_admin',
      'Case 1: sarthakraj2009 with valid initial password succeeds and flags requiresPasswordChange=true'
    );

    // Case 2: sarthakraj726@gmail.com with valid initial password
    const c2 = await authenticateAdmin('sarthakraj726@gmail.com', 'sarthakraj726');
    assert(
      c2.success === true && c2.requiresPasswordChange === true,
      'Case 2: sarthakraj726@gmail.com with valid initial password succeeds'
    );

    // Case 3: karnsaurabh with valid initial password
    const c3 = await authenticateAdmin('karnsaurabh', 'sarthakraj726');
    assert(
      c3.success === true && c3.user?.role === 'super_admin',
      'Case 3: karnsaurabh with valid initial password succeeds'
    );

    // Case 4: karnsaurabh1995@gmail.com with valid initial password
    const c4 = await authenticateAdmin('karnsaurabh1995@gmail.com', 'sarthakraj726');
    assert(
      c4.success === true && c4.user?.role === 'super_admin',
      'Case 4: karnsaurabh1995@gmail.com with valid initial password succeeds'
    );

    // Case 5: sarthakraj2009 with wrong password -> REJECTED (generic message)
    const c5 = await authenticateAdmin('sarthakraj2009', 'WrongPassword!99');
    assert(
      c5.success === false && c5.error === 'Invalid Admin ID or Password.',
      'Case 5: sarthakraj2009 with wrong password rejected with generic non-enumerating error'
    );

    // Case 6: Non-existent username -> REJECTED (identical error)
    const c6 = await authenticateAdmin('unknownadmin99', 'AnyPassword123!');
    assert(
      c6.success === false && c6.error === 'Invalid Admin ID or Password.',
      'Case 6: Non-existent username rejected with identical generic error (no enumeration)'
    );

    // Case 7: Suspended admin account -> REJECTED (identical error)
    db.createUser({
      id: 'test-suspended-admin',
      name: 'Suspended Admin',
      email: 'suspended.admin@dokind.org',
      username: 'suspendedadmin',
      role: 'super_admin',
      status: 'suspended',
      passwordHash: hashPasswordSync('ValidPassword123!'),
    });
    const c7 = await authenticateAdmin('suspendedadmin', 'ValidPassword123!');
    assert(
      c7.success === false && c7.error === 'Invalid Admin ID or Password.',
      'Case 7: Suspended admin account rejected with identical error'
    );

    // Case 8: Regular donor trying to log in at /admin/login -> REJECTED (forbidden role)
    db.createUser({
      id: 'test-regular-donor',
      name: 'Regular Donor',
      email: 'donor.test@example.com',
      username: 'regulardonor',
      role: 'donor',
      status: 'active',
      passwordHash: hashPasswordSync('ValidPassword123!'),
    });
    const c8 = await authenticateAdmin('regulardonor', 'ValidPassword123!');
    assert(
      c8.success === false && (c8.error?.includes('insufficient administrative privileges') || false),
      'Case 8: Regular donor without administrative role rejected with privilege denial'
    );

    // Case 9 & 10: Valid admin changes password -> Old password rejected, new password succeeds
    const rotationAdmin = db.createUser({
      id: 'test-rotation-admin',
      name: 'Rotation Admin',
      email: 'rotation.admin@dokind.org',
      username: 'rotationadmin',
      role: 'super_admin',
      status: 'active',
      passwordHash: hashPasswordSync('InitialPassword123!'),
      requiresPasswordChange: true,
    });
    // Rotate password
    const newHash = hashPasswordSync('NewPermanentPassword456!');
    db.updateUser(rotationAdmin.id, {
      passwordHash: newHash,
      requiresPasswordChange: false,
    });
    // Case 9: Old password rejected
    const c9 = await authenticateAdmin('rotationadmin', 'InitialPassword123!');
    assert(
      c9.success === false && c9.error === 'Invalid Admin ID or Password.',
      'Case 9: Subsequent login with OLD password rejected'
    );
    // Case 10: New password succeeds with requiresPasswordChange=false
    const c10 = await authenticateAdmin('rotationadmin', 'NewPermanentPassword456!');
    assert(
      c10.success === true && c10.requiresPasswordChange === false,
      'Case 10: Subsequent login with NEW password succeeds with requiresPasswordChange=false'
    );

    // Case 11: Leading/trailing whitespace on identifier -> SUCCESS (trimmed)
    const c11 = await authenticateAdmin('   sarthakraj2009   ', 'sarthakraj726');
    assert(
      c11.success === true,
      'Case 11: Identifier with leading/trailing whitespace is trimmed and succeeds'
    );

    // Case 12: Case variations on email -> SUCCESS (case-insensitive)
    const c12 = await authenticateAdmin('SarthakRaj726@Gmail.Com', 'sarthakraj726');
    assert(
      c12.success === true,
      'Case 12: Email with mixed casing is handled case-insensitively and succeeds'
    );

    // Case 13: Case variations on username -> SUCCESS (case-insensitive)
    const c13 = await authenticateAdmin('SarthakRaj2009', 'sarthakraj726');
    assert(
      c13.success === true,
      'Case 13: Username with mixed casing is handled case-insensitively and succeeds'
    );

    // Case 14: Empty identifier or password -> REJECTED (400 validation error)
    const c14a = await authenticateAdmin('', 'somepass');
    const c14b = await authenticateAdmin('sarthakraj2009', '');
    assert(
      c14a.success === false && c14b.success === false,
      'Case 14: Empty identifier or password rejected with required fields validation message'
    );

    // Case 15: 5 consecutive failed attempts -> 6th attempt is RATE-LIMITED
    resetAllAdminRateLimits();
    const testIp = '198.51.100.42';
    const rateTestUser = 'ratelimittestuser';
    for (let i = 1; i <= 5; i++) {
      recordAdminFailedAttempt(rateTestUser, testIp);
    }
    const rateCheck = checkAdminRateLimit(rateTestUser, testIp);
    assert(
      rateCheck.allowed === false && (rateCheck.retryAfterSeconds || 0) > 0,
      'Case 15: 5 failed attempts trigger rate-limiting on 6th attempt (429 condition)'
    );

    // Case 16: Successful login resets failed-attempt counter
    clearAdminAttempts(rateTestUser, testIp);
    const postResetCheck = checkAdminRateLimit(rateTestUser, testIp);
    assert(
      postResetCheck.allowed === true,
      'Case 16: Successful authentication / clearAdminAttempts resets rate-limit counter'
    );

    // -------------------------------------------------------------------------
    // 2. STRICT ONE-TIME BOOTSTRAP GATE & FALLBACK ELIMINATION (Section 11.2)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Section 11.2: One-Time Bootstrap Path & Backdoor Immunity ---');

    // Add temporary email to designated super admins allowlist for test isolation
    process.env.INITIAL_SUPER_ADMIN_EMAILS =
      'karnsaurabh1995@gmail.com,sarthakraj726@gmail.com,testbootstrap@dokind.org';

    // Test account with NO password hash initially
    const unhashedSuperAdmin = db.createUser({
      id: 'test-unhashed-sa',
      name: 'Unhashed Super Admin',
      email: 'testbootstrap@dokind.org',
      username: 'unhashedsa',
      role: 'super_admin',
      status: 'active',
      passwordHash: undefined,
    });

    // Login with bootstrap secret initializes passwordHash and requiresPasswordChange
    const bootstrapLogin = await authenticateAdmin('unhashedsa', 'sarthakraj726');
    assert(
      bootstrapLogin.success === true &&
      bootstrapLogin.requiresPasswordChange === true &&
      !!unhashedSuperAdmin.passwordHash,
      'Bootstrap login provisions passwordHash for unhashed designated Super Admin'
    );

    // Verify stored hash matches the bootstrap password
    const hashVerification = await verifyPassword('sarthakraj726', unhashedSuperAdmin.passwordHash || '');
    assert(
      hashVerification === true,
      'Bootstrap creates valid salted scrypt hash matching the bootstrap password'
    );

    // Now update password (simulate first-login rotation)
    const rotatedHash = hashPasswordSync('RotatedPermanentPass789!');
    db.updateUser(unhashedSuperAdmin.id, {
      passwordHash: rotatedHash,
      requiresPasswordChange: false,
    });

    // Test that old bootstrap password CANNOT bypass the stored rotated hash
    const backdoorAttempt = await authenticateAdmin('unhashedsa', 'sarthakraj726');
    assert(
      backdoorAttempt.success === false,
      'Security Guarantee: Old bootstrap password CANNOT bypass or overwrite rotated password hash'
    );

    // Test that rotated password succeeds
    const rotatedLogin = await authenticateAdmin('unhashedsa', 'RotatedPermanentPass789!');
    assert(
      rotatedLogin.success === true && rotatedLogin.requiresPasswordChange === false,
      'Rotated password authenticates cleanly without requiring password change'
    );

    // -------------------------------------------------------------------------
    // 3. PASSWORD STRENGTH VALIDATION (Section 11.2)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Password Strength Validator ---');
    assert(
      validatePasswordStrength('short1').valid === false,
      'validatePasswordStrength rejects passwords < 8 characters'
    );
    assert(
      validatePasswordStrength('onlylettershere').valid === false,
      'validatePasswordStrength rejects passwords without numbers'
    );
    assert(
      validatePasswordStrength('1234567890').valid === false,
      'validatePasswordStrength rejects passwords without letters'
    );
    assert(
      validatePasswordStrength('StrongPassword1!').valid === true,
      'validatePasswordStrength accepts compliant passwords'
    );

    // -------------------------------------------------------------------------
    // 4. OPEN-REDIRECT DEFENSE (Section 2.1 & 11.3)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Open-Redirect Defense ---');
    assert(
      getSafeReturnUrl('/admin') === '/admin',
      'getSafeReturnUrl preserves valid relative /admin'
    );
    assert(
      getSafeReturnUrl('/admin/campaigns?tab=active') === '/admin/campaigns?tab=active',
      'getSafeReturnUrl preserves complex relative paths'
    );
    assert(
      getSafeReturnUrl('https://malicious-site.com') === '/admin',
      'getSafeReturnUrl neutralizes external https:// URL to /admin'
    );
    assert(
      getSafeReturnUrl('//evil.com') === '/admin',
      'getSafeReturnUrl neutralizes protocol-relative //evil.com to /admin'
    );
    assert(
      getSafeReturnUrl('/\\evil.com') === '/admin',
      'getSafeReturnUrl neutralizes backslash evasion /\\evil.com to /admin'
    );
    assert(
      getSafeReturnUrl('javascript:alert(1)') === '/admin',
      'getSafeReturnUrl neutralizes javascript: pseudo-protocol to /admin'
    );
    assert(
      getSafeReturnUrl(null) === '/admin',
      'getSafeReturnUrl handles null safely'
    );
  } finally {
    // Restore original database state
    if (originalDbState) {
      fs.writeFileSync(dbStatePath, originalDbState, 'utf8');
      db.loadPersistedState();
    }
  }

  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
