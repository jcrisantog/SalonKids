## ADDED Requirements

### Requirement: Rule task can use a related questionnaire time
El sistema SHALL permitir que cada tarea asociada a una regla de cuestionario tome su horario desde un campo de respuesta configurable, independiente del campo que dispara la regla.

#### Scenario: Tarea usa horario relacionado
- **WHEN** una regla activa se cumple y una tarea asociada define `schedule_source_field_key`
- **THEN** el sistema usa el valor de ese campo como `scheduled_time` si es una hora valida

#### Scenario: Override de hora tiene prioridad
- **WHEN** una tarea asociada define `override_scheduled_time` y tambien `schedule_source_field_key`
- **THEN** el sistema usa `override_scheduled_time`

#### Scenario: Compatibilidad con reglas de hora existentes
- **WHEN** una regla se dispara por un campo de tipo hora y no define fuente de horario
- **THEN** el sistema usa la respuesta del campo disparador como horario de la tarea

### Requirement: Initial program rules map related activity times
El sistema SHALL sembrar reglas iniciales para actividades programadas que tomen el horario del campo de hora correspondiente, aun cuando la regla se dispare por un campo relacionado.

#### Scenario: Presentacion usa hora de programa
- **WHEN** la regla de presentacion genera la tarea publica de presentacion
- **THEN** la tarea usa `presentationTime` como fuente de horario cuando exista

#### Scenario: Mesa de dulces usa hora de programa
- **WHEN** la regla de mesa de dulces genera la tarea publica de mesa de dulces
- **THEN** la tarea usa `candyTableTime` como fuente de horario cuando exista

#### Scenario: Otra actividad usa nombre y hora
- **WHEN** el cliente captura otra actividad y su horario
- **THEN** la tarea "Otra actividad programada" usa el nombre capturado y el horario capturado
