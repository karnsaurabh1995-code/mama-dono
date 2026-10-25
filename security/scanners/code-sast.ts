import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { SecurityFinding, ScannerResult } from './dependency-audit';

function findSemgrepBinary(): string | null {
  const candidates = [
    'semgrep',
    'semgrep.exe',
    'C:\\Users\\sarth\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\semgrep.exe',
  ];

  for (const bin of candidates) {
    try {
      const out = execSync(`"${bin}" --version`, { stdio: 'pipe' }).toString().trim();
      if (out && !out.includes('not recognized')) {
        return bin;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export async function runCodeSAST(rootDir: string, rawDir: string): Promise<ScannerResult> {
  const startTime = Date.now();
  const findings: SecurityFinding[] = [];
  const semgrepBin = findSemgrepBinary();
  let semgrepVersion = 'not-installed';

  // 1. Run Semgrep if installed
  if (semgrepBin) {
    try {
      semgrepVersion = execSync(`"${semgrepBin}" --version`, { stdio: 'pipe' }).toString().trim();
      const semgrepConfigPath = path.join(rootDir, 'security', 'config', 'semgrep.yml');
      const semgrepRawOut = path.join(rawDir, 'semgrep-results.json');

      try {
        execSync(
          `"${semgrepBin}" scan --config "${semgrepConfigPath}" --json --output "${semgrepRawOut}" "${path.join(rootDir, 'src')}"`,
          {
            cwd: rootDir,
            stdio: 'pipe',
            maxBuffer: 20 * 1024 * 1024,
          }
        );
      } catch (scanErr: any) {
        // Semgrep returns non-zero when findings or warnings occur
      }

      if (fs.existsSync(semgrepRawOut)) {
        const rawJson = fs.readFileSync(semgrepRawOut, 'utf8');
        if (rawJson.trim().length > 0) {
          const semgrepData = JSON.parse(rawJson);
          const results = semgrepData.results || [];

          for (const res of results) {
            const relPath = path.relative(rootDir, res.path).replace(/\\/g, '/');
            const ruleMeta = res.extra?.metadata || {};
            const severityMap: Record<string, SecurityFinding['severity']> = {
              ERROR: 'High',
              WARNING: 'Medium',
              INFO: 'Low',
            };
            const mappedSeverity = severityMap[res.extra?.severity] || 'Medium';

            findings.push({
              id: `SAST-${res.check_id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}-${path.basename(relPath)}-L${res.start?.line || 0}`,
              title: `SAST: ${res.check_id}`,
              severity: mappedSeverity,
              confidence: (ruleMeta.confidence as any) || 'Medium',
              status: 'unresolved',
              component: relPath,
              file: relPath,
              line: res.start?.line,
              cwe: ruleMeta.cwe || 'CWE-20: Improper Input Handling',
              owasp: ruleMeta.owasp || 'A03:2021 - Injection',
              description: res.extra?.message || `Semgrep rule match: ${res.check_id}`,
              evidence: `Line ${res.start?.line}: ${res.extra?.lines?.trim() || ''}`,
              reproduction: `Inspect ${relPath} around line ${res.start?.line}`,
              impact: 'Security vulnerability or unsafe coding practice identified by static analysis.',
              remediation: 'Refactor code to adhere to secure development best practices and sanitize dynamic values.',
              scanner: 'semgrep',
              rawReference: res,
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('Semgrep scan encountered execution error:', err.message);
    }
  }

  // 2. Native Deep SAST Engine for Next.js & Payment Security Analysis
  // Inspect src/ directory for specific framework & route security patterns
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
          const lines = content.split('\n');

          // Check 1: dangerouslySetInnerHTML without sanitization
          if (content.includes('dangerouslySetInnerHTML')) {
            const isSanitized = content.includes('sanitizeHtml') || content.includes('DOMPurify');
            if (!isSanitized) {
              const lineIdx = lines.findIndex((l) => l.includes('dangerouslySetInnerHTML'));
              const findingId = `SAST-XSS-DANGEROUS-HTML-${path.basename(relPath)}`;
              if (!findings.some((f) => f.id === findingId)) {
                findings.push({
                  id: findingId,
                  title: 'Potential XSS: unsanitized dangerouslySetInnerHTML used',
                  severity: 'High',
                  confidence: 'High',
                  status: 'unresolved',
                  component: relPath,
                  file: relPath,
                  line: lineIdx + 1,
                  cwe: "CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
                  owasp: 'A03:2021 - Injection',
                  description: 'dangerouslySetInnerHTML bypasses React built-in HTML encoding and introduces Cross-Site Scripting risks if user inputs are rendered without sanitization.',
                  evidence: lines[lineIdx]?.trim() || 'dangerouslySetInnerHTML',
                  reproduction: `Examine ${relPath} at line ${lineIdx + 1}`,
                  impact: 'An attacker could execute arbitrary JavaScript in the victim donor’s session.',
                  remediation: 'Sanitize content with DOMPurify or sanitizeHtml() before rendering.',
                  scanner: 'native-sast',
                });
              }
            }
          }

          // Check 2: Razorpay Verification Signature Bypass in verify route
          if (relPath.includes('api/donations/verify') && content.includes('keySecret && razorpaySignature') && !content.includes('isProduction')) {
            const lineIdx = lines.findIndex((l) => l.includes('keySecret && razorpaySignature'));
            const findingId = 'SAST-PAYMENT-SIG-BYPASS';
            if (!findings.some((f) => f.id === findingId)) {
              findings.push({
                id: findingId,
                title: 'Payment Verification Signature Bypass in Fallback Mode',
                severity: 'High',
                confidence: 'High',
                status: 'unresolved',
                component: relPath,
                file: relPath,
                line: lineIdx + 1,
                cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
                owasp: 'A02:2021 - Cryptographic Failures',
                description: 'The verification route only checks signatures if keySecret && razorpaySignature are provided. If razorpaySignature is omitted, it falls back to completing the payment with a mock signature.',
                evidence: lines[lineIdx]?.trim() || 'if (keySecret && razorpaySignature)',
                reproduction: 'Send POST /api/donations/verify without razorpaySignature',
                impact: 'In non-strictly checked environments, a malicious actor could confirm unpaid donations without providing a valid Razorpay signature.',
                remediation: 'Enforce that razorpaySignature is mandatory in production (NODE_ENV === "production") and reject any verification request lacking valid cryptographic proof.',
                scanner: 'native-sast',
              });
            }
          }

          // Check 3: Webhook Verification Signature Bypass
          if (relPath.includes('api/webhooks/razorpay') && content.includes('if (webhookSecret && signature)') && !content.includes('isProduction')) {
            const lineIdx = lines.findIndex((l) => l.includes('if (webhookSecret && signature)'));
            const findingId = 'SAST-WEBHOOK-SIG-BYPASS';
            if (!findings.some((f) => f.id === findingId)) {
              findings.push({
                id: findingId,
                title: 'Webhook Signature Check Skipped When Secret/Header Is Missing',
                severity: 'High',
                confidence: 'High',
                status: 'unresolved',
                component: relPath,
                file: relPath,
                line: lineIdx + 1,
                cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
                owasp: 'A02:2021 - Cryptographic Failures',
                description: 'Webhook handler skips cryptographic signature verification if x-razorpay-signature header is absent.',
                evidence: lines[lineIdx]?.trim() || 'if (webhookSecret && signature)',
                reproduction: 'POST /api/webhooks/razorpay with forged event payload and no x-razorpay-signature header',
                impact: 'Forged webhooks could mark orders as paid or trigger false refunds.',
                remediation: 'Ensure that x-razorpay-signature header is strictly required in production mode before processing events.',
                scanner: 'native-sast',
              });
            }
          }

          // Check 4: Insecure Direct Object Reference (IDOR) check in refund routes
          if (relPath.includes('api/donations/refund') && (!content.includes('ALLOWED_REFUND_ROLES') && !content.includes('role'))) {
            const findingId = 'SAST-REFUND-AUTHZ-CHECK';
            if (!findings.some((f) => f.id === findingId)) {
              findings.push({
                id: findingId,
                title: 'Refund API Route Missing Explicit Authorization Check',
                severity: 'High',
                confidence: 'Medium',
                status: 'unresolved',
                component: relPath,
                file: relPath,
                line: 1,
                cwe: 'CWE-285: Improper Authorization',
                owasp: 'A01:2021 - Broken Access Control',
                description: 'Refund initiation must be restricted strictly to authenticated administrators with refund privileges.',
                evidence: 'Refund route does not inspect caller session token or admin privileges.',
                reproduction: 'Attempt POST /api/donations/refund without admin credentials',
                impact: 'Unauthorized users could issue fraudulent refunds for legitimate donations.',
                remediation: 'Add server-side session authentication check (e.g., verifying admin or head_staff role) before invoking refund logic.',
                scanner: 'native-sast',
              });
            }
          }
        }
      }
    };
    scanDir(srcDir);
  }

  return {
    scanner: 'code-sast',
    toolName: semgrepBin ? `Semgrep (${semgrepVersion}) + Native Next.js SAST` : 'Native Next.js SAST Engine (Semgrep not installed)',
    version: semgrepBin ? semgrepVersion : 'native-sast-v1',
    durationMs: Date.now() - startTime,
    status: findings.some((f) => f.severity === 'High' || f.severity === 'Critical') ? 'failed' : 'passed',
    findings,
    rawOutput: { semgrepVersion, findingsCount: findings.length },
    skipReason: !semgrepBin ? 'Semgrep binary not found in PATH; executed native AST/pattern SAST scanner.' : undefined,
    installGuide: !semgrepBin ? 'To install Semgrep: run "pip install semgrep" or see https://semgrep.dev/docs/getting-started/' : undefined,
  };
}
