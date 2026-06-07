## Why

Las tareas reactivas del cuestionario hoy estan definidas en codigo dentro de `rule-engine.ts`, por lo que cada ajuste requiere desarrollo. La duena necesita poder configurar que preguntas generan tareas, distinguir preguntas informativas y mantener esa configuracion cuando se agreguen nuevas preguntas al cuestionario.

## What Changes

- Agregar un modulo administrativo para configurar reglas pregunta -> tarea del cuestionario.
- Permitir que cada regla use una condicion simple sobre un campo del cuestionario.
- Permitir que cada regla genere una o mas tareas maestras existentes del catalogo `master_tasks`.
- Permitir overrides por tarea generada: hora sugerida, responsable sugerido, visibilidad y descripcion opcional.
- Reemplazar la generacion hardcodeada de tareas reactivas por un motor que lea reglas activas desde base de datos.
- Mantener proteccion de tareas manuales mediante `is_manual_override`.
- Cargar una configuracion inicial basada en la matriz operativa del cuestionario actual.
- Aplicar cambios de reglas solo en futuros guardados del cuestionario o eventos nuevos; no recalcular eventos antiguos automaticamente.

## Capabilities

### New Capabilities

- `questionnaire-task-rules`: Gestion administrativa de reglas configurables que relacionan respuestas del cuestionario con tareas operativas y actividades publicas.

### Modified Capabilities

- `client-event-questionnaire`: La sincronizacion de tareas reactivas pasa a depender de reglas configurables en lugar de reglas hardcodeadas.

## Impact

- Nuevas tablas en `schema.sql` para reglas y tareas asociadas a reglas.
- Nueva pantalla admin para crear, editar, activar/desactivar y eliminar reglas.
- Nuevas rutas API admin para administrar reglas.
- Cambios en `src/lib/rule-engine.ts` para evaluar reglas desde base de datos.
- Cambios menores en `src/app/api/client-events/[token]/questionnaire/route.ts` para usar el motor configurable sin cambiar el contrato publico.
- Reutiliza `questionnaireSections` como fuente de preguntas configurables y `master_tasks` como catalogo de tareas.
