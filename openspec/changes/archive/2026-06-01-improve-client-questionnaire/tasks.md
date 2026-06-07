## 1. Preparation

- [x] 1.1 Read the relevant local Next.js docs in `node_modules/next/dist/docs/` before editing App Router routes or client/server components.
- [x] 1.2 Review the current questionnaire files: `src/app/event/[token]/QuestionnaireClient.tsx`, `src/app/api/client-events/[token]/questionnaire/route.ts` and `src/lib/rule-engine.ts`.
- [x] 1.3 Map the Word questionnaire sections into stable questionnaire field keys, preserving existing keys where possible.
- [x] 1.4 Define default values for all new fields so empty and legacy questionnaire payloads load safely.

## 2. Questionnaire Data Model

- [x] 2.1 Expand `QuestionnaireData` in `src/lib/rule-engine.ts` with fields for all sixteen operational sections.
- [x] 2.2 Add shared section/field metadata for labels, input types, options, conditionals and progress calculation.
- [x] 2.3 Ensure questionnaire loading merges saved JSONB data with the expanded default object.
- [x] 2.4 Confirm hidden conditional values are preserved unless explicitly changed by the user.

## 3. Public Questionnaire UI

- [x] 3.1 Replace the current hand-coded questionnaire panels with a section-based long-form flow.
- [x] 3.2 Add mobile-friendly section navigation and per-section completion/progress indicators.
- [x] 3.3 Implement reusable controls for text, textarea, number, time, yes/no, single-choice and multi-choice fields.
- [x] 3.4 Add conditional rendering for follow-up questions such as pastel add-ons, menu choices, pinata options, external providers and dynamics.
- [x] 3.5 Preserve autosave, manual save, pending/saving/saved/error states and public timeline display.
- [x] 3.6 Verify labels, controls and timeline do not overlap on mobile or desktop layouts.

## 4. API and Persistence

- [x] 4.1 Keep the existing `/api/client-events/[token]/questionnaire` GET and PUT contract compatible with current callers.
- [x] 4.2 Add any server-side normalization needed before saving questionnaire JSONB data.
- [x] 4.3 Ensure invalid tokens return a safe error without exposing event or questionnaire details.
- [x] 4.4 Verify empty, partial legacy and expanded questionnaire payloads round-trip correctly.

## 5. Reactive Task Rules

- [x] 5.1 Add or update reactive task rules for pastel, velitas, batukada, chisperos, bombas de humo, bazukas and souvenirs.
- [x] 5.2 Add or update reactive task rules for musica, presentacion, dedicatorias and special songs.
- [x] 5.3 Add or update reactive task rules for pinata setup, adult participation, bags, stick and safety opening.
- [x] 5.4 Add or update reactive task rules for tables, drinks, linen, kids tables and reserved tables.
- [x] 5.5 Add or update reactive task rules for salon menu, external menu, food timing, staff meals and provider coordination.
- [x] 5.6 Add or update reactive task rules for coffee, candy table, centerpieces, gelatin and support services.
- [x] 5.7 Add or update reactive task rules for external decoration, self-decoration, canvas, photo frame, candy bags and souvenirs.
- [x] 5.8 Add or update reactive task rules for dynamics, trampoline socks, valet counts and the event activity program.
- [x] 5.9 Preserve manual overrides and avoid duplicate generated tasks by using stable generated task keys.

## 6. Verification

- [x] 6.1 Run lint and build checks for the project.
- [x] 6.2 Test the questionnaire manually with a new event token and with an existing saved questionnaire.
- [x] 6.3 Verify autosave debounce, manual save, save errors and reload behavior.
- [x] 6.4 Verify generated internal tasks appear in admin views and public tasks appear in the client timeline only when appropriate.
- [x] 6.5 Capture desktop and mobile screenshots of the questionnaire for layout review.
