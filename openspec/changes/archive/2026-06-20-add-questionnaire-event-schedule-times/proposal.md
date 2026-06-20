## Why

La seccion 15 del cuestionario ya concentra el programa de actividades, pero faltan horarios operativos para piñata, pastel y las dinamicas seleccionadas en la seccion 13. Sin esos horarios, el equipo debe completar la agenda manualmente aunque el cliente ya haya confirmado que esas actividades ocurriran.

## What Changes

- Agregar en la seccion 15 campos de horario para piñata y pastel cuando las respuestas previas indiquen que si habra esas actividades.
- Agregar en la seccion 15 campos de horario para cada dinamica seleccionada en la seccion 13.
- Guardar esos horarios como valores estructurados de tiempo dentro del payload del cuestionario.
- Permitir que las reglas de tareas usen esos horarios como fuente para tareas programadas relacionadas.
- Mantener compatibilidad con cuestionarios existentes dejando los nuevos campos vacios por defecto.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `client-event-questionnaire`: la seccion de programa de actividades debe capturar horarios condicionales para piñata, pastel y dinamicas seleccionadas.
- `questionnaire-task-rules`: las reglas configurables deben poder usar los nuevos campos de horario como fuentes de agenda para tareas generadas.

## Impact

- Metadata y renderizado del cuestionario publico.
- Modelo/defaults del payload de respuestas del cuestionario.
- Sincronizacion de tareas generadas desde respuestas del cuestionario.
- Seeds o configuracion inicial de reglas que relacionan actividades programadas con tareas operativas.
