# MClimateWise Mel - Category D plus Minimal E.4 Technical Plan

## Architecture Overview

The product is a Vue 3 single-page application with a small page set: home, combined sign-in/registration, interactive tables, email, and not-found. Vue Router controls navigation and protects the table and email routes.

Firebase Authentication supplies external email/password identity. A shared Vue composable exposes the current user and waits for Firebase's initial authentication result before navigation guards make access decisions.

Both required tables use a shared PrimeVue DataTable wrapper. Climate resources and community events are maintained as local representative datasets so D.3 remains reliable and does not add an unnecessary database dependency.

The protected email page validates the form and converts the selected file to Base64. It calls a Firebase v2 callable function in `australia-southeast1`. The function verifies Firebase Authentication, validates the request again, reads the Gmail app password from Firebase Secret Manager, and sends the message and attachment through Gmail SMTP with Nodemailer.

The shared PrimeVue DataTable wrapper exposes the library's built-in `exportCSV()` action. PrimeVue exports its processed table data, so current sorting and filters are reflected without a second data-processing implementation.

The Vite frontend builds to `dist` for the existing Firebase Hosting site. Firebase's SPA rewrite allows history-mode routes to be loaded and refreshed directly.

## Core Data Structures

### Authentication State

```js
{
  user: null | FirebaseUser,
  loading: boolean,
  error: string
}
```

Authentication operations:

```js
register(email, password)
login(email, password)
logout()
waitForAuthReady()
```

### Climate Resource

```js
{
  id: number,
  title: string,
  topic: string,
  audience: string,
  format: string,
  difficulty: string
}
```

### Community Event

```js
{
  id: number,
  name: string,
  type: string,
  location: string,
  date: string,
  audience: string,
  availability: string
}
```

### Table Configuration

```js
{
  title: string,
  searchPlaceholder: string,
  rows: Array<object>,
  columns: Array<{
    field: string,
    header: string,
    filterPlaceholder: string
  }>
}
```

### Email Request

```js
{
  to: string,
  subject: string,
  message: string,
  attachment: {
    content: string,
    filename: string,
    type: string,
    size: number
  }
}
```

Client operation:

```js
sendEmailWithAttachment(payload)
```

## Module Design

### Application Shell and Router

**Responsibilities:** Render the common layout and navigation, define public/protected routes, wait for authentication readiness, redirect unauthenticated visitors, and render a client-side not-found page.

**Dependencies:** Vue, Vue Router, authentication composable.

### Authentication

**Responsibilities:** Initialize Firebase, observe authentication state, register users, sign users in and out, translate common authentication errors, and expose loading/user/error state.

**Dependencies:** Firebase Web SDK.

### Interactive Tables

**Responsibilities:** Provide at least 21 rows in each dataset and render both datasets with sorting, global search, per-column filters, fixed 10-row pagination, loading feedback, clear-filters control, an empty state, and CSV export of the currently processed rows.

**Dependencies:** PrimeVue DataTable, Column, input and button components.

### Email Client

**Responsibilities:** Validate form values and attachment metadata, convert the file to Base64, prevent duplicate submission, call the Firebase function, and display loading/success/failure feedback.

**Dependencies:** Firebase Web SDK Authentication and Functions clients.

### Email Function

**Responsibilities:** Require an authenticated callable request, repeat validation, read `GMAIL_APP_PASSWORD` from Firebase Secret Manager, send through Gmail SMTP with Nodemailer, attach the decoded Base64 file, and return a safe success or failure response.

**Dependencies:** Firebase Functions v2, Nodemailer, and Gmail SMTP.

### Deployment Configuration

**Responsibilities:** Configure Firebase Functions and Hosting, build to `dist`, and preserve the Firebase Hosting SPA rewrite.

## Module Interaction

### Authentication Flow

```text
Form validation
  -> Firebase Authentication
  -> shared auth state update
  -> redirect to the originally requested route
```

### Table Flow

```text
Local datasets and column definitions
  -> shared InteractiveDataTable
  -> PrimeVue client-side sort/filter/page
  -> results or empty state
```

### Email Flow

```text
Form and file validation
  -> convert attachment to Base64
  -> authenticated Firebase callable function
  -> server validation and Firebase secret
  -> Gmail SMTP
  -> success/error response
  -> visible UI feedback
```

### CSV Export Flow

```text
PrimeVue current filters and sorting
  -> DataTable processed rows
  -> built-in exportCSV()
  -> browser downloads a named CSV file
```

## File Organisation

```text
assisment3/
├── public/
│   └── static assets
├── src/
│   ├── assets/main.css
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── FormMessage.vue
│   │   └── InteractiveDataTable.vue
│   ├── composables/useAuth.js
│   ├── data/
│   │   ├── climateResources.js
│   │   └── communityEvents.js
│   ├── router/index.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   └── emailService.js
│   ├── utils/validation.js
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── TablesView.vue
│   │   ├── EmailView.vue
│   │   └── NotFoundView.vue
│   ├── App.vue
│   └── main.js
├── .env.example
├── firebase.json
├── spec.md
├── plan.md
├── task.md
└── checklist.md
```

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | Vue 3 Composition API | Existing project and Studio technology |
| Routing | Vue Router 4 with history mode | Week 5 pattern and protected routes |
| Authentication | Firebase email/password authentication | Week 7 pattern and D.1 fit |
| Tables | PrimeVue DataTable | Week 4 pattern with built-in rubric features |
| Table data | Local representative records | D.3 does not require a database; simplest reliable demonstration |
| Email | Firebase callable function + Nodemailer/Gmail SMTP | Keeps the app password server-side and supports D.2 attachments |
| Styling | PrimeVue theme plus concise custom CSS | Good usability without a custom design system |
| State | One Vue composable | No need for Pinia at this scale |
| Hosting | Existing Firebase Hosting site | Already public and aligned with Week 11 hosting concepts |
| SPA fallback | Firebase Hosting rewrite to `/index.html` | Supports direct history-mode route access |
| CSV export | PrimeVue DataTable `exportCSV()` | Reuses the installed component and exports its current processed rows |
| Attachment policy | PDF, PNG, JPEG, TXT; 2 MB maximum | Easy to demonstrate and keeps browser uploads small |
| Function region | `australia-southeast1` | Close to Melbourne users and explicit in both client and backend |
| Verification | ESLint, production build, validation checks, and browser checks | Proportionate coverage without adding a large test framework |

