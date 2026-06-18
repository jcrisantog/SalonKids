# Design

## Schedule source per rule task
`questionnaire_task_rule_tasks` tendra una columna nullable `schedule_source_field_key`.

Al generar una tarea configurable, el horario se resolvera en este orden:

1. `override_scheduled_time`
2. `schedule_source_field_key` si apunta a una respuesta con formato de hora
3. `field_key` de la regla si la respuesta disparadora es una hora
4. `null`

Esto conserva compatibilidad con reglas existentes y permite que una tarea generada por un booleano use un campo de hora relacionado.

## Otra actividad
El cuestionario conservara `otherActivityTime` como campo de hora y agregara `otherActivityName` como texto. Para compatibilidad, si no existe nombre nuevo pero hay texto legado en `otherActivityTime`, el motor puede tratarlo como descripcion sin usarlo como hora.

La regla sembrada para "Otra actividad programada" se disparara por `otherActivityName` y tomara horario desde `otherActivityTime`.
