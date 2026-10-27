# Dokind Data Dictionary & Schema Specification

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only.

---

## 1. Core Domain Models

### 1.1 User & Identity (`users`)
- `id`: `UUID` / String — Primary unique user identifier.
- `email`: `String` (Unique, lowercase, normalized).
- `name`: `String` — Full legal name of user or donor.
- `phone`: `String?` — Normalized E.164 phone number (`+91XXXXXXXXXX`).
- `role`: `UserRole` — Primary role: `donor`, `fundraiser`, `organization_manager`, `head_staff`, `admin`, `super_admin`, etc.
- `secondaryRole`: `UserRole?` — Optional second role subject to the maximum-two-role constraint.
- `pan`: `String?` — 10-character alphanumeric Indian PAN for Section 80G tax receipt issuance.
- `isAnonymousDefault`: `Boolean` (default `false`) — Donor privacy preference.
- `status`: `String` — `active`, `suspended`, `pending_verification`.
- `sessionRevokedAt`: `DateTime?` — Timestamp of last global session revocation.
- `createdAt`, `updatedAt`: `DateTime` (UTC).

### 1.2 Organization (`organizations`)
- `id`: `UUID` / String — Unique organization identifier.
- `slug`: `String` (Unique, URL-safe slug).
- `name`: `String` — Legal registered non-profit / trust name.
- `tagline`: `String?` — Mission statement summary.
- `darpanId`: `String?` — NITI Aayog NGO Darpan unique identifier (e.g. `DL/2016/0104822`).
- `panNumber`: `String?` — Organization entity PAN.
- `reg12A`: `String?` — Income Tax Department Section 12A registration number.
- `reg80G`: `String?` — Income Tax Department Section 80G registration number / URN.
- `fcraRegistered`: `Boolean` (default `false`).
- `city`, `state`: `String`.
- `foundedYear`: `Integer`.
- `verificationStatus`: `String` — `pending`, `under_review`, `verified`, `rejected`, `suspended`.
- `verifiedAt`: `DateTime?`.

### 1.3 Campaign (`campaigns`)
- `id`: `UUID` / String — Primary key.
- `slug`: `String` (Unique, URL-safe).
- `title`: `String` — Headline of fundraiser.
- `shortDescription`: `String` — 2-sentence summary for card previews.
- `story`: `String` — Full editorial narrative, sanitized rich text.
- `category`: `CauseCategory` — `medical`, `education`, `food-hunger`, `disability`, `children`, `elderly`, `animals`, `disaster-relief`, etc.
- `campaignType`: `CampaignType` — `one-time`, `monthly`, `product`.
- `targetAmount`: `Integer` (Paise / INR minor units or exact integer Rupees).
- `raisedAmount`: `Integer` — Sum of all succeeded, non-refunded contributions.
- `supporterCount`: `Integer` — Total verified unique contributors.
- `organizerId`: `String` — User ID of campaign creator.
- `organizationId`: `String?` — Linked verified NGO if applicable.
- `hospitalName`: `String?` — Treating hospital for medical campaigns.
- `status`: `CampaignStatus` — `draft`, `submitted`, `active`, `paused`, `completed`, `rejected`, `archived`.
- `urgent`: `Boolean` — Urgency flag for emergency placement.
- `featured`: `Boolean` — Admin curation pick for homepage.
- `is80GEligible`: `Boolean` — Enables Form 10BE tax receipting.
- `posters`: `Array<PosterItem>` — Multi-poster campaign artwork with captions.
- `budgetItems`: `Array<BudgetItem>` — Itemized hospital and equipment cost breakdown.

### 1.4 Donation (`donations`)
- `id`: `UUID` / String — Unique donation reference.
- `campaignId`: `String` — Foreign key to campaign.
- `userId`: `String?` — Linked donor user ID if authenticated.
- `donorName`: `String` — Donor full name.
- `donorEmail`: `String` — Receipt delivery email address.
- `donorPhone`: `String?` — Mobile contact.
- `donorPan`: `String?` — Indian PAN for Form 10BE compliance.
- `amount`: `Integer` — Campaign contribution amount in INR.
- `tipAmount`: `Integer` (default `0`) — Voluntary platform contribution.
- `totalAmount`: `Integer` — `amount + tipAmount`.
- `currency`: `String` (default `INR`).
- `isAnonymous`: `Boolean` — When `true`, name is redacted in public tickers.
- `status`: `String` — `pending`, `succeeded`, `failed`, `refunded`.
- `razorpayOrderId`: `String?` (Unique index).
- `razorpayPaymentId`: `String?`.
- `receiptNumber`: `String?` — Sequential Form 10BE tax receipt ID.
- `refundReason`: `String?`.
- `refundedAt`: `DateTime?`.
- `createdAt`: `DateTime` (UTC).

### 1.5 Processed Webhook Event (`processed_webhook_events`)
- `id`: `UUID` — Primary key.
- `eventId`: `String` (Unique constraint) — Razorpay event identifier (e.g. `event_J12345678`).
- `eventType`: `String` — `payment.captured`, `order.paid`, `refund.processed`.
- `processedAt`: `DateTime` (default `NOW()`).

### 1.6 CMS Page Draft & Published Version (`page_drafts`, `page_published_versions`)
- `page_slug`: `String` — Page identifier (`home`, `about`, `causes`, `how-it-works`, `impact`, `contact`, etc.).
- `version_number`: `Integer` — Monotonic version counter.
- `sections`: `JSONB` — Structured array of `PageSection` blocks.
- `is_active`: `Boolean` — Single active version flag per page.
- `published_at`, `published_by`: Audit metadata.
