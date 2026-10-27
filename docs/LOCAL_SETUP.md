# Dokind Local Setup & Developer Guide

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only.

---

## 1. System Prerequisites

- **Node.js**: `v20.x` or higher (verified on Node.js `v24.19.0`)
- **Package Manager**: `npm` `v10.x` or higher (verified on `11.17.0`)
- **Operating System**: Windows, macOS, or Linux

---

## 2. Quickstart Installation

### Step 1: Navigate to Workspace & Install Dependencies
```bash
cd "d:\mama dono\pt 3"
npm install
```

### Step 2: Configure Environment Variables
Copy the documented `.env.example` to create your local `.env.local`:
```bash
copy .env.example .env.local
```
Key development settings in `.env.local`:
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_PLATFORM_NAME=dokind`
- `AUTH_SECRET=dokind-dev-auth-secret-minimum-32-chars-long`
- `ENCRYPTION_MASTER_KEY=dokind-dev-master-key-minimum-32-chars-long`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder`
- `RAZORPAY_KEY_SECRET=rzp_test_secret_placeholder`
- `RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder`

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Core Verification & Test Commands

Every command listed here is verified and executes cleanly:

| Command | Purpose | Verification Standard |
| :--- | :--- | :--- |
| `npm run build` | Compiles Next.js production build | All 103 pages + 32 API routes compile with 0 errors |
| `npx tsc --noEmit` | Strict TypeScript compilation | 0 type errors across all files |
| `npm run security:test:payment` | Razorpay payment cryptographic suite | 12 / 12 security assertions pass |
| `npx tsx scripts/verify-platform.ts` | Complete platform verification suite | 32 / 32 assertions pass (PAN, order, 80G, refund, RBAC) |
| `npx tsx scripts/test-publishing-e2e.ts`| CMS publishing & cross-process persistence | 14 / 14 E2E publishing assertions pass |

---

## 4. Role Testing & Authentication

In local development mode:
- Donors can sign in using passwordless Email OTP (simulated/console logged when SMTP is not configured).
- Super Admin access is available for the configured super admin account in `INITIAL_SUPER_ADMIN_ACCOUNTS`.
- Admin console is accessed at `/admin`.
