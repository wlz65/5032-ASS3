# MClimateWise Mel - Category D Checklist

> Every item is verified through a command or observable application behaviour. Category E and F are excluded.

## D.1 External Authentication

- [ ] A visitor can create an account with a valid email and password. (Verify: submit the registration form and observe authenticated user information.)
- [ ] A registered user can sign in and sign out. (Verify: complete both actions and observe navigation and user state.)
- [ ] An unauthenticated visitor cannot open the tables or email routes. (Verify: open each URL directly and observe a login redirect containing the intended destination.)
- [ ] After signing in, the user returns to the originally requested protected route. (Verify: start from a protected route while signed out, then sign in.)
- [ ] Invalid email, short password, incorrect credentials, and missing Firebase configuration produce clear messages without a crash. (Verify: exercise each case in the form.)
- [ ] Authentication controls remain disabled while a request is running. (Verify: observe button state during a request.)

## D.2 Email With Attachment

- [ ] The email form includes labelled recipient, subject, message, and attachment controls. (Verify: inspect the rendered form and tab through it with the keyboard.)
- [ ] Missing fields and invalid recipient addresses are rejected before a backend call. (Verify: submit each invalid combination and observe field-specific feedback.)
- [ ] Only PDF, PNG, JPEG, and TXT attachments no larger than 2 MB are accepted. (Verify: select valid, unsupported, and oversized files and compare results.)
- [ ] A valid file is converted and sent through exactly one callable request. (Verify: submit once and observe the pending state and one network request.)
- [ ] The backend rejects unauthenticated requests. (Verify: run the backend handler/emulator without authentication and observe an unauthenticated error.)
- [ ] The backend repeats validation and never trusts the browser payload. (Verify: backend validation tests pass for every invalid boundary.)
- [ ] The SendGrid key is read from a backend secret and is absent from frontend source/build output. (Verify: inspect configuration and search `src` and `dist`.)
- [ ] Success and safe failure messages are displayed, and the submit button prevents duplicate requests. (Verify: exercise configured success and forced failure paths.)

## D.3 Interactive Table Data

- [ ] The Climate Education Resources table contains at least 21 complete records. (Verify: run a data integrity check and observe at least three pages.)
- [ ] The Community Events & Workshops table contains at least 21 complete records. (Verify: run a data integrity check and observe at least three pages.)
- [ ] Both tables display exactly 10 rows per full page. (Verify: inspect the first and second pages of each table.)
- [ ] Every displayed column can be sorted. (Verify: toggle ascending and descending sorting for each column.)
- [ ] Global search filters across the configured fields in each table. (Verify: search for a value that appears outside the first column.)
- [ ] Every displayed column has an individual search control. (Verify: filter each column separately in both tables.)
- [ ] Clear filters restores the full dataset. (Verify: apply multiple filters, clear, and observe the original row count.)
- [ ] A no-results message appears for unmatched searches. (Verify: enter a deliberately absent term.)

## D.4 Deployment Readiness

- [ ] `npm run build` completes successfully and produces `dist`. (Verify: run the command and inspect its exit code and output directory.)
- [ ] `dist/_redirects` exists with an SPA fallback. (Verify: inspect the built file.)
- [ ] Cloudflare Pages can use `npm run build` and `dist`. (Verify: inspect build configuration and, when account setup is available, complete a Pages build.)
- [ ] Opening or refreshing `/login`, `/tables`, `/email`, and an unknown route does not produce a server 404. (Verify: use preview/hosted application direct URLs.)
- [ ] Missing production service configuration shows a useful setup message instead of a blank page. (Verify: build/run without local environment values.)

## Security and Code Quality

- [ ] `.env.example` contains names only, and local environment files remain ignored. (Verify: inspect both files and repository status.)
- [ ] No SendGrid key, password, private key, or real secret exists in source or built assets. (Verify: search the workspace and `dist` for configured secret values/patterns.)
- [ ] Components have focused responsibilities and service logic is outside page components. (Verify: inspect module boundaries against `plan.md`.)
- [ ] Form controls have associated labels, status feedback is announced, and focus is visible. (Verify: keyboard-only walkthrough.)
- [ ] The layout is usable without horizontal page overflow on phone and desktop widths. (Verify: inspect representative responsive widths.)
- [ ] ESLint completes without errors. (Verify: run `npm run lint`.)
- [ ] Backend validation tests all pass. (Verify: run the configured test script.)

## End-to-End Scenarios

- [ ] **Authentication and tables:** A signed-out visitor opens `/tables`, signs in, returns to `/tables`, searches and sorts both datasets, changes pages, clears filters, and signs out. (Verify: complete the sequence without a console error or broken state.)
- [ ] **Authentication and email:** A signed-out visitor opens `/email`, signs in, selects a valid attachment, sends a configured email, sees success, and cannot submit the same request twice while pending. (Verify: complete the sequence with Firebase/SendGrid configured.)
- [ ] **Failure resilience:** With Firebase or SendGrid configuration unavailable, the corresponding page remains rendered and explains what is unavailable. (Verify: run with intentionally missing configuration.)
- [ ] **Production navigation:** A production/preview build supports direct access, refresh, navigation, and a client-side 404 page. (Verify: test all route URLs against the preview or hosted build.)

