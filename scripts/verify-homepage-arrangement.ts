import { db } from '../src/lib/db';

async function main() {
  console.log('================================================================');
  console.log('   DOKIND HOMEPAGE SECTION ARRANGEMENT & VERIFICATION SUITE     ');
  console.log('================================================================');

  // 1. Check database sections
  const published = db.getPublishedPageSections('home');
  console.log('\n--- 1. Published Sections from Database Layer ---');
  published.forEach((s, idx) => {
    console.log(`  [${idx}] id: ${s.id}, type: ${s.type}, order: ${s.order}, title: "${s.title}"`);
  });

  const hasFeaturedInDB = published.some(s => s.id === 'sec-featured-campaigns' || s.type === 'featured_campaigns');
  const hasProductInDB = published.some(s => s.id === 'sec-product-giving' || s.type === 'products');

  if (hasFeaturedInDB || hasProductInDB) {
    console.error('FAIL: Redundant sections still in database published sections!');
    process.exit(1);
  }
  console.log('  ✓ [PASS] Redundant sections completely absent from database published sections.');

  // 2. Fetch live rendered HTML
  console.log('\n--- 2. Live HTTP GET / Verification ---');
  const res = await fetch('http://localhost:32009/');
  if (!res.ok) {
    console.error(`FAIL: HTTP ${res.status}`);
    process.exit(1);
  }
  const html = await res.text();

  const hasFeaturedInHTML = html.includes('Featured Campaigns Making Measurable Impact');
  const hasProductInHTML = html.includes('Product Giving: Deliver Tangible Essentials Directly');

  if (hasFeaturedInHTML) {
    console.error('FAIL: "Featured Campaigns Making Measurable Impact" still rendered in HTML!');
    process.exit(1);
  }
  if (hasProductInHTML) {
    console.error('FAIL: "Product Giving: Deliver Tangible Essentials Directly" still rendered in HTML!');
    process.exit(1);
  }
  console.log('  ✓ [PASS] "Featured Campaigns Making Measurable Impact" is NOT rendered.');
  console.log('  ✓ [PASS] "Product Giving: Deliver Tangible Essentials Directly" is NOT rendered.');

  // Extract all h2 headings from live HTML
  const headings: string[] = [];
  const regex = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const clean = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
      .replace(/\s+/g, ' ');
    headings.push(clean);
  }

  console.log('\n--- 3. Headings Rendered on Live Homepage (In Sequence) ---');
  headings.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h}`);
  });

  // Verify key headings exist in order
  const expectedOrder = [
    'Support Causes That Touch Your Heart',
    'Monthly Giving: Long-Term Sustained Transformation',
    'Our Proven Impact in Numbers',
    'Voices of Trust & Gratitude',
    'Frequently Asked Questions',
    'Ready to Start a Fundraiser for Someone in Need?',
    'Featured In National Media',
    'Stay Connected to the Lives You Touch',
  ];

  console.log('\n--- 4. Sequence Validation ---');
  let lastFoundIndex = -1;
  for (const exp of expectedOrder) {
    const idx = headings.findIndex(h => h.includes(exp) || exp.includes(h));
    if (idx === -1) {
      console.error(`FAIL: Missing expected section heading: "${exp}"`);
      process.exit(1);
    }
    if (idx < lastFoundIndex) {
      console.error(`FAIL: Out-of-order section heading: "${exp}" (found at index ${idx}, expected after ${lastFoundIndex})`);
      process.exit(1);
    }
    console.log(`  ✓ [PASS] Found "${exp}" at live position ${idx + 1}`);
    lastFoundIndex = idx;
  }

  console.log('\n================================================================');
  console.log('   ALL HOMEPAGE SECTION VERIFICATION CHECKS PASSED PERFECTLY!   ');
  console.log('================================================================');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
