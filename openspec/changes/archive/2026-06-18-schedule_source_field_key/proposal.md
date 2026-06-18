# schedule_source_field_key

## Why
Algunas tareas generadas por respuestas del cuestionario necesitan tomar su horario de un campo relacionado, no necesariamente del campo que dispara la regla. Por ejemplo, una regla disparada por `presentation = true` debe poder usar `presentationTime`.

Tambien se requiere separar "Otra actividad" en descripcion y horario para que esa actividad pueda generar una tarea programada con hora real.

## What Changes
- Agregar una fuente configurable de horario por relacion regla-tarea.
- Usar esa fuente al generar tareas antes de caer al horario del campo disparador.
- Separar "Otra actividad" en dos respuestas: descripcion/nombre y horario.
- Actualizar seeds, documentacion y especificaciones para las tareas del programa.

## Impact
- Cambia el esquema de `questionnaire_task_rule_tasks`.
- Cambian APIs y pantalla admin de reglas del cuestionario.
- Cambia la metadata del cuestionario y el motor de generacion de tareas.
