# Dokind Visual Reference Matrix

> **DESIGN AUTHORITY:** The eight reference views serve as the authoritative visual specification for Dokind.
> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only. No version labels or dev badges.
> **SCREENSHOT HYGIENE:** Floating developer tools (such as red "1 Issue" indicators or screen size overlays) are excluded from the public Dokind interface.

---

## 1. Global Visual Tokens & Foundations

- **Background Canvas**: Warm Ivory (`#FAF9F6`)
- **Card Surfaces**: Pure White (`#FFFFFF`) with thin hairline border (`#E8E6E1`)
- **Brand Primary Accent**: Coral-Red (`#EF4949` / `#E84B45`), hover (`#D93838`)
- **Verification & Tax Exemption**: Muted Emerald (`#25845B`), subtle background (`#EDF7F2`)
- **Primary Typography**: Deep Charcoal (`#202124`)
- **Secondary Typography**: Slate Charcoal (`#555B63`), Muted (`#8A909A`)
- **Corner Radii**: Buttons (`0.75rem` / `12px`), Cards (`1.25rem` / `20px`), Badges (`9999px` pill)
- **Container Maximum Width**: `1280px` (`max-w-7xl`), expanded on large displays (`max-w-[1560px]`)

---

## 2. Eight Core Reference Views Matrix

### View 1: Homepage (`/`)
- **Primary Reference**: Reference Screenshot 1 (Homepage)
- **Viewport Dimension Baseline**: Desktop (`1440x900` / `1280x800`), Tablet (`820x1180`), Mobile (`390x844`)
- **Header & Hero Height**:
  - Top announcement strip: `32px` to `36px` (`#EF4949` urgent or `#202124` neutral)
  - Navigation bar: `72px` (`h-18`), white with `#E8E6E1` border
  - Hero carousel: `480px` to `540px` desktop height, full width container with 16:9 / 16:10 poster and left editorial overlay
- **Main Container Width & Margins**: `max-w-7xl` (`1280px`), horizontal padding `16px` (mobile), `24px` (tablet), `32px` (desktop)
- **Section Order & Vertical Spacing (`space-y-16` / `space-y-20` on desktop, `space-y-10` on mobile)**:
  1. Announcement strip
  2. Sticky white main navigation with Dokind logo
  3. Hero campaign carousel
  4. Live contribution and trust ticker (horizontal marquee)
  5. Cause collection category carousel (12 sectors)
  6. Featured campaign grid (3 columns desktop, 2 tablet, 1 mobile)
  7. Monthly Giving missions spotlight (3 cards with blue gradient accent)
  8. Product Giving tangible items spotlight
  9. Database-verified impact statistics banner
  10. Donor testimonials carousel
  11. Interactive FAQ accordion
  12. Start a Fundraiser dual-journey split CTA
  13. National media mentions & recognition
  14. Newsletter subscription card
  15. Dark charcoal footer (`#1A1B1E`)
- **Card Design**: Rounded `20px`, hairline `#E8E6E1` border, 16:10 image ratio, bold titles, progress bar with raised vs goal, two action buttons (Share, Donate).
- **Remaining Visual Uncertainties**: None. Fully mapped to component suite in `src/components/home/`.

---

### View 2: Campaign Discovery / Listing (`/campaigns`)
- **Primary Reference**: Reference Screenshot 2 (Campaigns Explorer)
- **Viewport Dimension Baseline**: `1440x900`, `1280x800`, `390x844`
- **Header & Filter Bar**:
  - Breadcrumbs: `Home > Explore Campaigns`
  - Search input with inline search icon and clear button
  - Horizontal scrollable cause chips (`All`, `Medical`, `Education`, `Hunger`, `Disability`, etc.)
  - Sort dropdown: `Featured`, `Most Urgent`, `Newest`, `Most Funded`
  - Giving model toggles: `One-Time`, `Monthly`, `Product Giving`
  - Tax-deductible toggle: `80G Certified Only`
- **Grid Structure**:
  - Desktop: 3 columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8`)
  - Tablet: 2 columns
  - Mobile: 1 column
- **Empty State**: Friendly illustration, "No campaigns found matching your criteria", Reset Filters button.
- **Card Attributes**: 80G tax exemption badge top-left, urgent countdown top-right, verified organizer stamp, raised amount formatted in INR, supporter count.

---

### View 3: Monthly Giving Missions (`/monthly-giving`)
- **Primary Reference**: Reference Screenshot 3 (Monthly Giving)
- **Hero Treatment**:
  - Deep blue-gradient backdrop (`from-blue-900 via-indigo-950 to-neutral-900`)
  - White bold headline: "Transform Lives Month After Month"
  - Subtitle on predictable long-term funding for cancer patients, elder care, and daily meals
  - Trust seal: "100% Direct Program Execution | Tax Deductible (80G)"
- **Mission Cards**:
  - Encased in warm ivory card with distinct blue mission badge
  - Mission photo with aspect ratio `16:10`
  - Impact statement: e.g. "Feeds 15 impoverished caregivers every month"
  - Default monthly gift chip (₹501, ₹751, ₹1001)
  - "Join Mission" coral-red primary button
- **Three-Panel Explanatory Section**:
  - Panel 1: Predictable sustained aid
  - Panel 2: Verified monthly field impact reports
  - Panel 3: Complete donor control (pause or cancel anytime in 1 click)

---

### View 4: How It Works (`/how-it-works`)
- **Primary Reference**: Reference Screenshot 4 (How It Works)
- **Layout Architecture**:
  - Centered hero with "Transparent Giving Architecture" pill badge
  - Dual-card split layout:
    - **Card A (Left / Donor Journey)**: 4 numbered steps (Discover verified drives, Contribute via secure Razorpay, Receive instant 80G receipt, Track direct hospital utilization).
    - **Card B (Right / Fundraiser Journey)**: 4 numbered steps (Submit medical records, Clinical desk verification, Go live and mobilize community, Direct hospital disbursement).
- **Visual Rhythm**: Numbered circular badges (`#EF4949` for donor, `#25845B` for fundraiser), clear step dividers, and bottom CTA buttons.

---

### View 5: Impact Metrics (`/impact`)
- **Primary Reference**: Reference Screenshot 5 (Verified Impact Ledger)
- **Top Metrics Grid**:
  - 4 massive metric cards on clean white surface:
    1. Total Aid Disbursed (`₹2.4+ Cr`)
    2. Verified Donors (`14,200+`)
    3. Grassroots NGOs Audited (`48 Partner Trusts`)
    4. Direct Beneficiaries Reached (`38,500+`)
- **Cause Allocation Bars**: Visual breakdown of funds disbursed across Medical, Child Education, Hunger Relief, and Disaster Response.
- **Forensic Transparency Commitment**: Explanation of escrow bank routing, hospital invoice matching, and Section 80G Form 10BE filing.

---

### View 6: Start a Fundraiser Multi-Step Form (`/start-campaign`)
- **Primary Reference**: Reference Screenshot 6 (Start Campaign Wizard)
- **Step Indicator**:
  - 6 clearly labeled horizontal steps:
    1. Cause & Type
    2. Campaigner Details
    3. Story & Target Goal
    4. Documents & Estimates
    5. Media & Photos
    6. Review & Submit
- **Form Surface**: Single centered card (`max-w-3xl mx-auto`), white surface, `#E8E6E1` border, `rounded-3xl`, `p-6 sm:p-10`.
- **Navigation Controls**: Left "Back" outline button, Right "Continue" coral-red primary button, top "Save Draft" secondary trigger.
- **Document Uploader**: Drag-and-drop zone with accepted formats (`.pdf`, `.jpg`, `.png`, max 10MB), privacy guarantee notice.

---

### View 7: Organization Verification Application (`/verify-organization`)
- **Primary Reference**: Reference Screenshot 7 (NGO Verification Form)
- **Form Fields**:
  - Registered Trust/Society Legal Name
  - Mission Tagline & Year of Establishment
  - NITI Aayog NGO Darpan Unique ID
  - Entity Permanent Account Number (PAN)
  - Section 12A Registration Number & Date
  - Section 80G Approval Number (Form 10AC/10BE)
  - FCRA Registration Details (if accepting overseas contributions)
  - Registered Office Address, City, State, PIN
  - Financial Audit & Annual Report document upload
- **Compliance Callout**: Explains statutory verification requirements under Indian Ministry of Finance rules.

---

### View 8: Verified NGO Directory (`/organizations`)
- **Primary Reference**: Reference Screenshot 8 (NGO Directory)
- **Directory Structure**:
  - Top search input and state/city filter
  - NGO cards with verified green checkmark badge
  - Legal registration metadata: Darpan ID, 80G Certified, Established Year
  - Total funds mobilized and active campaign count
  - "View Profile & Campaigns" link
- **Profile Detail View (`/organizations/[slug]`)**: Audited partner history, leadership team, active drives, and compliance certificate previews.
