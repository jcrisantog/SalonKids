## 1. Preparation

- [x] 1.1 Read the relevant local Next.js docs under `node_modules/next/dist/docs/` before editing routes or app pages.
- [x] 1.2 Review current admin navigation, integrations, staff, master tasks, questionnaire rules, event tasks, and PDF generation files to confirm exact edit points.

## 2. Owner-Facing Navigation And Integrations

- [x] 2.1 Remove Live Matriz from the visible admin navigation and any primary admin entry points.
- [x] 2.2 Simplify `/admin/integrations` so it keeps useful link/WhatsApp actions and removes Pulido visual.
- [x] 2.3 Remove Checklist movil / Lighthouse and Checklist de impresion fisica from `/admin/integrations`.
- [x] 2.4 Remove now-unused integration checklist/status helpers and icon imports after the UI sections are removed.

## 3. Staff Registration

- [x] 3.1 Hide Rol principal from the staff create/edit form and remove it from visible staff table/list labels.
- [x] 3.2 Update staff form state and submit payload so saving works when no role is captured by the UI.
- [x] 3.3 Relax `POST /api/admin/staff` validation so only name is required and `primary_role` uses an internal fallback when omitted.
- [x] 3.4 Relax `PATCH /api/admin/staff/[id]` validation so only name is required and missing `primary_role` does not block edits.
- [x] 3.5 Update staff labels in responsible dropdowns so options show person names without role text.

## 4. Master Tasks

- [x] 4.1 Hide Area and Rol default from the Tareas Maestras form.
- [x] 4.2 Remove Area and Rol columns from the Tareas Maestras table and adjust the table width/layout.
- [x] 4.3 Update Tareas Maestras help text, search placeholder, and search haystack to exclude hidden Area and Rol fields.
- [x] 4.4 Ensure `POST /api/admin/tasks` and `PATCH /api/admin/tasks/[id]` accept omitted or empty Area and Rol default without validation errors.
- [x] 4.5 Ensure editing an existing tarea maestra preserves visible fields and does not require reviewing hidden Area or Rol default values.

## 5. Questionnaire Rules

- [x] 5.1 Hide Responsable/role override controls from the Reglas Cuestionario task association UI.
- [x] 5.2 Update Reglas Cuestionario form state and payload creation so `override_role_responsible` is not required when hidden.
- [x] 5.3 Update rule list, preview, modal task creation, labels, and dropdowns so hidden responsible role text is not shown to the owner.
- [x] 5.4 Ensure `POST /api/admin/questionnaire-rules` and `PATCH /api/admin/questionnaire-rules/[id]` continue to save rule tasks with no responsible override.
- [x] 5.5 Confirm the rule engine can still generate tasks without `override_role_responsible` and relies on `staff_id` when present.

## 6. Event Tasks And PDF

- [x] 6.1 Hide Rol responsable from the Tareas del Evento create/edit form.
- [x] 6.2 Remove Rol from the Tareas del Evento table and adjust table width/layout.
- [x] 6.3 Update event task search placeholder and haystack to exclude hidden role text.
- [x] 6.4 Ensure `POST /api/admin/events/[id]/tasks` and `PATCH /api/admin/events/[id]/tasks/[taskId]` accept missing or empty `role_responsible`.
- [x] 6.5 Change visible responsible fallback so unassigned event tasks show a no-responsible state instead of role text.
- [x] 6.6 Update PDF row generation so Responsable uses assigned staff name when `staff_id` exists and `S/R` when no person is assigned.
- [x] 6.7 Update PDF summary/filter labels if needed so they do not expose hidden role-based responsibility.

## 7. Verification

- [x] 7.1 Run lint and fix any TypeScript, React, import, or accessibility issues introduced by removed fields.
- [x] 7.2 Run the production build and fix any Next.js route/page issues.
- [x] 7.3 Manually verify staff create/edit without role, master task create/edit without Area/Rol, rule save without Responsable, event task save without Rol responsable, and PDF responsible output.
- [x] 7.4 Verify hidden sections and removed columns do not leave empty layout gaps or stale copy.
