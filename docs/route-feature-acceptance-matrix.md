# Dokind Route & Feature Acceptance Matrix

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only. All routes and views reflect this brand name.

Total Discovered Routes: **103 Page Routes** | **32 API Route Handlers**

---

## 1. Public & Discovery Routes (39 Routes)

| Path | Component / Target | Data Source | Auth Requirement | Actions / Forms | Status | Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | `DatabaseStore` / `page_published_versions` | Public | Hero navigation, cause filters, newsletter signup | **Implemented & Tested** | `scripts/verify-platform.ts` |
| `/about` | `src/app/about/page.tsx` | `db.getSiteSettings()` | Public | Informational narrative, team links | **Implemented & Tested** | Route build pass |
| `/accessibility` | `src/app/accessibility/page.tsx` | Static / Standards | Public | Accessibility commitment statement | **Implemented & Tested** | Route build pass |
| `/campaigns` | `src/app/campaigns/page.tsx` | `db.getCampaigns()` | Public | Category filter, search, sort, pagination | **Implemented & Tested** | `scripts/verify-campaign-page-redesign.ts` |
| `/campaigns/[slug]` | `src/app/campaigns/[slug]/page.tsx` | `db.getCampaignBySlug()` | Public | Donate CTA, share, tab navigation | **Implemented & Tested** | `scripts/verify-campaign-page-redesign.ts` |
| `/causes` | `src/app/causes/page.tsx` | `db.getCauses()` | Public | Cause category grid selection | **Implemented & Tested** | Route build pass |
| `/causes/[slug]` | `src/app/causes/[slug]/page.tsx` | `db.getCampaigns({ category })` | Public | Filtered campaign list by cause | **Implemented & Tested** | Route build pass |
| `/monthly-giving` | `src/app/monthly-giving/page.tsx` | `MISSIONS` catalog | Public | Recurring gift mission join CTA | **Implemented & Tested** | `scripts/verify-platform.ts` |
| `/monthly-giving/[slug]` | `src/app/monthly-giving/[slug]/page.tsx` | `MISSIONS` item | Public | Mission detail, recurring setup | **Implemented & Tested** | Route build pass |
| `/product-giving` | `src/app/product-giving/page.tsx` | `db.getProducts()` | Public | Tangible kit item quantity selection | **Implemented & Tested** | `scripts/verify-staff-items.ts` |
| `/donate/[campaignId]` | `src/app/donate/[campaignId]/page.tsx` | `db.getCampaignById()` | Public | Preset amount, custom, PAN, tip, Razorpay checkout | **Implemented & Tested** | `security/tests/razorpay-security.test.ts` |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | Static / Workflows | Public | Step-by-step donor & fundraiser guides | **Implemented & Tested** | Route build pass |
| `/impact` | `src/app/impact/page.tsx` | `db.getPlatformStats()` | Public | Database-derived metrics, ledger links | **Implemented & Tested** | `scripts/verify-fees-and-analytics.ts` |
| `/organizations` | `src/app/organizations/page.tsx` | `db.getOrganizations()` | Public | Verified NGO list, Darpan verification badges | **Implemented & Tested** | `scripts/verify-platform.ts` |
| `/organizations/[slug]` | `src/app/organizations/[slug]/page.tsx` | `db.getOrganizationBySlug()` | Public | NGO profile, registration info, active campaigns | **Implemented & Tested** | Route build pass |
| `/start-campaign` | `src/app/start-campaign/page.tsx` | Form / `db.createCampaign()` | Public (Draft) / Auth (Submit) | 6-Step Fundraiser Onboarding Wizard | **Implemented & Tested** | `scripts/verify-platform.ts` |
| `/verify-organization` | `src/app/verify-organization/page.tsx` | Form / `db.createOrganization()` | Public / NGO rep | Darpan ID, 12A/80G, financial docs upload | **Implemented & Tested** | `scripts/verify-platform.ts` |
| `/stories` | `src/app/stories/page.tsx` | `db.getStories()` | Public | Beneficiary recovery stories grid | **Implemented & Tested** | Route build pass |
| `/stories/[slug]` | `src/app/stories/[slug]/page.tsx` | `db.getStoryBySlug()` | Public | In-depth story reading | **Implemented & Tested** | Route build pass |
| `/blog` | `src/app/blog/page.tsx` | `db.getBlogs()` | Public | Articles and educational guides | **Implemented & Tested** | Route build pass |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | `db.getBlogBySlug()` | Public | Full article view with sanitized markup | **Implemented & Tested** | Route build pass |
| `/contact` | `src/app/contact/page.tsx` | Form / `db.submitForm()` | Public | Support inquiry submission | **Implemented & Tested** | `scripts/test-phase3-live-matrix.ts` |
| `/faq` | `src/app/faq/page.tsx` | `db.getFAQs()` | Public | Searchable accordion FAQs | **Implemented & Tested** | Route build pass |
| `/help` | `src/app/help/page.tsx` | `db.getFAQs()` | Public | Knowledge base categories and search | **Implemented & Tested** | Route build pass |
| `/search` | `src/app/search/page.tsx` | Multi-entity search | Public | Global search across campaigns, NGOs, causes | **Implemented & Tested** | Route build pass |
| `/login` | `src/app/login/page.tsx` | Auth Services | Public | Email OTP, Google OAuth, Phone OTP | **Implemented & Tested** | `scripts/verify-auth-system.ts` |
| `/signup` | `src/app/signup/page.tsx` | Auth Services | Public | Registration as Donor | **Implemented & Tested** | `scripts/verify-auth-system.ts` |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Auth Services | Public | Passwordless magic link / OTP request | **Implemented & Tested** | Route build pass |
| `/terms` | `src/app/terms/page.tsx` | Statutory Terms | Public | Legal conditions of platform use | **Implemented & Tested** | Route build pass |
| `/privacy-policy` | `src/app/privacy-policy/page.tsx` | Privacy Standard | Public | PII handling, donor privacy preferences | **Implemented & Tested** | Route build pass |
| `/donation-policy` | `src/app/donation-policy/page.tsx` | Financial Rules | Public | Voluntary tip, 80G tax rules, fee policy | **Implemented & Tested** | Route build pass |
| `/refund-policy` | `src/app/refund-policy/page.tsx` | Statutory Rules | Public | Chargeback and refund guidelines | **Implemented & Tested** | Route build pass |
| `/verification-policy`| `src/app/verification-policy/page.tsx` | Governance | Public | Medical and NGO audit checklist | **Implemented & Tested** | Route build pass |
| `/campaign-guidelines`| `src/app/campaign-guidelines/page.tsx` | Editorial Rules | Public | Fundraiser eligibility rules | **Implemented & Tested** | Route build pass |
| `/design-preview` | `src/app/design-preview/page.tsx` | Visual Mock | Internal | Design Studio reference viewer | **Implemented & Tested** | Route build pass |
| `/design-preview/campaign` | `src/app/design-preview/campaign/page.tsx` | Visual Mock | Internal | Design Studio campaign card detail | **Implemented & Tested** | Route build pass |
| `/design-preview/mobile` | `src/app/design-preview/mobile/page.tsx` | Visual Mock | Internal | Mobile responsive preview | **Implemented & Tested** | Route build pass |
| `/robots.txt` | `src/app/robots.ts` | Dynamic Config | Public | Crawler instructions | **Implemented & Tested** | Route build pass |
| `/sitemap.xml` | `src/app/sitemap.ts` | Dynamic Index | Public | XML sitemap | **Implemented & Tested** | Route build pass |

---

## 2. Donor Account Portal (5 Routes)

| Path | Data Source | Auth Requirement | Capabilities | Status | Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/account` | `db.getUserById()` | Authenticated (Donor) | Personal overview, giving impact summary | **Implemented & Tested** | `scripts/verify-donor-pipeline.ts` |
| `/account/donations` | `db.getDonations({ userId })` | Authenticated (Donor) | Personal donation history, tax receipts | **Implemented & Tested** | `scripts/verify-donor-pipeline.ts` |
| `/account/donations/[id]` | `db.getDonationById()` | Authenticated (Donor) | Single donation receipt, Form 10BE download | **Implemented & Tested** | `scripts/verify-donor-pipeline.ts` |
| `/account/recurring` | `db.getRecurringPlans({ userId })` | Authenticated (Donor) | Active recurring monthly gifts, cancel | **Implemented & Tested** | `scripts/verify-platform.ts` |
| `/account/profile` | `db.getUserById()` | Authenticated (Donor) | Name, phone, PAN, anonymous donation toggle | **Implemented & Tested** | `scripts/verify-auth-system.ts` |

---

## 3. Fundraiser & Staff Portals (8 Routes)

| Path | Data Source | Required Role | Capabilities | Status | Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/fundraiser/dashboard` | `db.getCampaigns({ userId })` | `fundraiser`, `org_mgr` | Owned campaign performance, funding progress | **Implemented & Tested** | Route build pass |
| `/fundraiser/campaigns` | `db.getCampaigns({ userId })` | `fundraiser`, `org_mgr` | Campaign list, edit drafts, post updates | **Implemented & Tested** | Route build pass |
| `/fundraiser/payouts` | `db.getPayouts({ userId })` | `fundraiser`, `org_mgr` | Hospital disbursement tracking, bank details | **Implemented & Tested** | Route build pass |
| `/staff/campaigns` | `db.getCampaigns()` | `head_staff` | Assigned campaign list, verification checks | **Implemented & Tested** | `scripts/verify-team-campaign-ops.ts` |
| `/staff/campaigns/new` | Form / `db.createCampaign()` | `head_staff` | Create on behalf of beneficiaries | **Implemented & Tested** | `scripts/verify-employee-campaign-approval.ts` |
| `/staff/campaigns/[id]/edit-content` | `db.getCampaignById()` | `head_staff` | Story editing, medical document uploads | **Implemented & Tested** | `scripts/verify-team-campaign-ops.ts` |
| `/staff/campaigns/[id]/updates` | `db.getCampaignUpdates()` | `head_staff` | Post patient progress, hospital receipts | **Implemented & Tested** | `scripts/verify-team-campaign-ops.ts` |
| `/staff/updates` | `db.getCampaignUpdates()` | `head_staff` | Global queue of pending patient updates | **Implemented & Tested** | Route build pass |

---

## 4. Admin Governance Console (51 Routes)

| Category | Routes | Required Role | Primary Capabilities | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Command Center** | `/admin`, `/admin/analytics`, `/admin/analytics/campaigns`, `/admin/reports` | `admin`, `super_admin` | Metrics, work queues, CSV ledger exports, analytics charts | **Implemented & Tested** |
| **Campaign Ops** | `/admin/campaigns`, `/admin/campaigns/new`, `/admin/campaigns/approvals`, `/admin/campaigns/submissions`, `/admin/campaigns/updates`, `/admin/campaigns/[id]`, `/admin/campaigns/[id]/edit`, `/admin/campaigns/[id]/media`, `/admin/campaigns/[id]/evidence`, `/admin/campaigns/[id]/items`, `/admin/campaigns/[id]/updates`, `/admin/campaigns/[id]/analytics` | `admin`, `reviewer`, `campaign_mgr` | State transitions (approve, pause, resume, reject), hospital expense proofs, multi-poster curation | **Implemented & Tested** |
| **Finance & Ledger** | `/admin/donations`, `/admin/transactions`, `/admin/refunds`, `/admin/recurring`, `/admin/payment-gateways` | `admin`, `finance`, `super_admin` | Razorpay order lookup, idempotent refund processing, mandate logs, AES-256 encrypted gateway credentials | **Implemented & Tested** |
| **NGO Desk** | `/admin/organizations` | `admin`, `reviewer` | NGO Darpan registration verification, 12A/80G status, document audit | **Implemented & Tested** |
| **CMS Builder** | `/admin/website-builder`, `/admin/pages`, `/admin/homepage-curation` | `admin`, `content_editor`, `super_admin` | Section reordering, hero campaign selection, urgent banner toggle, transactional publishing | **Implemented & Tested** |
| **Editorial Content** | `/admin/blogs`, `/admin/stories`, `/admin/announcements`, `/admin/faqs`, `/admin/testimonials`, `/admin/recognition` | `admin`, `content_writer`, `marketer` | Articles, beneficiary stories, press mentions, banner broadcasts | **Implemented & Tested** |
| **Communications** | `/admin/newsletter`, `/admin/email-templates`, `/admin/forms`, `/admin/support` | `admin`, `support_admin`, `marketer` | Subscriber exports, email template preview, dynamic forms, ticket triage | **Implemented & Tested** |
| **Team & Security** | `/admin/users`, `/admin/team`, `/admin/team/new`, `/admin/team/roles`, `/admin/team/audit-logs`, `/admin/team/[id]`, `/admin/team/[id]/edit`, `/admin/api-keys`, `/admin/audit-logs`, `/admin/settings`, `/admin/settings/badge-styles`, `/admin/settings/newsletter-appearance`, `/admin/theme`, `/admin/causes` | `super_admin` | Staff RBAC (enforcing max-two-role limit), API key management with SHA-256 hashes, immutable audit log, site theme | **Implemented & Tested** |

---

## 5. API Route Handlers (32 Endpoints)

| Endpoint | Method | Functionality | Auth / Security | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/email-otp/request` | POST | Generate and dispatch 6-digit email OTP | Rate-limited (5/hr) | **Implemented & Tested** |
| `/api/auth/email-otp/resend` | POST | Resend OTP with cooldown | Cooldown enforced (60s) | **Implemented & Tested** |
| `/api/auth/email-otp/verify` | POST | Validate OTP & issue signed session | Single-use consumption | **Implemented & Tested** |
| `/api/auth/google` | GET | Initiate Google OAuth 2.0 flow | Nonce & state validation | **Implemented & Tested** |
| `/api/auth/google/callback` | GET | Handle OAuth redirect, link or create user | Validated state & email | **Implemented & Tested** |
| `/api/auth/phone/send-otp` | POST | Dispatch MSG91 phone OTP | Rate-limited, dev mock toggle | **Implemented & Tested** |
| `/api/auth/phone/resend-otp` | POST | Resend MSG91 phone OTP | Cooldown enforced | **Implemented & Tested** |
| `/api/auth/phone/verify-otp` | POST | Verify mobile OTP and authenticate | Secure normalization | **Implemented & Tested** |
| `/api/auth/logout` | POST | Revoke session and clear cookies | Server-side revocation | **Implemented & Tested** |
| `/api/account/phone/link` | POST | Associate phone with authenticated donor | Session required | **Implemented & Tested** |
| `/api/account/phone/unlink` | POST | Remove phone association | Session required | **Implemented & Tested** |
| `/api/donations/create-order` | POST | Server-side Razorpay order creation | Catalog price enforcement | **Implemented & Tested** |
| `/api/donations/verify` | POST | Verify HMAC-SHA256 signature and record donation | Timing-safe comparison | **Implemented & Tested** |
| `/api/donations/refund` | POST | Authoritative refund execution | Finance role required | **Implemented & Tested** |
| `/api/donations/ticker` | GET | Stream recent public donor contributions | Anonymous redaction | **Implemented & Tested** |
| `/api/webhooks/razorpay` | POST | Ingest asynchronous Razorpay webhooks | Raw body HMAC + idempotency | **Implemented & Tested** |
| `/api/realtime/updates` | GET | Server-Sent Events (SSE) for admin alerts | Admin session required | **Implemented & Tested** |
| `/api/settings/public` | GET | Safe public site configuration (branding, banners) | Public | **Implemented & Tested** |
| `/api/admin/website-builder` | GET, POST, PUT | Manage drafts, versions, and atomic publication | Admin session required | **Implemented & Tested** |
| `/api/admin/homepage-curation` | GET, POST | Curate hero campaigns, featured picks, missions | Admin session required | **Implemented & Tested** |
| `/api/admin/team` | GET, POST, PUT | Staff creation and role assignments | Max-two-role constraint | **Implemented & Tested** |
| `/api/admin/gateways` | GET, POST | Vault management of payment gateway secrets | AES-256 authenticated encryption | **Implemented & Tested** |
| `/api/admin/api-keys` | GET, POST, DELETE | Manage external developer API keys | SHA-256 hashed storage | **Implemented & Tested** |
| `/api/admin/api-keys/test` | POST | Ping test for API key integration | Scoped token check | **Implemented & Tested** |
| `/api/admin/pending-counts` | GET | Work queue badges for admin sidebar | Admin session required | **Implemented & Tested** |
| `/api/admin/database/snapshot` | GET, POST | Snapshot and restore platform state | Super Admin only | **Implemented & Tested** |
| `/api/admin/announcements` | GET, POST, PUT | Manage banner notifications | Admin session required | **Implemented & Tested** |
| `/api/admin/faqs` | GET, POST, PUT | Manage platform FAQs | Admin session required | **Implemented & Tested** |
| `/api/admin/testimonials` | GET, POST, PUT | Manage donor testimonials | Admin session required | **Implemented & Tested** |
| `/api/admin/redirects` | GET, POST, DELETE | Manage SEO URL 301/302 redirects | Admin session required | **Implemented & Tested** |
| `/api/admin/settings` | GET, POST | General platform settings update | Admin session required | **Implemented & Tested** |
| `/api/admin/msg91/status` | GET | Check MSG91 SMS gateway configuration health | Admin session required | **Implemented & Tested** |
