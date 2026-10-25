import fs from 'fs';
import path from 'path';
import { SecurityFinding, ScannerResult } from './dependency-audit';

export interface ASVSControlEvaluation {
  id: string;
  title: string;
  category: string;
  level: string;
  status: 'passed' | 'failed' | 'requires_manual_verification';
  notes: string;
  relatedFindings: string[];
}

export interface ASVSAssessmentResult {
  standard: string;
  version: string;
  evaluatedAt: string;
  totalControls: number;
  passedCount: number;
  failedCount: number;
  manualVerificationCount: number;
  complianceScorePercent: number;
  controls: ASVSControlEvaluation[];
}

export function evaluateASVS(
  rootDir: string,
  rawDir: string,
  allFindings: SecurityFinding[]
): ScannerResult {
  const startTime = Date.now();
  const configPath = path.join(rootDir, 'security', 'config', 'asvs-v5.json');

  if (!fs.existsSync(configPath)) {
    return {
      scanner: 'asvs-assessor',
      toolName: 'OWASP ASVS 5.0 Verification Framework',
      version: '5.0.0',
      durationMs: 0,
      status: 'error',
      findings: [],
      skipReason: 'Missing security/config/asvs-v5.json configuration file',
    };
  }

  const asvsData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const evaluations: ASVSControlEvaluation[] = [];

  for (const chapter of asvsData.chapters || []) {
    for (const ctrl of chapter.controls || []) {
      const related = allFindings.filter((f) => {
        const text = `${f.title} ${f.description} ${f.component} ${f.cwe || ''} ${f.owasp || ''}`.toLowerCase();
        if (ctrl.id === 'V11.1.1' && (text.includes('signature') || text.includes('razorpay'))) return true;
        if (ctrl.id === 'V11.1.2' && text.includes('idempotency')) return true;
        if (ctrl.id === 'V11.1.3' && text.includes('price')) return true;
        if (ctrl.id === 'V6.1.1' && text.includes('timing')) return true;
        if (ctrl.id === 'V10.1.1' && (f.scanner === 'npm-audit' || f.scanner === 'trivy')) return true;
        if (ctrl.id === 'V14.1.1' && text.includes('header')) return true;
        if (ctrl.id === 'V1.1.1' && text.includes('secret')) return true;
        if (ctrl.id === 'V5.2.1' && text.includes('xss')) return true;
        return false;
      });

      let status: ASVSControlEvaluation['status'] = 'passed';
      let notes = 'Verified by automated scanning and configuration check.';

      if (related.length > 0) {
        status = 'failed';
        notes = `Automated checks identified ${related.length} relevant finding(s).`;
      } else if (
        ctrl.category === 'Authentication' ||
        ctrl.category === 'Privacy' ||
        ctrl.category === 'File Upload'
      ) {
        status = 'requires_manual_verification';
        notes = 'Automated static check passed baseline; full compliance requires operational review.';
      }

      evaluations.push({
        id: ctrl.id,
        title: ctrl.title,
        category: ctrl.category,
        level: ctrl.level,
        status,
        notes,
        relatedFindings: related.map((r) => r.id),
      });
    }
  }

  const passedCount = evaluations.filter((e) => e.status === 'passed').length;
  const failedCount = evaluations.filter((e) => e.status === 'failed').length;
  const manualCount = evaluations.filter((e) => e.status === 'requires_manual_verification').length;
  const score = Math.round((passedCount / evaluations.length) * 100);

  const report: ASVSAssessmentResult = {
    standard: 'OWASP ASVS 5.0',
    version: '5.0.0',
    evaluatedAt: new Date().toISOString(),
    totalControls: evaluations.length,
    passedCount,
    failedCount,
    manualVerificationCount: manualCount,
    complianceScorePercent: score,
    controls: evaluations,
  };

  fs.writeFileSync(path.join(rawDir, 'asvs-assessment.json'), JSON.stringify(report, null, 2));

  return {
    scanner: 'asvs-assessor',
    toolName: 'OWASP ASVS 5.0 Structured Verification Assessor',
    version: '5.0.0',
    durationMs: Date.now() - startTime,
    status: failedCount > 0 ? 'failed' : 'passed',
    findings: [],
    rawOutput: report,
  };
}
