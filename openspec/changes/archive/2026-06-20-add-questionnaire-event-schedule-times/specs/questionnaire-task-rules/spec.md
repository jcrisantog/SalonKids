## ADDED Requirements

### Requirement: Rules use cake and pinata program times
El sistema SHALL permitir que las tareas generadas por pastel y piñata usen los horarios capturados en la seccion 15 como fuente de `scheduled_time`.

#### Scenario: Tarea de pastel usa horario de programa
- **WHEN** una regla activa se cumple porque el cliente indico que habra pastel y la tarea asociada define `schedule_source_field_key` hacia el horario de pastel
- **THEN** el sistema usa el horario de pastel capturado en la seccion 15 como `scheduled_time` de la tarea

#### Scenario: Tarea de pinata usa horario de programa
- **WHEN** una regla activa se cumple porque el cliente indico que traera piñata y la tarea asociada define `schedule_source_field_key` hacia el horario de piñata
- **THEN** el sistema usa el horario de piñata capturado en la seccion 15 como `scheduled_time` de la tarea

#### Scenario: Horario vacio mantiene comportamiento seguro
- **WHEN** una actividad aplica pero su horario de seccion 15 esta vacio
- **THEN** el sistema genera o actualiza la tarea sin usar un horario invalido y conserva la prioridad de `override_scheduled_time` cuando exista

### Requirement: Rules use selected dynamic program times
El sistema SHALL permitir que cada dinamica seleccionada genere una tarea programada con el horario capturado para esa dinamica en la seccion 15.

#### Scenario: Dinamica seleccionada usa su propio horario
- **WHEN** una regla activa se cumple por una dinamica seleccionada y la tarea asociada define `schedule_source_field_key` hacia el horario de esa dinamica
- **THEN** el sistema usa ese horario como `scheduled_time` de la tarea generada

#### Scenario: Dinamicas multiples conservan horarios independientes
- **WHEN** el cliente selecciona dos o mas dinamicas y captura horarios distintos para ellas
- **THEN** el sistema genera o actualiza las tareas de esas dinamicas con sus horarios correspondientes sin reutilizar el horario de otra dinamica

#### Scenario: Dinamica no seleccionada no genera tarea por horario residual
- **WHEN** existe un horario guardado para una dinamica pero la dinamica ya no esta seleccionada
- **THEN** el sistema no genera la tarea de esa dinamica solo por el horario residual

### Requirement: Initial rules map new activity times
El sistema SHALL sembrar o actualizar reglas iniciales para que pastel, piñata y dinamicas seleccionadas puedan tomar horarios desde los nuevos campos de programa.

#### Scenario: Sembrar fuentes de horario de pastel y pinata
- **WHEN** se ejecuta el seed de reglas de cuestionario
- **THEN** las tareas publicas relacionadas con pastel y piñata quedan configuradas con la fuente de horario capturada en la seccion 15

#### Scenario: Sembrar fuentes de horario por dinamica
- **WHEN** se ejecuta el seed de reglas de cuestionario
- **THEN** cada dinamica soportada queda configurada para usar su propio campo de horario de la seccion 15 cuando genere una tarea programada
