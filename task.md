# MClimateWise Mel - Category D and E Implementation Tasks

## 1. Preserve and verify completed Category D and E.1

- [x] Implement Firebase email/password registration, login, logout, authentication state, and protected routes (D.1).
- [x] Validate email fields and attachment limits in the Vue client (D.2).
- [x] Implement the authenticated Firebase v2 callable email function with repeat server validation (D.2 / E.1).
- [x] Store the Gmail app password in Firebase Secret Manager and send attachments through Nodemailer (D.2 / E.1).
- [x] Implement two PrimeVue tables with at least 21 rows, sorting, global search, column filters, and 10-row pagination (D.3).
- [x] Deploy the existing application and function through Firebase Hosting and Functions (D.4).
- [x] Re-run the existing Firebase Function tests after all E changes.
- [x] Confirm the existing authentication, tables, and email modules remain unchanged by E implementation.

## 2. Add the map dependency and application route

- [x] Load the fixed Leaflet 1.9.4 browser distribution and its CSS without adding a Vue wrapper (npm registry was unavailable).
- [x] Add a protected, lazy-loaded `/map` route.
- [x] Add a Map navigation link for authenticated users.
- [x] Confirm `/map` uses the existing authentication guard and loads for the authenticated account.

## 3. Implement the place and route service

- [x] Create `src/services/mapService.js` with Melbourne bounds and public endpoint constants.
- [x] Validate and normalise place-search queries.
- [x] Implement submit-only Nominatim search with `format=jsonv2`, five-result limit, Australian country filter, and bounded Melbourne view box.
- [x] Add an in-memory query cache and ensure at least 1.1 seconds between outgoing Nominatim searches.
- [x] Normalise API results into the small place-result structure and discard invalid coordinates.
- [x] Validate route endpoints and reject missing or identical endpoints before requesting a route.
- [x] Implement the OSRM driving route request with full GeoJSON geometry.
- [x] Convert OSRM coordinate order for Leaflet and convert distance/duration into readable units.
- [x] Return consistent user-safe errors for unavailable, malformed, no-result, and no-route responses.
- [x] Add small Node tests for place normalisation, invalid coordinates, route geometry conversion, distance, and duration.

## 4. Build the protected Map page

- [x] Create `src/views/MapView.vue` with one labelled place-search form.
- [x] Add search loading, success, empty, and error states.
- [x] Render search matches as keyboard-operable result buttons.
- [x] Allow a selected result to update the map marker and visible place details.
- [x] Allow a selected result to replace either the route start or destination.
- [x] Supply two simple default Melbourne landmarks for immediate route demonstration.
- [x] Add Plan route and Clear route controls with missing-endpoint protection.
- [x] Initialise Leaflet after mount with a Melbourne view and attributed OpenStreetMap tiles.
- [x] Replace old markers and polylines when state changes rather than accumulating layers.
- [x] Draw the route and fit the map to its bounds after a successful OSRM response.
- [x] Display start, destination, distance, and estimated duration as normal text.
- [x] Remove the Leaflet map and layers when the view unmounts.
- [x] Keep external request failures recoverable so the user can retry or clear the route.

## 5. Complete accessibility work (E.3)

- [x] Set the document language to English in `index.html`.
- [x] Give the map region, search form, results, endpoint controls, and route summary clear accessible names and headings.
- [x] Add polite live announcements for place-search, route, and export results.
- [x] Ensure all new actions use native keyboard-operable controls with visible focus.
- [x] Keep essential place and trip information available as text rather than map colour or shape alone.
- [x] Preserve logical page landmarks, heading order, labels, errors, and skip-link behavior.
- [x] Configure Leaflet zoom controls and interactive markers for keyboard access and meaningful labels.
- [x] Add reduced-motion styles without removing useful focus feedback.
- [x] Check responsive CSS, control size, text readability, and AA-oriented colour variables.

## 6. Finalise CSV export (E.4)

- [x] Keep PrimeVue's current-filter CSV export on both tables.
- [x] Disable or block export when the filtered result has no rows.
- [x] Add a polite visible/export status confirmation.
- [ ] Verify downloaded CSV files contain the displayed columns and currently filtered rows.

## 7. Quality verification

- [x] Run all map-service tests.
- [x] Run the existing Firebase Function tests.
- [x] Run frontend lint and fix all introduced findings.
- [x] Run the production build and fix all introduced failures.
- [x] Test the deployed place search, selected marker, searched endpoint, route drawing, distance, and duration.
- [ ] Test the complete application using keyboard-only navigation.
- [ ] Inspect document language, landmarks, labels, focus, live feedback, text alternatives, contrast, and reduced-motion behavior.
- [x] Confirm no new secret, app password, or private credential exists in browser code or tracked files.

## 8. Deployment and final checks

- [x] Deploy the tested production frontend to the existing Firebase Hosting project.
- [x] Verify the public application and authenticated map route load successfully.
- [x] Verify direct access to `/map` works through the Hosting SPA rewrite.
- [x] Run one valid place search and multiple route requests on the deployed site.
- [ ] Verify both deployed CSV exports.
- [ ] Confirm the existing callable email function still works from the deployed application.
- [x] Record the final public URL and concise Category E demonstration steps for handoff.

`checklist.md` is intentionally not used or modified, as requested.

> Deployment completed through the authorised Google Cloud Shell session. Public URL: `https://mclimatewise-mel.web.app`.

---

# Sign-out Confirmation Tasks

## File List

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/components/AppHeader.vue` | Request confirmation before the existing sign-out action |

## SC-T1: Add the confirmation guard

**File:** `src/components/AppHeader.vue`

**Dependencies:** None

**Steps:**

1. Update the existing asynchronous sign-out handler to call the browser-native confirmation dialog with the approved question.
2. Return immediately when the user cancels so neither Firebase logout nor router navigation runs.
3. Keep the existing `logout()` and `router.push('/')` sequence unchanged when the user confirms.
4. Keep the existing loading-based disabled state on the **Sign out** button.

**Verification:** Inspect the focused diff and run frontend lint; expect no new lint errors and no changes outside the approved component and documentation.

## SC-T2: Verify compilation and user-visible behaviour

**Files:** `src/components/AppHeader.vue`, generated production build

**Dependencies:** SC-T1

**Steps:**

1. Run the production build.
2. Open the application while authenticated and activate **Sign out**.
3. Choose **Cancel** and verify the session and current route remain unchanged.
4. Activate **Sign out** again, choose **OK**, and verify the user is signed out and returned to the public home page.

**Verification:** Production build succeeds; both the cancellation and confirmation browser scenarios match the approved specification.

## Execution Order

```text
SC-T1 -> SC-T2
```
