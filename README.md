# dokind Foundation — Verified Indian Crowdfunding & Philanthropy Platform

**dokind Foundation** (`dokind`) is a modern, high-trust, database-driven crowdfunding platform built specifically for India. It brings together emergency medical crowdfunding, recurring monthly mission support, transparent product giving, multi-factor donor authentication, and bank-grade Razorpay payment security under Section 80G Indian tax compliance.

---

## 🌟 Key Highlights & Architectural Features

### 1. Brand Identity & Design System
- **Palette**: Warm ivory background (`#FAF9F6`), Deep charcoal headings (`#202124`), Warm Vermilion primary CTA (`#E84B45` & `#BD302D`), Muted emerald success badge (`#25845B`), Warm borders (`#E8E6E1`).
- **Branding**: Official dokind Foundation visual identity, custom vector brush-stroke card framing, responsive brand logos, and accessible WCAG 2.2 AA contrast ratios.
- **Typography & Formatting**: Inter / modern sans-serif typography, Lucide React icons, and native Indian numbering formatting across all currencies (e.g., ₹1,50,000, ₹14.5 L, ₹2.5 Cr).

### 2. Triple Giving Models
1. **Urgent & Medical Emergency Campaigns**: Verified AIIMS hospital estimates, itemized budgets (ICU, chemotherapy, organ transplants), clinical updates, and direct hospital disbursement options.
2. **Monthly Giving Missions**: Recurring monthly support for daily hospital meals, girl child education, and animal trauma rescue with 1-click self-serve cancellation and zero lock-in.
3. **Product Giving**: Sponsor tangible items (Family Grocery Kits, Student School Kits, Heavy Polar Blankets, Modular Prosthetics) with real-time quantity selectors, wholesale procurement transparency, and geotagged distribution proof.

### 3. Production Authentication Architecture
- **Centralized Login Modal**: Accessible, global dialog triggered explicitly by user actions (closed by default; never forced on page load or public browsing).
- **Passwordless Email OTP**: Secure 6-digit numeric verification code delivered via Gmail SMTP (`smtp.gmail.com:465`) / Nodemailer with keyed HMAC-SHA256 digests and `crypto.timingSafeEqual` comparison.
- **Google Sign-In (OAuth 2.0 / OpenID Connect)**: Official Google identity federation with anti-CSRF state signing and verified email enforcement.
- **MSG91 Mobile OTP**: Real phone number authentication via MSG91 v5 OTP API with rate-limiting, cooldown timers, and abuse prevention.
- **Zero Privilege Escalation**: New signups automatically receive standard `donor` role; staff roles (`super_admin`, `admin`, `marketer`, `content_writer`, `head_staff`) are strictly governed with a maximum 2-role constraint.

### 4. Payment Processing & Statutory Compliance
- **Razorpay Integration**: Server-side order creation (`/api/donations/create-order`), cryptographic HMAC-SHA256 signature verification (`/api/donations/verify`), and asynchronous webhook processing (`/api/webhooks/razorpay`).
- **Timing-Safe Cryptography**: Constant-time signature verification prevents timing side-channel attacks on financial routes.
- **Idempotency & Accounting**: Double-counting prevention on duplicate webhooks, network retries, and browser reloads.
- **Section 80G Tax Certificates**: Automated Form 10BE-compliant tax deduction receipts with 10-digit PAN validation and NITI Aayog NGO Darpan URN verification.
- **Live Donation Ticker**: Real-time donor activity strip honoring complete anonymity preferences.

### 5. Automated Security Audit Toolkit
- **Source Code SAST**: Semgrep static rules + Next.js App Router security engine (`security/scanners/code-sast.ts`).
- **Secret & Credential Detection**: High-precision pattern matching & Git history scanner (`security/scanners/secret-scanner.ts`).
- **Dependency Auditing**: Native automated `npm audit` integration (`security/scanners/dependency-audit.ts`).
- **OWASP ASVS 5.0 Verification**: 14-chapter Application Security Verification Standard benchmark assessment (`security/scanners/asvs-assessor.ts`).
- **Reports**: Stored in `security-reports/summary.md` and structured `findings.json`.

---

## 📂 Complete Route Directory

### Public Pages
- `/` — Homepage (Hero carousel, campaign search, 12 causes, urgent appeals, featured campaigns, missions, product giving, dual journey, impact metrics, live ticker)
- `/campaigns` — Multi-filter discovery page (causes, giving types, 80G tax-exempt filter, urgent filter, sorting)
- `/campaigns/[slug]` — Dynamic campaign detail (hero, clinical story, itemized budget, verified hospital documents, updates, recent supporters, sticky donation module)
- `/causes` & `/causes/[slug]` — Cause directories and category-specific campaigns
- `/monthly-giving` & `/monthly-giving/[slug]` — Recurring monthly missions
- `/product-giving` — Physical essential needs catalog
- `/donate/[campaignId]` — Complete checkout (presets ₹101 to ₹10,000, optional platform tip selector, 80G PAN entry, Razorpay gateway, test mode simulation)
- `/start-campaign` — Fundraiser onboarding and creation wizard
- `/organizations` & `/organizations/[slug]` — Verified NGO directory with Darpan IDs, 12A, 80G, FCRA details
- `/verify-organization` — NGO accreditation application wizard
- `/how-it-works` — Dual journey guide for Donors and Fundraisers
- `/about` — Mission, ethics, governance, and dokind Foundation principles
- `/impact` — Database-verified statistics and beneficiary reach
- `/stories` & `/stories/[slug]` — Impact stories and field updates
- `/blog` & `/blog/[slug]` — Educational guides on Section 80G tax deductions and medical crowdfunding
- `/contact` — Support ticket form and direct helpline
- `/help` & `/faq` — Searchable Knowledge Base and Categorized FAQs
- `/search` — Global search across campaigns, causes, NGOs, and stories
- Legal: `/privacy-policy`, `/terms`, `/donation-policy`, `/refund-policy`, `/campaign-guidelines`, `/verification-policy`, `/accessibility`

### Donor Account Portal (`/account`)
- `/account` — Overview & quick statistics
- `/account/donations` — Complete donation history
- `/account/donations/[id]` — Printable official 80G tax receipt
- `/account/recurring` — Active monthly mandates with 1-click self-serve cancellation
- `/account/profile` — Name, verified phone, verified email, and Income Tax PAN update

### Fundraiser Portal (`/fundraiser`)
- `/fundraiser/dashboard` — Views, funding goal percentage, and donor count
- `/fundraiser/campaigns` — Manage campaigns, edit, and post updates
- `/fundraiser/payouts` — Direct hospital bank wire requests and settlement history

### Administrative Console (`/admin`)
- **Platform Overview**: Total raised, active campaigns, verified NGOs, recurring donors
- **Campaign Approval Queue**: Approve, pause, resume, or reject with reason
- **Campaign Management (`/admin/campaigns/[id]`)**: Analytics, Evidence, Media, Updates
- **NGO Verification Queue**: Cross-verify 12A/80G/Darpan credentials and grant badges
- **Financial Ledger & Refunds (`/admin/refunds`)**: Search transactions, inspect 80G PAN, and process instant refunds
- **Team Management (`/admin/team`)**: Role assignments (max 2 roles per member), audit logs, access control
- **API Keys & Integrations (`/admin/api-keys`, `/admin/integrations`)**: Manage scopes, rate-limiting, and webhook secrets
- **Theme & Appearance (`/admin/theme`)**: Visual customization and brand control
- **SEO & Social Engine (`/admin/seo`)**: Metadata, OpenGraph cards, and schema tags

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions, Route Handlers)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React icons, Canvas Confetti
- **Authentication**: Nodemailer (Gmail SMTP), Google OAuth 2.0 / OpenID Connect, MSG91 Phone OTP
- **Payment Gateway**: Razorpay Indian Gateway Adapter (UPI, Cards, NetBanking, Simulation Mode)
- **Database**:
  1. Stateful Embedded Database Store (`src/lib/db/index.ts`) for zero-dependency instant execution and local development.
  2. Full Supabase / PostgreSQL schema with Row-Level Security (RLS) policies and triggers (`supabase/schema.sql`).
- **Security**: Semgrep SAST, Gitleaks, `crypto.timingSafeEqual`, OWASP ASVS 5.0 Assessor

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials (or test in development mode with built-in fallbacks):
- `AUTH_SECRET`: Random 32+ character HMAC secret.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
- `SMTP_USER` & `SMTP_PASS`: Gmail App Password for transactional emails.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay API keys.
- `MSG91_AUTH_KEY` & `MSG91_OTP_TEMPLATE_ID`: MSG91 SMS gateway keys.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suites
Run the verification suites across all subsystems:
```bash
# Full Platform Verification (32 assertions)
npx tsx scripts/verify-platform.ts

# React Hooks AST Compliance Scan (zero hook violations)
npx tsx scripts/verify-react-hooks-compliance.ts

# Authentication System Suite (Email OTP, Google OAuth, Sessions)
npx tsx scripts/verify-auth-system.ts

# MSG91 Phone OTP Authentication Suite
npx tsx scripts/verify-msg91-phone-auth.ts

# Razorpay Cryptographic Integrity & Payment Test Suite
npm run security:test:payment

# Full Security Audit (Code SAST, Secrets, ASVS 5.0)
npm run security:check -- --code
```

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📋 Launch & Deployment Checklist

1. **Razorpay Production Credentials**:
   - Register for a Razorpay Indian Merchant Account at [dashboard.razorpay.com](https://dashboard.razorpay.com).
   - Generate live `Key ID` and `Key Secret` under **Settings > API Keys**.
   - Configure Webhook URL `https://dokind.org.in/api/webhooks/razorpay` with secret.
2. **Google Cloud Console OAuth**:
   - Add authorized redirect URI: `https://dokind.org.in/api/auth/google/callback`.
3. **Gmail SMTP / Custom SMTP**:
   - Generate a 16-character App Password under Google Account Security for high-deliverability transactional emails.
4. **Supabase Production Database**:
   - Run `supabase/schema.sql` and `supabase/migrations/20261025_payment_integrity_schema.sql` in the Supabase SQL Editor.
5. **CBDT Section 80G Reporting**:
   - Collect donor PANs digitally and file annual Form 10BD with the Income Tax Department so Form 10BE receipts pre-fill in donor AIS statements.

---

## 📄 License & Attribution

Copyright © 2026 **dokind Foundation**. All rights reserved.
Built for high-trust Indian crowdfunding and verified community philanthropy.
