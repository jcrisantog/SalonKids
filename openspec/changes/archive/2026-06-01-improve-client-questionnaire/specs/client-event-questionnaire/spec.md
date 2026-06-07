## ADDED Requirements

### Requirement: Public questionnaire loads by event token
The system SHALL allow a client to open the questionnaire using the event public token and SHALL display the event summary, saved answers, save status and public timeline.

#### Scenario: Existing token loads questionnaire
- **WHEN** a client opens `/event/{token}` with a valid token
- **THEN** the system displays the questionnaire with the event name, date, current answers and public tasks

#### Scenario: Invalid token shows error
- **WHEN** a client opens `/event/{token}` with an invalid token
- **THEN** the system displays a non-editable error state and does not expose questionnaire data

### Requirement: Questionnaire matches administrator document sections
The system SHALL organize the digital questionnaire into the operational sections used by administrators: datos generales, pastel, musica y ambiente, presentacion, pinata, mesas/bebidas/manteleria, menu contratado con salon, menu externo, cafe/centros/dulces/gelatina, servicios de apoyo, decoracion, varios/letrero, dinamicas, cama elastica/seguridad, programa de actividades and dudas/comentarios.

#### Scenario: Client sees all operational sections
- **WHEN** the questionnaire loads
- **THEN** the system presents all required sections in a navigable long-form flow

#### Scenario: Section progress is visible
- **WHEN** the client fills fields in a section
- **THEN** the system updates visible progress for that section without requiring a page reload

### Requirement: Questionnaire captures structured field types
The system SHALL support boolean options, single-choice options, multiple-choice options, numeric quantities, time inputs, short text, long text and repeated name/list entries needed by the operational questionnaire.

#### Scenario: Client answers option questions
- **WHEN** the client selects a yes/no, single-choice or multiple-choice answer
- **THEN** the system stores the selected value in the questionnaire payload

#### Scenario: Client answers quantities and times
- **WHEN** the client enters a quantity or time
- **THEN** the system stores a typed value that can be used by scheduling and task rules

### Requirement: Conditional follow-up fields
The system SHALL show follow-up questions only when their parent answer makes them relevant, while preserving previously entered hidden values unless the client changes them.

#### Scenario: Pastel add-on follow-up appears
- **WHEN** the client indicates interest in chisperos, bombas de humo or bazukas
- **THEN** the system displays the corresponding type, quantity and distribution fields

#### Scenario: Hidden values are preserved
- **WHEN** the client turns off a parent option after filling its follow-up
- **THEN** the system hides the follow-up without silently deleting the previously entered value

### Requirement: Autosave and manual save
The system SHALL automatically save questionnaire changes after a short debounce and SHALL also provide a manual save action with clear visual states for pending, saving, saved and error.

#### Scenario: Autosave succeeds
- **WHEN** the client edits a field and pauses
- **THEN** the system saves the questionnaire and shows a saved state

#### Scenario: Save fails
- **WHEN** the API cannot save the questionnaire
- **THEN** the system keeps the edited values on screen and shows an error state

### Requirement: Backward-compatible questionnaire data
The system SHALL load existing questionnaire rows that do not contain the new fields by merging them with defaults and SHALL save the expanded payload without requiring a database migration.

#### Scenario: Legacy payload loads
- **WHEN** a saved questionnaire contains only the earlier Fase 6 fields
- **THEN** the system displays those answers and leaves new fields empty by default

#### Scenario: Empty payload loads
- **WHEN** an event has no questionnaire row yet
- **THEN** the system displays an empty questionnaire ready for first save

### Requirement: Operational task synchronization
The system SHALL convert relevant questionnaire answers into reactive event tasks while preserving manual overrides made by administrators.

#### Scenario: Pastel answers create tasks
- **WHEN** the client answers that pastel, velitas, batukada, souvenirs or special songs are needed
- **THEN** the system creates or updates the corresponding operational tasks for staff

#### Scenario: Pinata answers create tasks
- **WHEN** the client answers that pinata, bolsitas, palo, adult participation or safety opening is needed
- **THEN** the system creates or updates the corresponding pinata preparation tasks

#### Scenario: Menu answers create tasks
- **WHEN** the client fills salon menu, external menu, food timing or staff meal permissions
- **THEN** the system creates or updates kitchen, service or provider coordination tasks

#### Scenario: Program answers create timeline tasks
- **WHEN** the client provides times for food, presentation, show, candy table, chocolate fountain, dance, tamales, ice cream or another activity
- **THEN** the system creates or updates scheduled tasks that can appear in the public timeline when marked public

### Requirement: Public timeline remains focused
The system SHALL expose only public-visible tasks in the client timeline and SHALL keep internal-only operational tasks hidden from the client.

#### Scenario: Internal task generated
- **WHEN** a questionnaire answer generates an internal staff task
- **THEN** the task is not displayed in the public client timeline

#### Scenario: Public task generated
- **WHEN** a questionnaire answer generates a public milestone
- **THEN** the milestone appears in the public timeline response

### Requirement: Mobile-first client experience
The system SHALL keep the questionnaire usable on mobile and desktop, with readable labels, non-overlapping controls, stable input sizes and accessible focus states.

#### Scenario: Mobile completion
- **WHEN** the client fills the questionnaire on a narrow viewport
- **THEN** all controls remain readable, reachable and non-overlapping

#### Scenario: Desktop completion
- **WHEN** the client fills the questionnaire on a desktop viewport
- **THEN** the system provides efficient section navigation and does not require horizontal scrolling
