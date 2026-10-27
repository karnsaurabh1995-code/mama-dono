# Dokind Known Risks & Security Remediation Matrix

> **AUDIT MANDATE:** All identified security vulnerabilities, permissive database policies, authentication loopholes, and secret exposures must be tracked, remediated, and verified with deterministic tests.

---

## 1. High-Priority Security & Architectural Findings

| ID | Finding / Risk | Severity | Location | Status | Remediation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Permissive Supabase RLS Policy (`FOR ALL USING (true)`) | **CRITICAL** | `supabase/migrations/20261027_website_publishing_schema.sql` | **Identified** | Rewrite RLS policy to enforce that public clients can ONLY read `is_active = TRUE` published pages. Write access (`INSERT`, `UPDATE`, `DELETE`) is strictly restricted to service-role or authenticated administrators. |
| **SEC-02** | Hardcoded Fallback Master Key in AES-256 Vault | **HIGH** | `src/lib/security/crypto-vault.ts` | **Identified** | Remove static fallback string. Require `ENCRYPTION_MASTER_KEY` or `AUTH_SECRET`. If unconfigured in production (`NODE_ENV === 'production'`), throw an explicit fatal error rather than using an insecure default. |
| **SEC-03** | Unsigned JSON Session Cookie & Production Demo-User Fallback | **HIGH** | `src/lib/auth/server.ts`, `src/lib/auth/context.tsx` | **Identified** | Replace unsigned JSON cookies with cryptographic HMAC-SHA256 signatures (`<id>.<timestamp>.<hmac>`). In production mode, strictly reject demo user fallbacks. |
| **SEC-04** | Residual Legacy Branding ("SevaSetu") in Data & Templates | **MEDIUM** | `src/lib/data/blogs.ts`, `campaign-items.ts`, `media.ts`, `admin/reports` | **Identified** | Cleanse all residual strings to ensure 100% pure **Dokind** branding across the application, emails, receipts, CSV exports, and metadata. |
| **SEC-05** | Development Floating HUD Overlay Visible in Production | **LOW** | `src/components/common/ScreenFitProvider.tsx` | **Identified** | Deactivate the floating developer HUD widget by default so public users and automated screenshot audits do not see dev controls. |
| **SEC-06** | React 19 / ESLint `set-state-in-effect` in Providers | **LOW** | `src/providers/SiteSettingsProvider.tsx`, `src/lib/auth/context.tsx` | **Identified** | Refactor synchronous state setters inside effects into async callbacks or state initializer functions. |

---

## 2. Remediation Verification Plan

1. **SEC-01 (RLS)**: Apply patched migration in Supabase and run automated RLS tests verifying that unauthenticated anonymous calls cannot insert or update page drafts or versions.
2. **SEC-02 (Vault)**: Run unit tests asserting that attempting to encrypt/decrypt without a valid environment key in production throws an error, and that valid keys produce authenticated AES-256-GCM ciphertexts.
3. **SEC-03 (Auth)**: Run session verification tests verifying that forged, tampered, or expired session cookies are rejected immediately with 401 Unauthorized.
4. **SEC-04 (Branding)**: Automated repository regex scan ensuring zero occurrences of "SevaSetu" or "Dokind V2" in `src/`.
5. **SEC-05 (HUD)**: Verify via browser screenshot tests that no floating overlay is visible on mobile or desktop viewports.
