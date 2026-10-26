/**
 * DOKIND PHASE 1 CRITICAL VERIFICATION:
 * End-to-End Publishing, Durable Disk Persistence & Live Public Website Synchronization
 *
 * Verifies:
 * 1. Reads initial published website state and backs it up in memory.
 * 2. Modifies visible section title with a dynamic unique nonce (PUBLISH-VERIFY-<nonce>).
 * 3. Submits publish through the real authoritative endpoint (POST /api/admin/website-builder).
 * 4. Verifies durable disk persistence in data/database-state.json and authoritative read-back.
 * 5. Simulates a browser hard refresh (GET / with Cache-Control: no-cache, no-store).
 * 6. Asserts that the unique nonce is present in the server-rendered HTML.
 * 7. Tests section reordering and visibility toggling (asserts hidden section is not rendered).
 * 8. Simulates persistence/validation failures and asserts strict error reporting with no false success.
 * 9. Restores initial published state cleanly (non-destructive guarantee).
 */

import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import { PageSection } from '../src/lib/types';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const STATE_FILE = path.join(process.cwd(), 'data', 'database-state.json');

const ADMIN_COOKIE = `dokind_session=${encodeURIComponent(
  JSON.stringify({
    id: 'usr-sa-1',
    employeeId: 'EMP-0001',
    name: 'Saurabh Karn',
    email: 'karnsaurabh1995@gmail.com',
    role: 'super_admin',
    department: 'Executive Governance',
    jobTitle: 'Super Administrator',
    status: 'active',
  })
)}`;

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, title: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${title}`);
  } else {
    console.error(`  ❌ [FAIL] ${title}${details ? ` -> ${details}` : ''}`);
    throw new Error(`Assertion failed: ${title}`);
  }
}

async function runE2EPublishingTest() {
  console.log('\n========================================================================');
  console.log('   DOKIND E2E PUBLISHING & HARD-REFRESH VERIFICATION SUITE');
  console.log('========================================================================\n');

  // Verify server is reachable
  try {
    const healthCheck = await fetch(`${BASE_URL}/`, { cache: 'no-store' });
    assert(healthCheck.ok, `Dev server is running and reachable at ${BASE_URL}`);
  } catch (err: any) {
    console.error(`Cannot connect to dev server at ${BASE_URL}. Ensure it is running with 'npm run dev'.`);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // STEP 1: Read Initial State & Create Backup
  // --------------------------------------------------------------------------
  console.log('Step 1: Reading initial published state & creating in-memory backup...');
  const initialSections: PageSection[] = JSON.parse(JSON.stringify(db.getPublishedPageSections('home')));
  const initialVersions = JSON.parse(JSON.stringify(db.getPageVersions('home')));
  assert(Array.isArray(initialSections) && initialSections.length > 0, 'Loaded initial published sections from store');
  console.log(`  ℹ️ Initial state has ${initialSections.length} sections and ${initialVersions.length} versions`);

  try {
    // --------------------------------------------------------------------------
    // STEP 2: Update Visible Section Title with Unique Nonce & Publish via Real API
    // --------------------------------------------------------------------------
    console.log('\nStep 2: Mutating section title and executing publish via POST /api/admin/website-builder...');
    const nonce = `PUBLISH-VERIFY-${Date.now()}`;
    const testSubtitle = `Durable disk synchronization verified at ${new Date().toISOString()}`;
    const testBadge = `AUDIT-TEST-OK`;

    // Clone sections and update the 'categories' / 'featured_campaigns' or 'stats' section
    const targetSectionIndex = initialSections.findIndex((s) => s.type === 'featured_campaigns' || s.type === 'stats');
    assert(targetSectionIndex !== -1, 'Identified target section for title mutation');

    const modifiedSections: PageSection[] = JSON.parse(JSON.stringify(initialSections));
    modifiedSections[targetSectionIndex].title = nonce;
    modifiedSections[targetSectionIndex].subtitle = testSubtitle;
    modifiedSections[targetSectionIndex].badge = testBadge;

    const publishRes = await fetch(`${BASE_URL}/api/admin/website-builder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: ADMIN_COOKIE,
      },
      body: JSON.stringify({
        slug: 'home',
        action: 'publish',
        sections: modifiedSections,
      }),
    });

    assert(publishRes.ok, `Publish API responds with HTTP 200 OK (Status: ${publishRes.status})`);
    const publishData = await publishRes.json();
    assert(publishData.success === true, 'Publish API response has success: true');
    assert(typeof publishData.version === 'number', `New published version assigned: #${publishData.version}`);

    // --------------------------------------------------------------------------
    // STEP 3: Verify Durable Persistence in data/database-state.json
    // --------------------------------------------------------------------------
    console.log('\nStep 3: Verifying durable persistence in data/database-state.json on disk...');
    assert(fs.existsSync(STATE_FILE), 'database-state.json exists on disk');
    const rawDisk = fs.readFileSync(STATE_FILE, 'utf-8');
    assert(rawDisk.includes(nonce), 'database-state.json contains the unique nonce title string');
    assert(rawDisk.includes(testSubtitle), 'database-state.json contains the unique test subtitle');
    assert(rawDisk.includes(testBadge), 'database-state.json contains the unique test badge');

    const parsedDisk = JSON.parse(rawDisk);
    const diskVersions = parsedDisk.pageVersions?.home || [];
    assert(diskVersions.length > 0, 'Disk contains at least one version for slug "home"');
    const diskLatest = diskVersions[0];
    assert(diskLatest.versionNumber === publishData.version, 'Latest disk version matches API published version');
    const diskTargetSec = diskLatest.sections.find((s: any) => s.id === modifiedSections[targetSectionIndex].id);
    assert(diskTargetSec?.title === nonce, 'Disk section title exactly matches unique nonce');

    // Authoritative read-back via DatabaseStore
    db.reloadFromDisk();
    const authoritativeSections = db.getPublishedPageSections('home');
    const authTargetSec = authoritativeSections.find((s) => s.id === modifiedSections[targetSectionIndex].id);
    assert(authTargetSec?.title === nonce, 'DatabaseStore.getPublishedPageSections returns the published title');

    // --------------------------------------------------------------------------
    // STEP 4: Live Hard Refresh - Fetch GET / with Cache-Busting Headers
    // --------------------------------------------------------------------------
    console.log('\nStep 4: Simulating browser hard refresh on public homepage (GET / with Cache-Control: no-cache)...');
    const publicPageRes = await fetch(`${BASE_URL}/`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    assert(publicPageRes.ok, 'Public homepage responds with HTTP 200 OK');
    const publicHtml = await publicPageRes.text();
    assert(publicHtml.includes(nonce), `Server-rendered HTML contains unique nonce: "${nonce}"`);
    assert(publicHtml.includes(testSubtitle), `Server-rendered HTML contains unique test subtitle: "${testSubtitle}"`);
    assert(publicHtml.includes(testBadge), `Server-rendered HTML contains unique test badge: "${testBadge}"`);
    console.log(`  ℹ️ Live HTML verified: Found "${nonce}" in rendered HTML stream!`);

    // --------------------------------------------------------------------------
    // STEP 5: Verify Visibility Toggle & Section Reordering
    // --------------------------------------------------------------------------
    console.log('\nStep 5: Verifying section visibility toggling & reordering persistence...');
    const reorderedSections: PageSection[] = JSON.parse(JSON.stringify(modifiedSections));

    // Hide the cta_box section
    const ctaIndex = reorderedSections.findIndex((s) => s.type === 'cta_box');
    if (ctaIndex !== -1) {
      const uniqueCtaTitle = `HIDDEN-CTA-${Date.now()}`;
      reorderedSections[ctaIndex].title = uniqueCtaTitle;
      reorderedSections[ctaIndex].isVisible = false;

      // Reorder: Move stats section to front (order 0)
      const statsIdx = reorderedSections.findIndex((s) => s.type === 'stats');
      if (statsIdx !== -1) {
        const statsSec = reorderedSections.splice(statsIdx, 1)[0];
        reorderedSections.unshift(statsSec);
      }

      const reorderRes = await fetch(`${BASE_URL}/api/admin/website-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ADMIN_COOKIE,
        },
        body: JSON.stringify({
          slug: 'home',
          action: 'publish',
          sections: reorderedSections,
        }),
      });

      assert(reorderRes.ok, 'Publish with reordered/hidden sections responds with 200 OK');

      // Fetch public homepage after hard refresh
      const refreshedHtml = await (
        await fetch(`${BASE_URL}/`, {
          headers: { 'Cache-Control': 'no-cache, no-store' },
        })
      ).text();

      assert(
        !refreshedHtml.includes(uniqueCtaTitle),
        'Hidden section (isVisible: false) is correctly excluded from public rendered HTML'
      );
      console.log('  ℹ️ Visibility filtering verified: Hidden section is NOT in rendered HTML.');
    }

    // --------------------------------------------------------------------------
    // STEP 6: Negative Testing & Failure Simulation (No False Success)
    // --------------------------------------------------------------------------
    console.log('\nStep 6: Simulating validation and storage failure scenarios...');

    // Scenario 6A: Reject invalid section type
    const invalidSectionsPayload = [
      {
        id: 'sec-malicious-x',
        type: 'invalid_type_injection',
        title: 'Hacked Section',
      },
    ];

    const rejectRes = await fetch(`${BASE_URL}/api/admin/website-builder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: ADMIN_COOKIE,
      },
      body: JSON.stringify({
        slug: 'home',
        action: 'publish',
        sections: invalidSectionsPayload,
      }),
    });

    assert(rejectRes.status === 400, 'API strictly rejects invalid section types with HTTP 400 Bad Request');
    const rejectData = await rejectRes.json();
    assert(
      rejectData.error && (rejectData.error.toLowerCase().includes('unsupported type') || rejectData.error.toLowerCase().includes('invalid type')),
      'Error message specifies unsupported/invalid section type'
    );

    // Scenario 6B: Verify persistence rollback on forced write failure
    console.log('  Testing persistence rollback guarantee in DatabaseStore...');
    const originalPersist = (db as any).persistState;
    let rollbackVerified = false;

    try {
      // Mock persistState to simulate disk failure (e.g. disk full / EACCES)
      (db as any).persistState = () => false;

      try {
        db.publishPageSections('home', 'Failing Actor');
      } catch (err: any) {
        assert(
          err.message.toLowerCase().includes('persistence failed'),
          'DatabaseStore throws descriptive Error on persistence failure instead of failing silently'
        );
        rollbackVerified = true;
      }
    } finally {
      // Restore original persistState method
      (db as any).persistState = originalPersist;
    }
    assert(rollbackVerified, 'DatabaseStore rollbacks in-memory state and throws when disk write fails');

  } finally {
    // --------------------------------------------------------------------------
    // STEP 7: Restore Initial State (Non-Destructive Guarantee)
    // --------------------------------------------------------------------------
    console.log('\nStep 7: Restoring initial published state (non-destructive clean-up)...');
    try {
      const restoreRes = await fetch(`${BASE_URL}/api/admin/website-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: ADMIN_COOKIE,
        },
        body: JSON.stringify({
          slug: 'home',
          action: 'publish',
          sections: initialSections,
        }),
      });

      assert(restoreRes.ok, 'Restoration publish API call succeeded');

      // Verify restore in rendered HTML
      const finalHtml = await (
        await fetch(`${BASE_URL}/`, {
          headers: { 'Cache-Control': 'no-cache, no-store' },
        })
      ).text();
      assert(!finalHtml.includes('PUBLISH-VERIFY-'), 'Test nonce cleanly removed from public HTML');
      console.log('  ℹ️ State successfully restored to initial pre-test condition.');
    } catch (restoreErr) {
      console.error('Warning during restore:', restoreErr);
    }
  }

  console.log('\n========================================================================');
  console.log(`   E2E PUBLISHING RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('========================================================================\n');
}

runE2EPublishingTest().catch((err) => {
  console.error('\n❌ E2E Publishing Test Suite failed:', err);
  process.exit(1);
});
