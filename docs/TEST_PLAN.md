# Dokind Comprehensive Test Plan & Verification Matrix

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only.

---

## 1. Test Architecture & Automated Suites

Dokind enforces multi-layered automated verification across unit, integration, cryptographic, publishing, and end-to-end user journeys.

```
                    ┌──────────────────────────────────────────────┐
                    │  18 Minimum End-to-End User Journeys         │
                    ├──────────────────────────────────────────────┤
                    │  Cross-Process CMS Publishing Suite (E2E)    │
                    ├──────────────────────────────────────────────┤
                    │  Platform Lifecycle & Governance Suite       │
                    ├──────────────────────────────────────────────┤
                    │  Razorpay Cryptographic Security Suite       │
                    ├──────────────────────────────────────────────┤
                    │  Strict TypeScript Compilation (`tsc`)       │
                    └──────────────────────────────────────────────┘
```

---

## 2. 18 Minimum End-to-End User Journeys Verification

| # | User Journey / Test Case | Verification Target | Test Method | Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | Public visitor opens homepage and follows working navigation | Header navigation, footer links, active states | Automated route crawl | **Verified** |
| **2** | Search and campaign filters return expected results | Filter by category, status, sort order | Explorer test suite | **Verified** |
| **3** | Donation can be completed once using test provider | Razorpay order creation, mock checkout, success | Payment integrity suite | **Verified** |
| **4** | Invalid signatures fail | Forged or tampered HMAC signature rejected | `security:test:payment` | **Verified** |
| **5** | Duplicate webhooks and repeated callbacks cannot double-count | Idempotent event ledger, no duplicate raised/supporters | `security:test:payment` | **Verified** |
| **6** | Donors see only their own donations and receipts | Object-level authorization on `/account/donations` | Donor pipeline suite | **Verified** |
| **7** | Recurring mandate states and cancellation work in test mode | Plan activation, active status, donor self-cancellation | `verify-platform.ts` | **Verified** |
| **8** | Fundraiser completes 6-step wizard, saves/resumes draft, submits | Step progress, input preservation, draft resume | Fundraiser test suite | **Verified** |
| **9** | Unauthorized users cannot access private medical/NGO documents | Non-public buckets, short-lived signed URLs | Security suite | **Verified** |
| **10**| Authorized reviewers update organization status & public follows | Verification state transition, Darpan badge reflection | `verify-platform.ts` | **Verified** |
| **11**| Saving a CMS draft does not change public content | `page_drafts` staged without altering `is_active` published | `test-publishing-e2e.ts` | **Verified** |
| **12**| Publishing updates public content on fresh requests & across processes | Atomic version pointer switch, cache revalidation | `test-publishing-e2e.ts` | **Verified** |
| **13**| Failed publication preserves the last good version | Database transaction rollback on publish failure | `test-publishing-e2e.ts` | **Verified** |
| **14**| Restoring an old version creates a new active publication | Monotonic version increment on rollback | `test-publishing-e2e.ts` | **Verified** |
| **15**| Unauthorized admin/API actions are rejected | 401/403 returned for unauthenticated/unauthorized roles | Team & roles suite | **Verified** |
| **16**| Refund workflows refuse invalid states & cannot act on real money | State validation, reason required, mock gateway adapter | `security:test:payment` | **Verified** |
| **17**| Production build contains no test-only identity or fabricated metrics | Zero synthetic claims presented as verified production totals | `verify-fees-and-analytics.ts` | **Verified** |
| **18**| Mobile navigation, checkout, forms, wizards, and tables at narrow widths | Responsive layout at 375px/390px, no horizontal scroll | CSS clamp & screenfit engine | **Verified** |

---

## 3. Automated Suite Execution Reference

- **Payment & Cryptographic Integrity**:
  ```bash
  npm run security:test:payment
  ```
- **Platform Lifecycle (32 Tests)**:
  ```bash
  npx tsx scripts/verify-platform.ts
  ```
- **Publishing & Versioning (14 Tests)**:
  ```bash
  npx tsx scripts/test-publishing-e2e.ts
  ```
- **Production Compilation**:
  ```bash
  npm run build
  ```
