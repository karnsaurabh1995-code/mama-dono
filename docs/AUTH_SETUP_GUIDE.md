# DOKIND — PRODUCTION AUTHENTICATION INTEGRATION GUIDE
## Google OAuth 2.0 + Gmail Passwordless Email OTP + Centralized Login Modal

---

## 1. Overview & Architecture

Dokind features a unified, dual-method authentication system with a centralized, accessible modal shared across the entire application:

```text
                               +----------------------------+
                               |     dokind Login Modal     |
                               +----------------------------+
                                             |
                     +-----------------------+-----------------------+
                     |                                               |
                     v                                               v
        [ Continue with Email ]                             [ Continue with Google ]
                     |                                               |
         User inputs email address                           Redirect to Google OAuth 2.0
                     |                                               |
       Server generates 6-digit OTP                         User selects Google account
        & HMAC-SHA256 digest material                                |
                     |                                     Google redirects with Auth Code
       HTML email dispatched via Gmail                               |
           (Nodemailer SMTP :465)                         Server exchanges code for tokens
                     |                                     & verifies email identity
          User submits 6-digit code                                  |
                     |                                               |
        Timing-safe digest verification                              |
                     |                                               |
                     +-----------------------+-----------------------+
                                             |
                                             v
                           Authoritative Database Match / Provision
                                 (New users = role: 'donor')
                                             |
                                             v
                         Set Secure HTTP-Only 'dokind_session' Cookie
                                             |
                                             v
                               Close Modal & Update Header UI
```

---

## 2. Google OAuth 2.0 Setup (Google Cloud Console)

### Step 1: Create OAuth Credentials
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your existing GCP project or create a new project named `dokind-production`.
3. In the sidebar, go to **APIs & Services** $\to$ **OAuth consent screen**:
   - User Type: **External**.
   - App name: `dokind`.
   - User support email: Select your verified email.
   - Developer contact email: Enter your technical administrator email.
   - Scopes: Add `openid`, `https://www.googleapis.com/auth/userinfo.email`, and `https://www.googleapis.com/auth/userinfo.profile`.
4. Go to **APIs & Services** $\to$ **Credentials**:
   - Click **+ CREATE CREDENTIALS** $\to$ **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `dokind Web Client`.

### Step 2: Configure Authorized URIs
Add the exact URI configurations:

#### Authorized JavaScript origins:
- Local Development: `http://localhost:3000`
- Production: `https://dokind.org.in`

#### Authorized redirect URIs:
- Local Development: `http://localhost:3000/api/auth/google/callback`
- Production: `https://dokind.org.in/api/auth/google/callback`

### Step 3: Copy Credentials to `.env.local`
```dotenv
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
```

---

## 3. Gmail SMTP Setup (App Password)

Google requires an **App Password** for direct SMTP authentication (`smtp.gmail.com:465`).

### Step 1: Generate App Password
1. Sign into your sender Google Account (e.g. `auth@dokind.org.in` or Gmail address).
2. Go to [Google Account Security](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is enabled on the account.
4. Search for **App passwords** or visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
5. App name: Enter `Dokind Crowdfunding Platform`.
6. Click **Create** and copy the 16-character generated password (e.g. `abcd efgh ijkl mnop`).

### Step 2: Add SMTP Settings to `.env.local`
```dotenv
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your_sender_account@gmail.com
EMAIL_SERVER_PASSWORD=abcdefghijklmnop
EMAIL_FROM="dokind Foundation" <your_sender_account@gmail.com>
```

> [!NOTE]
> In local development, if SMTP credentials are left as placeholders, Dokind automatically runs in **Dev Mock Simulation Mode**:
> It logs the generated 6-digit OTP code to the server console:
> `[DOKIND EMAIL OTP MOCK] Sent verification code to user@example.com: 123456`
> and surfaces a one-click Auto-fill chip in the development UI.

---

## 4. Key Security Controls & Anti-Abuse Defenses

1. **Cryptographic 6-Digit OTP**:
   Generated server-side with Node.js `crypto.randomInt(100000, 1000000)` guaranteeing 6 digits with leading zeroes.
2. **Keyed HMAC-SHA256 Storage**:
   Codes are never stored in plaintext. Verification uses `crypto.timingSafeEqual` to prevent timing attacks.
3. **Attempt & Lockout Limits**:
   Maximum 5 attempts per challenge. Exceeding 5 attempts immediately purges the challenge and locks out the session.
4. **Resend Cooldown**:
   Strict 60-second cooldown timer between resend requests.
5. **Multi-Tier Rate Limiting**:
   - Max 5 OTP requests per 15 minutes per email address.
   - Max 20 OTP requests per hour per client IP address.
6. **Zero Privilege Escalation**:
   New users authenticated via email OTP or Google OAuth are strictly assigned `role: 'donor'`. Existing staff (`super_admin`, `admin`, `marketer`, etc.) retain their authoritative permissions.
7. **No Automatic Modal Open**:
   The login modal is initialized to `isOpen: false` and opens exclusively upon explicit user click of a Login / Sign In button.

---

## 5. Verification Checklist

| Scenario | Expected Outcome | Status |
| :--- | :--- | :--- |
| **Page Navigation & Refresh** | No login modal appears automatically on home, causes, campaigns, or refresh | ✅ Verified |
| **Header Login Click** | Shared modal opens with Email form + OR divider + Google button | ✅ Verified |
| **Email OTP Request** | 6-digit code generated, HMAC digest stored, email dispatched | ✅ Verified |
| **Incorrect OTP Code** | Remaining attempt counter decreased; error displayed near inputs | ✅ Verified |
| **5 Incorrect Attempts** | Challenge purged and locked out; requires requesting a new code | ✅ Verified |
| **Valid OTP Code** | Session cookie issued; modal closed; Header reflects authenticated user | ✅ Verified |
| **Google Sign-In Click** | Redirects to Google consent screen; returns with code and establishes session | ✅ Verified |
| **Sign Out** | Clears session cookie; restores public Log In button | ✅ Verified |
