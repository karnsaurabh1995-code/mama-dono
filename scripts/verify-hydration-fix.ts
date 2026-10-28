import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';

async function runHydrationVerification() {
  console.log('🚀 Running Dokind Hydration Mismatch Deep Diagnostics & Verification Suite...\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // PART 1: ERROR A DIAGNOSTICS (Root <html> Attributes)
  // -------------------------------------------------------------
  test('Error A.1: src/app/layout.tsx renders clean <html lang="en" className="h-full"> without suppressHydrationWarning', () => {
    const layoutCode = fs.readFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), 'utf-8');
    assert(layoutCode.includes('<html lang="en" className="h-full">'), 'Root html tag must have lang="en" className="h-full"');
    assert(!layoutCode.includes('suppressHydrationWarning'), 'layout.tsx must not have blanket suppressHydrationWarning');
    assert(!layoutCode.includes('data-qb-installed'), 'layout.tsx must not have data-qb-installed');
  });

  test('Error A.2: Codebase search confirms zero occurrences of data-qb-installed', () => {
    const srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'), { recursive: true }) as string[];
    for (const f of srcFiles) {
      if (typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json'))) {
        const fullPath = path.join(process.cwd(), 'src', f);
        if (fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          assert(!content.includes('data-qb-installed'), `File ${f} must not include data-qb-installed`);
        }
      }
    }
  });

  test('Error A.3: useScreenFit initializes deterministically with width: 1280, height: 800', () => {
    const hookCode = fs.readFileSync(path.join(process.cwd(), 'src/hooks/useScreenFit.ts'), 'utf-8');
    assert(hookCode.includes('width: 1280,'), 'useScreenFit must initialize width: 1280');
    assert(hookCode.includes('height: 800,'), 'useScreenFit must initialize height: 800');
    assert(!hookCode.includes("typeof window !== 'undefined' ? window.innerWidth"), 'useScreenFit must not branch on window.innerWidth in initial useState');
  });

  await testAsync('Error A.4: Live HTTP GET / returns clean root html tag', async () => {
    const res = await fetch('http://localhost:32009/');
    assert.strictEqual(res.status, 200, 'Homepage must return HTTP 200');
    const html = await res.text();
    assert(html.includes('<html lang="en" class="h-full">'), 'Live response must contain <html lang="en" class="h-full">');
    assert(!html.includes('data-qb-installed'), 'Live response must not contain data-qb-installed');
    assert(!html.includes('suppresshydrationwarning'), 'Live response must not contain suppresshydrationwarning');
  });

  // -------------------------------------------------------------
  // PART 2: ERROR B DIAGNOSTICS & RESOLUTION (Admin Overview Campaign Count)
  // -------------------------------------------------------------
  const authoritativeCampaignsCount = db.getCampaigns().length;

  test(`Error B.1: Authoritative persistent database has ${authoritativeCampaignsCount} campaigns`, () => {
    assert(authoritativeCampaignsCount >= 11, 'Database must have at least 11 campaigns');
    console.log(`     (Database currently contains ${authoritativeCampaignsCount} campaigns across disk & seed)`);
  });

  test('Error B.2: src/app/admin/page.tsx is a Server Component with initialSnapshot contract', () => {
    const pageCode = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/page.tsx'), 'utf-8');
    assert(!pageCode.includes("'use client'"), 'Admin page.tsx must NOT be a client component');
    assert(pageCode.includes('initialSnapshot'), 'Admin page.tsx must construct initialSnapshot');
    assert(pageCode.includes('campaignsCount: campaigns.length'), 'Admin page.tsx must pass campaignsCount');
    assert(pageCode.includes('<AdminOverviewClient initialSnapshot={initialSnapshot} />'), 'Admin page.tsx must render AdminOverviewClient');
  });

  test('Error B.3: src/app/admin/AdminOverviewClient.tsx binds campaignsCount from server snapshot', () => {
    const clientCode = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/AdminOverviewClient.tsx'), 'utf-8');
    assert(clientCode.includes("'use client'"), 'AdminOverviewClient.tsx must be a client component');
    assert(clientCode.includes('{campaignsCount} total • Control'), 'AdminOverviewClient must render {campaignsCount} total • Control');
    assert(!clientCode.includes("import { db } from '@/lib/db'"), 'AdminOverviewClient must NOT import db to avoid client memory divergence');
  });

  await testAsync('Error B.4: Live HTTP GET /admin server HTML matches authoritative campaign count', async () => {
    const res = await fetch('http://localhost:32009/admin');
    assert.strictEqual(res.status, 200, 'Admin overview must return HTTP 200');
    const html = await res.text();

    // Check rendered text inside HTML
    const expectedText = `${authoritativeCampaignsCount}<!-- --> total • Control`;
    assert(html.includes(expectedText), `Server HTML must contain "${expectedText}"`);

    // Check serialized RSC payload in HTML
    assert(
      html.includes(`"campaignsCount":${authoritativeCampaignsCount}`) ||
      html.includes(`\\"campaignsCount\\":${authoritativeCampaignsCount}`),
      `RSC payload must serialize campaignsCount as ${authoritativeCampaignsCount}`
    );
  });

  // -------------------------------------------------------------
  // PART 3: DYNAMIC FILTER & API ROUTE VERIFICATION
  // -------------------------------------------------------------
  await testAsync('Part 3.1: Live HTTP GET /api/admin/metrics returns matching campaignsCount and period metrics', async () => {
    const res = await fetch('http://localhost:32009/api/admin/metrics?periodDays=7');
    assert.strictEqual(res.status, 200, 'API /api/admin/metrics must return HTTP 200');
    const data = await res.json();
    assert.strictEqual(data.campaignsCount, authoritativeCampaignsCount, `API campaignsCount must equal ${authoritativeCampaignsCount}`);
    assert(typeof data.metrics?.grossSuccessfulAmount === 'number', 'API metrics must include grossSuccessfulAmount');
    assert.strictEqual(data.metrics?.periodDays, 7, 'API periodDays must equal requested 7 days');
  });

  // -------------------------------------------------------------
  // PART 4: CAMPAIGNS LIST REFACTOR VALIDATION
  // -------------------------------------------------------------
  test('Part 4.1: src/app/admin/campaigns/page.tsx is a Server Component passing initialCampaigns', () => {
    const pageCode = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/campaigns/page.tsx'), 'utf-8');
    assert(!pageCode.includes("'use client'"), 'Admin campaigns page.tsx must NOT be a client component');
    assert(pageCode.includes('initialCampaigns'), 'Admin campaigns page.tsx must pass initialCampaigns');
    assert(pageCode.includes('<AdminCampaignsClient'), 'Admin campaigns page.tsx must render AdminCampaignsClient');
  });

  await testAsync('Part 4.2: Live HTTP GET /admin/campaigns renders all authoritative campaigns', async () => {
    const res = await fetch('http://localhost:32009/admin/campaigns');
    assert.strictEqual(res.status, 200, 'Admin campaigns list must return HTTP 200');
    const html = await res.text();
    // Verify first persisted campaign is present in HTML
    assert(html.includes('camp-1793113645447'), 'Persisted campaign camp-1793113645447 must be rendered in HTML');
  });

  console.log(`\n========================================`);
  console.log(`Hydration Verification Results: ${passed} / ${total} Tests Passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runHydrationVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
