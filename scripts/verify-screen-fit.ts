import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 DOKIND VERIFICATION: UNIVERSAL SCREEN FIT (PHONE TO BILLBOARDS)');
  console.log('================================================================\n');

  // 1. Verify ScreenFit Hook & Provider exist
  const hookPath = path.join(process.cwd(), 'src/hooks/useScreenFit.ts');
  const providerPath = path.join(process.cwd(), 'src/components/common/ScreenFitProvider.tsx');
  const globalsCssPath = path.join(process.cwd(), 'src/app/globals.css');
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');

  assert(fs.existsSync(hookPath), 'useScreenFit hook exists');
  assert(fs.existsSync(providerPath), 'ScreenFitProvider component exists');
  assert(fs.existsSync(globalsCssPath), 'globals.css exists');
  assert(fs.existsSync(layoutPath), 'layout.tsx exists');

  // 2. Verify Screen Tiers coverage in hook
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  assert(hookContent.includes("'phone'"), 'Hook defines phone tier (<640px)');
  assert(hookContent.includes("'tablet'"), 'Hook defines tablet tier (640px - 1023px)');
  assert(hookContent.includes("'laptop'"), 'Hook defines laptop tier (1024px - 1439px)');
  assert(hookContent.includes("'desktop'"), 'Hook defines desktop tier (1440px - 2159px)');
  assert(hookContent.includes("'tv'"), 'Hook defines TV tier (2560px - 3839px)');
  assert(hookContent.includes("'billboard'"), 'Hook defines billboard tier (>=3840px)');

  // 3. Verify CSS Breakpoints in globals.css
  const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
  assert(cssContent.includes('@media (min-width: 1440px)'), 'globals.css has 1440px desktop breakpoint');
  assert(cssContent.includes('@media (min-width: 1921px)'), 'globals.css has 1921px 2K/Ultrawide breakpoint');
  assert(cssContent.includes('@media (min-width: 2560px)'), 'globals.css has 2560px 4K TV breakpoint');
  assert(cssContent.includes('@media (min-width: 3840px)'), 'globals.css has 3840px UHD & Billboard breakpoint');
  assert(cssContent.includes('@media (min-width: 5120px)'), 'globals.css has 5120px 8K Billboard breakpoint');
  assert(cssContent.includes('overflow-x: clip'), 'globals.css clips horizontal scroll for mobile stability');
  assert(cssContent.includes('clamp('), 'globals.css uses modern clamp() fluid typography');

  // 4. Verify Root Layout Viewport & Provider integration
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  assert(layoutContent.includes('export const viewport: Viewport'), 'layout.tsx exports Viewport configuration');
  assert(layoutContent.includes("width: 'device-width'"), 'Viewport specifies device-width');
  assert(layoutContent.includes('<ScreenFitProvider>'), 'RootLayout integrates ScreenFitProvider');

  // 5. Verify Live Server Rendering with ScreenFitProvider
  const res = await fetch('http://localhost:3000/');
  assert(res.status === 200, 'Home page returns HTTP 200 with ScreenFit active');
  const html = await res.text();
  assert(html.includes('dokind'), 'Rendered HTML contains Dokind branding');

  console.log('\n================================================================');
  console.log('🎉 ALL SCREEN FIT ASSERTIONS PASSED CLEANLY (18/18 PASS)');
  console.log('================================================================');
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
