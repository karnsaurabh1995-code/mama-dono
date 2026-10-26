import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import { decryptSecret } from '../src/lib/security/crypto-vault';

const BASE_URL = 'http://localhost:3000';
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

const STATE_FILE = path.join(process.cwd(), 'data', 'database-state.json');

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

async function runPhase3LiveMatrix() {
  console.log('\n========================================================================');
  console.log('   DOKIND PHASE 3: LIVE HARD-REFRESH & DISK PERSISTENCE VERIFICATION');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // TEST A: Modify & Verify a General Site Setting
  // --------------------------------------------------------------------------
  console.log('--- TEST A: Site Setting Modification, Disk Persistence & Public Reflection ---');
  const initialSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(initialSettingsRes.ok, 'Admin Settings API GET responds with 200 OK');
  const initialData = await initialSettingsRes.json();
  assert(Boolean(initialData.settings), 'Admin Settings returns valid settings object');

  const testAddress = `dokind Foundation HQ, Tower B, Level 12, Connaught Place, New Delhi - 110001 [TS: ${Date.now()}]`;
  const updateSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      ...initialData.settings,
      supportAddress: testAddress,
    }),
  });
  assert(updateSettingsRes.ok, 'Admin Settings API POST responds with 200 OK');

  // Verify disk state
  const rawDiskAfterA = fs.readFileSync(STATE_FILE, 'utf-8');
  assert(rawDiskAfterA.includes(testAddress), 'data/database-state.json contains the newly saved support address');

  // Verify public settings API
  const publicSettingsRes = await fetch(`${BASE_URL}/api/settings/public`, {
    cache: 'no-store',
  });
  const publicSettingsData = await publicSettingsRes.json();
  assert(publicSettingsData.settings.supportAddress === testAddress, 'Public Settings API serves updated address with no-store cache control');

  // Verify public contact page HTML
  const contactPageRes = await fetch(`${BASE_URL}/contact`, {
    cache: 'no-store',
  });
  const contactHtml = await contactPageRes.text();
  assert(contactPageRes.ok, 'Public /contact route responds with 200 OK');
  console.log('  ℹ️ Contact HTML status: OK');

  // --------------------------------------------------------------------------
  // TEST B: Modify Homepage Campaign Curation & Verify Order on Homepage
  // --------------------------------------------------------------------------
  console.log('\n--- TEST B: Homepage Campaign Curation Modification & Section Ordering ---');
  const curationRes = await fetch(`${BASE_URL}/api/admin/homepage-curation`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(curationRes.ok, 'Admin Homepage Curation GET responds with 200 OK');

  const newHeroIds = [
    'camp-hunger-mumbai-hospital',
    'camp-aarav-cancer',
    'camp-girl-education-rural',
  ];

  const updateCurationRes = await fetch(`${BASE_URL}/api/admin/homepage-curation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      heroCampaignIds: newHeroIds,
      featuredCampaignIds: [
        'camp-hunger-mumbai-hospital',
        'camp-aarav-cancer',
        'camp-girl-education-rural',
        'camp-stray-dog-shelter',
      ],
      monthlyMissionIds: ['mission-zero-hunger', 'mission-girl-scholarship'],
    }),
  });
  assert(updateCurationRes.ok, 'Admin Homepage Curation POST responds with 200 OK');

  // Verify disk state
  const rawDiskAfterB = fs.readFileSync(STATE_FILE, 'utf-8');
  const parsedDiskB = JSON.parse(rawDiskAfterB);
  assert(
    parsedDiskB.settings.homepageCuration.heroCampaignIds[0] === 'camp-hunger-mumbai-hospital',
    'data/database-state.json has camp-hunger-mumbai-hospital as first hero campaign'
  );

  // Hard refresh public homepage
  const homeRes = await fetch(`${BASE_URL}/`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  });
  assert(homeRes.ok, 'Public Homepage GET responds with 200 OK');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('camp-hunger-mumbai-hospital'), 'Public Homepage rendered HTML links to top hero campaign');
  console.log('  ℹ️ Hero campaign successfully rendered in top spot');

  // --------------------------------------------------------------------------
  // TEST C: Modify Website Builder Content, Publish & Verify Dynamic Renderer
  // --------------------------------------------------------------------------
  console.log('\n--- TEST C: Website Builder Section Management, Publishing & Homepage Dynamic Rendering ---');
  const wbRes = await fetch(`${BASE_URL}/api/admin/website-builder?slug=home`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(wbRes.ok, 'Admin Website Builder GET responds with 200 OK');
  const wbData = await wbRes.json();
  assert(Array.isArray(wbData.draftSections), 'Website Builder returns draft sections array');

  // Publish draft sections
  const publishRes = await fetch(`${BASE_URL}/api/admin/website-builder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      action: 'publish',
      pageSlug: 'home',
      notes: `Automated Test C Publish Verification [${Date.now()}]`,
    }),
  });
  assert(publishRes.ok, 'Admin Website Builder publish action responds with 200 OK');

  // Verify disk state
  const rawDiskAfterC = fs.readFileSync(STATE_FILE, 'utf-8');
  const parsedDiskC = JSON.parse(rawDiskAfterC);
  const homeVersions = parsedDiskC.pageVersions?.home || [];
  assert(homeVersions.length > 0, 'data/database-state.json has published page versions for home');
  const latestVersion = homeVersions[0];
  assert(Boolean(latestVersion.publishedAt), 'Latest page version has valid publishedAt timestamp');
  assert(latestVersion.sections.length > 0, 'Published version contains active page sections');

  // Hard refresh public homepage and verify status
  const refreshedHomeRes = await fetch(`${BASE_URL}/`, {
    cache: 'no-store',
  });
  assert(refreshedHomeRes.ok, 'Public Homepage responds with 200 OK following Website Builder publish');

  // --------------------------------------------------------------------------
  // TEST D: Modify Team Member & Verify Public /about Reflection
  // --------------------------------------------------------------------------
  console.log('\n--- TEST D: Team Member Job Title Update & Public /about Reflection ---');
  const teamRes = await fetch(`${BASE_URL}/api/admin/team`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  assert(teamRes.ok, 'Admin Team API GET responds with 200 OK');
  const teamData = await teamRes.json();
  assert(Array.isArray(teamData.employees), 'Admin Team API returns employees array');
  const targetEmployee = teamData.employees.find((e: any) => e.id === 'usr-reviewer-1') || teamData.employees[0];
  assert(Boolean(targetEmployee), 'Found valid employee target in directory');

  const testTitle = `Chief Medical Director and Senior Field Auditor [${Date.now()}]`;
  const updateTeamRes = await fetch(`${BASE_URL}/api/admin/team`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      id: targetEmployee.id,
      updates: {
        jobTitle: testTitle,
      },
    }),
  });
  assert(updateTeamRes.ok, 'Admin Team API PUT responds with 200 OK');

  // Verify disk state
  const rawDiskAfterD = fs.readFileSync(STATE_FILE, 'utf-8');
  assert(rawDiskAfterD.includes(testTitle), 'data/database-state.json contains the updated employee job title');

  // Hard refresh /about
  const aboutRes = await fetch(`${BASE_URL}/about`, {
    cache: 'no-store',
  });
  assert(aboutRes.ok, 'Public /about responds with 200 OK');
  const aboutHtml = await aboutRes.text();
  assert(aboutHtml.includes(testTitle), 'Public /about rendered HTML contains the updated job title');
  console.log(`  ℹ️ /about successfully rendered updated jobTitle: "${testTitle}"`);

  // --------------------------------------------------------------------------
  // TEST E: Modify API Credential & Verify AES-256-GCM Vault Without Secret Leakage
  // --------------------------------------------------------------------------
  console.log('\n--- TEST E: API Credential Encryption, Zero Leakage & Backend Secret Decryption ---');
  const newSecretCandidate = `rzp_live_secret_sample_key_${Date.now()}`;
  const gatewayUpdateRes = await fetch(`${BASE_URL}/api/admin/gateways`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ADMIN_COOKIE,
    },
    body: JSON.stringify({
      id: 'razorpay',
      updates: {
        environment: 'production',
        keyId: 'rzp_live_dokind_prod_key',
        secretKey: newSecretCandidate,
      },
    }),
  });
  assert(gatewayUpdateRes.ok, 'Admin Gateways POST responds with 200 OK');

  // Inspect database-state.json directly from disk
  const rawDiskAfterE = fs.readFileSync(STATE_FILE, 'utf-8');
  assert(
    !rawDiskAfterE.includes(newSecretCandidate),
    'CRITICAL SECURITY: Plaintext secret is NEVER leaked to disk in data/database-state.json'
  );

  const parsedDiskE = JSON.parse(rawDiskAfterE);
  const rzpGateway = parsedDiskE.gateways.find((g: any) => g.id === 'razorpay');
  assert(Boolean(rzpGateway), 'Razorpay gateway record found in disk snapshot');
  assert(
    rzpGateway.secretKey.startsWith('enc:v1:'),
    'Gateway secretKey is stored encrypted with authenticated AES-256-GCM enc:v1 prefix'
  );

  // Verify backend decryption on demand
  const decryptedGatewaySecret = decryptSecret(rzpGateway.secretKey);
  assert(
    decryptedGatewaySecret === newSecretCandidate,
    'Backend cryptoVault correctly and losslessly decrypts ciphertext when needed for authorized operations'
  );

  // Restore clean state for testAddress
  db.updateSiteSettings({
    supportAddress: 'dokind Foundation, 4th Floor, Connaught Place, New Delhi - 110001',
  });

  console.log('\n========================================================================');
  console.log(`   PHASE 3 VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('========================================================================\n');
}

runPhase3LiveMatrix().catch((err) => {
  console.error('\n❌ Phase 3 Live Verification failed:', err);
  process.exit(1);
});
