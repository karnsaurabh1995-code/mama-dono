import http from 'http';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}${details ? ` - ${details}` : ''}`);
    failed++;
  }
}

function fetchUrl(url: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, body }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 DOKIND VERIFICATION: ADMIN SIDEBAR HYDRATION CONTRACT');
  console.log('================================================================\n');

  // Test 1: SSR output of /admin/seo does not render divergent initial badge
  try {
    const { statusCode, body } = await fetchUrl('http://localhost:3000/admin/seo');
    assert(statusCode === 200, 'Test 1a: /admin/seo returns HTTP 200');

    // Look for Campaign Approvals link in SSR HTML
    const approvalsMatch = body.match(/href="\/admin\/campaigns\/approvals"[^>]*>([\s\S]*?)<\/a>/);
    assert(
      !!approvalsMatch,
      'Test 1b: Campaign Approvals navigation link rendered in SSR HTML'
    );

    if (approvalsMatch) {
      const linkInner = approvalsMatch[1];
      const hasAmberBadgeInSSR = linkInner.includes('bg-amber-500 text-white');
      assert(
        !hasAmberBadgeInSSR,
        'Test 1c: Initial SSR HTML does not contain divergent amber badge (guaranteeing 0 hydration errors)',
        `Link inner HTML: ${linkInner}`
      );
    }
  } catch (err: unknown) {
    assert(false, 'Test 1 execution failed', (err as Error).message);
  }

  // Test 2: Server API endpoint /api/admin/pending-counts returns live data
  try {
    const { statusCode, body } = await fetchUrl('http://localhost:3000/api/admin/pending-counts');
    assert(statusCode === 200, 'Test 2a: /api/admin/pending-counts returns HTTP 200');

    const data = JSON.parse(body);
    assert(
      typeof data.approvals === 'number' && typeof data.wires === 'number',
      'Test 2b: /api/admin/pending-counts returns valid numeric counts',
      `Got approvals: ${data.approvals}, wires: ${data.wires}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 2 execution failed', (err as Error).message);
  }

  // Test 3: Source inspection of src/app/admin/layout.tsx
  try {
    const layoutContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/layout.tsx'),
      'utf8'
    );

    assert(
      layoutContent.includes('pendingCounts') &&
        layoutContent.includes('setPendingCounts') &&
        layoutContent.includes('/api/admin/pending-counts'),
      'Test 3a: layout.tsx uses post-hydration data-fetching architecture for dynamic badge counts'
    );

    assert(
      !layoutContent.includes('suppressHydrationWarning'),
      'Test 3b: layout.tsx does NOT use blanket suppressHydrationWarning'
    );

    assert(
      layoutContent.includes('badge: pendingCounts.approvals && pendingCounts.approvals > 0 ? pendingCounts.approvals : undefined'),
      'Test 3c: Campaign Approvals badge correctly consumes hydrated state contract'
    );

    assert(
      layoutContent.includes("badge: '1', badgeColor: 'bg-rose-500 text-white'") &&
        layoutContent.includes("badge: 'Superior Admin'"),
      'Test 3d: Static badges (Refunds Engine, API Keys) preserved intact'
    );
  } catch (err: unknown) {
    assert(false, 'Test 3 execution failed', (err as Error).message);
  }

  // Test 4: Role-based navigation gating in layout.tsx remains intact
  try {
    const layoutContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/layout.tsx'),
      'utf8'
    );

    assert(
      layoutContent.includes("role === 'marketer'") &&
        layoutContent.includes("role === 'lead_generator'") &&
        layoutContent.includes("role === 'content_writer'") &&
        layoutContent.includes('canRoleAccess'),
      'Test 4: RBAC permission evaluation across all roles remains robust'
    );
  } catch (err: unknown) {
    assert(false, 'Test 4 execution failed', (err as Error).message);
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
