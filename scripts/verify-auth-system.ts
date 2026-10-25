import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { normalizeEmail, isValidEmail, generateEmailOtp, hashOtpCode, verifyOtpCode } from '../src/lib/auth/email-otp';
import { db } from '../src/lib/db';
import { generateOAuthState, verifyOAuthState } from '../src/lib/auth/google';

console.log('================================================================');
console.log('🧪 DOKIND VERIFICATION: COMPLETE AUTHENTICATION SYSTEM SUITE');
console.log('================================================================\n');

// 1. Email Normalization & Validation
console.log('--- 1. Testing Email Normalization & Validation ---');
const email1 = normalizeEmail('  User.Name@Example.COM  ');
assert.strictEqual(email1, 'user.name@example.com', 'Normalized email trims and lowercases');
assert(isValidEmail('sarthak@dokind.org.in'), 'Valid organization email accepted');
assert(isValidEmail('donor.care+tax80g@gmail.com'), 'Gmail plus-address accepted');
assert(!isValidEmail('invalid-email-address'), 'Invalid email without domain rejected');
assert(!isValidEmail('@nodomain.com'), 'Email missing username rejected');
assert(!isValidEmail(''), 'Empty email rejected');
console.log('✅ [PASS 1] Email normalization and RFC validation pass.');

// 2. Cryptographic OTP Generation & Timing-Safe Hashing
console.log('\n--- 2. Testing Cryptographic OTP Generation & Timing-Safe Verification ---');
const otpCode = generateEmailOtp();
assert.strictEqual(typeof otpCode, 'string', 'OTP code is a string');
assert.strictEqual(otpCode.length, 6, 'OTP code is exactly 6 digits');
assert(/^\d{6}$/.test(otpCode), 'OTP code contains digits only');

const digest = hashOtpCode(otpCode);
assert.strictEqual(typeof digest, 'string', 'Digest is a string');
assert.strictEqual(digest.length, 64, 'Digest is 64 hex characters (SHA-256)');

// Verification test
assert(verifyOtpCode(otpCode, digest), 'Timing-safe verification succeeds for matching code');
assert(!verifyOtpCode('000000', digest), 'Timing-safe verification fails for incorrect code');
assert(!verifyOtpCode('123', digest), 'Timing-safe verification fails for partial code');
console.log('✅ [PASS 2] Cryptographic 6-digit OTP generation and HMAC-SHA256 digest pass.');

// 3. Database Challenge Lifecycle & Lockout Controls
console.log('\n--- 3. Testing Database Challenge Lifecycle & Brute-Force Lockout ---');
const testEmail = `test-qa-${Date.now()}@dokind.org.in`;
const challengeDigest = hashOtpCode('123456');

const challenge = db.createEmailOtpChallenge(testEmail, challengeDigest);
assert.strictEqual(challenge.email, testEmail, 'Challenge email matched');
assert.strictEqual(challenge.attempts, 0, 'Initial attempts count is 0');
assert.strictEqual(challenge.maxAttempts, 5, 'Maximum attempts is 5');
assert(challenge.expiresAt > Date.now(), 'Expiration is in future');
assert(challenge.resendCooldownUntil > Date.now(), 'Cooldown is active');

// Attempt tracking
const attempt1 = db.recordEmailOtpAttempt(testEmail);
assert(!attempt1.locked, 'Attempt 1 does not lock challenge');
assert.strictEqual(challenge.attempts, 1, 'Attempt counter incremented to 1');

// Simulate 4 more incorrect attempts to reach limit of 5
db.recordEmailOtpAttempt(testEmail);
db.recordEmailOtpAttempt(testEmail);
db.recordEmailOtpAttempt(testEmail);
const finalAttempt = db.recordEmailOtpAttempt(testEmail);
assert(finalAttempt.locked, '5th incorrect attempt locks challenge');
assert.strictEqual(db.getEmailOtpChallenge(testEmail), undefined, 'Locked challenge is purged from active store');
console.log('✅ [PASS 3] 5-attempt brute force defense & permanent lockout confirmed.');

// 4. Rate Limiting Tests
console.log('\n--- 4. Testing Multi-Tier Rate Limiting (Email & IP) ---');
const spamEmail = `rate-limit-test-${Date.now()}@example.com`;
const testIp = '198.51.100.42';

// Under limit
const checkInitial = db.checkEmailOtpRateLimit(spamEmail, testIp);
assert(checkInitial.allowed, 'Initial request allowed');

// Record 5 requests
for (let i = 0; i < 5; i++) {
  db.recordEmailOtpRateLimit(spamEmail, testIp);
}

// 6th request must be blocked
const checkBlocked = db.checkEmailOtpRateLimit(spamEmail, testIp);
assert(!checkBlocked.allowed, '6th request within window is rate limited');
assert(typeof checkBlocked.retryAfterSeconds === 'number', 'Returns retryAfterSeconds');
console.log('✅ [PASS 4] Multi-tier rate limiting blocks automated spam requests.');

// 5. Google OAuth State Anti-CSRF Token Generation
console.log('\n--- 5. Testing Google OAuth Anti-CSRF Token Generation ---');
const { state } = generateOAuthState('/campaigns/pediatric-surgery');
const verifiedState = verifyOAuthState(state);
assert(verifiedState.valid, 'Valid signed state verified');
assert.strictEqual(verifiedState.returnUrl, '/campaigns/pediatric-surgery', 'Target returnUrl preserved');

const tamperedState = state.slice(0, -4) + 'abcd';
const verifiedTampered = verifyOAuthState(tamperedState);
assert(!verifiedTampered.valid, 'Tampered state rejected');
console.log('✅ [PASS 5] Google OAuth anti-CSRF signed state tokens verified.');

// 6. Live HTTP Endpoint Tests
console.log('\n--- 6. Testing Live HTTP API Endpoints ---');
async function testLiveEndpoints() {
  const liveEmail = `live-test-${Date.now()}@dokind.org.in`;

  // A. Request Email OTP
  const reqRes = await fetch('http://localhost:3000/api/auth/email-otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: liveEmail }),
  });
  assert.strictEqual(reqRes.status, 200, 'POST /api/auth/email-otp/request returns 200');
  const reqData = await reqRes.json();
  assert(reqData.success, 'Request OTP returns success: true');
  assert(reqData.devCode, 'Dev simulation code provided in dev mode');
  console.log(`[Test Client] Received verification code: ${reqData.devCode}`);

  // B. Immediate resend must hit cooldown (429)
  const resendRes = await fetch('http://localhost:3000/api/auth/email-otp/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: liveEmail }),
  });
  assert.strictEqual(resendRes.status, 429, 'Immediate resend returns 429 cooldown');

  // C. Verify with wrong OTP code (400)
  const wrongVerify = await fetch('http://localhost:3000/api/auth/email-otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: liveEmail, code: '000000' }),
  });
  assert.strictEqual(wrongVerify.status, 400, 'Wrong OTP verification returns 400');
  const wrongData = await wrongVerify.json();
  assert(wrongData.error.includes('Incorrect verification code'), 'Clear error returned on wrong code');

  // D. Verify with correct OTP code (200 + Session Cookie)
  const validVerify = await fetch('http://localhost:3000/api/auth/email-otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: liveEmail, code: reqData.devCode }),
  });
  assert.strictEqual(validVerify.status, 200, 'Valid OTP verification returns 200');
  const validData = await validVerify.json();
  assert(validData.success, 'Verification returns success: true');
  assert.strictEqual(validData.user.email, liveEmail, 'Returned user email matches');
  assert.strictEqual(validData.user.role, 'donor', 'First-time email user assigned donor role');

  const setCookie = validVerify.headers.get('set-cookie');
  assert(setCookie && setCookie.includes('dokind_session'), 'Session cookie issued upon valid verification');
  console.log('✅ [PASS 6] Live HTTP endpoints verified (Request, Cooldown, Rejection, and Session Issuance).');

  // 7. Verify Centralized Modal Component Structure
  console.log('\n--- 7. Testing Centralized Login Modal Component Hierarchy ---');
  const modalPath = path.join(process.cwd(), 'src/components/auth/LoginModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');
  assert(modalCode.includes('EmailOtpForm'), 'LoginModal renders EmailOtpForm');
  assert(modalCode.includes('GoogleSignInButton'), 'LoginModal renders GoogleSignInButton');
  assert(modalCode.includes('OR'), 'LoginModal renders OR divider between email and Google');
  assert(modalCode.includes('Welcome back'), 'LoginModal renders Welcome back heading');
  assert(modalCode.includes('!isLoginModalOpen'), 'LoginModal is closed when isLoginModalOpen is false');

  const providerPath = path.join(process.cwd(), 'src/providers/AuthUIProvider.tsx');
  const providerCode = fs.readFileSync(providerPath, 'utf8');
  assert(providerCode.includes('useState(false)'), 'AuthUIProvider initializes modal to closed (false)');

  console.log('✅ [PASS 7] Centralized LoginModal structure and initial closed state verified.');
}

testLiveEndpoints().then(() => {
  console.log('\n================================================================');
  console.log('TOTAL SUITE RESULTS: ALL AUTHENTICATION CHECKS PASSED CLEANLY!');
  console.log('================================================================');
});
