# Security Audit Report — Dokind Crowdfunding Platform

**Audit Status:** **CRITICAL RISK**
**Generated:** 2026-10-28T06:11:28.764Z  
**Target:** `http://localhost:3000`  
**Execution Mode:** `code`  
**Total Duration:** 32.87s  
**OWASP ASVS 5.0 Automated Baseline:** 72% (18/25 automated controls passing)

---

## 1. Executive Summary

A comprehensive, non-destructive security evaluation was conducted across the Dokind codebase, payment workflows, and running web interface. The audit toolkit inspected source code (SAST), secrets and credential leakage, npm dependency trees, Razorpay payment verification integrity, and live HTTP security configurations.

### Findings Breakdown

| Severity | Count | Status |
| :--- | :--- | :--- |
| **Critical** | 24 | Requires Immediate Hotfix |
| **High** | 0 | None Detected |
| **Medium** | 0 | None |
| **Low** | 0 | Best Practice Improvements |
| **Informational** | 0 | Architecture Notices |
| **Total Findings** | **24** | |



---

## 2. Tools & Coverage Matrix

| Scanner / Component | Engine Used | Status | Duration | Findings | Prerequisite / Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **npm audit** | `11.17.0` | `PASSED` | 3.97s | 0 | Executed cleanly |
| **Gitleaks (8.30.1) + Native Engine** | `8.30.1` | `FAILED` | 4.10s | 24 | Executed cleanly |
| **Native Next.js SAST Engine (Semgrep not installed)** | `native-sast-v1` | `PASSED` | 24.78s | 0 | Semgrep binary not found in PATH; executed native AST/pattern SAST scanner. |
| **Razorpay Cryptographic & Business Logic Integrity Suite** | `1.0.0` | `PASSED` | 0.01s | 0 | Executed cleanly |
| **OWASP ASVS 5.0 Structured Verification Assessor** | `5.0.0` | `FAILED` | 0.00s | 0 | Executed cleanly |

### Prerequisites & Missing Scanner Setup
- **Native Next.js SAST Engine (Semgrep not installed)**: To install Semgrep: run "pip install semgrep" or see https://semgrep.dev/docs/getting-started/


---

## 3. Razorpay Payment Integrity Audit

Dokind uses Razorpay as its core fundraising payment provider. The audit toolkit executed an automated test suite verifying cryptographic signatures, timing safety, webhook idempotency, and business logic pricing rules:

1. **Cryptographic Signature Verification:**  
   - HMAC-SHA256 calculation matches Razorpay official specification: `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`.  
   - Signature checks correctly reject tampered signatures, tampered order IDs, and tampered payment IDs.
2. **Timing Attack Resistance:**  
   - Verification uses `crypto.timingSafeEqual` to eliminate microsecond timing leaks during comparison.
3. **Webhook Security & Idempotency:**  
   - Webhook signatures are verified using the exact raw request body.  
   - Multiple deliveries of the same `payment.captured` or `order.paid` event are handled idempotently in `verifyAndCompletePayment` without duplicate credits to `campaign.raisedAmount` or `supporterCount`.
4. **Business Logic & Pricing Enforcement:**  
   - Authoritative server-side catalog pricing is strictly enforced in `createDonationOrder`. Untrusted client unit prices are discarded, positive integer quantities are validated, and total donations cannot fall below catalog costs.

---

## 4. Detailed Security Findings

### 1. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-9`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 9)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***11; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 9

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 2. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-10`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 10)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***11; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 10

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 3. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-30`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 30)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***87; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 30

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 4. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-31`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 31)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***87; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 31

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 5. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-51`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 51)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***11; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 51

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 6. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-52`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 52)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***11; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 52

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 7. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-72`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 72)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: tes***REDACTED***10; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 72

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 8. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-73`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 73)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: tes***REDACTED***10; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 73

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 9. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-93`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 93)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: GOC***REDACTED***AB; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 93

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 10. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-94`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 94)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: GOC***REDACTED***AB; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 94

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 11. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-114`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 114)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: 6Lf***REDACTED***et; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 114

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 12. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-115`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 115)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: 6Lf***REDACTED***et; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 115

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 13. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-135`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 135)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: re_***REDACTED***BB; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 135

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 14. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-136`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 136)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: re_***REDACTED***BB; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 136

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 15. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-156`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 156)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: f2s***REDACTED***88; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 156

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 16. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-gitleaks-report.json-157`)

- **Component / File:** `security-reports/raw/gitleaks-report.json` (Line 157)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: f2s***REDACTED***88; Commit: 3c9b737971f132e104c0f2f016442a73276fd457
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security-reports/raw/gitleaks-report.json' around line 157

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 17. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-verify-admin-integration.ts-43`)

- **Component / File:** `scripts/verify-admin-integration.ts` (Line 43)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***11; Commit: ae1f05b02789df09b24295e5faf8ea1a4ba99399
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'scripts/verify-admin-integration.ts' around line 43

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 18. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-verify-admin-integration.ts-145`)

- **Component / File:** `scripts/verify-admin-integration.ts` (Line 145)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***87; Commit: ae1f05b02789df09b24295e5faf8ea1a4ba99399
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'scripts/verify-admin-integration.ts' around line 145

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 19. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-razorpay-security.test.ts-9`)

- **Component / File:** `security/tests/razorpay-security.test.ts` (Line 9)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: rzp***REDACTED***11; Commit: 5df99a89c663925bbc73061f2c64fe20842081a5
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security/tests/razorpay-security.test.ts' around line 9

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 20. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-razorpay-integrity.ts-22`)

- **Component / File:** `security/scanners/razorpay-integrity.ts` (Line 22)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: tes***REDACTED***10; Commit: 5df99a89c663925bbc73061f2c64fe20842081a5
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'security/scanners/razorpay-integrity.ts' around line 22

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 21. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-api-keys.ts-59`)

- **Component / File:** `src/lib/data/api-keys.ts` (Line 59)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: GOC***REDACTED***AB; Commit: 5df99a89c663925bbc73061f2c64fe20842081a5
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'src/lib/data/api-keys.ts' around line 59

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 22. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-api-keys.ts-124`)

- **Component / File:** `src/lib/data/api-keys.ts` (Line 124)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: 6Lf***REDACTED***et; Commit: 5df99a89c663925bbc73061f2c64fe20842081a5
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'src/lib/data/api-keys.ts' around line 124

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 23. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-api-keys.ts-219`)

- **Component / File:** `src/lib/data/api-keys.ts` (Line 219)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: re_***REDACTED***BB; Commit: 5df99a89c663925bbc73061f2c64fe20842081a5
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'src/lib/data/api-keys.ts' around line 219

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

### 24. [CRITICAL] Exposed Credential: Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (`LEAK-generic-api-key-api-keys.ts-267`)

- **Component / File:** `src/lib/data/api-keys.ts` (Line 267)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **OWASP Category:** A07:2021 - Identification and Authentication Failures
- **Confidence:** High | **Status:** `unresolved` | **Scanner:** `gitleaks`

**Description:**  
Gitleaks detected a hardcoded credential or secret matching rule 'generic-api-key'.

**Evidence:**  
```text
Match rule: generic-api-key; Secret: f2s***REDACTED***88; Commit: 5df99a89c663925bbc73061f2c64fe20842081a5
```

**Business Impact:**  
Exposed credentials can allow unauthorized access to third-party services, databases, or payment gateways.

**Safe Reproduction Steps:**  
Inspect file 'src/lib/data/api-keys.ts' around line 267

**Recommended Remediation:**  
Immediately revoke the credential, rotate the secret in the provider dashboard, and store it in server-side environment variables.

---

---

## 5. Security Posture & Prioritized Release Checklist

1. **Immediate Hotfixes (P0 / Critical & High):**
   - **Enforce Authoritative Item Pricing in Database:** Modify `createDonationOrder` in `src/lib/db/index.ts` to lookup item unit prices from `itemNeed.unitPrice` rather than trusting client `alloc.unitPrice`, and assert `params.amount >= calculatedItemTotal`.
   - **Enforce Mandatory Signature in Production:** In `src/app/api/donations/verify/route.ts`, return 400 Bad Request if `razorpaySignature` is missing when `process.env.NODE_ENV === 'production'`.
   - **Enforce Mandatory Webhook Header:** In `src/app/api/webhooks/razorpay/route.ts`, return 400 Bad Request if `x-razorpay-signature` is absent when secret is configured.
2. **Next Sprint (P1 / Medium):**
   - **Configure HTTP Security Headers:** Add `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` in `next.config.ts`.
   - **Add Session Role Checks on Refund Route:** Ensure `/api/donations/refund` validates admin authentication session before executing refunds.
3. **Continuous Maintenance (P2 / Low):**
   - Regularly execute `npm run security:check -- --code` during CI/CD builds.
   - Keep third-party dependencies updated using `npm audit fix`.

---
*Generated automatically by Dokind Security Audit Toolkit.*
