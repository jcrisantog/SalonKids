## Context

The current public event questionnaire is implemented in `src/app/event/[token]/QuestionnaireClient.tsx` and persists a flexible JSONB payload through `src/app/api/client-events/[token]/questionnaire/route.ts`. It already supports public token access, autosave, visual save status, public timeline updates and reactive task synchronization through `src/lib/rule-engine.ts`.

The attached operational document, `CUESTIONARIO_MEJORADO.docx`, contains the real questionnaire used by the administrators. It is much broader than the current UI and groups questions into sixteen operational sections: datos generales, pastel, musica, presentacion, pinata, mesas/bebidas/manteleria, menu contratado, menu externo, cafe/dulces/gelatina, servicios de apoyo, decoracion, varios/letrero, dinamicas, cama elastica/seguridad, programa and dudas/comentarios.

## Goals / Non-Goals

**Goals:**

- Represent the real administrator questionnaire as a digital client-facing flow.
- Keep questionnaire storage compatible with the existing JSONB `questionnaire_data.data` column.
- Preserve public token access, autosave, manual save, load states and error states.
- Add structured fields for options, quantities, times, long-form notes and conditional follow-up questions.
- Keep the UI efficient for long-form completion with section progress and quick navigation.
- Feed operationally relevant answers into reactive task generation and public timeline updates.

**Non-Goals:**

- Replacing the existing Supabase schema for `questionnaire_data`.
- Building contract/payment logic for add-ons and quoted services.
- Adding admin approval workflows for every questionnaire answer.
- Implementing WhatsApp or email reminders as part of this change.
- Importing the Word document at runtime.

## Decisions

1. Keep JSONB persistence and expand the TypeScript data shape.

   Rationale: the current API already persists arbitrary questionnaire data and can safely load older partial payloads by merging defaults. A relational redesign would add migration risk without immediate operational value.

   Alternative considered: create normalized tables per questionnaire section. This would improve reporting later, but would slow delivery and require more migrations.

2. Model the questionnaire as metadata-driven sections.

   Rationale: the form is long and has many repeated field patterns. A local section schema can define labels, field keys, input types, option lists, conditional visibility and progress rules, while still rendering custom components where needed.

   Alternative considered: hand-code every field directly in the page. This is simple initially, but it makes future admin edits and consistency harder.

3. Use stable camelCase keys grouped by domain.

   Rationale: existing answers already use camelCase keys such as `cake`, `pinata`, `birthdaySongVersion` and `playlistNotes`. Continuing that style limits implementation churn and makes rule-engine usage straightforward.

   Alternative considered: nest data under section objects such as `cake.names.mother`. Nesting is cleaner for large forms, but it may require more careful merge logic and backward mapping from existing flat fields.

4. Treat conditional fields as optional but preserved.

   Rationale: if a client answers a follow-up and later toggles the parent question off, preserving the value avoids accidental data loss. The UI can hide inactive fields while the payload keeps them unless explicitly cleared by the user.

   Alternative considered: clear hidden fields automatically. This reduces stale data but can surprise users in a long autosaving form.

5. Generate reactive tasks from normalized answer signals.

   Rationale: only operationally meaningful answers should produce or update tasks, for example pastel add-ons, pinata setup, menu timing, external providers, dynamic games, safety socks, valet counts and program milestones.

   Alternative considered: create a task for every non-empty answer. That would overload the live matrix and reduce staff focus.

## Risks / Trade-offs

- Large form feels overwhelming to clients -> Use section navigation, progress indicators, collapsible completed sections and concise labels.
- Existing saved questionnaires lack new fields -> Merge with a complete default object on load and tolerate missing keys in rules.
- Autosave could fire too often on long text inputs -> Keep debounce behavior and batch complete payload saves.
- Reactive task rules may create duplicate or noisy tasks -> Use stable task keys per answer signal and preserve manual overrides.
- Some Word questions include prices and policy text -> Display prices as informational copy only; do not calculate totals in this change.
- Spanish accent mojibake exists in older files -> Edit touched files with consistent UTF-8 and avoid unrelated encoding churn.

## Migration Plan

1. Add the expanded `QuestionnaireData` defaults and field metadata.
2. Replace the current long page layout with section-based rendering and progress.
3. Update the API only if payload validation or response shape needs additional metadata; keep the route path unchanged.
4. Extend rule-engine task generation for new operational signals.
5. Verify old saved questionnaires still load by testing an empty payload and a partial legacy payload.
6. Rollback by reverting UI/rule changes; existing JSONB rows remain readable because no destructive migration is required.

## Open Questions

- Should the client see every operational/policy note from the Word document, or should some policy text remain admin-only?
- Which add-on prices are fixed enough to show directly in the questionnaire?
- Should administrators be able to edit the questionnaire section/field labels later from the admin panel?
