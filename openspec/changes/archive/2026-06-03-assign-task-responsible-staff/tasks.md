## 1. Data Model

- [x] 1.1 Add nullable `default_staff_id` foreign key to `master_tasks` in `schema.sql` with `ON DELETE SET NULL`.
- [x] 1.2 Add nullable `override_staff_id` foreign key to `questionnaire_task_rule_tasks` in `schema.sql` with `ON DELETE SET NULL`.
- [x] 1.3 Update generated/select payload expectations so `master_tasks` and rule-task joins include staff assignment fields.

## 2. Admin APIs

- [x] 2.1 Update `GET /api/admin/tasks` to return `default_staff_id` and enough staff data to display the assigned person.
- [x] 2.2 Update create/edit task APIs to accept nullable `default_staff_id`, validate it against `staff`, and persist it.
- [x] 2.3 Update event task create/edit APIs to validate nullable `staff_id` and keep `role_responsible` as fallback text.
- [x] 2.4 Ensure API error messages are clear when a selected staff record does not exist.

## 3. Admin UI

- [x] 3.1 Update the master tasks page to load staff options and include a "Responsable default" select in create/edit flows.
- [x] 3.2 Show assigned staff name in the master tasks list, falling back to `default_role` when no person is assigned.
- [x] 3.3 Update the event activities page to load staff options and include a responsible staff select in create/edit flows.
- [x] 3.4 Show assigned staff name in the event activities list, falling back to `role_responsible` when no person is assigned.
- [x] 3.5 Preserve existing inactive staff assignments in forms and lists while prioritizing active staff for new selections.

## 4. Questionnaire Rule Generation

- [x] 4.1 Update rule-task API payloads and UI types to support nullable `override_staff_id` where rule-level assignment is configured.
- [x] 4.2 Update the rule engine to set event task `staff_id` from `override_staff_id`, then `master_tasks.default_staff_id`, then `null`.
- [x] 4.3 Preserve `role_responsible` fallback behavior from override role, master task default role, or operational fallback.
- [x] 4.4 Confirm generated tasks with `is_manual_override = true` are still preserved during synchronization.

## 5. Verification

- [x] 5.1 Verify creating and editing a master task with a staff responsible, without a responsible, and after clearing a responsible.
- [x] 5.2 Verify creating and editing an event activity can assign, change, and clear `staff_id`.
- [x] 5.3 Verify generated questionnaire tasks inherit staff assignment in the correct precedence order.
- [x] 5.4 Run the project lint/build checks used by the repo and fix any type or formatting issues.
