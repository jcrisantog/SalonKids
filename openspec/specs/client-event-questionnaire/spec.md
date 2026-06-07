## ADDED Requirements

### Requirement: Public questionnaire loads by event token
El sistema SHALL permitir que un cliente abra el cuestionario usando el token publico del evento y SHALL mostrar el resumen del evento, respuestas guardadas y estado de guardado. El sistema SHALL conservar los datos del cronograma disponibles internamente pero SHALL NOT mostrar el cronograma publico en la interfaz del cuestionario mientras la funcionalidad esta en revision.

#### Scenario: Existing token loads questionnaire
- **WHEN** un cliente abre `/event/{token}` con un token valido
- **THEN** el sistema muestra el cuestionario con nombre del evento, fecha, respuestas actuales y estado de guardado sin mostrar el bloque de cronograma

#### Scenario: Invalid token shows error
- **WHEN** un cliente abre `/event/{token}` con un token invalido
- **THEN** el sistema muestra un estado de error no editable y no expone datos del cuestionario

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
El sistema SHALL convertir respuestas relevantes del cuestionario en tareas reactivas del evento usando reglas configurables activas y preservando overrides manuales hechos por administradoras.

#### Scenario: Pastel answers create tasks
- **WHEN** el cliente responde que se necesitan pastel, velitas, batukada, souvenirs o canciones especiales y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza las tareas operativas correspondientes para el staff desde tareas maestras configuradas

#### Scenario: Pinata answers create tasks
- **WHEN** el cliente responde que se necesita pinata, bolsitas, palo, participacion de adultos o apertura con seguridad y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza las tareas correspondientes de preparacion de pinata desde tareas maestras configuradas

#### Scenario: Menu answers create tasks
- **WHEN** el cliente captura menu del salon, menu externo, horarios de comida o permisos de comida para staff y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza tareas de cocina, servicio o coordinacion de proveedor desde tareas maestras configuradas

#### Scenario: Program answers create scheduled tasks
- **WHEN** el cliente proporciona horarios para comida, presentacion, show, mesa de dulces, fuente de chocolate, baile, tamales, helado u otra actividad y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza tareas programadas para staff sin mostrarlas en el cronograma del cuestionario

#### Scenario: Informative answer does not create tasks
- **WHEN** el cliente responde un campo del cuestionario que no tiene regla configurable activa
- **THEN** el sistema guarda la respuesta sin generar tareas de evento para ese campo

### Requirement: Public timeline remains focused
El sistema SHALL conservar internamente los datos del cronograma publico y SHALL ocultar el bloque de cronograma de la interfaz del cliente hasta que la duena apruebe mostrarlo.

#### Scenario: Task generated
- **WHEN** una respuesta del cuestionario genera una tarea para staff
- **THEN** la tarea no se muestra en la interfaz publica del cuestionario

#### Scenario: Public timeline data exists
- **WHEN** existen datos de tareas visibles publicamente para un evento
- **THEN** el cuestionario sigue cargando y guardando normalmente sin renderizar un bloque de cronograma al cliente

### Requirement: Mobile-first client experience
The system SHALL keep the questionnaire usable on mobile and desktop, with readable labels, non-overlapping controls, stable input sizes and accessible focus states.

#### Scenario: Mobile completion
- **WHEN** the client fills the questionnaire on a narrow viewport
- **THEN** all controls remain readable, reachable and non-overlapping

#### Scenario: Desktop completion
- **WHEN** the client fills the questionnaire on a desktop viewport
- **THEN** the system provides efficient section navigation and does not require horizontal scrolling
