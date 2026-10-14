# MClimateWise Mel - Category D plus Minimal E.4 Tasks

## Completed implementation

- [x] Firebase email/password registration, login, logout, auth state, and protected routes (D.1).
- [x] Validate recipient, subject, message, attachment type, and 2 MB attachment limit in the Vue form (D.2).
- [x] Convert the selected attachment to Base64 and call a regional Firebase v2 callable function (D.2).
- [x] Require Firebase Authentication and repeat all validation in the backend (D.2).
- [x] Add Nodemailer/Gmail SMTP integration with a Firebase Secret Manager app password and attachment (D.2).
- [x] Add two PrimeVue tables with at least 21 rows, sorting, global and per-column filters, and 10-row pagination (D.3).
- [x] Retain Firebase Hosting SPA configuration and production build output (D.4).
- [x] Add filtered CSV export to both tables as the single small E.4 feature.
- [x] Pass frontend lint, frontend production build, and backend validation tests.

## Account-bound deployment steps

- [x] Upgrade `mclimatewise-mel` from Spark to Blaze.
- [x] Create a Google app password for `a2067669103@gmail.com`.
- [x] Store it as Firebase secret `GMAIL_APP_PASSWORD`.
- [x] Deploy the Firebase function and updated Hosting build.
- [ ] Send one real email with an allowed attachment and verify receipt.
