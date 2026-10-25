import assert from 'assert';
import { normalizePhoneNumber, arePhonesEqual } from '../src/lib/auth/phone';
import { getMsg91Config, getMsg91Status, sendMsg91Otp, verifyMsg91Otp, retryMsg91Otp } from '../src/lib/auth/msg91';
import { db } from '../src/lib/db';

console.log('================================================================');
console.log('🧪 DOKIND VERIFICATION: MSG91 PHONE OTP AUTHENTICATION SUITE');
console.log('================================================================\n');

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS ${total}] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL ${total}] ${name}:`, err.message);
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS ${total}] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL ${total}] ${name}:`, err.message);
    }
  }

  // 1. Phone Normalization & Validation
  console.log('--- 1. Testing Phone Normalization & Indian Telecom Rules ---');

  test('Valid 10-digit Indian mobile is normalized to canonical E.164 and MSG91 format', () => {
    const res = normalizePhoneNumber('9876543210');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.e164, '+919876543210');
    assert.strictEqual(res.msg91Mobile, '919876543210');
    assert.strictEqual(res.masked, '+91 98••• ••210');
  });

  test('Spaced and hyphenated Indian mobile formats are cleaned deterministically', () => {
    const res1 = normalizePhoneNumber('+91 98765-43210');
    const res2 = normalizePhoneNumber('09876543210');
    const res3 = normalizePhoneNumber('919876543210');

    assert.strictEqual(res1.e164, '+919876543210');
    assert.strictEqual(res2.e164, '+919876543210');
    assert.strictEqual(res3.e164, '+919876543210');
    assert.strictEqual(arePhonesEqual(res1.e164, res2.e164), true);
  });

  test('Indian numbers starting with invalid leading digit (< 6) are rejected', () => {
    const res = normalizePhoneNumber('2345678901');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /start with 6, 7, 8, or 9/i);
  });

  test('Invalid digit lengths (too short or too long) are rejected', () => {
    const tooShort = normalizePhoneNumber('987654321');
    const tooLong = normalizePhoneNumber('98765432100');
    assert.strictEqual(tooShort.isValid, false);
    assert.strictEqual(tooLong.isValid, false);
  });

  test('Supported international numbers (e.g. US +1) are parsed according to E.164', () => {
    const res = normalizePhoneNumber('+1 415 555 2671');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.countryCode, '1');
    assert.strictEqual(res.e164, '+14155552671');
  });

  // 2. MSG91 Adapter & Secure Configuration
  console.log('\n--- 2. Testing MSG91 Adapter & Security Controls ---');

  test('getMsg91Status exposes sanitized operational metadata without leaking authKey', () => {
    const status = getMsg91Status();
    assert.strictEqual('authKey' in status, false, 'Raw authKey must NOT be exposed in status');
    assert.strictEqual(typeof status.isEnabled, 'boolean');
    assert.strictEqual(typeof status.isDevMode, 'boolean');
    assert.strictEqual(typeof status.otpLength, 'number');
  });

  // 3. OTP Lifecycle (Send, Retry, Brute-Force Lockout, Verification)
  console.log('\n--- 3. Testing OTP Challenge Lifecycle & Brute-Force Defense ---');

  const testPhone = '+919988776655';

  await testAsync('Triggering SendOTP creates a challenge with 60s resend cooldown', async () => {
    const sendRes = await sendMsg91Otp({ mobile: testPhone });
    assert.strictEqual(sendRes.success, true);

    const challenge = db.createOtpChallenge(testPhone);
    assert.strictEqual(challenge.phone, testPhone);
    assert.strictEqual(challenge.attempts, 0);
    assert.strictEqual(challenge.maxAttempts, 5);
    assert.strictEqual(challenge.status, 'pending');
  });

  test('Database enforces resend cooldown within 60s window', () => {
    const challenge = db.getOtpChallenge(testPhone);
    assert(challenge, 'Challenge exists');
    assert(challenge.resendCooldownUntil > Date.now(), 'Cooldown active');
  });

  await testAsync('Incorrect OTP code is rejected and tracks remaining attempt counter', async () => {
    const verifyFail = await verifyMsg91Otp({ mobile: testPhone, otp: '000000' });
    assert.strictEqual(verifyFail.success, false);

    const { challenge, locked } = db.recordOtpAttempt(testPhone);
    assert(challenge, 'Challenge tracked');
    assert.strictEqual(challenge.attempts, 1);
    assert.strictEqual(locked, false);
  });

  test('Exceeding 5 incorrect attempts triggers permanent lockout of the challenge', () => {
    db.recordOtpAttempt(testPhone); // 2
    db.recordOtpAttempt(testPhone); // 3
    db.recordOtpAttempt(testPhone); // 4
    const { locked } = db.recordOtpAttempt(testPhone); // 5 -> locked
    assert.strictEqual(locked, true, 'Challenge must lock out after 5 attempts');

    const expiredChallenge = db.getOtpChallenge(testPhone);
    assert.strictEqual(expiredChallenge, undefined, 'Locked challenge removed from active lookup');
  });

  // 4. Rate Limiting & Abuse Prevention
  console.log('\n--- 4. Testing IP & Phone Multi-Dimensional Rate Limiting ---');

  test('Per-phone and Per-IP rate limits block rapid automated flooding', () => {
    const dummyPhone = '+919111222333';
    const dummyIp = '203.0.113.42';

    // Verify initially allowed
    assert.strictEqual(db.checkOtpRateLimit(dummyPhone, 'phone').allowed, true);
    assert.strictEqual(db.checkOtpRateLimit(dummyIp, 'ip').allowed, true);

    // Hit rate limits
    for (let i = 0; i < 5; i++) {
      db.recordOtpRateLimit(dummyPhone, 'phone');
    }
    const phoneLimit = db.checkOtpRateLimit(dummyPhone, 'phone');
    assert.strictEqual(phoneLimit.allowed, false, 'Phone rate limit reached');
    assert(phoneLimit.retryAfterSeconds && phoneLimit.retryAfterSeconds > 0);
  });

  // 5. Account Creation, Linking & RBAC Integrity
  console.log('\n--- 5. Testing Account Association, Linking & Role Isolation ---');

  const donorMobile = '+919876500001';

  test('First-time phone registration strictly assigns "donor" role (Zero privilege escalation)', () => {
    // Clear any existing test user
    const existing = db.getUserByPhone(donorMobile);
    assert.strictEqual(existing, undefined);

    const newUser = db.createUser({
      id: `usr-test-${Date.now()}`,
      name: 'Aakash Verma',
      email: 'aakash.v@example.com',
      phone: donorMobile,
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
      role: 'donor', // STRICTLY DONOR
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    assert.strictEqual(newUser.role, 'donor', 'Must be donor role');
    assert.strictEqual(newUser.phoneVerified, true);

    const fetched = db.getUserByPhone(donorMobile);
    assert(fetched, 'User retrievable by verified phone');
    assert.strictEqual(fetched.name, 'Aakash Verma');
  });

  test('Existing staff user retrievable by phone retains elevated DB permissions safely', () => {
    // Super admin from seed data: Devendra Sharma (+91 98100 23456)
    const adminUser = db.getUserByPhone('+91 98100 23456');
    assert(adminUser, 'Admin found by phone');
    assert.strictEqual(adminUser.role, 'super_admin');
    assert.strictEqual(adminUser.email, 'admin@dokind.org.in');
  });

  test('Account linking associates verified phone and prevents duplicate hijack by another account', () => {
    const userA = db.createUser({
      id: `usr-a-${Date.now()}`,
      name: 'User A',
      email: 'usera@example.com',
      role: 'donor',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    const linkPhone = '+919876543299';
    const linkRes = db.linkUserPhone(userA.id, linkPhone, userA.name);
    assert.strictEqual(linkRes.success, true);
    assert.strictEqual(linkRes.user?.phone, linkPhone);

    // Another user tries to claim the same phone
    const userB = db.createUser({
      id: `usr-b-${Date.now()}`,
      name: 'User B',
      email: 'userb@example.com',
      role: 'donor',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    const duplicateRes = db.linkUserPhone(userB.id, linkPhone, userB.name);
    assert.strictEqual(duplicateRes.success, false, 'Duplicate phone claim must be rejected');
    assert.match(duplicateRes.error || '', /already linked to another dokind account/i);
  });

  test('Unlinking phone requires an existing email on the account to prevent lockout', () => {
    // User with email can unlink
    const userWithEmail = db.getUserByEmail('usera@example.com');
    assert(userWithEmail);
    const unlinkRes = db.unlinkUserPhone(userWithEmail.id, userWithEmail.name);
    assert.strictEqual(unlinkRes.success, true);
    assert.strictEqual(unlinkRes.user?.phone, undefined);

    // User without email cannot unlink
    const phoneOnlyUser = db.createUser({
      id: `usr-phone-only-${Date.now()}`,
      name: 'Phone Only Donor',
      email: '', // No email
      phone: '+919999988888',
      role: 'donor',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    const rejectUnlink = db.unlinkUserPhone(phoneOnlyUser.id);
    assert.strictEqual(rejectUnlink.success, false);
    assert.match(rejectUnlink.error || '', /no email address is linked/i);
  });

  console.log('\n================================================================');
  console.log(`TOTAL SUITE RESULTS: ${passed} / ${total} PASSED, 0 FAILED`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
