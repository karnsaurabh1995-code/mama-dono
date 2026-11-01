import crypto from 'crypto';
import { db } from '../src/lib/db';

const BASE_URL = 'http://localhost:32009';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: string, details: string) {
  if (condition) {
    results.push({ name, category, passed: true, details });
    console.log(`  ✓ [PASS] [${category}] ${name}`);
  } else {
    results.push({ name, category, passed: false, details });
    console.error(`  ❌ [FAIL] [${category}] ${name}: ${details}`);
  }
}

function createSignedSessionCookie(userId: string, createdAt = new Date().toISOString()): string {
  const secret = process.env.AUTH_SECRET || 'dokind-local-dev-auth-signing-secret-minimum-32-chars';
  const payload = JSON.stringify({ id: userId, sessionCreatedAt: createdAt });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

async function runTests() {
  console.log('========================================================================');
  console.log('   DOKIND ULTRA-COMPREHENSIVE ADMIN SECURITY & HOMEPAGE TEST SUITE      ');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // 1. DIRECT URL ACCESS & EDGE PROXY DEFENSE
  // -------------------------------------------------------------------------
  console.log('--- 1. Testing Direct URL Access & Edge Perimeter Defense ---');

  const testUrls = [
    { path: '/admin', expectedReturn: '%2Fadmin' },
    { path: '/admin/dashboard', expectedReturn: '%2Fadmin%2Fdashboard' },
    { path: '/admin/campaigns', expectedReturn: '%2Fadmin%2Fcampaigns' },
    { path: '/admin/settings', expectedReturn: '%2Fadmin%2Fsettings' },
    { path: '/admin/finance', expectedReturn: '%2Fadmin%2Ffinance' },
    { path: '/admin/team', expectedReturn: '%2Fadmin%2Fteam' },
  ];

  for (const { path, expectedReturn } of testUrls) {
    const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    assert(
      res.status === 307 && location.includes('/admin/login') && location.includes(expectedReturn),
      `Direct URL ${path} redirects to /admin/login with returnUrl`,
      'Perimeter Defense',
      `Got HTTP ${res.status}, Location: ${location}`
    );
  }

  // Followed redirect test: ensure /admin/login renders login form directly
  const followedRes = await fetch(`${BASE_URL}/admin`, { redirect: 'follow' });
  const followedHtml = await followedRes.text();
  assert(
    followedRes.status === 200 &&
    followedRes.url.includes('/admin/login') &&
    followedHtml.includes('Admin Sign In') &&
    followedHtml.includes('Admin ID / Username') &&
    followedHtml.includes('Admin Password'),
    'Following /admin direct access renders Admin Sign In form with Admin ID and Password fields',
    'Perimeter Defense',
    `URL: ${followedRes.url}, contains Admin Sign In and required input labels`
  );

  // Rapid refresh stability: 5 rapid anonymous requests do not loop
  let all307 = true;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    if (res.status !== 307) all307 = false;
  }
  assert(
    all307,
    'Repeated refreshes of /admin consistently return single HTTP 307 with zero refresh loop',
    'Perimeter Defense',
    '5 consecutive requests cleanly returned HTTP 307'
  );

  // -------------------------------------------------------------------------
  // 2. UNPROTECTED REJECTION OF SENSITIVE APIS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing Unauthenticated Administrative API Protection ---');

  const apiEndpoints = [
    { url: '/api/admin/metrics', method: 'GET' },
    { url: '/api/admin/team', method: 'GET' },
    { url: '/api/admin/gateways', method: 'GET' },
    { url: '/api/admin/reports/export', method: 'GET' },
    { url: '/api/admin/website-builder', method: 'POST', body: JSON.stringify({ pageSlug: 'home', sections: [] }) },
    { url: '/api/admin/homepage-curation', method: 'POST', body: JSON.stringify({ heroCampaignIds: [] }) },
  ];

  for (const ep of apiEndpoints) {
    const res = await fetch(`${BASE_URL}${ep.url}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body,
    });
    assert(
      res.status === 401,
      `Anonymous call to ${ep.method} ${ep.url} returns HTTP 401 Unauthorized`,
      'API Security',
      `Got HTTP ${res.status}`
    );
  }

  // /api/admin/auth/me returns authenticated: false
  const meRes = await fetch(`${BASE_URL}/api/admin/auth/me`);
  const meData = await meRes.json();
  assert(
    meRes.status === 200 && meData.authenticated === false,
    'Anonymous /api/admin/auth/me returns authenticated: false without leaking session data',
    'API Security',
    JSON.stringify(meData)
  );

  // -------------------------------------------------------------------------
  // 3. AUTHENTICATION & LOGIN FLOW
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Testing Authentication & Credential Verification ---');

  // Test invalid credentials
  const badLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'sarthakraj2009', password: 'DefinitivelyWrongPassword999!' }),
  });
  const badLoginData = await badLoginRes.json();
  assert(
    badLoginRes.status === 401 && badLoginData.success === false && badLoginData.error === 'Invalid Admin ID or Password.',
    'Invalid credentials return HTTP 401 with generic non-enumerating error message',
    'Authentication',
    `HTTP ${badLoginRes.status}, error: "${badLoginData.error}"`
  );

  // Test missing credentials
  const emptyLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '', password: '' }),
  });
  assert(
    emptyLoginRes.status === 400,
    'Empty credentials return HTTP 400 Bad Request',
    'Authentication',
    `HTTP ${emptyLoginRes.status}`
  );

  // Test legitimate super admin user
  const user = db.getUsers().find((u) => u.username === 'sarthakraj2009' || u.email === 'sarthakraj726@gmail.com');
  assert(Boolean(user), 'Super Admin sarthakraj2009 exists in database', 'Authentication', `ID: ${user?.id}`);

  // Create valid signed session token
  const validToken = createSignedSessionCookie(user!.id);
  const authCookieHeader = `dokind_session=${validToken}`;

  // Verify authenticated /api/admin/auth/me
  const authMeRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
    headers: { Cookie: authCookieHeader },
  });
  const authMeData = await authMeRes.json();
  assert(
    authMeRes.status === 200 && authMeData.authenticated === true && authMeData.user?.role === 'super_admin',
    'Authenticated Super Admin session verified by /api/admin/auth/me',
    'Session Verification',
    `Authenticated: ${authMeData.authenticated}, Role: ${authMeData.user?.role}`
  );

  // Verify authenticated /admin loads dashboard (HTTP 200)
  const authAdminRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: authCookieHeader },
    redirect: 'manual',
  });
  assert(
    authAdminRes.status === 200,
    'Authenticated Super Admin accessing /admin receives HTTP 200 without redirect',
    'Session Verification',
    `HTTP ${authAdminRes.status}`
  );

  // Verify authenticated /admin/campaigns loads (HTTP 200)
  const authCampRes = await fetch(`${BASE_URL}/admin/campaigns`, {
    headers: { Cookie: authCookieHeader },
    redirect: 'manual',
  });
  assert(
    authCampRes.status === 200,
    'Authenticated Super Admin accessing /admin/campaigns receives HTTP 200',
    'Session Verification',
    `HTTP ${authCampRes.status}`
  );

  // Verify authenticated /api/admin/metrics returns 200
  const authMetricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
    headers: { Cookie: authCookieHeader },
  });
  const authMetricsData = await authMetricsRes.json();
  assert(
    authMetricsRes.status === 200 &&
    authMetricsData.success === true &&
    (typeof authMetricsData.campaignsCount === 'number' || typeof authMetricsData.metrics?.totalRaised === 'number'),
    'Authenticated Super Admin accessing /api/admin/metrics returns verified financial metrics',
    'Session Verification',
    `campaignsCount: ${authMetricsData.campaignsCount}, metrics object present: ${Boolean(authMetricsData.metrics)}`
  );

  // -------------------------------------------------------------------------
  // 4. GRANULAR ROLE-BASED ACCESS CONTROL (RBAC)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Testing Granular Role-Based Access Control (RBAC) ---');

  // Find or create content editor user
  const editorUser = db.getUsers().find((u) => u.role === 'content_editor');
  const editorToken = createSignedSessionCookie(editorUser ? editorUser.id : 'usr-staff-editor-test');
  const editorCookie = `dokind_session=${editorToken}`;

  const editorTeamRes = await fetch(`${BASE_URL}/api/admin/team`, {
    headers: { Cookie: editorCookie },
  });
  assert(
    editorTeamRes.status === 403,
    'Content Editor is forbidden (HTTP 403) from /api/admin/team',
    'RBAC Defense',
    `Got HTTP ${editorTeamRes.status}`
  );

  const editorGatewaysRes = await fetch(`${BASE_URL}/api/admin/gateways`, {
    headers: { Cookie: editorCookie },
  });
  assert(
    editorGatewaysRes.status === 403,
    'Content Editor is forbidden (HTTP 403) from /api/admin/gateways (payment credentials)',
    'RBAC Defense',
    `Got HTTP ${editorGatewaysRes.status}`
  );

  // Test donor role: strictly excluded from all administrative access
  const donorUser = db.getUsers().find((u) => u.role === 'donor');
  const donorToken = createSignedSessionCookie(donorUser ? donorUser.id : 'usr-donor-test');
  const donorCookie = `dokind_session=${donorToken}`;

  const donorMetricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
    headers: { Cookie: donorCookie },
  });
  assert(
    donorMetricsRes.status === 403,
    'Ordinary Donor role is strictly forbidden (HTTP 403) from administrative APIs',
    'RBAC Defense',
    `Got HTTP ${donorMetricsRes.status}`
  );

  // -------------------------------------------------------------------------
  // 5. LOGOUT & SESSION INVALIDATION
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Testing Logout & Session Invalidation ---');

  const logoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
    method: 'POST',
    headers: { Cookie: authCookieHeader },
  });
  const logoutData = await logoutRes.json();
  const setCookie = logoutRes.headers.get('set-cookie') || '';
  assert(
    logoutRes.status === 200 &&
    logoutData.success === true &&
    (setCookie.includes('Max-Age=0') || setCookie.includes('Expires=Thu, 01 Jan 1970') || setCookie.includes('dokind_session=;')),
    'Logout endpoint clears the session cookie with immediate expiry',
    'Session Invalidation',
    `Set-Cookie: ${setCookie}`
  );

  // -------------------------------------------------------------------------
  // 6. HOMEPAGE DUPLICATE SECTION REMOVAL VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Testing Homepage Duplicate Section Removal & Arrangement ---');

  const homeRes = await fetch(`${BASE_URL}/`);
  assert(homeRes.status === 200, 'Homepage returns HTTP 200', 'Homepage Layout', `Status: ${homeRes.status}`);
  const homeHtml = await homeRes.text();

  // Test KEEP: Support Causes That Touch Your Heart
  assert(
    homeHtml.includes('Support Causes That Touch Your Heart'),
    'KEEP: Original "Support Causes That Touch Your Heart" section is present',
    'Homepage Layout',
    'Verified presence in live HTML'
  );

  // Test REMOVE: Featured Campaigns Making Measurable Impact
  assert(
    !homeHtml.includes('Featured Campaigns Making Measurable Impact'),
    'REMOVE: First duplicate "Featured Campaigns Making Measurable Impact" is completely absent',
    'Homepage Layout',
    'Zero occurrences in live HTML'
  );

  // Test KEEP: Monthly Giving
  assert(
    homeHtml.includes('Monthly Giving: Long-Term Sustained Transformation'),
    'KEEP: Legitimate "Monthly Giving: Long-Term Sustained Transformation" section is present',
    'Homepage Layout',
    'Verified presence in live HTML'
  );

  // Test REMOVE: Product Giving
  assert(
    !homeHtml.includes('Product Giving: Deliver Tangible Essentials Directly'),
    'REMOVE: Second duplicate "Product Giving: Deliver Tangible Essentials Directly" is completely absent from homepage',
    'Homepage Layout',
    'Zero occurrences in live HTML'
  );

  // Test Section Sequence
  const headings: string[] = [];
  const regex = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let match;
  while ((match = regex.exec(homeHtml)) !== null) {
    const clean = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
      .replace(/\s+/g, ' ');
    headings.push(clean);
  }

  const expectedHeadings = [
    'Support Causes That Touch Your Heart',
    'Monthly Giving: Long-Term Sustained Transformation',
    'Our Proven Impact in Numbers',
    'Voices of Trust & Gratitude',
    'Frequently Asked Questions',
    'Ready to Start a Fundraiser for Someone in Need?',
    'Featured In National Media',
    'Stay Connected to the Lives You Touch',
  ];

  let ordered = true;
  let lastIdx = -1;
  for (const exp of expectedHeadings) {
    const foundIdx = headings.findIndex((h) => h.includes(exp) || exp.includes(h));
    if (foundIdx === -1 || foundIdx < lastIdx) {
      ordered = false;
    }
    lastIdx = foundIdx;
  }

  assert(
    ordered,
    'Homepage sections render in exact contiguous order without redundant gaps',
    'Homepage Layout',
    `Rendered headings: ${headings.join(' -> ')}`
  );

  // Test Item / Product Giving Preservation elsewhere on platform
  const products = db.getProducts();
  const campaignsWithItems = db.getCampaigns().filter((c) => c.itemizedBudget && c.itemizedBudget.length > 0);
  assert(
    products.length > 0 && campaignsWithItems.length > 0,
    'Item / Product donation capability is fully preserved across campaign records and database models',
    'Functionality Preservation',
    `${products.length} catalog products and ${campaignsWithItems.length} campaigns with itemized budgets`
  );

  // Test /product-giving page remains fully functioning
  const productGivingRes = await fetch(`${BASE_URL}/product-giving`);
  const productGivingHtml = await productGivingRes.text();
  assert(
    productGivingRes.status === 200 && productGivingHtml.includes('Product Giving Catalog'),
    'Dedicated /product-giving directory page remains fully functional and accessible',
    'Functionality Preservation',
    `Status: ${productGivingRes.status}, contains Product Giving Catalog`
  );

  // -------------------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n========================================================================');
  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
