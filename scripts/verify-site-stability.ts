import assert from 'assert';
import crypto from 'crypto';
import { db } from '../src/lib/db';

function getSignedAdminCookie(): string {
  const superAdmin = db.getUsers().find((u) => u.role === 'super_admin');
  const secret = process.env.AUTH_SECRET || 'dokind-local-dev-auth-signing-secret-minimum-32-chars';
  const payload = JSON.stringify({ id: superAdmin!.id, sessionCreatedAt: new Date().toISOString() });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `dokind_session=${encodedPayload}.${signature}`;
}

async function runStabilityVerification() {
  console.log('================================================================');
  console.log('   DOKIND SITE-WIDE STABILITY & ROUTE VERIFICATION SUITE       ');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:32009';
  let passed = 0;
  let total = 0;

  async function checkRoute(
    title: string,
    urlPath: string,
    expectedStatus: number,
    options: {
      headers?: Record<string, string>;
      redirect?: RequestRedirect;
      expectedLocation?: string;
      expectedText?: string;
      notExpectedText?: string;
    } = {}
  ) {
    total++;
    try {
      const res = await fetch(`${BASE_URL}${urlPath}`, {
        headers: options.headers,
        redirect: options.redirect || 'manual',
      });

      assert.strictEqual(
        res.status,
        expectedStatus,
        `Expected status ${expectedStatus} but got ${res.status} for ${urlPath}`
      );

      if (options.expectedLocation) {
        const location = res.headers.get('location') || '';
        assert(
          location.includes(options.expectedLocation),
          `Expected location to include "${options.expectedLocation}" but got "${location}"`
        );
      }

      if (options.expectedText || options.notExpectedText) {
        const text = await res.text();
        if (options.expectedText) {
          assert(
            text.includes(options.expectedText),
            `Expected response to contain "${options.expectedText}"`
          );
        }
        if (options.notExpectedText) {
          assert(
            !text.includes(options.notExpectedText),
            `Did not expect response to contain "${options.notExpectedText}"`
          );
        }
      }

      console.log(`  ✓ [PASS] ${title} (${urlPath}) -> HTTP ${res.status}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${title} (${urlPath}) -> ${err.message}`);
    }
  }

  // 1. Public Routes Verification (Must return 200 without redirect loop)
  console.log('--- 1. Public Routes Stability ---');
  await checkRoute('Homepage', '/', 200, {
    expectedText: 'Dokind',
    notExpectedText: 'data-qb-installed',
  });
  await checkRoute('Campaigns Directory', '/campaigns', 200, {
    expectedText: 'Dokind',
  });
  const firstCampaign = db.getCampaigns()[0];
  if (firstCampaign) {
    await checkRoute('Campaign Detail', `/campaigns/${firstCampaign.slug}`, 200, {
      expectedText: firstCampaign.title,
    });
  }
  await checkRoute('Monthly Giving Directory', '/monthly-giving', 200);
  await checkRoute('Causes Directory', '/causes', 200);
  await checkRoute('Blogs Directory', '/blog', 200);
  await checkRoute('Donor Login Page', '/login', 200);
  await checkRoute('Public Settings API', '/api/settings/public', 200);

  // 2. Admin Login & Authorization Guarding
  console.log('\n--- 2. Admin & Staff Route Security & Redirects ---');
  await checkRoute('Admin Login Page (Signed Out)', '/admin/login', 200, {
    expectedText: 'Dokind Staff Portal',
  });
  await checkRoute('Anonymous Admin Access (Must 307 Redirect)', '/admin', 307, {
    expectedLocation: '/admin/login?returnUrl=%2Fadmin',
  });
  await checkRoute('Anonymous Admin Campaigns Access (Must 307 Redirect)', '/admin/campaigns', 307, {
    expectedLocation: '/admin/login?returnUrl=%2Fadmin%2Fcampaigns',
  });
  await checkRoute('Anonymous Admin Finance Access (Must 307 Redirect)', '/admin/finance', 307, {
    expectedLocation: '/admin/login?returnUrl=%2Fadmin%2Ffinance',
  });

  // 3. Authenticated Staff Access
  console.log('\n--- 3. Authenticated Staff Access with Session Cookie ---');
  const staffCookie = getSignedAdminCookie();
  await checkRoute('Staff /admin Dashboard', '/admin', 200, {
    headers: { cookie: staffCookie },
    expectedText: 'Platform Intelligence',
  });
  await checkRoute('Staff /admin/campaigns', '/admin/campaigns', 200, {
    headers: { cookie: staffCookie },
  });
  await checkRoute('Staff /admin/finance', '/admin/finance', 200, {
    headers: { cookie: staffCookie },
  });
  await checkRoute('Staff /api/admin/metrics', '/api/admin/metrics', 200, {
    headers: { cookie: staffCookie },
  });
  await checkRoute('Staff /api/admin/auth/me', '/api/admin/auth/me', 200, {
    headers: { cookie: staffCookie },
    expectedText: '"authenticated":true',
  });

  // 4. API Security for Anonymous Callers
  console.log('\n--- 4. Anonymous Protected API Denial ---');
  await checkRoute('Anonymous Admin Metrics API (Must 401)', '/api/admin/metrics', 401);
  await checkRoute('Anonymous Admin Team API (Must 401)', '/api/admin/team', 401);
  await checkRoute('Anonymous Admin Gateways API (Must 401)', '/api/admin/gateways', 401);
  await checkRoute('Anonymous Admin Me API (Must return unauthenticated JSON)', '/api/admin/auth/me', 200, {
    expectedText: '"authenticated":false',
  });

  console.log('\n================================================================');
  console.log(`TOTAL STABILITY CHECKS: ${total}`);
  console.log(`PASSED:                 ${passed}`);
  console.log(`FAILED:                 ${total - passed}`);
  console.log('================================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runStabilityVerification().catch((err) => {
  console.error('Fatal stability test error:', err);
  process.exit(1);
});
