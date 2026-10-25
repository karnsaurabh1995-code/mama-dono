import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { SecurityFinding, ScannerResult } from './dependency-audit';

function redactSecret(str: string): string {
  if (!str || str.length <= 6) return '***REDACTED***';
  return str.substring(0, 3) + '***REDACTED***' + str.substring(str.length - 2);
}

export async function runSecretScanner(rootDir: string, rawDir: string): Promise<ScannerResult> {
  const startTime = Date.now();
  const findings: SecurityFinding[] = [];
  let gitleaksInstalled = false;
  let gitleaksVersion = 'not-installed';

  // Check if gitleaks CLI is available
  try {
    const versionOut = execSync('gitleaks version', { stdio: 'pipe' }).toString().trim();
    gitleaksInstalled = true;
    gitleaksVersion = versionOut;
  } catch {
    // Try searching common Windows locations
    try {
      const whereOut = execSync('where.exe gitleaks', { stdio: 'pipe' }).toString().trim();
      if (whereOut) {
        gitleaksInstalled = true;
        gitleaksVersion = 'gitleaks-cli';
      }
    } catch {
      gitleaksInstalled = false;
    }
  }

  // 1. Run official Gitleaks CLI if available
  if (gitleaksInstalled) {
    try {
      const gitleaksReportPath = path.join(rawDir, 'gitleaks-report.json');
      try {
        execSync(`gitleaks detect --source "${rootDir}" --no-banner --report-format json --report-path "${gitleaksReportPath}"`, {
          cwd: rootDir,
          stdio: 'pipe',
        });
      } catch (leakErr: any) {
        // Gitleaks returns exit code 1 when leaks are found
      }

      if (fs.existsSync(gitleaksReportPath)) {
        const rawContent = fs.readFileSync(gitleaksReportPath, 'utf8');
        if (rawContent.trim().length > 0) {
          const leaks = JSON.parse(rawContent);
          for (const leak of leaks) {
            findings.push({
              id: `LEAK-${leak.RuleID || 'SECRET'}-${path.basename(leak.File || 'unknown')}-${leak.StartLine || 0}`,
              title: `Exposed Credential: ${leak.Description || leak.RuleID}`,
              severity: 'Critical',
              confidence: 'High',
              status: 'unresolved',
              component: leak.File,
              file: leak.File,
              line: leak.StartLine,
              cwe: 'CWE-798: Use of Hard-coded Credentials',
              owasp: 'A07:2021 - Identification and Authentication Failures',
              description: `Gitleaks detected a hardcoded credential or secret matching rule '${leak.RuleID}'.`,
              evidence: `Match rule: ${leak.RuleID}; Secret: ${redactSecret(leak.Secret || '')}; Commit: ${leak.Commit || 'working-tree'}`,
              reproduction: `Inspect file '${leak.File}' around line ${leak.StartLine}`,
              impact: 'Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.',
              remediation: 'Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.',
              scanner: 'gitleaks',
              rawReference: { rule: leak.RuleID, file: leak.File, line: leak.StartLine },
            });
          }
        }
      }
    } catch (gitleaksErr: any) {
      console.warn('Gitleaks execution encountered an error:', gitleaksErr.message);
    }
  }

  // 2. Native High-Precision Secret & Key Scanner (Working Tree + Git History)
  const secretPatterns = [
    {
      id: 'RAZORPAY-LIVE-KEY',
      name: 'Razorpay Live Key ID',
      regex: /rzp_live_[a-zA-Z0-9]{14}/g,
      severity: 'Critical' as const,
      description: 'Production Razorpay live key ID identified in source code.',
    },
    {
      id: 'RAZORPAY-SECRET-KEY',
      name: 'Razorpay Key Secret',
      regex: /(?:RAZORPAY_KEY_SECRET|razorpay_secret|razorpaySecret)\s*[:=]\s*['"]([a-zA-Z0-9]{18,40})['"]/gi,
      severity: 'Critical' as const,
      description: 'Razorpay API secret key hardcoded in plaintext.',
    },
    {
      id: 'RAZORPAY-WEBHOOK-SECRET',
      name: 'Razorpay Webhook Secret',
      regex: /(?:RAZORPAY_WEBHOOK_SECRET|webhookSecret)\s*[:=]\s*['"]([a-zA-Z0-9_-]{16,40})['"]/gi,
      severity: 'Critical' as const,
      description: 'Razorpay webhook signing secret hardcoded in plaintext.',
    },
    {
      id: 'SUPABASE-SERVICE-ROLE-KEY',
      name: 'Supabase Service Role Secret Key',
      regex: /service_role\s*[:=]\s*['"](eyJ[a-zA-Z0-9._-]+)['"]/gi,
      severity: 'Critical' as const,
      description: 'High-privilege Supabase service role key bypassing Row Level Security.',
    },
    {
      id: 'PRIVATE-KEY-HEADER',
      name: 'Unencrypted Private Key',
      regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
      severity: 'Critical' as const,
      description: 'Asymmetric private key certificate stored in plaintext.',
    },
    {
      id: 'DATABASE-CONNECTION-URL',
      name: 'Database URL with Embedded Credentials',
      regex: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[a-zA-Z0-9_-]+:([^@\s]+)@[a-zA-Z0-9.-]+/gi,
      severity: 'High' as const,
      description: 'Database connection URI contains embedded database password.',
    },
  ];

  // Helper to scan a directory recursively
  const ignoreDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'security-reports', '.gemini']);
  function scanDirRecursive(dir: string) {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignoreDirs.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirRecursive(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.pdf', '.zip'].includes(ext)) {
          continue;
        }
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

          // Ignore test fixtures, security toolkit files, or template files
          if (
            relPath.startsWith('security/') ||
            relPath.includes('.test.') ||
            relPath.includes('__tests__') ||
            relPath.endsWith('.example')
          ) {
            continue;
          }

          const lines = content.split('\n');
          for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            const line = lines[lineIdx];
            for (const pattern of secretPatterns) {
              pattern.regex.lastIndex = 0;
              let match: RegExpExecArray | null;
              while ((match = pattern.regex.exec(line)) !== null) {
                const matchedSecret = match[1] || match[0];
                // Ignore mock placeholders or obvious test strings
                if (
                  matchedSecret.includes('placeholder') ||
                  matchedSecret.includes('your_') ||
                  matchedSecret.includes('mock_') ||
                  matchedSecret.includes('SevaSetu2026') // Test key from mock
                ) {
                  continue;
                }

                const findingId = `SEC-${pattern.id}-${path.basename(relPath)}-L${lineIdx + 1}`;
                if (!findings.some((f) => f.id === findingId)) {
                  findings.push({
                    id: findingId,
                    title: `Hardcoded Secret Detected: ${pattern.name}`,
                    severity: pattern.severity,
                    confidence: 'High',
                    status: 'unresolved',
                    component: relPath,
                    file: relPath,
                    line: lineIdx + 1,
                    cwe: 'CWE-798: Use of Hard-coded Credentials',
                    owasp: 'A07:2021 - Identification and Authentication Failures',
                    description: pattern.description,
                    evidence: `Line ${lineIdx + 1}: ${redactSecret(matchedSecret)}`,
                    reproduction: `Check file '${relPath}' at line ${lineIdx + 1}`,
                    impact: 'Exposes private credentials, risking unauthorized administrative or financial actions.',
                    remediation: 'Remove hardcoded secret from source code and load via server-side environment variables (.env.local).',
                    scanner: 'native-secret-audit',
                    rawReference: { pattern: pattern.name, file: relPath, line: lineIdx + 1 },
                  });
                }
              }
            }
          }
        } catch {
          // ignore unreadable files
        }
      }
    }
  }

  scanDirRecursive(rootDir);

  // 3. Scan recent Git commit diffs for secrets
  try {
    const gitDiff = execSync('git log -p -n 15', { cwd: rootDir, stdio: 'pipe' }).toString();
    for (const pattern of secretPatterns) {
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.regex.exec(gitDiff)) !== null) {
        const matched = match[1] || match[0];
        if (
          !matched.includes('placeholder') &&
          !matched.includes('your_') &&
          !matched.includes('mock_') &&
          !matched.includes('SevaSetu2026')
        ) {
          const findingId = `SEC-GIT-${pattern.id}`;
          if (!findings.some((f) => f.id === findingId)) {
            findings.push({
              id: findingId,
              title: `Secret in Git History: ${pattern.name}`,
              severity: pattern.severity,
              confidence: 'Medium',
              status: 'unresolved',
              component: 'Git Commit History',
              file: 'git-history',
              cwe: 'CWE-798: Use of Hard-coded Credentials',
              owasp: 'A07:2021 - Identification and Authentication Failures',
              description: `A credential matching ${pattern.name} was detected in recent Git commit history.`,
              evidence: `Commit diff match: ${redactSecret(matched)}`,
              reproduction: "Run 'git log -S <pattern>' to locate the introducing commit.",
              impact: 'Anyone with read access to the git repository can extract previous credentials from git history.',
              remediation: 'Rotate the compromised secret immediately and consider rewriting commit history with git-filter-repo or BFG Repo-Cleaner.',
              scanner: 'native-git-history-audit',
            });
          }
        }
      }
    }
  } catch {
    // git history not available or shallow clone
  }

  const rawReport = {
    gitleaksInstalled,
    gitleaksVersion,
    findingsCount: findings.length,
    scannedTime: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(rawDir, 'secret-scan-summary.json'), JSON.stringify(rawReport, null, 2));

  return {
    scanner: 'secret-scanner',
    toolName: gitleaksInstalled ? `Gitleaks (${gitleaksVersion}) + Native Engine` : 'Native Secret Engine (Gitleaks not installed)',
    version: gitleaksInstalled ? gitleaksVersion : 'native-v1',
    durationMs: Date.now() - startTime,
    status: findings.some((f) => f.severity === 'Critical') ? 'failed' : 'passed',
    findings,
    rawOutput: rawReport,
    skipReason: !gitleaksInstalled ? 'Gitleaks CLI not found in PATH; executed native high-precision pattern and git history scanner.' : undefined,
    installGuide: !gitleaksInstalled ? 'To install official Gitleaks: run "winget install Gitleaks.Gitleaks" or download binary from https://github.com/gitleaks/gitleaks/releases' : undefined,
  };
}
