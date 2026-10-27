# Dokind Role-Based Access Control (RBAC) & Permission Matrix

> **BRANDING DIRECTIVE:** The public-facing product name is **Dokind** only.

---

## 1. System Roles Definition

| Role | Scope | Description |
| :--- | :--- | :--- |
| `super_admin` | Global Root | Full access to platform settings, encrypted gateway secrets, API keys, and staff roles. |
| `admin` | Operations | Operational management of campaigns, content, NGOs, and site curation. |
| `finance` | Accounting | Authorized for payment reconciliation, donor refunds, and financial ledger exports. |
| `reviewer` | Clinical / NGO Desk | Authorized to audit medical documents, verify Darpan credentials, and approve drives. |
| `campaign_manager` | Campaign Ops | Manages campaign details, multi-poster artwork, urgent flags, and organizer updates. |
| `content_editor` | CMS Builder | Authorizes CMS section drafts, layout changes, and page publications. |
| `content_writer` | Editorial | Creates and edits blog posts, stories, announcements, and FAQs. |
| `marketer` | Marketing | Manages newsletters, testimonials, and media press recognition. |
| `support_staff` | Helpdesk | Handles donor inquiries, support tickets, and form submissions. |
| `head_staff` | Field Ops | Creates and verifies campaigns on behalf of patients, posts clinical updates. |
| `organization_manager` | NGO Partner | Manages verified NGO profile, associated campaigns, and disbursement accounts. |
| `fundraiser` | Campaigner | Manages personal campaign, posts updates, requests disbursement to hospital. |
| `donor` | Public User | Default role for all public signups. Manages personal donations and tax receipts. |

---

## 2. Granular Permissions Matrix

| Capability / Permission Area | super_admin | admin | finance | reviewer | campaign_mgr | content_editor | donor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Payment Gateways & Vault** |  Yes | No | No | No | No | No | No |
| **Manage Developer API Keys** |  Yes | No | No | No | No | No | No |
| **Assign Staff Roles & Max-2 Rule** |  Yes | No | No | No | No | No | No |
| **Authorize & Issue Donor Refunds** |  Yes | No |  Yes | No | No | No | No |
| **Export Master Financial Ledgers** |  Yes |  Yes |  Yes | No | No | No | No |
| **Approve / Verify NGO Darpan & 80G** |  Yes |  Yes | No |  Yes | No | No | No |
| **Approve Medical Campaigns to Active**|  Yes |  Yes | No |  Yes |  Yes | No | No |
| **Pause / Archive Campaigns** |  Yes |  Yes | No |  Yes |  Yes | No | No |
| **Publish Live CMS Website Pages** |  Yes |  Yes | No | No | No |  Yes | No |
| **Edit Blog Articles & FAQs** |  Yes |  Yes | No | No | No |  Yes | No |
| **View Personal Donations & Receipts** |  Yes |  Yes |  Yes | No | No | No |  Yes (Own) |
| **Submit New Fundraiser Wizard** |  Yes |  Yes | No | No |  Yes | No |  Yes |

---

## 3. Server-Side RBAC Enforcement Rules

1. **Default Registration**: All new user registrations via email OTP or Google OAuth are assigned strictly the `donor` role.
2. **Maximum-Two-Roles Rule**: Staff members may hold at most two active roles (`role` and `secondaryRole`). Attempts to assign a third role are rejected by the server with `400 Bad Request`.
3. **No Client Role Authority**: Roles are never parsed from unauthenticated client parameters, query strings, or localStorage. The user's role is determined authoritatively by the server session resolver from `DatabaseStore`.
4. **Session Revocation**: When a staff member's role is downgraded or account is suspended, `sessionRevokedAt` is updated, immediately invalidating all active sessions.
