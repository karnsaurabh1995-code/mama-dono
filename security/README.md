# Dokind Security Audit Toolkit 🛡️

A plug-and-play, reusable, non-destructive security audit toolkit for the Dokind crowdfunding platform. It provides automated coverage across source-code security (SAST), exposed credentials and secrets, npm package dependencies, Razorpay payment integrity, live HTTP configuration, and the OWASP ASVS 5.0 verification standard.

---

## 🚀 Quick Start (Single-Command)

Run a full security audit across both your codebase and live development server:

```bash
npm run security:check
```

Or run dedicated sub-modes:

```bash
# 1. Source code, secrets, dependencies, and Razorpay tests only (fastest, no server needed)
npm run security:check -- --code

# 2. Passive live website scan against http://localhost:3000
npm run security:check -- --passive

# 3. Scan a custom staging environment
npm run security:check -- --passive --target https://staging.dokind.org

# 4. Recheck previously identified findings after remediation
npm run security:check -- --recheck

# 5. Standalone Razorpay payment integrity unit tests
npm run security:test:payment
```

---

## 📦 What the Toolkit Audits

### 1. Source Code Security (SAST)
- **Engine:** Semgrep CLI (`semgrep.yml`) + Next.js App Router Static Analysis Engine.
- **Coverage:** Insecure HTML rendering (`dangerouslySetInnerHTML`), dynamic code execution (`eval`), client-side secret leakage in React components (`NEXT_PUBLIC_` vs server environment), unhandled exceptions, and missing authorization guards on administrative routes.

### 2. Secret & Credential Detection
- **Engine:** Official Gitleaks CLI + native high-entropy pattern and Git commit history analyzer.
- **Coverage:** Hardcoded Razorpay live keys (`rzp_live_*`), API secrets, webhook secrets, Supabase service-role JWTs, database connection URIs with embedded passwords, and unencrypted private keys.
- **Privacy:** All detected secrets are masked with `***REDACTED***` in both terminal output and generated report artifacts.

### 3. Dependency Auditing
- **Engine:** Native `npm audit --json`.
- **Coverage:** Checks all direct and transitive dependencies against the GitHub Advisory / npm vulnerability database, mapping each to CVEs, CWEs, and CVSS severity scores.

### 4. Razorpay Payment Integrity Suite
- **Cryptographic Signatures:** Verifies that server-side payment signature validation implements official Razorpay HMAC-SHA256: `HMAC_SHA256(order_id + "|" + payment_id, key_secret)`.
- **Timing Attack Resistance:** Verifies that signature comparison uses constant-time comparison via Node.js `crypto.timingSafeEqual` rather than `===`.
- **Webhook Security & Raw Body Integrity:** Verifies `X-Razorpay-Signature` against the exact raw request body.
- **Webhook Idempotency & Replay Resistance:** Simulates repeated delivery of `payment.captured` and `order.paid` webhooks, ensuring monetary raised amounts and supporter counts are never double-credited.
- **Business Logic Pricing Tampering:** Tests whether an attacker can manipulate unit prices in item allocations or donate an amount lower than the catalog cost of requested items.
- **Safety Guarantee:** Automated payment tests execute against sandbox fixtures; **zero real charges, captures, or refunds are ever issued.**

### 5. Live Website Passive Analysis
- **Engine:** Non-aggressive HTTP security analyzer + OWASP ZAP Baseline configuration (`zap-baseline.conf`).
- **Coverage:** Security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`), cookie security attributes (`HttpOnly`, `Secure`, `SameSite`), CORS wildcard misconfigurations, and sensitive file disclosure probes (`.env`, `.git`).

### 6. OWASP ASVS 5.0 Verification Mapping
- Maps automated audit findings and platform security controls against all 14 chapters of the OWASP Application Security Verification Standard (ASVS) 5.0, generating automated compliance percentages and highlighting controls requiring manual operational review.

---

## 📊 Interpreting Generated Reports

Reports are generated inside the `security-reports/` directory:

```
security-reports/
├── summary.md        <-- Executive summary & prioritized technical remediation roadmap
├── findings.json     <-- Machine-readable array of deduplicated findings (ID, CWE, line, remediation)
├── coverage.json     <-- Tools run, scan durations, tool versions, and skipped check notes
└── raw/              <-- Sanitized raw scanner reports (Semgrep, npm audit, Razorpay test output)
```

### Finding Severity Levels:
- **CRITICAL:** High-impact vulnerability requiring an immediate hotfix (e.g., hardcoded live payment secret, unauthenticated payment confirmation). The audit runner exits with code `1`.
- **HIGH:** Significant vulnerability that must be remediated before production launch (e.g., client-controlled item unit price, missing signature check in fallback mode). Exits with code `1`.
- **MEDIUM:** Architecture improvement to address in the next development sprint (e.g., missing Content-Security-Policy or X-Frame-Options header).
- **LOW / INFORMATIONAL:** Defense-in-depth hardening or best practice improvements (e.g., Referrer-Policy header, minor advisory).

---

## 🔧 Prerequisites & Optional Tool Installation

The toolkit runs out of the box with zero external setup because native engines are bundled for all scanners. However, installing official third-party CLI binaries provides additional depth:

| Tool | Purpose | How to Install on Windows | How to Install on macOS / Linux |
| :--- | :--- | :--- | :--- |
| **Node.js 20+ & npm** | Runtime | Already installed | `brew install node` |
| **Semgrep** | Advanced SAST | `pip install semgrep` | `brew install semgrep` or `pip install semgrep` |
| **Gitleaks** | Repository secrets | `winget install Gitleaks.Gitleaks` | `brew install gitleaks` |
| **Trivy** | Vulnerability scanning | `winget install AquaSecurity.Trivy` | `brew install trivy` |
| **OWASP ZAP** | DAST baseline scan | Download from [zaproxy.org](https://www.zaproxy.org/download/) | `brew install --cask zap` or use Docker |

*Note: If an external tool is not installed, the audit runner records it in `coverage.json` as a skipped prerequisite and automatically falls back to the native analyzer without failing or halting independent checks.*

---

## 🔒 Safety & Rules of Engagement

1. **Non-Destructive Testing:** This toolkit is designed for defensive auditing. It will never place live financial transactions, trigger external email broadcasts, or destroy database records.
2. **Secret Privacy:** Never commit production `.env` files or hardcode live Razorpay secrets.
3. **Staging Environment Access:** Active testing flags (`--active`) strictly require the `--authorized-staging` flag to ensure active tests are only performed on authorized non-production infrastructure.

---

## 🛠️ Remediation Workflow

1. Run the audit:
   ```bash
   npm run security:check -- --code
   ```
2. Open `security-reports/summary.md` to review the prioritized remediation items.
3. Implement the suggested code corrections in the codebase.
4. Verify the fixes:
   ```bash
   npm run security:check -- --recheck
   ```
5. Confirm that resolved findings show `Resolved` and no new regressions were introduced.
