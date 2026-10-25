import { db } from '../src/lib/db';
import { CAMPAIGNS_DATA } from '../src/lib/data/campaigns';

async function verifyFeatures() {
  console.log('================================================================');
  console.log('🧪 TESTING HOMEPAGE CURATION, HERO TAP, & MULTI-POSTER CAROUSEL');
  console.log('================================================================\n');

  // Test 1: Database Curation Config
  console.log('--- 1. Testing db.getHomepageCuration & updateHomepageCuration ---');
  const curation = await db.getHomepageCuration();
  console.log('Default curation fetched:', {
    heroCampaignCount: curation.heroCampaignIds.length,
    featuredCampaignCount: curation.featuredCampaignIds.length,
    monthlyMissionCount: curation.monthlyMissionIds.length,
    urgentCampaignCount: curation.urgentCampaignIds.length,
  });

  if (!curation.heroCampaignIds || curation.heroCampaignIds.length === 0) {
    throw new Error('Hero campaign IDs missing in curation configuration');
  }
  console.log('✅ [PASS 1.1] getHomepageCuration returned valid configuration with populated hero IDs.');

  // Test updating curation
  const testIds = [...curation.heroCampaignIds];
  const updated = await db.updateHomepageCuration(
    {
      ...curation,
      heroCampaignIds: testIds.reverse(),
    },
    'Test Administrator'
  );
  if (updated.heroCampaignIds[0] !== testIds[0]) {
    throw new Error('Update curation failed to persist new order');
  }
  // Restore original
  await db.updateHomepageCuration(curation, 'Test Administrator');
  console.log('✅ [PASS 1.2] updateHomepageCuration successfully updated and verified round-trip persistence.');

  // Test 2: Verify Campaign Poster Images
  console.log('\n--- 2. Testing Multi-Poster Carousel Data Structure ---');
  const sampleCampaign = CAMPAIGNS_DATA.find(c => c.slug === 'save-4-year-old-aarav-leukemia-treatment');
  if (!sampleCampaign) throw new Error('Sample campaign not found');

  if (!sampleCampaign.posterImages || sampleCampaign.posterImages.length < 2) {
    throw new Error(`Sample campaign does not have at least 2 poster images (found ${sampleCampaign.posterImages?.length})`);
  }
  console.log(`Sample campaign "${sampleCampaign.title.slice(0, 30)}..." has ${sampleCampaign.posterImages.length} poster images:`);
  sampleCampaign.posterImages.forEach((img, idx) => console.log(`   Poster ${idx + 1}: ${img.slice(0, 60)}...`));
  console.log('✅ [PASS 2] Campaigns have multi-poster data configured (2-3 posters).');

  // Test 3: Live HTTP Route Status
  console.log('\n--- 3. Testing Live HTTP Endpoints for New Pages ---');
  const baseUrl = 'http://localhost:3000';

  const routesToTest = [
    '/',
    '/campaigns/save-4-year-old-aarav-leukemia-treatment',
    '/admin/homepage-curation',
    '/admin/campaigns/c1/edit',
    '/admin/campaigns/new'
  ];

  for (const route of routesToTest) {
    const res = await fetch(`${baseUrl}${route}`, {
      headers: { 'Accept': 'text/html' }
    });
    if (res.status !== 200) {
      throw new Error(`Route ${route} returned status ${res.status}`);
    }
    const html = await res.text();
    if (html.includes('Rendered fewer hooks than expected')) {
      throw new Error(`Route ${route} threw React hook violation`);
    }
    console.log(`✅ [PASS 3] Route ${route} returned HTTP 200 OK without errors.`);
  }

  // Test 4: Live HTTP API Route
  console.log('\n--- 4. Testing Admin Homepage Curation API Security & Endpoints ---');
  // 4.1 Unauthenticated access should be rejected with 401
  const unauthRes = await fetch(`${baseUrl}/api/admin/homepage-curation`);
  if (unauthRes.status === 401) {
    console.log('✅ [PASS 4.1] Unauthenticated request safely blocked with HTTP 401 Unauthorized.');
  } else {
    throw new Error(`Expected 401 for unauthenticated request, received ${unauthRes.status}`);
  }

  // 4.2 Authenticated access with admin session cookie
  const adminSession = encodeURIComponent(JSON.stringify({
    id: 'usr-admin-1',
    email: 'admin@dokind.org',
    role: 'super_admin'
  }));

  const authHeaders = {
    'Cookie': `dokind_session=${adminSession}`,
    'Content-Type': 'application/json'
  };

  const apiRes = await fetch(`${baseUrl}/api/admin/homepage-curation`, {
    headers: authHeaders
  });
  if (apiRes.status !== 200) {
    throw new Error(`/api/admin/homepage-curation with admin session returned status ${apiRes.status}`);
  }
  const apiData = await apiRes.json();
  if (!apiData.curation || !Array.isArray(apiData.campaigns)) {
    throw new Error('API did not return valid curation and campaigns payload');
  }
  console.log(`✅ [PASS 4.2] /api/admin/homepage-curation GET returns 200 with ${apiData.campaigns.length} campaigns for super_admin.`);

  // 4.3 POST update via API
  const postRes = await fetch(`${baseUrl}/api/admin/homepage-curation`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      heroCampaignIds: apiData.curation.heroCampaignIds,
      featuredCampaignIds: apiData.curation.featuredCampaignIds,
      monthlyMissionIds: apiData.curation.monthlyMissionIds,
      urgentCampaignIds: apiData.curation.urgentCampaignIds
    })
  });
  if (postRes.status !== 200) {
    throw new Error(`/api/admin/homepage-curation POST returned status ${postRes.status}`);
  }
  const postData = await postRes.json();
  if (!postData.success) {
    throw new Error('API POST update did not return success: true');
  }
  console.log('✅ [PASS 4.3] /api/admin/homepage-curation POST successfully validated and persisted curation.');

  console.log('\n================================================================');
  console.log('🎉 ALL FEATURE INTEGRATION & VERIFICATION CHECKS PASSED CLEANLY!');
  console.log('================================================================');
}

verifyFeatures().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
