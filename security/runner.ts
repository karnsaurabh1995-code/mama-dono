import fs from 'fs';
import path from 'path';
import { runDependencyAudit, ScannerResult, SecurityFinding } from './scanners/dependency-audit';
import { runSecretScanner } from './scanners/secret-scanner';
import { runCodeSAST } from './scanners/code-sast';
import { runRazorpayIntegrityAudit } from './scanners/razorpay-integrity';
import { runLivePassiveScan } from './scanners/live-passive';
import { evaluateASVS } from './scanners/asvs-assessor';
import { generateReports, deduplicateFindings } from './reports/generator';

interface CliArgs {
  mode: 'full' | 'code' | 'passive' | 'active' | 'recheck';
  targetUrl: string;
  reportDir: string;
  failOn: 'critical' | 'high' | 'medium' | 'low';
  authorizedStaging: boolean;
}

function parseArgs(args: string[]): CliArgs {
  let mode: CliArgs['mode'] = 'full';
  let targetUrl = 'http://localhost:3000';
  let reportDir = 'security-reports';
  let failOn: CliArgs['failOn'] = 'high';
  let authorizedStaging = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--code') mode = 'code';
    else if (arg === '--passive') mode = 'passive';
    else if (arg === '--full') mode = 'full';
    else if (arg === '--active') mode = 'active';
    else if (arg === '--recheck') mode = 'recheck';
    else if (arg === '--target' && args[i + 1]) {
      targetUrl = args[++i];
    } else if (arg === '--report-dir' && args[i + 1]) {
      reportDir = args[++i];
    } else if (arg === '--fail-on' && args[i + 1]) {
      failOn = args[++i] as any;
    } else if (arg === '--authorized-staging') {
      authorizedStaging = true;
    }
  }

  return { mode, targetUrl, reportDir, failOn, authorizedStaging };
}

async function main() {
  const startTime = Date.now();
  const cliArgs = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const fullReportDir = path.isAbsolute(cliArgs.reportDir)
    ? cliArgs.reportDir
    : path.join(rootDir, cliArgs.reportDir);
  const rawDir = path.join(fullReportDir, 'raw');

  // Ensure directories exist
  if (!fs.existsSync(fullReportDir)) fs.mkdirSync(fullReportDir, { recursive: true });
  if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

  console.log('\n=============================================================');
  console.log('       DOKIND APPLICATION SECURITY AUDIT TOOLKIT             ');
  console.log('=============================================================');
  console.log(` Mode:        ${cliArgs.mode.toUpperCase()}`);
  console.log(` Target:      ${cliArgs.targetUrl}`);
  console.log(` Reports:     ${fullReportDir}`);
  console.log(` Safety Gate: Fail on ${cliArgs.failOn.toUpperCase()} or higher`);
  console.log('=============================================================\n');

  if (cliArgs.mode === 'active' && !cliArgs.authorizedStaging) {
    console.error('❌ Active security testing against staging was requested without authorization confirmation.');
    console.error('   Please provide --authorized-staging to confirm you own and are authorized to test this staging target.');
    console.error('   Active tests against production or unauthorized targets are strictly prohibited.\n');
    process.exit(1);
  }

  // Load previous findings if running recheck
  let previousFindings: SecurityFinding[] = [];
  const prevFindingsPath = path.join(fullReportDir, 'findings.json');
  if (cliArgs.mode === 'recheck' && fs.existsSync(prevFindingsPath)) {
    try {
      previousFindings = JSON.parse(fs.readFileSync(prevFindingsPath, 'utf8'));
      console.log(`ℹ️ Loaded ${previousFindings.length} previous finding(s) for remediation recheck.`);
    } catch {
      console.warn('⚠️ Could not parse previous findings.json; performing clean scan.');
    }
  }

  const results: ScannerResult[] = [];

  // 1. Dependency Audit (code, full, recheck)
  if (cliArgs.mode === 'code' || cliArgs.mode === 'full' || cliArgs.mode === 'recheck') {
    console.log('🔍 [1/5] Running Dependency Security Audit (npm audit)...');
    const depRes = await runDependencyAudit(rootDir, rawDir);
    results.push(depRes);
    console.log(`       Status: ${depRes.status.toUpperCase()} (${depRes.findings.length} findings, ${(depRes.durationMs / 1000).toFixed(2)}s)`);
    if (depRes.skipReason) console.log(`       Note: ${depRes.skipReason}`);
  }

  // 2. Secret & Credential Scanner (code, full, recheck)
  if (cliArgs.mode === 'code' || cliArgs.mode === 'full' || cliArgs.mode === 'recheck') {
    console.log('🔑 [2/5] Running Secret & Credential Leak Scanner (Gitleaks + Native)...');
    const secRes = await runSecretScanner(rootDir, rawDir);
    results.push(secRes);
    console.log(`       Status: ${secRes.status.toUpperCase()} (${secRes.findings.length} findings, ${(secRes.durationMs / 1000).toFixed(2)}s)`);
    if (secRes.skipReason) console.log(`       Note: ${secRes.skipReason}`);
  }

  // 3. Static Application Security Testing (code, full, recheck)
  if (cliArgs.mode === 'code' || cliArgs.mode === 'full' || cliArgs.mode === 'recheck') {
    console.log('🛡️  [3/5] Running Source Code SAST Analysis (Semgrep + Next.js Engine)...');
    const sastRes = await runCodeSAST(rootDir, rawDir);
    results.push(sastRes);
    console.log(`       Status: ${sastRes.status.toUpperCase()} (${sastRes.findings.length} findings, ${(sastRes.durationMs / 1000).toFixed(2)}s)`);
    if (sastRes.skipReason) console.log(`       Note: ${sastRes.skipReason}`);
  }

  // 4. Razorpay Payment Integrity Audit Suite (code, full, recheck)
  if (cliArgs.mode === 'code' || cliArgs.mode === 'full' || cliArgs.mode === 'recheck') {
    console.log('💳 [4/5] Running Razorpay Payment Integrity & Idempotency Suite...');
    const rzpRes = await runRazorpayIntegrityAudit(rootDir, rawDir);
    results.push(rzpRes);
    console.log(`       Status: ${rzpRes.status.toUpperCase()} (${rzpRes.findings.length} findings, ${(rzpRes.durationMs / 1000).toFixed(2)}s)`);
  }

  // 5. Live Website Passive Scan (passive, full, active, recheck)
  if (cliArgs.mode === 'passive' || cliArgs.mode === 'full' || cliArgs.mode === 'active' || cliArgs.mode === 'recheck') {
    console.log(`🌐 [5/5] Running Live Passive Security & Header Scan (${cliArgs.targetUrl})...`);
    const liveRes = await runLivePassiveScan(cliArgs.targetUrl, rootDir, rawDir);
    results.push(liveRes);
    console.log(`       Status: ${liveRes.status.toUpperCase()} (${liveRes.findings.length} findings, ${(liveRes.durationMs / 1000).toFixed(2)}s)`);
    if (liveRes.skipReason) console.log(`       Note: ${liveRes.skipReason}`);
  }

  // 6. OWASP ASVS 5.0 Mapping
  console.log('📋 Evaluating OWASP ASVS 5.0 Verification Matrix...');
  const currentFindings = deduplicateFindings(results.flatMap((r) => r.findings));
  const asvsRes = evaluateASVS(rootDir, rawDir, currentFindings);
  results.push(asvsRes);

  // Recheck comparison if recheck mode
  let recheckSummary: any = undefined;
  if (cliArgs.mode === 'recheck' && previousFindings.length > 0) {
    const currentIds = new Set(currentFindings.map((f) => f.id));
    const prevIds = new Set(previousFindings.map((f) => f.id));

    const resolved = previousFindings.filter((p) => !currentIds.has(p.id));
    const unresolved = previousFindings.filter((p) => currentIds.has(p.id));
    const newlyFound = currentFindings.filter((c) => !prevIds.has(c.id));

    recheckSummary = {
      resolvedCount: resolved.length,
      unresolvedCount: unresolved.length,
      newCount: newlyFound.length,
    };

    console.log('\n--- Remediation Retest Results ---');
    console.log(` ✅ Resolved Findings:   ${resolved.length}`);
    console.log(` ⚠️ Unresolved Findings: ${unresolved.length}`);
    console.log(` 🆕 New Findings:        ${newlyFound.length}`);
  }

  // Generate Reports
  console.log('\n📄 Generating audit reports in security-reports/...');
  generateReports({
    reportDir: fullReportDir,
    rawDir,
    targetUrl: cliArgs.targetUrl,
    scannerResults: results,
    startTime,
    mode: cliArgs.mode,
    recheckResults: recheckSummary,
  });

  const criticalFindings = currentFindings.filter((f) => f.severity === 'Critical');
  const highFindings = currentFindings.filter((f) => f.severity === 'High');
  const mediumFindings = currentFindings.filter((f) => f.severity === 'Medium');

  console.log('\n=============================================================');
  console.log('                    AUDIT SUMMARY RESULTS                    ');
  console.log('=============================================================');
  console.log(` Critical: ${criticalFindings.length}`);
  console.log(` High:     ${highFindings.length}`);
  console.log(` Medium:   ${mediumFindings.length}`);
  console.log(` Low/Info: ${currentFindings.length - criticalFindings.length - highFindings.length - mediumFindings.length}`);
  console.log(` Total:    ${currentFindings.length}`);
  console.log('-------------------------------------------------------------');
  console.log(` 📑 Executive & Technical Report: ${path.join(fullReportDir, 'summary.md')}`);
  console.log(` 📊 Machine-readable Findings:   ${path.join(fullReportDir, 'findings.json')}`);
  console.log(` 📈 Coverage & Scanners:         ${path.join(fullReportDir, 'coverage.json')}`);
  console.log('=============================================================\n');

  // Determine exit code
  let failed = false;
  if (cliArgs.failOn === 'critical' && criticalFindings.length > 0) failed = true;
  if (cliArgs.failOn === 'high' && (criticalFindings.length > 0 || highFindings.length > 0)) failed = true;
  if (cliArgs.failOn === 'medium' && (criticalFindings.length > 0 || highFindings.length > 0 || mediumFindings.length > 0)) failed = true;

  if (failed) {
    console.log(`❌ Security Gate FAILED: Findings detected matching or exceeding ${cliArgs.failOn.toUpperCase()} severity.`);
    process.exit(1);
  } else {
    console.log('✅ Security Gate PASSED: No blocking vulnerabilities detected under configured policy.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error during security audit execution:', err);
  process.exit(1);
});
