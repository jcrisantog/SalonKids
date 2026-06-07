## MODIFIED Requirements

### Requirement: Generated tasks are synchronized safely
El sistema SHALL sincronizar tareas configurables sin duplicarlas, SHALL preservar tareas manuales marcadas con `is_manual_override = true` y SHALL evitar crear una nueva tarea generada cuando ya existe una tarea del mismo origen configurable.

#### Scenario: Regenerar despues de cambiar respuestas
- **WHEN** el cliente cambia una respuesta y guarda el cuestionario
- **THEN** el sistema elimina, actualiza o crea tareas generadas por reglas configurables segun las reglas que aplican actualmente, sin duplicar tareas con el mismo origen

#### Scenario: Preservar tarea manual
- **WHEN** una administradora edita o crea una tarea manual del evento
- **THEN** el sistema no borra ni reemplaza esa tarea durante la sincronizacion de reglas

#### Scenario: Tarea generada editada manualmente no se duplica
- **WHEN** una tarea generada por una regla configurable fue editada y marcada como manual
- **THEN** futuros guardados del cuestionario no crean una segunda tarea para el mismo `source_rule_task_id`

#### Scenario: Tarea generada existente se actualiza
- **WHEN** una tarea generada por una regla configurable existe y no esta marcada como manual
- **THEN** futuros guardados del cuestionario actualizan esa tarea en lugar de insertar una nueva copia
