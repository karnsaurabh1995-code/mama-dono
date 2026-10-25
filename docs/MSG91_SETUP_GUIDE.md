# DOKIND — MSG91 MOBILE OTP INTEGRATION & DLT SETUP GUIDE

## 1. Overview & Architecture

Dokind implements a production-ready, secure, and privacy-preserving phone authentication system powered by **MSG91's official OTP API (v5)**.

### Architectural Decisions
- **Option A: Headless Server-Side OTP APIs**: Dokind connects directly to MSG91 v5 endpoints (`/api/v5/otp`, `/api/v5/otp/verify`, `/api/v5/otp/retry`) strictly from Next.js server-side route handlers.
- **Credential Protection**: The `MSG91_AUTH_KEY` is kept strictly on the backend. No third-party scripts, iframes, or vendor tokens are loaded into the browser.
- **Authoritative Identity Bridge**: Successful phone OTP verification proves ownership of a mobile number, which is authoritatively resolved in `DatabaseStore` to create a `dokind_session` session cookie.
- **RBAC Preservation**: First-time phone registrations are strictly provisioned as `donor`. Administrative privileges (Super Admin, Admin, Reviewer, Finance, Writer) are loaded from the database record and can never be escalated via phone verification.
- **Dual-Mode Authentication**: Email/password login remains available for staff and existing accounts.

---

## 2. Step-by-Step MSG91 Account Setup

### Step 1: Create an MSG91 Account
1. Visit [https://msg91.com](https://msg91.com) and sign up for a business account.
2. Complete company profile verification and two-factor authentication (2FA).

### Step 2: Obtain your MSG91 Authentication Key (`authkey`)
1. In the MSG91 Dashboard, navigate to **Settings** &rarr; **AuthKey**.
2. Click **Create New AuthKey**.
3. Name the key (e.g., `Dokind-Production-OTP`).
4. Copy the generated key.
5. Store the key in your secure deployment environment variable store as `MSG91_AUTH_KEY`.

---

## 3. Indian DLT (Distributed Ledger Technology) Registration (Mandatory for India)

Under Telecom Regulatory Authority of India (TRAI) regulations, all commercial and transactional SMS sent to Indian (+91) mobile numbers require DLT registration.

### Step 1: Register as a Principal Entity (PE)
Register on any major Indian telecom operator's DLT portal (registration on one portal syncs across all operators via blockchain):
- **Vilpower (Vodafone Idea):** [https://www.vilpower.in](https://www.vilpower.in)
- **Jio DLT:** [https://trueconnect.jio.com](https://trueconnect.jio.com)
- **Airtel DLT:** [https://www.airtel.in/business/commercial-communication](https://www.airtel.in/business/commercial-communication)
- **BSNL / Smartping:** [https://www.ucc-bsnl.co.in](https://www.ucc-bsnl.co.in)

Required documents: Company PAN, Certificate of Incorporation / Society Registration / Trust Deed, GST certificate, and Authorized Signatory Letter.

### Step 2: Register your Sender ID / Header
1. In your DLT portal, navigate to **Headers** &rarr; **Add Header**.
2. Select Category: **Transactional / Service Implicit**.
3. Choose a 6-letter Header matching your organization (e.g., `DOKIND` or `DOKNDF`).
4. Submit for telecom approval (typically 24–48 hours).

### Step 3: Register your OTP Content Template
1. In your DLT portal, go to **Content Templates** &rarr; **Add Template**.
2. Template Type: **Service Implicit** (for OTP authentication).
3. Associate with your approved Header (e.g., `DOKIND`).
4. Template Title: `Dokind Login OTP`.
5. Template Text (must use exact DLT variable format `{#var#}`):
   ```
   {#var#} is your verification code to log in to dokind. This code is valid for 10 minutes. Do not share it with anyone. - dokind Foundation
   ```
6. Submit for approval. Record your **DLT Template ID**.

---

## 4. MSG91 Dashboard Configuration

### Step 1: Link DLT to MSG91
1. In MSG91 Dashboard, go to **DLT Details**.
2. Enter your **Entity ID (PE ID)** and upload your approved Headers and DLT Template IDs.

### Step 2: Create the MSG91 OTP Template
1. In MSG91 Dashboard, navigate to the **OTP** module &rarr; **Templates**.
2. Click **Create Template**.
3. Set Template Name: `Dokind OTP`.
4. Enter template body using MSG91's variable syntax:
   ```
   ##OTP## is your verification code to log in to dokind. This code is valid for 10 minutes. Do not share it with anyone. - dokind Foundation
   ```
5. Map the approved DLT Template ID and Sender ID.
6. Save the template and copy the generated **Template ID** (e.g., `661234abcd5678ef01234567`).

---

## 5. Environment Variables Configuration

In `.env.local` (for development) and in production environment settings (Vercel, AWS, etc.):

```bash
# Enable Phone OTP feature
PHONE_OTP_ENABLED=true

# MSG91 Auth Key
MSG91_AUTH_KEY=your_msg91_auth_key_here

# MSG91 OTP Template ID (containing ##OTP##)
MSG91_OTP_TEMPLATE_ID=your_msg91_otp_template_id_here

# OTP Length (default 6 digits)
MSG91_OTP_LENGTH=6

# OTP Lifetime (default 10 minutes)
MSG91_OTP_EXPIRY_MINUTES=10

# Default country dial code without plus (91 for India)
MSG91_DEFAULT_COUNTRY_CODE=91

# Set to false in production to enforce real SMS delivery
MSG91_DEV_MODE=false
```

---

## 6. Development Simulation & Mock Testing Mode

When `PHONE_OTP_ENABLED=false` or `MSG91_DEV_MODE=auto` (and no auth key is configured):
- Dokind runs in **Development Simulation Mode**.
- Generates secure, realistic mock OTPs with countdown timers.
- Displays a yellow hint pill with the mock code and an "Auto-fill" button for rapid UI/UX testing in development.
- Zero SMS credits are consumed.
- Allows full end-to-end testing of user registration, role verification, and session persistence.

---

## 7. Security Policy & Abuse Prevention

Dokind enforces multi-layered defense around phone OTP:

| Dimension | Policy | Behavior on Violation |
| :--- | :--- | :--- |
| **Resend Cooldown** | 60 seconds | Resend button disabled with countdown timer; API returns `429 Too Many Requests`. |
| **Max Resends** | 3 resends per session | Session locked; user must restart request. |
| **Verification Attempts** | Max 5 attempts | Challenge permanently invalidated after 5 failed codes. |
| **Challenge Expiry** | 10 minutes | Expired OTP rejected with clear user alert. |
| **Per-Phone Rate Limit** | Max 5 requests per 15 min | Rejects repeated SMS triggers to the same number (`429`). |
| **Per-IP Rate Limit** | Max 15 requests per 15 min | Mitigates automated bot attacks and SMS pumping (`429`). |
| **Privilege Escalation** | Strict | First-time phone login always creates `role: 'donor'`. Existing users retain their database role. |

---

## 8. Verification & Troubleshooting

### Error: `Invalid MSG91 Authentication Key (401)`
- **Cause:** The `MSG91_AUTH_KEY` environment variable is invalid, expired, or IP-restricted.
- **Fix:** Verify key in MSG91 Dashboard &rarr; Settings &rarr; AuthKey.

### Error: `Template ID missing or invalid`
- **Cause:** `MSG91_OTP_TEMPLATE_ID` is missing or does not contain `##OTP##`.
- **Fix:** Ensure template is created in the OTP module (not the general SMS Campaign module).

### Error: `SMS not delivered to handset (India)`
- **Cause:** DLT Header or Content Template not approved or mismatch between MSG91 template and DLT portal text.
- **Fix:** Check DLT registration status in telecom portal.
