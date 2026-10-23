# SevaSetu (सेवासेतु) — The Trust Bridge for Indian Crowdfunding

**SevaSetu** is a complete, database-driven crowdfunding web application built specifically for India. It combines the warm visual hierarchy of **True Hope Foundation**, the recurring mission-led discovery of **Give.do**, and the tangible essential-needs transparency of **DonateKart**.

---

## 🌟 Key Highlights & Architectural Features

### 1. Design System & Brand Identity
- **Palette**: Warm ivory background (`#FAF9F6`), Deep charcoal headings (`#202124`), Warm Vermilion primary CTA (`#E84B45` & `#BD302D`), Muted emerald success badge (`#25845B`), Warm borders (`#E8E6E1`).
- **Typography & Icons**: Inter / modern sans-serif typography, Lucide React icon library, accessible WCAG 2.2 AA contrast ratios, and keyboard focus states.
- **Indian Numbering**: Formatted throughout with Indian comma groupings (e.g. ₹1,50,000, ₹14.5 L, ₹2.5 Cr).

### 2. Triple Giving Models
1. **Urgent & Medical Emergency Campaigns**: Verified AIIMS hospital estimates, itemized budgets (ICU, chemotherapy, implants), and direct hospital disbursement options.
2. **Monthly Giving Missions (Give.do Inspired)**: Recurring monthly support for daily hospital meals, girl child scholarships, and stray animal trauma care with 1-click cancellation and zero lock-in.
3. **Product Giving (DonateKart Inspired)**: Sponsor physical items (Family Grocery Kits, Student School Kits, Heavy Polar Blankets, Modular Prosthetics) with quantity selectors, wholesale procurement disclosures, and geotagged distribution proof.

### 3. Payment Processing & Indian Compliance
- **Razorpay Integration**: Server-side order creation (`/api/donations/create-order`), cryptographic HMAC SHA-256 signature verification (`/api/donations/verify`), and asynchronous webhook processing (`/api/webhooks/razorpay`).
- **Idempotency & Accounting**: Payments cannot double-count funds or supporters even if duplicate webhooks or retries are received.
- **Refunds & Reversals**: Administrative refunds instantly recalculate campaign raised totals and reverse financial balances.
- **Section 80G Tax Certificates**: Instant Form 10BE-compliant tax deduction acknowledgment generation with 10-digit PAN validation and NITI Aayog NGO Darpan URNs.
- **Live Donation Ticker**: Verified, real-time donation activity strip respecting complete donor anonymity preferences.

---

## 📂 Complete Route Directory

### Public Pages
- `/` — Homepage (Hero carousel, campaign search, 12 causes, urgent appeals, featured campaigns, missions, product giving, dual journey, impact metrics, ticker)
- `/campaigns` — Multi-filter discovery page (causes, giving types, 80G filter, urgent filter, sorting)
- `/campaigns/[slug]` — Dynamic campaign detail (hero, clinical story, itemized budget, verified documents, updates, recent supporters, sticky donation panel)
- `/causes` & `/causes/[slug]` — Cause directories and category-specific campaigns
- `/monthly-giving` & `/monthly-giving/[slug]` — Recurring monthly missions
- `/product-giving` — Physical essential needs catalog
- `/donate/[campaignId]` — Complete checkout (presets ₹101 to ₹10,000, tip selector, PAN, Razorpay gateway, test mode simulation)
- `/start-campaign` — 7-step fundraiser onboarding wizard
- `/organizations` & `/organizations/[slug]` — Verified NGO directory with Darpan IDs, 12A, 80G, FCRA details
- `/verify-organization` — NGO accreditation application wizard
- `/how-it-works` — Dual journey guide for Donors and Fundraisers
- `/about` — Mission, ethics, governance, and advisory principles
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
- `/account/recurring` — Active monthly mandates with 1-click cancel
- `/account/profile` — Name, phone, and Income Tax PAN update

### Fundraiser Portal (`/fundraiser`)
- `/fundraiser/dashboard` — Views, funding goal percentage, and donor count
- `/fundraiser/campaigns` — Manage campaigns, edit, and post updates
- `/fundraiser/payouts` — Direct hospital bank wire requests and settlement history

### Administrative Console (`/admin`)
- Platform Overview: Total raised, active campaigns, verified NGOs, recurring donors
- Campaign Approval Queue: Approve, pause, resume, or reject with reason
- NGO Verification Queue: Cross-verify 12A/80G/Darpan credentials and grant badges
- Financial Ledger: Search transactions, inspect 80G PAN, and process instant refunds
- Settings: Payment gateway API keys, test mode simulation toggle, live ticker toggle
- Audit Trail: Immutable chronological ledger of every administrative action

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Server Actions & API Routes, Turbopack)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React icons, Canvas Confetti
- **Payment Gateway**: Razorpay Indian Gateway Adapter (UPI, Cards, NetBanking, Simulation Mode)
- **Database**: Dual Architecture:
  1. Stateful Embedded Database Store (`src/lib/db/index.ts`) for zero-dependency instant execution and local preview.
  2. Full Supabase / PostgreSQL schema with Row-Level Security (RLS) policies and triggers (`supabase/schema.sql`).

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

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
Run the 32-assertion verification test suite:
```bash
npx tsx scripts/verify-platform.ts
```

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📋 Launch & Integration Checklist

1. **Razorpay Production Credentials**:
   - Register for a Razorpay Indian Merchant Account at [dashboard.razorpay.com](https://dashboard.razorpay.com).
   - Generate live `Key ID` and `Key Secret` under **Settings > API Keys**.
   - Configure Webhook URL `https://yourdomain.com/api/webhooks/razorpay` with secret.
2. **Supabase Production Database**:
   - Create a project on [supabase.com](https://supabase.com).
   - Run `supabase/schema.sql` in the Supabase SQL Editor.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **CBDT Section 80G Reporting**:
   - Collect donor PANs digitally and file annual Form 10BD with the Income Tax Department to ensure Form 10BE certificates pre-fill in donor AIS statements.
