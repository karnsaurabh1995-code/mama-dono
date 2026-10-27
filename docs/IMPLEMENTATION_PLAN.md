# Dokind Master Implementation Plan

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only. Never show “Dokind V2”, “Dokind 2.0”, “V2”, “Version 2”, “rebuild project”, or development/version language anywhere in the website UI, page titles, SEO metadata, navigation, emails, receipts, dashboards, footer, or customer-facing copy.

---

## 1. Executive Summary & Objective

Dokind is a production-oriented, transparent Indian crowdfunding platform delivering:
- 103 page routes (39 public pages, 51 admin pages, 5 staff pages, 3 fundraiser pages, 5 donor account pages).
- 32 API route handlers covering authentication (passwordless email OTP, Google OAuth 2.0, MSG91 phone OTP), donation creation, Razorpay cryptographic webhook processing, CMS page publishing, real-time sync, and administrative operations.
- Dedicated Section 80G tax receipt issuance (Form 10BE compliance), Darpan NGO verification, recurring monthly giving missions, physical item/product giving catalogs, itemized hospital expense ledgers, and multi-poster campaign updates.
- Transactional CMS page builder with immutable version snapshots, single-active-version database constraints, draft previews, and zero-downtime rollback.

This implementation plan outlines the verified step-by-step roadmap to achieve total feature parity, faithful visual match against the 8 reference design anchors, rigorous security remediation, and production-grade stability.

---

## 2. Source Code & Workspace Isolation Baseline

- **Repository**: `https://github.com/karnsaurabh1995-code/mama-dono`
- **Initial Baseline Commit**: `2e53c079a7dc601d5b3d1ccbb09082c499eaa083` (branch `main`)
- **Active Workspace Directory**: `d:\mama dono\pt 3` (dedicated isolated workspace directory)
- **Implementation Branch**: `feature/dokind-faithful-recreation`
- **Isolation Guarantee**: The live/origin repository and existing deployment branches are untouched. All development and testing occurs strictly within `d:\mama dono\pt 3`.

---

## 3. Implementation Milestones

### Milestone 0: Audit, Inventory & Architectural Blueprint (Completed)
- Verify repository commit baseline (`2e53c07`).
- Perform comprehensive inventory of 103 pages and 32 API endpoints.
- Establish empirical health baseline:
  - TypeScript strict compile: `0 errors` (103 pages + 32 endpoints verified).
  - Razorpay cryptographic security test suite: `12 / 12 passed`.
  - Platform verification test suite: `32 / 32 assertions passed`.
- Identify known security findings & branding debts:
  - Permissive RLS `FOR ALL USING (true)` in `supabase/migrations/20261027_website_publishing_schema.sql`.
  - Hardcoded fallback AES encryption key in `src/lib/security/crypto-vault.ts`.
  - Unsigned session cookies & hardcoded `DEMO_USERS` fallback in `src/lib/auth/server.ts`.
  - Residual legacy "SevaSetu" strings in blog posts, email templates, and export filenames.
  - Development HUD overlay in `src/components/common/ScreenFitProvider.tsx`.
- Generate all authoritative planning and reference matrices:
  - `docs/IMPLEMENTATION_PLAN.md`
  - `docs/route-feature-acceptance-matrix.md`
  - `docs/visual-reference-matrix.md`
  - `docs/KNOWN_RISKS.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DATA_DICTIONARY.md`
  - `docs/ROLE_PERMISSION_MATRIX.md`
  - `docs/THREAT_MODEL.md`
  - `docs/LOCAL_SETUP.md`
  - `docs/TEST_PLAN.md`
  - `docs/IMPLEMENTATION_STATUS.md`

### Milestone 1: Brand Cleansing & Design System Alignment
- Systematically eliminate all legacy "SevaSetu" and versioning ("V2", "2.0") terminology across:
  - `src/lib/data/blogs.ts`
  - `src/lib/data/campaign-items.ts`
  - `src/lib/data/gateways.ts`
  - `src/lib/data/media.ts`
  - `src/app/admin/email-templates/page.tsx`
  - `src/app/admin/reports/page.tsx`
  - `src/app/admin/donations/page.tsx`
  - `src/app/admin/audit-logs/page.tsx`
  - `src/app/admin/newsletter/page.tsx`
  - `src/app/admin/pages/page.tsx`
  - `src/app/layout.tsx` (fix character encoding glitch `dokind ?"`)
- Remove development floating HUD overlay from `src/components/common/ScreenFitProvider.tsx` so public visitors and screenshots never see test tools.
- Centralize design tokens in `DESIGN_TOKENS` and enforce:
  - Warm ivory canvas `#FAF9F6`
  - Coral-red brand primary `#EF4949` / `#E84B45`
  - Deep charcoal `#202124`
  - Muted emerald `#25845B`
  - Thin warm border `#E8E6E1`
  - Official Dokind wordmark logo and favicon.

### Milestone 2: Security Hardening & Session Integrity
- **AES-256-GCM Vault**: Remove static fallback key from `src/lib/security/crypto-vault.ts`. Require `ENCRYPTION_MASTER_KEY` or `AUTH_SECRET`; throw explicit configuration error in production if missing.
- **Server Session Signing**: Replace plain JSON cookies with HMAC-signed session tokens (`id.timestamp.signature`) using high-entropy `AUTH_SECRET`. Enforce server-side revocation and session rotation.
- **Demo User Quarantine**: Remove automatic demo-user fallback in production mode (`process.env.NODE_ENV === 'production'`).
- **Supabase RLS Hardening**: Patch `page_drafts` and `page_published_versions` RLS policies to restrict modification strictly to authorized service role and authenticated admin sessions.

### Milestone 3: Public Website Shell & Editorial Polish
- Verify top narrow announcement bar with link capability.
- Ensure sticky white header with active link indicators, responsive search, Donate Now CTA, and mobile navigation drawer.
- Implement homepage 14-stage sequence:
  1. Announcement strip
  2. Main navigation
  3. Hero campaign carousel
  4. Live donation / trust ticker
  5. Cause categories & collection filters
  6. Featured campaigns
  7. Monthly Giving missions
  8. Product Giving Tangible Needs
  9. Database-calculated Impact Metrics
  10. Donor Testimonials
  11. Interactive FAQ Accordion
  12. Start a Fundraiser dual-journey CTA
  13. National Media / Press Mentions
  14. Newsletter & Dark Charcoal Footer
- Compare visual baseline against Reference Screenshot 1 (Homepage).

### Milestone 4: Campaign Discovery, Details & NGO Directory
- **Explore Campaigns (`/campaigns`)**: Faceted category filter, search query sync with URL parameters, sorting (urgent, featured, newest, goal progress), 80G tax-benefit filter, and zero-results state.
- **Campaign Detail (`/campaigns/[slug]`)**: Itemized hospital budgets, multi-poster image carousel, verified medical documents with privacy protection, campaign updates with date stamps, and sticky donation module.
- **Causes Directory (`/causes` & `/causes/[slug]`)**: 12 curated humanitarian sectors with real linked campaigns.
- **Verified NGO Directory (`/organizations` & `/organizations/[slug]`)**: Darpan IDs, 12A/80G registration badges, founded year, location, active campaigns.
- Compare against Reference Screenshots 2, 7, and 8.

### Milestone 5: Giving Models, Checkout & Fundraiser Onboarding
- **Monthly Giving (`/monthly-giving` & `/[slug]`)**: Large gradient hero, 4 curated recurring missions, mandate setup flow, cancellation controls.
- **Product Giving (`/product-giving`)**: Tangible kits catalog, server-side authoritative unit cost calculation, remaining quantity counters.
- **Donation Checkout (`/donate/[campaignId]`)**: Preset amount chips, custom amount, optional tip, 80G PAN input with statutory validation, Razorpay order creation, timing-safe HMAC verification.
- **Fundraiser Wizard (`/start-campaign`)**: 6-step wizard (Cause/Type, Campaigner Details, Story & Goal, Documents, Media, Review & Submit), draft save/resume, file upload validation.
- **Organization Verification (`/verify-organization`)**: Darpan ID, PAN, 12A/80G, financial document uploads.
- **Donor Account (`/account`)**: Personal donation history, downloadable 80G tax receipts (Form 10BE), recurring mandate management.
- Compare against Reference Screenshots 3, 4, 5, and 6.

### Milestone 6: Admin Governance Console
- **Admin Dashboard (`/admin`)**: Live work queues (campaigns awaiting approval, pending NGO verification, payment reconciliations, refunds, recurring mandates).
- **Campaign Management (`/admin/campaigns`)**: Review, approve, reject with reason, pause, resume, item needs editor, updates publisher.
- **Financial & Refund Desk (`/admin/donations`, `/admin/refunds`, `/admin/transactions`)**: Idempotent refund execution, donor privacy controls, audit logging.
- **NGO Verification Desk (`/admin/organizations`)**: Review Darpan credentials, inspect uploaded documents, issue verified badges.
- **User & Team Management (`/admin/team`, `/admin/users`)**: Enforce max-two-role constraint, role-permission matrix.

### Milestone 7: CMS Website Builder & Reliable Publishing
- Ensure `/admin/website-builder` provides add/edit/reorder/toggle of sections across Home, About, Causes, How It Works, Impact, Contact, FAQ, and Guidelines.
- Transactional publish workflow: updates `page_published_versions`, marks single active version, atomic database update, cache revalidation.
- Draft vs published isolation: draft changes do not leak to public visitors until explicitly published.
- Concurrency protection: optimistic version tokens prevent stale overwrites.

### Milestone 8: Full Route Verification & Viewport Parity
- Run automated end-to-end matrix across all 103 routes.
- Validate responsive layouts across mobile (375px), tablet (768px), laptop (1280px), desktop (1440px/1920px).
- Verify zero horizontal page overflow.

### Milestone 9: Final Quality Gate & Staging Handoff
- Execute complete test suite (TypeScript check, ESLint check, Razorpay security suite, platform verification suite, Next.js production build).
- Deliver documented runbook (`docs/LOCAL_SETUP.md`, `docs/TEST_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`).
- Ensure all public-facing titles, metadata, and copy say **Dokind** only.
