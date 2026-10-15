# MClimateWise Mel - Category D and E Specification

## Background

MClimateWise Mel is a web application for a Melbourne-based not-for-profit organisation focused on environmental education and climate literacy. It serves students, teachers, families, young people, and underrepresented communities that may not have easy access to reliable climate education.

The existing Vue 3 application already implements Category D with Firebase Authentication, two interactive tables, authenticated email with an attachment, a Firebase callable function, and Firebase Hosting. It also includes CSV export. This cycle completes all Category E requirements while keeping the application small and easy to demonstrate.

## Goals

- Retain the completed Category D functionality without regression.
- Complete E.1 Cloud Functions, E.2 Geo Location, E.3 Accessibility, and E.4 Export.
- Prefer techniques consistent with the Week 2-12 Studios and avoid unnecessary services or configuration.
- Keep every feature simple enough to explain and extend during the demonstration interview.

## Functional Requirements

- **F1 - External authentication (D.1):** Users can register, sign in, and sign out. Protected pages are available only to authenticated users, and authentication failures produce clear messages.
- **F2 - Email with an attachment (D.2):** An authenticated user can enter a recipient, subject, and message, select a supported attachment, and send it through protected server-side functionality. Client and server validation prevent invalid or duplicate submissions.
- **F3 - Interactive table data (D.3):** The application contains at least two tables. Each supports sorting, global search, individual-column search, and pagination limited to 10 rows per page.
- **F4 - Cloud deployment (D.4):** A fully working version remains publicly accessible through Firebase Hosting, including direct access to client-side routes.
- **F5 - Cloud Functions (E.1):** Email delivery and attachment processing run in an authenticated Firebase Cloud Function. The function validates requests, reads its credential from managed secret storage, returns useful success or failure results, and never exposes the credential to the browser.
- **F6 - Place search (E.2):** A map page allows a user to search for a Melbourne place or point of interest, view useful matching results, and select a result to locate it on the map.
- **F7 - Route and trip information (E.2):** A user can choose a start and destination, display a route between them, and see useful trip information including distance and estimated duration. Invalid, empty, and unavailable routes produce clear feedback.
- **F8 - Accessibility (E.3):** The application targets WCAG 2.1 AA. Navigation, forms, tables, search results, route information, status messages, and map controls are keyboard operable and have appropriate names, focus states, landmarks, contrast, and text alternatives.
- **F9 - Data export (E.4):** Each interactive table provides an Export CSV action. The exported file contains the current filtered rows and displayed columns. No export is created when no rows match.

## Non-Functional Requirements

- **N1 - Security:** Credentials remain in Firebase Secret Manager and are not committed or returned to clients. Protected server functions require Firebase Authentication. Inputs and attachment limits are validated on both client and server.
- **N2 - Usability:** Navigation and instructions are clear. Searches and routes show loading, success, empty, and error states. The layout remains usable on mobile and desktop.
- **N3 - Accessibility:** Text and interactive controls meet AA contrast targets, visible focus is preserved, forms use associated labels, dynamic results use appropriate live announcements, and essential map information also appears as text.
- **N4 - Reliability:** A failed external map request does not crash the page. The user can retry, change inputs, or clear the displayed result.
- **N5 - Simplicity:** The map uses free services that do not require another account or API key. No database, admin dashboard, PDF generator, or complex state library is introduced.
- **N6 - Code quality:** The project continues to use Vue 3 Composition API, small components, and separated service modules. Production build, lint, and existing function tests pass.

## Out of Scope

- Category F innovation requirements.
- Turn-by-turn driving navigation, live GPS tracking, traffic conditions, public transport timetables, or saving favourite routes.
- A comprehensive admin dashboard, learning management system, event booking system, or Firestore data migration.
- PDF export; one readable CSV export format is sufficient for E.4.
- A formal third-party accessibility certification. The implementation and verification target the observable WCAG 2.1 AA requirements in the rubric.
- Additional paid APIs, billing configuration, or new secret keys for the map.
- Changes to `checklist.md`, which the user explicitly excluded from this project workflow.

## Acceptance Criteria

- **AC1 - Category D regression:** Registration, sign-in, protected routes, two interactive tables, email with attachment, and the public deployment continue to work.
- **AC2 - Cloud Function:** A signed-in user can send one valid email with an attachment through the deployed callable function. An unauthenticated or invalid request is rejected with a visible message, and no credential is present in browser code.
- **AC3 - Place search:** Entering a valid Melbourne place returns selectable results. Selecting one updates the map and presents the selected place in text. No-result and network-failure states are visible.
- **AC4 - Route planning:** Valid start and destination selections produce a visible route plus distance and estimated duration. Missing selections and routing failures produce actionable feedback.
- **AC5 - Accessibility:** All main features can be reached and operated with the keyboard. Pages contain logical headings and landmarks, inputs have labels and errors, focus is visible, non-text controls have accessible names, dynamic results are announced, and essential map information is available without relying only on the visual map.
- **AC6 - CSV export:** Both tables download readable CSV files containing their current filtered rows and displayed columns. No-results tables do not create misleading exports.
- **AC7 - Quality and deployment:** Lint, tests, and production build pass. The updated application is deployed to the existing Firebase URL and direct route refreshes work.

---

# Sign-out Confirmation Specification

## Background

The application currently signs an authenticated user out immediately when the user selects the **Sign out** button. An accidental selection therefore ends the session without giving the user a chance to cancel.

## Goal

- Add one simple confirmation step before ending an authenticated user's session.
- Preserve the existing sign-out behaviour after the user confirms.

## Functional Requirements

- **SC-F1 - Request confirmation:** Selecting **Sign out** displays a browser-native confirmation dialog asking whether the user wants to sign out.
- **SC-F2 - Confirm sign-out:** Confirming the dialog signs the user out and returns the user to the public home page.
- **SC-F3 - Cancel sign-out:** Cancelling the dialog closes it without signing the user out or changing the current page.

## Non-Functional Requirements

- **SC-N1 - Simplicity:** Use the browser-native confirmation dialog and introduce no new component, library, route, or service.
- **SC-N2 - Consistency:** Continue using the existing authentication composable, loading state, and navigation behaviour.
- **SC-N3 - Accessibility:** Use a clear confirmation question and retain the existing keyboard-operable **Sign out** button.

## Out of Scope

- A custom-styled modal dialog.
- Changes to registration, sign-in, authentication roles, or session duration.
- Automatic sign-out or additional warning screens.

## Acceptance Criteria

- **SC-AC1:** When a signed-in user selects **Sign out**, a confirmation dialog appears before the session changes.
- **SC-AC2:** Choosing **OK** signs the user out and displays the public home page.
- **SC-AC3:** Choosing **Cancel** keeps the user signed in and on the same page.
- **SC-AC4:** Lint and the production build complete successfully after the change.
