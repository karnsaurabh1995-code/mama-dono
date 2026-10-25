<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# DOKIND SECURITY AUDIT TOOLKIT — AGENT OPERATING INSTRUCTIONS

## 1. Overview & Architecture

Dokind is a Next.js (App Router) crowdfunding and donation platform with Razorpay payment processing.
The security toolkit provides automated, non-destructive security auditing across:
- **Source Code SAST:** Semgrep rules + Next.js App Router security engine (`security/scanners/code-sast.ts`)
- **Secret & Credential Detection:** Gitleaks CLI + native high-precision pattern & Git history scanner (`security/scanners/secret-scanner.ts`)
- **Dependency Auditing:** Native `npm audit` integration (`security/scanners/dependency-audit.ts`)
- **Razorpay Payment Integrity Suite:** Cryptographic HMAC-SHA256 signature verification, timing attack resistance (`crypto.timingSafeEqual`), webhook idempotency & replay resistance, and business logic pricing checks (`security/scanners/razorpay-integrity.ts`)
- **Live HTTP & Header Analysis:** Non-aggressive security header verification (CSP, HSTS, X-Frame-Options, CORS, cookies) and OWASP ZAP baseline integration (`security/scanners/live-passive.ts`)
- **OWASP ASVS 5.0 Verification:** 14-chapter application security verification standard mapping (`security/scanners/asvs-assessor.ts`)

---

## 2. Command Reference

All security audit operations are run through npm scripts:

| Command | Purpose | When to Use |
| :--- | :--- | :--- |
| `npm run security:check` | Full combined audit (code + passive live) | Pre-deployment, milestone verification, release gate |
| `npm run security:check -- --code` | Source-code-only audit | During feature development, fast static analysis, CI/CD |
| `npm run security:check -- --passive` | Live running-website scan | When the dev server or staging site is active |
| `npm run security:check -- --recheck` | Remediation verification | After applying fixes to verify resolved vs unresolved issues |
| `npm run security:check -- --target <url>` | Custom scan target | Targeting staging (e.g. `--target https://staging.dokind.org`) |
| `npm run security:check -- --active --authorized-staging` | Active staging tests | Authorized staging vulnerability probes only |
| `npm run security:test:payment` | Standalone Razorpay test suite | Rapid payment signature and webhook regression testing |

---

## 3. Report Artifacts & Locations

All audit reports are stored under `security-reports/`:
- `security-reports/summary.md`: Human-readable technical & executive report with remediation roadmap.
- `security-reports/findings.json`: Structured array of deduplicated finding objects (ID, title, severity, file, line, CWE, OWASP, reproduction, impact, remediation).
- `security-reports/coverage.json`: Scanner execution matrix, durations, tool versions, and skipped check justifications.
- `security-reports/raw/`: Sanitized raw outputs from Semgrep, npm audit, secret scanner, Razorpay tests, and live scanners (all secrets redacted with `***REDACTED***`).

---

## 4. Agent Safety Constraints & Rules of Engagement

1. **Strictly Non-Destructive:** Never execute real charges, capture real funds, issue live refunds, or alter live campaign balances during automated audits.
2. **Never Auto-Apply High-Impact Changes:** Antigravity agents must propose file-specific code diffs and request user confirmation before modifying payment verification logic, database schemas, authentication flows, or production configs.
3. **Never Log or Expose Secrets:** Live credentials, Razorpay secret keys, webhook signing secrets, JWT tokens, and donor PAN cards must NEVER be printed to terminal output, logs, or reports.
4. **Distinguish Scanner Errors from Findings:** If an external scanner binary (e.g., Gitleaks, ZAP) is missing from PATH, clearly report it as a prerequisite note in `coverage.json` and execute native fallback checks without claiming skipped checks passed.
5. **No Production Active Testing:** Never run active attacks, injection probes, or mutation tests against production domains.
