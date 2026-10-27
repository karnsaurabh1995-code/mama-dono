# Dokind Threat Model & Security Posture

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only.

---

## 1. Asset Classification & Sensitivity

| Asset Category | Examples | Security Classification | Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Financial Secrets** | Razorpay Secret, Webhook Secret | **Critical** | AES-256-GCM authenticated vault, server-only environment variables. Never sent to browser. |
| **Identity & Auth Keys** | `AUTH_SECRET`, Session Signing Keys | **Critical** | High-entropy server secret, HMAC-SHA256 cookie signatures, session revocation. |
| **Donor PII & PAN** | Full Name, Phone, Email, PAN | **Restricted / Confidential** | Least-privilege access (Donor self + Finance / Admin), public redaction for anonymous gifts. |
| **Private Documents** | Patient medical estimates, hospital bills | **Restricted / Private** | Non-public storage buckets, short-lived signed URLs, role-gated clinical reviewer access. |
| **Public Campaign Data** | Campaign stories, approved artwork, goals | **Public** | Sanitized rich text, public CDN caching, published version isolation. |

---

## 2. STRIDE Threat Analysis & Mitigations

### 2.1 Spoofing
- **Threat**: Attacker creates a forged webhook payload simulating a successful payment capture.
- **Mitigation**: Webhook signatures are verified against the exact raw request body using HMAC-SHA256 and the server-only `RAZORPAY_WEBHOOK_SECRET` with `crypto.timingSafeEqual`. Unsigned or mismatched signatures are rejected with `400 Bad Request`.

### 2.2 Tampering
- **Threat**: Malicious donor alters the unit price of a tangible product in `product-giving` or changes the donation total in browser JavaScript.
- **Mitigation**: Server-side order creation strictly discards untrusted client prices. Product unit costs are derived authoritatively from the catalog; minimum contribution thresholds (₹50) are strictly validated on the server.

### 2.3 Repudiation
- **Threat**: Disputed donation or unauthorized campaign modification.
- **Mitigation**: Comprehensive immutable audit trail (`AuditLog`) recording timestamp, actor ID, IP hash, action type, before/after state diff, and unique transaction references.

### 2.4 Information Disclosure
- **Threat**: IDOR vulnerability allowing donor A to access donor B's Section 80G tax receipt or PAN by altering the receipt ID in the URL.
- **Mitigation**: Object-level authorization checks. `getDonationById` verifies that the requesting user's ID matches the donation's `userId`, unless the session holds `finance` or `admin` roles.

### 2.5 Denial of Service (DoS)
- **Threat**: Script automated spamming of SMS/Email OTP endpoints incurring cloud infrastructure and messaging costs.
- **Mitigation**: IP-based and identifier-based rate limiting (5 attempts/hour for OTP generation, 60-second resend cooldown).

### 2.6 Elevation of Privilege
- **Threat**: Normal donor manipulates session cookies to grant themselves `admin` or `finance` roles.
- **Mitigation**: Session cookies are signed with HMAC-SHA256 (`<id>.<timestamp>.<signature>`). The server derives roles solely by looking up the authenticated user ID in the authoritative database. Client-supplied role parameters are discarded.
