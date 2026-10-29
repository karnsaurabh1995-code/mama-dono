# Dokind Security Baseline Audit Report

**Date:** October 28, 2026  
**Auditor:** Senior Application Security & Penetration Testing Team  
**Repository:** `karnsaurabh1995-code/mama-dono`  
**Target Branch:** `feat/production-security-overhaul` (branched from `main` @ `73b281f`)  
**Deployment Target:** `https://mama-dono.vercel.app`  
**Framework:** Next.js 16.4.2 (App Router), React 19, TypeScript  

---

## 1. Executive Summary

Dokind is a Next.js App Router crowdfunding and donation platform with Razorpay payment processing and Supabase integration. A comprehensive static, architectural, and dynamic threat modeling audit of the codebase was conducted prior to executing the production security overhaul.

The audit revealed critical architectural and implementation vulnerabilities that compromise authentication integrity, administrative isolation, payment reconciliation, donor data privacy, and database security. Specifically:
1. **Unauthenticated Admin Account Takeover:** Public login routes allow arbitrary email input to instantly instantiate client-side sessions with administrative privileges.
2. **Client-Side Session Forging:** The client authentication context manually writes unsigned `dokind_session` cookies directly to `document.cookie` and allows arbitrary role switching.
3. **Missing Server-Side Authorization Guards:** Multiple administrative pages under `/admin` and API routes (e.g., `/api/admin/metrics`, `/api/admin/pending-counts`) lack server session validation or contain inverted logic (`!session || staffRoles.includes(...)`), granting anonymous access.
4. **Payment Reconciliation & Underpayment Exploit:** The Razorpay webhook handler validates cryptographic event signatures but completely omits verification that `paymentEntity.amount` and `currency` match the database donation record, allowing order confirmation for fractional payments.
5. **Donor Data Privacy & Insecure Direct Object References (IDOR):** Donor account and transaction dashboards query general database collections without scoping by authenticated user ID, leaking transaction details across donors.
6. **Database RLS Gaps:** Multiple Supabase database tables (`organizations`, `causes`, `campaign_budget_items`, `recurring_donations`, `refunds`, `manual_donations`) operate without Row Level Security enabled.
7. **Secret Exposure in Static Code:** Hardcoded mock API credentials in `src/lib/data/api-keys.ts` trigger secret scanner alerts (Gitleaks).
8. **Permissive Content Security Policy:** Production CSP permits `'unsafe-eval'` and broad script/frame sources.

This baseline report catalogs the route inventory, details each confirmed vulnerability (VULN-01 through VULN-10), defines the threat vector, and outlines the required remediation actions.

---

## 2. Route & Surface Inventory

### 2.1 Administrative Pages (`src/app/admin/*`)
| Route | Type | Current Access Control | Vulnerability / Status |
| :--- | :--- | :--- | :--- |
| `/admin` | Server Component | None (`AdminOverviewPage` fetches metrics directly) | **CRITICAL:** Accessible without session |
| `/admin/login` | Client Component | Form submission to `/api/admin/auth/login` | Hardened in previous PR, needs complete replacement of fallback paths |
| `/admin/campaigns` | Server/Client | Missing server-side layout guard | Accessible if client router navigates directly |
| `/admin/causes` | Server/Client | Missing server-side layout guard | Accessible if client router navigates directly |
| `/admin/donations` | Server/Client | Missing server-side layout guard | Exposes donor financial transaction records |
| `/admin/finance` | Client Component | Imports `db` directly, mock actor fallback | **CRITICAL:** Allows arbitrary refund & payout approval |
| `/admin/kyc` | Server/Client | Missing server-side layout guard | Exposes donor and NGO KYC documents |
| `/admin/organizations` | Server/Client | Missing server-side layout guard | Administrative mutations unauthenticated |
| `/admin/payouts` | Server/Client | Missing server-side layout guard | Financial disbursement mutations unauthenticated |
| `/admin/users` | Server/Client | Missing server-side layout guard | Administrative user management exposed |
| `/admin/audit-logs` | Server/Client | Missing server-side layout guard | Security audit logs viewable anonymously |
| `/admin/settings` | Server/Client | Missing server-side layout guard | System settings exposed |

### 2.2 Administrative APIs (`src/app/api/admin/*`)
| Endpoint | Method | Current Guard | Vulnerability / Status |
| :--- | :--- | :--- | :--- |
| `/api/admin/auth/login` | POST | `authenticateAdmin()` | Enforces bootstrap & password, but needs MFA support |
| `/api/admin/auth/me` | GET | `getServerSession()` | Returns session state |
| `/api/admin/auth/change-password`| POST | `getServerSession()` | Requires existing session |
| `/api/admin/metrics` | GET | `const hasAccess = !session \|\| ...` | **CRITICAL:** Inverted logic permits anonymous callers |
| `/api/admin/pending-counts` | GET | `const hasAccess = !session \|\| ...` | **CRITICAL:** Inverted logic permits anonymous callers |
| `/api/admin/export` | GET/POST | Varies by export type | Potential CSV formula injection vulnerability |

### 2.3 Public & Donor Authentication Surfaces
| Endpoint / Page | Type | Current Behavior | Vulnerability / Status |
| :--- | :--- | :--- | :--- |
| `/login` | Client Page | `handleEmailLogin` calls `login(cleanEmail)` | **CRITICAL:** Any email logs in without credentials |
| `/signup` | Client Page | Calls `login(email, role)` directly | Insecure client-driven role registration |
| `/api/auth/email-otp/send` | POST | Generates numeric OTP | Validates email format |
| `/api/auth/email-otp/verify` | POST | Verifies OTP code | Matched admin emails without password/MFA |
| `/api/auth/google/callback` | GET/POST | Processes OAuth callback | Auto-matched admin emails without MFA |
| `/account` | Client Page | `db.getDonations({ status: 'succeeded' })` | **CRITICAL (IDOR):** Shows all donors' donations |
| `/account/profile` | Client Page | Uses client `user` state | Lacks server session binding |
| `/account/recurring` | Client Page | Client state fetching | Lacks server session binding |

### 2.4 Payment & Webhook Surfaces (`src/app/api/donations/*` & `src/lib/payment/*`)
| Surface | Method | Current Behavior | Vulnerability / Status |
| :--- | :--- | :--- | :--- |
| `/api/donations/create-order` | POST | Creates Razorpay order | Authoritative order creation |
| `/api/donations/verify` | POST | Verifies HMAC-SHA256 signature | Non-production fallback allows missing secret |
| `/api/webhooks/razorpay` | POST | Verifies event signature | **CRITICAL:** Omits `amount` & `currency` checks against DB record |

---

## 3. Confirmed Vulnerabilities Prior to Remediation

### VULN-01: Client-Side Session Forging and Role Elevation via `context.tsx`
- **File:** `src/lib/auth/context.tsx` (Lines 80–120)
- **Severity:** **CRITICAL** (CVSS: 9.8)
- **Evidence:**
  ```typescript
  // context.tsx lines 84-88:
  const syncCookie = (user: User | null) => {
    if (user) {
      document.cookie = `dokind_session=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
    }
  };
  // login() client function:
  const login = async (email: string, targetRole: UserRole = 'donor') => {
    const demoUser = DEMO_USERS[targetRole];
    // Sets state and writes cookie immediately without any server challenge!
  };
  ```
- **Business Impact:** Any visitor can open browser developer tools or call `login('admin@dokind.org', 'super_admin')` to forge a session cookie and elevate privileges to Super Admin.
- **Remediation:** Remove `syncCookie`, eradicate `document.cookie` session manipulation, eliminate client-side user synthesis, and require server-issued HttpOnly HMAC-signed cookies verified via `/api/auth/me`.

---

### VULN-02: Public Login Email-Only Authentication Bypass
- **File:** `src/app/login/page.tsx` (Lines 260–275)
- **Severity:** **CRITICAL** (CVSS: 9.8)
- **Evidence:**
  ```typescript
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...
    const loggedIn = await login(cleanEmail);
    if (loggedIn) {
      router.push(returnUrl || (loggedIn.role === 'donor' ? '/account' : '/admin'));
    }
  };
  ```
- **Business Impact:** Typing any known administrator or super admin email (e.g. `sarthakraj726@gmail.com`) into the standard public login form immediately authenticates the session and redirects to `/admin`.
- **Remediation:** Replace email-only login with mandatory Email OTP verification or password challenge. Block administrative role assumption from the public donor login interface.

---

### VULN-03: Inverted Authorization Logic in Administrative Metrics and Pending Counts APIs
- **Files:** `src/app/api/admin/metrics/route.ts` & `src/app/api/admin/pending-counts/route.ts`
- **Severity:** **CRITICAL** (CVSS: 9.1)
- **Evidence:**
  ```typescript
  // src/app/api/admin/metrics/route.ts line 28:
  const session = await getServerSession();
  const staffRoles = ['super_admin', 'platform_admin', 'moderator', 'finance', 'trust_safety', 'auditor'];
  const hasAccess = !session || staffRoles.includes(session.role);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  ```
- **Business Impact:** Because `!session` evaluates to `true` when no session exists, unauthenticated anonymous callers bypass access control and retrieve sensitive platform financial metrics and user count summaries.
- **Remediation:** Invert and correct the condition: `if (!session || !staffRoles.includes(session.role) || session.status === 'suspended') return 401/403`.

---

### VULN-04: Missing Server-Side Authorization on Administrative Pages
- **Files:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, and `/admin/*` subpages
- **Severity:** **HIGH** (CVSS: 8.5)
- **Evidence:**
  `src/app/admin/layout.tsx` is marked `'use client'` and contains no server-side authentication check. `src/app/admin/page.tsx` directly renders `AdminOverviewPage()` without calling `getServerSession()`.
- **Business Impact:** Direct navigation or client-side caching enables unauthorized users to view administrative shells and dashboards.
- **Remediation:** Add server-side authentication and role enforcement at the layout or root page level, redirecting unauthenticated users to `/admin/login` with strict returnUrl validation.

---

### VULN-05: Payment Reconciliation & Underpayment Bypass in Razorpay Webhook
- **File:** `src/app/api/webhooks/razorpay/route.ts` (Lines 80–140)
- **Severity:** **CRITICAL** (CVSS: 9.3)
- **Evidence:**
  The webhook handler verifies HMAC-SHA256 signature using `crypto.timingSafeEqual`, but then looks up the donation record by `donationId` or `order_id` and marks it `succeeded` without validating:
  ```typescript
  // Missing check:
  if (paymentEntity.amount !== Math.round(donation.totalAmount * 100)) { ... }
  if (paymentEntity.currency !== donation.currency) { ... }
  ```
- **Business Impact:** An attacker can create an order for ₹10,000, tamper with the client-side checkout to pay ₹1, and if Razorpay generates a payment entity for ₹1, Dokind marks the ₹10,000 campaign donation as fully paid.
- **Remediation:** Verify `paymentEntity.amount === Math.round(donation.totalAmount * 100)` and `paymentEntity.currency === donation.currency` before confirming the donation. Replay protection via persistent idempotency keys.

---

### VULN-06: Insecure Direct Object Reference (IDOR) on Donor Transaction History
- **File:** `src/app/account/page.tsx` (Lines 110–135)
- **Severity:** **HIGH** (CVSS: 7.5)
- **Evidence:**
  ```typescript
  const recentDonations = useMemo(() => {
    return db.getDonations({ status: 'succeeded' }).slice(0, 4);
  }, []);
  ```
- **Business Impact:** Any logged-in donor visiting their personal `/account` dashboard is presented with recent donations made by other donors, disclosing donor names, amounts, and campaign contributions.
- **Remediation:** Filter donations strictly by `d.donorId === user.id || d.donorEmail === user.email`.

---

### VULN-07: Client-Side Database Direct Access and Mock Actor in Finance Portal
- **File:** `src/app/admin/finance/page.tsx` (Lines 40–70)
- **Severity:** **HIGH** (CVSS: 8.2)
- **Evidence:**
  `FinancePage` imports `db` directly on the client and supplies a fallback actor `{ id: 'usr-finance-1', role: 'finance' }` when executing approval actions for bank transfers and tax exemption certificates.
- **Business Impact:** Direct execution of financial mutations with synthetic credentials.
- **Remediation:** Migrate mutations to server-side authenticated APIs verifying real actor identity from session cookie.

---

### VULN-08: Incomplete Supabase Row Level Security (RLS) Coverage
- **File:** `supabase/schema.sql`
- **Severity:** **HIGH** (CVSS: 7.8)
- **Evidence:**
  RLS is enabled on `profiles`, `campaigns`, `donations`, and `audit_logs`, but omitted entirely on `organizations`, `causes`, `campaign_budget_items`, `recurring_donations`, `refunds`, and `manual_donations`.
- **Business Impact:** If a client connects directly to Supabase via the public anonymous key, unconstrained read/write access to unprotected tables is permitted.
- **Remediation:** Author and apply migration `20261028_comprehensive_rls_hardening.sql` enabling RLS across all platform tables with restrictive policies.

---

### VULN-09: Hardcoded Mock API Credentials Triggering Secret Scanners
- **File:** `src/lib/data/api-keys.ts`
- **Severity:** **MEDIUM** (CVSS: 5.3)
- **Evidence:**
  Contains mock API keys resembling live formats: `GOCSPX-dkndSecretKey...`, `AKIA_DOKIND...`, `re_dknd_live...`, `f2sms_live...`. These trigger high-severity alerts in Gitleaks.
- **Business Impact:** Pollutes security audit logs with false positives and risks confusion with real production secrets.
- **Remediation:** Replace mock patterns with sanitized placeholders (`GOCSPX-SAMPLE-MASKED-KEY-DO-NOT-USE`, `AKIA_SAMPLE_AWS_KEY_MASKED`).

---

### VULN-10: Permissive Content Security Policy (CSP)
- **File:** `next.config.ts`
- **Severity:** **MEDIUM** (CVSS: 6.1)
- **Evidence:**
  `next.config.ts` includes `'unsafe-eval'` in `script-src` and broad frame permissions.
- **Business Impact:** Increases exposure to Cross-Site Scripting (XSS) and clickjacking.
- **Remediation:** Restrict script-src by removing `'unsafe-eval'` in production mode, refine connect-src, and restrict frame-ancestors to `'none'`.

---

## 4. Remediation Plan

The remediation will be executed sequentially:
1. **Architecture & Contract (`docs/SECURITY_ARCHITECTURE.md`):** Formalize the authoritative server session model, Data Access Layer (DAL), and Role-Permission Matrix.
2. **Admin Authentication Hardening:** Remove client-side role switching and cookie forging; implement server layout authorization guards and fix inverted API checks.
3. **Donor Authentication Hardening:** Eliminate email-only bypass in `/login` and `/signup`; resolve IDOR in donor account dashboards.
4. **Payment & Webhook Hardening:** Enforce amount/currency validation and persistent idempotency in Razorpay webhooks.
5. **Database & Secret Security:** Author Supabase RLS migration; sanitize mock keys in `api-keys.ts`; enforce fail-closed DB initialization.
6. **Application Hardening:** Tighten CSP and add edge middleware for `/admin` route protection.
7. **Verification & Audit Artifacts:** Execute test suites (`lint`, `build`, `security:check`, `security:test:payment`, `verify:admin`) and publish `security-reports/security-remediation-final.md`.
