# Member Onboarding & Vetting (prototype)

This doc describes a simple, privacy-minded onboarding flow for new members and a manual vetting process for identity verification if desired.

Goals

- Collect minimal required information.
- Verify membership eligibility through manual review (file uploads or references).
- Protect personal data and publish a retention policy.

Minimal signup form fields

- Full name
- Email (required)
- Preferred display name
- Location (city/state)
- Membership type (supporter, member, veteran)
- Optional: file upload for verification (front-end should encrypt in transit via HTTPS)

Suggested flow

1. User fills out signup form and receives a verification email (magic link or confirmation code).
2. On verification, account is created and placed in "Pending" status.
3. Admin reviews the application and uploaded proof (if provided). Admin can mark as "Approved" or "Rejected" and optionally add notes.
4. Approved members are granted a "badge" in the UI and access to members-only pages.

Implementation notes

- Store users in a small SQLite DB or in a spreadsheet for small groups. Keep uploads in secure storage (S3 or similar) and remove uploads once verification completes.
- Email verification can be done with a one-time code emailed via a transactional provider (SendGrid, Mailgun) or via a magic link token.
- Admin dashboard: simple table view of pending applications, approve/reject buttons, and CSV export.

Privacy & retention

- Keep personal data only as long as necessary for membership management.
- Provide a contact method for data removal requests.
- Encrypt backups and restrict access to admin roles only.
