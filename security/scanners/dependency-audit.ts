import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface SecurityFinding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  confidence: 'High' | 'Medium' | 'Low';
  status: 'new' | 'known' | 'fixed' | 'unresolved' | 'manual_verification_required';
  component: string;
  file?: string;
  line?: number;
  cwe?: string;
  owasp?: string;
  description: string;
  evidence: string;
  reproduction: string;
  impact: string;
  remediation: string;
  scanner: string;
  rawReference?: any;
}

export interface ScannerResult {
  scanner: string;
  toolName: string;
  version: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  findings: SecurityFinding[];
  rawOutput?: any;
  skipReason?: string;
  installGuide?: string;
}

export async function runDependencyAudit(rootDir: string, rawDir: string): Promise<ScannerResult> {
  const startTime = Date.now();
  const toolName = 'npm audit';
  let version = 'unknown';

  try {
    version = execSync('npm --version', { cwd: rootDir, stdio: 'pipe' }).toString().trim();
  } catch {
    version = 'system';
  }

  try {
    let auditJsonRaw = '';
    try {
      auditJsonRaw = execSync('npm audit --json', {
        cwd: rootDir,
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024,
      }).toString();
    } catch (err: any) {
      // npm audit exits with 1 when vulnerabilities are found
      if (err.stdout) {
        auditJsonRaw = err.stdout.toString();
      } else {
        throw err;
      }
    }

    const auditData = JSON.parse(auditJsonRaw);
    fs.writeFileSync(path.join(rawDir, 'npm-audit.json'), JSON.stringify(auditData, null, 2));

    const findings: SecurityFinding[] = [];
    const vulnerabilities = auditData.vulnerabilities || {};

    for (const [pkgName, vulnInfo] of Object.entries<any>(vulnerabilities)) {
      const severityMap: Record<string, SecurityFinding['severity']> = {
        critical: 'Critical',
        high: 'High',
        moderate: 'Medium',
        low: 'Low',
        info: 'Informational',
      };

      const mappedSeverity = severityMap[vulnInfo.severity?.toLowerCase()] || 'Medium';

      const viaList = Array.isArray(vulnInfo.via) ? vulnInfo.via : [];
      const primaryVia = viaList.find((v: any) => typeof v === 'object') || {};

      const advisoryTitle = primaryVia.title || `${pkgName} vulnerability (${vulnInfo.severity})`;
      const advisoryUrl = primaryVia.url || 'https://www.npmjs.com/advisories';
      const cwe = primaryVia.cwe ? primaryVia.cwe.join(', ') : 'CWE-1395: Dependency on Vulnerable Third-Party Component';

      findings.push({
        id: `DEP-${pkgName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        title: `Vulnerable Dependency: ${pkgName} - ${advisoryTitle}`,
        severity: mappedSeverity,
        confidence: 'High',
        status: 'unresolved',
        component: `package.json -> ${pkgName}`,
        file: 'package.json',
        cwe,
        owasp: 'A06:2021 - Vulnerable and Outdated Components',
        description: `Package '${pkgName}' version installed in node_modules contains a known ${vulnInfo.severity} severity security vulnerability. Direct dependency: ${!vulnInfo.isDirect ? 'transitive' : 'direct'}.`,
        evidence: `Direct dependency: ${vulnInfo.isDirect ? 'Yes' : 'No'}; Range: ${vulnInfo.range}; Severity: ${vulnInfo.severity}; Advisory: ${advisoryUrl}`,
        reproduction: `Run 'npm audit --json' or inspect node_modules/${pkgName}/package.json`,
        impact: `Exploitation depends on reachable package code paths, potentially leading to denial of service, memory exhaustion, or code execution.`,
        remediation: vulnInfo.fixAvailable
          ? `Run 'npm update ${pkgName}' or update package version as recommended by npm.`
          : `Review advisory at ${advisoryUrl} and upgrade parent package or pin fixed version.`,
        scanner: 'npm-audit',
        rawReference: vulnInfo,
      });
    }

    return {
      scanner: 'dependency-audit',
      toolName,
      version,
      durationMs: Date.now() - startTime,
      status: findings.some((f) => f.severity === 'Critical' || f.severity === 'High') ? 'failed' : 'passed',
      findings,
      rawOutput: { summary: auditData.metadata?.vulnerabilities || {} },
    };
  } catch (error: any) {
    return {
      scanner: 'dependency-audit',
      toolName,
      version,
      durationMs: Date.now() - startTime,
      status: 'error',
      findings: [],
      skipReason: `Failed to execute npm audit: ${error.message}`,
      installGuide: 'Ensure Node.js and npm are properly configured and dependencies installed via npm install.',
    };
  }
}
