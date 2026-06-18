## CHANGED Requirements

### Requirement: Questionnaire captures structured field types
The system SHALL support boolean options, single-choice options, multiple-choice options, numeric quantities, time inputs, short text, long text and repeated name/list entries needed by the operational questionnaire.

#### Scenario: Client answers quantities and times
- **WHEN** the client enters a quantity or time, including the time for "Otra actividad"
- **THEN** the system stores a typed value that can be used by scheduling and task rules

#### Scenario: Client describes another scheduled activity
- **WHEN** the client fills "Otra actividad"
- **THEN** the system stores the activity description separately from its scheduled time

### Requirement: Operational task synchronization
El sistema SHALL convertir respuestas relevantes del cuestionario en tareas reactivas del evento usando reglas configurables activas y preservando overrides manuales hechos por administradoras.

#### Scenario: Program answers create scheduled tasks
- **WHEN** el cliente proporciona horarios para comida, presentacion, show, mesa de dulces, fuente de chocolate, baile, tamales, helado u otra actividad y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza tareas programadas para staff usando el horario capturado correspondiente sin mostrarlas en el cronograma del cuestionario
