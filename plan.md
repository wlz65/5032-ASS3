# MClimateWise Mel - Category D and E Technical Plan

## Architecture Overview

The product remains a small Vue 3 single-page application. Vue Router controls public and authenticated pages, Firebase Authentication supplies email/password identity, and Firebase Hosting serves the production build with a single-page application rewrite.

Category D remains unchanged in structure: two local datasets are displayed through a shared PrimeVue DataTable component, and the authenticated email page calls the existing Firebase v2 callable function. The function validates the request, reads the Gmail app password from Firebase Secret Manager, and sends the email and attachment through Nodemailer.

Category E adds one protected map page. A fixed Leaflet 1.9.4 browser distribution renders the map and OpenStreetMap tiles. A small map service performs user-triggered Melbourne place searches through Nominatim and requests a driving route through the public OSRM route service. Search results, the selected endpoints, route distance, route duration, loading states, and failures are also presented as normal text so the feature does not depend on the visual map alone.

No database, paid map account, new secret, Vue map wrapper, or global state library is added. Existing CSV export is retained and receives clearer accessible feedback.

## Core Data Structures

### Authentication State

```js
{
  user: null | FirebaseUser,
  loading: boolean,
  error: string
}
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

### Place Search Result

```js
{
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  type: string
}
```

Only the fields required by the interface are retained from the Nominatim response. Coordinates are converted to finite numbers before a result can be selected.

### Route Endpoint

```js
{
  name: string,
  latitude: number,
  longitude: number
}
```

### Route Result

```js
{
  coordinates: Array<[number, number]>,
  distanceKm: number,
  durationMinutes: number
}
```

OSRM returns GeoJSON coordinates in longitude/latitude order. The service converts them to Leaflet's latitude/longitude order before drawing the polyline.

### Map View State

```js
{
  query: string,
  results: Array<PlaceSearchResult>,
  selectedPlace: null | PlaceSearchResult,
  start: null | RouteEndpoint,
  destination: null | RouteEndpoint,
  route: null | RouteResult,
  searchStatus: 'idle' | 'loading' | 'success' | 'empty' | 'error',
  routeStatus: 'idle' | 'loading' | 'success' | 'error',
  message: string
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

## Module Design

### Application Shell and Router

**Responsibilities:** Render common navigation and layout, define public/protected routes, wait for authentication readiness, redirect unauthenticated users, and expose the new Map link through normal application navigation.

**Changes:** Add a lazy-loaded protected `/map` route and a Map navigation item. Existing authentication guard behavior is reused.

### Map View

**Responsibilities:** Own the search form, result list, start and destination selections, route controls, textual trip summary, status messages, and Leaflet map lifecycle.

The map is initialized after the component mounts and removed when the component unmounts. Marker and route layers are replaced rather than accumulated. A result selection centres the map and places a marker. A successful route draws start and destination markers plus a route polyline, then fits the map to the route bounds.

Two Melbourne demonstration endpoints are provided initially so route planning can be shown immediately. Search results can replace either endpoint. A Clear route action returns the interface to its initial route state.

### Map Service

**Responsibilities:** Build safe external request URLs, validate and normalise responses, cache repeated place searches for the current session, enforce polite request timing, and translate network/API failures into simple application errors.

`searchMelbournePlaces(query)`:

- Runs only after a form submission; there is no search-as-you-type or autocomplete.
- Trims and validates the query before a request.
- Calls Nominatim using `format=jsonv2`, `limit=5`, `countrycodes=au`, and a bounded Melbourne view box.
- Reuses an in-memory cache for repeated normalised queries.
- Keeps at least 1.1 seconds between outgoing Nominatim requests.
- Returns a small normalised list or a controlled error.

`fetchRoute(start, destination)`:

- Validates both endpoints and prevents a request when they are missing or identical.
- Calls OSRM's driving route endpoint with longitude/latitude pairs, `geometries=geojson`, and `overview=full`.
- Converts metres to kilometres and seconds to minutes for display.
- Returns a controlled no-route or network error without breaking the page.

### Accessibility Layer

**Responsibilities:** Ensure the new and existing features target WCAG 2.1 AA and remain usable without a mouse or visual interpretation of the map.

Implementation details:

- Set the document language to English.
- Retain the existing skip link, landmarks, labels, and visible focus styling.
- Use a labelled search form and real buttons for each search result and endpoint action.
- Give the map region an accessible name and keep all essential place/route information in adjacent text.
- Use polite live regions for search, route, and CSV export status; use clear inline error text.
- Keep Leaflet zoom controls and markers keyboard accessible with meaningful labels where applicable.
- Preserve logical heading order and adequate control sizes/contrast.
- Add reduced-motion styling for users who request it.
- Never communicate endpoint or route state through colour alone.

### Interactive Tables and CSV Export

**Responsibilities:** Continue providing two datasets with sorting, global and column filters, fixed 10-row pagination, empty/loading states, and CSV export.

The existing PrimeVue `exportCSV()` action remains the export mechanism. The export control is disabled when no filtered rows match. Activating a valid export also updates a polite live region so keyboard and screen-reader users receive confirmation.

### Email Client and Cloud Function

**Responsibilities:** Retain the completed E.1 implementation. The browser validates input and attachment metadata and invokes the authenticated callable function. The function repeats validation, reads the managed secret, sends through Gmail SMTP, and returns a safe result.

No additional Cloud Function is necessary: the existing email function already provides meaningful server-side functionality and meets E.1.

### Deployment Configuration

**Responsibilities:** Build the Vue application to `dist`, keep the existing Firebase Hosting SPA rewrite, deploy the updated frontend, and leave the working function configuration intact.

## Module Interactions

### Place Search Flow

```text
User submits a public-place query
  -> validate and normalise query
  -> return cached result or wait for request interval
  -> Nominatim bounded Melbourne search
  -> normalise up to five results
  -> render keyboard-operable result buttons and status text
  -> selected result updates marker and textual place details
```

### Route Planning Flow

```text
Choose start and destination
  -> validate endpoints
  -> OSRM route request
  -> normalise geometry, distance, and duration
  -> replace route layers and fit map bounds
  -> display the same trip information as text
```

### Email Flow

```text
Form and file validation
  -> convert attachment to Base64
  -> authenticated Firebase callable function
  -> server validation and Firebase secret
  -> Gmail SMTP
  -> visible success/error response
```

### CSV Export Flow

```text
PrimeVue current filters and sorting
  -> processed table rows
  -> block export if no rows match
  -> built-in exportCSV()
  -> named CSV download and accessible confirmation
```

## File Organisation

```text
assisment3/
├── functions/
│   ├── index.js
│   └── test/
├── src/
│   ├── assets/main.css                    # accessibility and map layout updates
│   ├── components/
│   │   ├── AppHeader.vue                  # Map navigation link
│   │   ├── FormMessage.vue
│   │   └── InteractiveDataTable.vue       # export feedback
│   ├── composables/useAuth.js
│   ├── data/
│   │   ├── climateResources.js
│   │   └── communityEvents.js
│   ├── router/index.js                    # protected /map route
│   ├── services/
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── firebase.js
│   │   └── mapService.js                  # Nominatim and OSRM requests
│   ├── utils/validation.js
│   ├── views/
│   │   ├── EmailView.vue
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── MapView.vue                    # Leaflet map and trip UI
│   │   ├── NotFoundView.vue
│   │   └── TablesView.vue
│   ├── App.vue
│   └── main.js
├── index.html                             # document language
├── package.json
├── firebase.json
├── spec.md
├── plan.md
└── task.md
```

`checklist.md` is intentionally excluded from this cycle as requested.

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | Vue 3 Composition API | Existing project and Studio technology |
| Routing | Vue Router 4 with history mode | Reuses the existing authenticated route pattern |
| Authentication | Firebase email/password authentication | Existing D.1 implementation |
| Cloud function | Existing Firebase callable email function | Already provides authenticated server-side validation and email delivery for E.1 |
| Tables | PrimeVue DataTable | Existing Studio-aligned implementation includes rubric features |
| CSV export | PrimeVue `exportCSV()` | Smallest E.4 solution and respects current filters |
| Map rendering | Fixed Leaflet 1.9.4 browser distribution, without a Vue wrapper | The npm registry is unavailable in the execution environment; the fixed browser build keeps the dependency small and the Vite build reproducible |
| Base map | OpenStreetMap tiles with visible attribution | Free, no new key, and suitable for the assignment demonstration |
| Place search | Nominatim submit-only bounded search | Provides genuine POI/place search without an API key while respecting the public-service policy |
| Route service | Public OSRM driving route API | Supplies route geometry, distance, and estimated duration without a new account |
| Search protection | 1.1-second request interval plus in-memory cache | Keeps usage modest and prevents repeated calls during a demonstration |
| Route defaults | Two preselected Melbourne landmarks | Makes E.2 immediately demonstrable while still allowing searched endpoints |
| Accessibility | Native controls, text alternatives, live regions, focus visibility, and reduced motion | Directly covers the observable E.3 rubric requirements |
| State | Local Composition API refs plus existing auth composable | No need for Pinia at this scale |
| Hosting | Existing Firebase Hosting project | Preserves the completed public D.4 deployment |
| Verification | ESLint, Node tests for map-service normalisation, existing function tests, production build, keyboard checks, and deployed browser checks | Covers logic and rubric behavior without adding a large test framework |

## Verification Plan

1. Run ESLint and the production build.
2. Run existing Firebase Function tests to confirm E.1 and D.2 behavior is unchanged.
3. Add small Node tests for map response normalisation, invalid coordinates, and route distance/duration conversion.
4. In the browser, sign in and verify protected navigation, place search, no-result/error feedback, endpoint selection, route drawing, distance, duration, clear route, and direct `/map` refresh.
5. Use keyboard-only navigation to check the skip link, header links, forms, search results, map controls, endpoint actions, tables, email form, and CSV export.
6. Check text alternatives, live announcements, document language, headings, focus visibility, contrast, and reduced-motion behavior.
7. Verify both tables export current filtered rows and do not export when empty.
8. Deploy the production build to the existing Firebase Hosting site and repeat the main flows on the public URL.

## Requirement Coverage

| Requirement | Planned implementation | Verification |
|---|---|---|
| F1 / D.1 | Existing Firebase email/password authentication and protected routes | Register, sign in/out, and protected-route browser checks |
| F2 / D.2 | Existing callable email function with attachment | Function tests and one authenticated send |
| F3 / D.3 | Existing two PrimeVue interactive tables | Sorting, filtering, global search, and 10-row pagination checks |
| F4 / D.4 | Existing Firebase Hosting SPA deployment | Public URL and direct-route refresh |
| F5 / E.1 | Existing authenticated Firebase callable function and managed secret | Function tests, rejection checks, and deployed send |
| F6 / E.2 | Nominatim Melbourne place search with selectable results and marker | Search, select, no-result, and failure checks |
| F7 / E.2 | OSRM route polyline plus distance and duration | Default and searched endpoint route checks |
| F8 / E.3 | Language, keyboard operation, labels, live regions, focus, contrast, and text map alternatives | Keyboard and accessibility inspection |
| F9 / E.4 | Filter-aware PrimeVue CSV export with empty-state guard | Both-table filtered and empty export checks |

---

# Sign-out Confirmation Plan

## Architecture Overview

The confirmation remains inside the existing header component because that component already owns the **Sign out** control and coordinates the authentication action with navigation. The existing authentication composable and router remain unchanged.

## Component Design

### `AppHeader.vue`

**Responsibility:** Intercept the existing sign-out button action and request browser confirmation before invoking the existing asynchronous logout flow.

**Interface changes:** None. The component continues to consume `user`, `loading`, and `logout` from `useAuth()`.

**Dependencies:** Existing Vue event binding, browser `window.confirm()`, existing authentication composable, and existing Vue Router instance.

## Interaction Flow

```text
User selects Sign out
        |
        v
Browser asks for confirmation
        |
        +-- Cancel --> Stop; keep session and current route
        |
        +-- OK -----> Call existing logout()
                           |
                           v
                      Navigate to /
```

## File Organisation

```text
src/
└── components/
    └── AppHeader.vue   # Add confirmation guard to existing logout handler
```

No new source file, component, route, service, state object, or dependency is required.

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Dialog type | Browser-native `window.confirm()` | Smallest implementation, keyboard operable, no modal focus-management code |
| Confirmation copy | `Are you sure you want to sign out?` | Clear, direct, and describes the consequence |
| Cancellation | Return from the event handler before calling `logout()` | Guarantees no authentication or navigation change |
| Confirmed action | Reuse existing `logout()` followed by `router.push('/')` | Preserves established behaviour and avoids authentication changes |
| Loading protection | Retain the button's existing `loading` disabled state | Prevents repeated sign-out requests |

## Verification Plan

1. Run lint to confirm the component follows project rules.
2. Run the production build to confirm compilation succeeds.
3. While signed in, select **Sign out**, choose **Cancel**, and verify the user and current page remain unchanged.
4. Select **Sign out** again, choose **OK**, and verify the public home page appears in a signed-out state.

## Requirement Coverage

| Requirement | Planned implementation | Verification |
|---|---|---|
| SC-F1 | Confirmation guard in the existing click handler | Dialog appears before logout |
| SC-F2 | Existing logout and home navigation run only after confirmation | OK signs out and opens `/` |
| SC-F3 | Early return when confirmation is cancelled | Cancel preserves session and route |
| SC-N1 | Native confirmation with no new dependency | Dependency and file review |
| SC-N2 | Existing composable, loading state, and router retained | Lint, build, and behaviour checks |
| SC-N3 | Existing native button plus browser-native dialog | Keyboard activation and dialog operation |
