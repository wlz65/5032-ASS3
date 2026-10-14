# MClimateWise Mel - Category D plus Minimal E.4 Specification

## Background

MClimateWise Mel is a web application for a Melbourne-based not-for-profit organisation focused on environmental education and climate literacy. It serves students, teachers, families, young people, and underrepresented communities that may not have easy access to reliable climate education.

The repository contains a Vue 3 Category D application with Firebase Authentication, two interactive tables, an email form, a Firebase callable function, and a live Firebase Hosting deployment. The earlier ASS1 document supplies the product premise but does not constrain the sitemap, visual design, or detailed feature set.

## Goals

- Deliver Business Requirements D.1-D.4 and add one deliberately small E.4 CSV export feature.
- Prefer techniques demonstrated in the Week 2-12 Studios.
- Keep the product small, reliable, user-friendly, and easy to explain in the demonstration interview.
- Keep Firebase Authentication and the existing Firebase Hosting deployment, while using protected Gmail SMTP credentials for D.2.

## Functional Requirements

- **F1 - External authentication (D.1):** Users can register, sign in, and sign out. The interface clearly shows authentication state and current user information. Protected pages are available only to authenticated users, and unauthenticated visitors are directed to sign in. Invalid email, weak password, incorrect credentials, and related failures produce clear messages.
- **F2 - Email with an attachment (D.2):** An authenticated user can enter a recipient, subject, and message, select one attachment, and send it through a Firebase callable function and Gmail SMTP. Required fields, email format, attachment type, and attachment size are validated on both client and server. The interface displays sending, success, and failure states and prevents duplicate submission.
- **F3 - Interactive table data (D.3):** The application includes a climate education resources table and a community events/workshops table. Both tables support sorting, global search, individual-column search, and pagination limited to 10 rows per page. Each table includes enough representative records to demonstrate every function. Empty and failure states are visible.
- **F4 - Cloud deployment (D.4):** The application remains deployed to the existing publicly accessible Firebase Hosting URL. Authentication, protected pages, both tables, and the email page remain usable in production. Refreshing a client-side route does not return a 404. Local configuration files are not committed.
- **F5 - Basic data export (E.4):** Each interactive table provides an Export CSV action. The exported file contains the rows currently visible after filtering and uses the table's displayed column headings. If no rows match, the interface does not create a misleading empty export and provides clear feedback.

## Non-Functional Requirements

- **N1 - Security:** The Gmail app password is stored in Firebase Secret Manager and never sent to the browser. The callable function requires Firebase Authentication, and all form and attachment limits are checked on both client and server.
- **N2 - Usability:** Navigation is clear and the authentication, table, and email functions are easy to find. Operations expose loading, success, failure, and empty states. The layout works on mobile and desktop screens.
- **N3 - Code quality:** The application uses Vue 3 Composition API and small reusable components. Firebase, email, and data concerns are separated from page components. Lint and production build checks pass. The structure remains simple enough to explain and extend during an interview.
- **N4 - Demonstration reliability:** Both tables contain sufficient demonstration data. Function failures produce a visible message instead of a blank page or crash. The production secret is configured separately from source code.
- **N5 - Basic accessibility only:** Semantic elements, associated form labels, keyboard-operable controls, and visible focus states are included when they add no unnecessary complexity. Full WCAG 2.1 AA conformance belongs to Category E and is not an acceptance target in this cycle.
- **N6 - Export simplicity:** CSV generation runs entirely in the browser and uses existing table data. No PDF library, cloud storage, or additional backend is introduced.

## Out of Scope

- Category E requirements other than the explicitly scoped basic E.4 CSV export. The Firebase callable function exists only to implement D.2; no separate E.1 function feature is claimed.
- All Category F innovation requirements.
- Full reproduction of the ASS1 sitemap, personas, wireframes, or complete proposed feature list.
- A comprehensive admin dashboard, learning management system, progress tracking, quizzes, and event booking workflows.
- Unnecessary state-management libraries or backend frameworks not used in the Studios.
- A custom identity system, standalone mail server, SendGrid integration, maps, PDF export, or full accessibility audit.
- Automating Google account security changes or app-password creation. These account-bound steps are completed separately by the user.

## Acceptance Criteria

- **AC1 - Authentication:** A new user can register, sign in, and sign out. An authenticated user can enter protected pages. An unauthenticated visitor attempting to open one is directed to sign in. Invalid input and authentication failures produce clear feedback.
- **AC2 - Email:** An authenticated user can provide a recipient, subject, message, and supported attachment. Invalid or incomplete requests are blocked. One valid submission calls the authenticated Firebase function, which sends one Gmail message with the attachment. Sending, success, and specific failure states are visible.
- **AC3 - Tables:** The climate resources and community events tables both contain enough data for multiple pages and support sorting, global search, individual-column search, and 10-row pagination. A no-results state is visible.
- **AC4 - Deployment:** `npm run build` succeeds and the `dist` output can be redeployed to Firebase Hosting. The public application supports direct access and refreshes on client-side routes. Authentication, tables, and the email page load and provide valid status feedback in production.
- **AC5 - Quality and demonstration:** Lint and production build checks pass. No private credential is present in frontend source, bundles, or committed configuration. The code structure makes the location and flow of each Category D requirement easy to demonstrate.
- **AC6 - CSV export:** Each table can download a readable CSV file containing its current filtered rows and displayed columns. Values containing commas, quotes, or line breaks remain valid CSV. A no-results state does not generate a misleading file.
