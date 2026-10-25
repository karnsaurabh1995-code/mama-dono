import { execSync } from 'child_process';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { URL } from 'url';
import { SecurityFinding, ScannerResult } from './dependency-audit';

function fetchUrl(targetUrl: string, headers: Record<string, string> = {}): Promise<{
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      targetUrl,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Dokind-Security-Audit-Toolkit/1.0',
          ...headers,
        },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.end();
  });
}

function checkZapInstalled(): { installed: boolean; binary?: string; version?: string } {
  const zapCandidates = ['zap.bat', 'zap.sh', 'owasp-zap', 'zap'];
  for (const bin of zapCandidates) {
    try {
      const out = execSync(`where.exe ${bin}`, { stdio: 'pipe' }).toString().trim();
      if (out) {
        return { installed: true, binary: out, version: 'zap-cli' };
      }
    } catch {
      // continue
    }
  }
  return { installed: false };
}

export async function runLivePassiveScan(
  targetUrl: string,
  rootDir: string,
  rawDir: string
): Promise<ScannerResult> {
  const startTime = Date.now();
  const findings: SecurityFinding[] = [];
  const zapStatus = checkZapInstalled();

  let targetAccessible = false;
  let homeRes: any = null;

  try {
    homeRes = await fetchUrl(targetUrl);
    targetAccessible = true;
  } catch (err: any) {
    return {
      scanner: 'live-passive',
      toolName: 'Passive HTTP & Header Security Analyzer',
      version: '1.0.0',
      durationMs: Date.now() - startTime,
      status: 'skipped',
      findings: [],
      skipReason: `Target URL ${targetUrl} is not reachable (${err.message}). Ensure website server is running.`,
      installGuide: 'Start the development server with "npm run dev" or specify an active URL via --target <url>',
    };
  }

  // 1. Security Headers Analysis
  const resHeaders = homeRes.headers;

  const headerChecks = [
    {
      header: 'content-security-policy',
      title: 'Missing Content-Security-Policy (CSP) Header',
      severity: 'Medium' as const,
      cwe: 'CWE-1021: Improper Restriction of Rendered UI Layers or Frames',
      owasp: 'A05:2021 - Security Misconfiguration',
      impact: 'Without CSP, the browser cannot enforce strict source restrictions on scripts, styles, and frames, increasing the impact of XSS vulnerabilities.',
      remediation: "Configure Content-Security-Policy in next.config.ts headers or proxy middleware to restrict script-src, frame-ancestors, and object-src.",
    },
    {
      header: 'x-frame-options',
      title: 'Missing X-Frame-Options Header (Clickjacking Risk)',
      severity: 'Medium' as const,
      cwe: 'CWE-1021: Improper Restriction of Rendered UI Layers or Frames',
      owasp: 'A05:2021 - Security Misconfiguration',
      impact: 'The application pages can be framed within an attacker-controlled iframe, exposing donors to clickjacking attacks.',
      remediation: "Add 'X-Frame-Options: SAMEORIGIN' or 'DENY' header in next.config.ts.",
    },
    {
      header: 'x-content-type-options',
      title: 'Missing X-Content-Type-Options Header (MIME-Sniffing Risk)',
      severity: 'Low' as const,
      cwe: 'CWE-116: Improper Encoding or Escaping of Output',
      owasp: 'A05:2021 - Security Misconfiguration',
      impact: 'Browsers may interpret responses as executable scripts instead of the declared MIME type, leading to drive-by code execution.',
      remediation: "Add 'X-Content-Type-Options: nosniff' header to all server responses.",
    },
    {
      header: 'referrer-policy',
      title: 'Missing Referrer-Policy Header',
      severity: 'Low' as const,
      cwe: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor',
      owasp: 'A05:2021 - Security Misconfiguration',
      impact: 'Sensitive URL parameters (campaign identifiers, tracking tokens) may be leaked to external third-party sites in the Referer header.',
      remediation: "Add 'Referrer-Policy: strict-origin-when-cross-origin' or 'no-referrer'.",
    },
    {
      header: 'permissions-policy',
      title: 'Missing Permissions-Policy Header',
      severity: 'Low' as const,
      cwe: 'CWE-250: Execution with Unnecessary Privileges',
      owasp: 'A05:2021 - Security Misconfiguration',
      impact: 'Browser device capabilities (camera, microphone, geolocation) are not explicitly restricted by the application policy.',
      remediation: "Add 'Permissions-Policy: camera=(), microphone=(), geolocation=()'.",
    },
  ];

  for (const check of headerChecks) {
    const val = resHeaders[check.header];
    if (!val) {
      findings.push({
        id: `HEADER-${check.header.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        title: check.title,
        severity: check.severity,
        confidence: 'High',
        status: 'unresolved',
        component: `HTTP Header: ${check.header}`,
        file: 'next.config.ts',
        cwe: check.cwe,
        owasp: check.owasp,
        description: `HTTP response from ${targetUrl} did not contain the security header '${check.header}'.`,
        evidence: `Headers returned: ${Object.keys(resHeaders).join(', ')}`,
        reproduction: `curl -I "${targetUrl}" | grep -i "${check.header}"`,
        impact: check.impact,
        remediation: check.remediation,
        scanner: 'live-passive',
      });
    }
  }

  // 2. HTTPS & HSTS check
  if (targetUrl.startsWith('https://')) {
    if (!resHeaders['strict-transport-security']) {
      findings.push({
        id: 'HEADER-HSTS-MISSING',
        title: 'Missing Strict-Transport-Security (HSTS) Header',
        severity: 'Medium',
        confidence: 'High',
        status: 'unresolved',
        component: 'HTTP Header: Strict-Transport-Security',
        file: 'next.config.ts',
        cwe: 'CWE-319: Cleartext Transmission of Sensitive Information',
        owasp: 'A02:2021 - Cryptographic Failures',
        description: 'HTTPS endpoint does not send Strict-Transport-Security header to prevent SSL stripping attacks.',
        evidence: `Headers: ${Object.keys(resHeaders).join(', ')}`,
        reproduction: `curl -I "${targetUrl}"`,
        impact: 'Users on insecure networks could be downgraded to HTTP.',
        remediation: "Add 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload'.",
        scanner: 'live-passive',
      });
    }
  }

  // 3. CORS Misconfiguration Check
  try {
    const corsRes = await fetchUrl(targetUrl, {
      Origin: 'https://evil-attacker-site.com',
    });
    const allowOrigin = corsRes.headers['access-control-allow-origin'];
    const allowCreds = corsRes.headers['access-control-allow-credentials'];

    if (allowOrigin === '*' && allowCreds === 'true') {
      findings.push({
        id: 'CORS-WILDCARD-WITH-CREDENTIALS',
        title: 'CORS Misconfiguration: Wildcard Origin With Credentials',
        severity: 'Critical',
        confidence: 'High',
        status: 'unresolved',
        component: 'CORS Configuration',
        cwe: 'CWE-346: Origin Validation Error',
        owasp: 'A01:2021 - Broken Access Control',
        description: 'The server allows arbitrary origins (*) to read authenticated responses with credentials.',
        evidence: `Access-Control-Allow-Origin: ${allowOrigin}, Access-Control-Allow-Credentials: ${allowCreds}`,
        reproduction: `curl -H "Origin: https://evil-attacker-site.com" -I "${targetUrl}"`,
        impact: 'Malicious websites can issue cross-origin requests to read donor data or session responses.',
        remediation: 'Restrict Access-Control-Allow-Origin to trusted domains and never combine wildcard origin with credentials.',
        scanner: 'live-passive',
      });
    }
  } catch {
    // ignore
  }

  // 4. Sensitive Path Disclosure Checks (Safe, Non-Destructive GETs)
  const sensitivePaths = [
    '/.env',
    '/.env.local',
    '/.git/config',
    '/.git/HEAD',
  ];

  for (const sPath of sensitivePaths) {
    try {
      const probeUrl = new URL(sPath, targetUrl).toString();
      const probeRes = await fetchUrl(probeUrl);
      if (probeRes.statusCode === 200 && probeRes.body.length > 0 && !probeRes.body.includes('<!DOCTYPE html>')) {
        findings.push({
          id: `PATH-EXPOSURE-${sPath.replace(/[^A-Za-z0-9]/g, '_')}`,
          title: `Sensitive File Exposure: ${sPath}`,
          severity: 'Critical',
          confidence: 'High',
          status: 'unresolved',
          component: sPath,
          cwe: 'CWE-552: Files or Directories Accessible to External Parties',
          owasp: 'A01:2021 - Broken Access Control',
          description: `Sensitive file ${sPath} is accessible via public HTTP request and returns contents without authorization.`,
          evidence: `Status: 200 OK at ${probeUrl}`,
          reproduction: `curl "${probeUrl}"`,
          impact: 'Direct leakage of configuration secrets, environment keys, or internal repository data.',
          remediation: `Configure web server or reverse proxy to block access to hidden files and ${sPath}.`,
          scanner: 'live-passive',
        });
      }
    } catch {
      // probe error
    }
  }

  // 5. OWASP ZAP Execution Check
  let zapExecuted = false;
  let zapReport: any = null;
  if (zapStatus.installed && zapStatus.binary) {
    try {
      const zapOutPath = path.join(rawDir, 'zap-report.json');
      execSync(
        `"${zapStatus.binary}" -cmd -quickurl "${targetUrl}" -quickout "${zapOutPath}" -quickprogress`,
        { cwd: rootDir, stdio: 'pipe' }
      );
      if (fs.existsSync(zapOutPath)) {
        zapExecuted = true;
        zapReport = JSON.parse(fs.readFileSync(zapOutPath, 'utf8'));
      }
    } catch (err: any) {
      console.warn('OWASP ZAP quickscan error:', err.message);
    }
  }

  const liveSummary = {
    targetUrl,
    scannedAt: new Date().toISOString(),
    statusCode: homeRes.statusCode,
    headersDetected: Object.keys(resHeaders),
    zapInstalled: zapStatus.installed,
    zapExecuted,
    findingsCount: findings.length,
  };
  fs.writeFileSync(path.join(rawDir, 'live-scan-summary.json'), JSON.stringify(liveSummary, null, 2));

  return {
    scanner: 'live-passive',
    toolName: zapExecuted
      ? `OWASP ZAP Baseline + Native Header Analyzer`
      : 'Native HTTP & Security Header Analyzer (OWASP ZAP not installed)',
    version: zapStatus.installed ? (zapStatus.version || 'zap') : '1.0.0',
    durationMs: Date.now() - startTime,
    status: findings.some((f) => f.severity === 'Critical') ? 'failed' : 'passed',
    findings,
    rawOutput: liveSummary,
    skipReason: !zapStatus.installed
      ? 'OWASP ZAP binary not detected in PATH; executed native non-aggressive header and route inspector.'
      : undefined,
    installGuide: !zapStatus.installed
      ? 'To install OWASP ZAP: download from https://www.zaproxy.org/download/ or run via Docker: "docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t <target>"'
      : undefined,
  };
}
