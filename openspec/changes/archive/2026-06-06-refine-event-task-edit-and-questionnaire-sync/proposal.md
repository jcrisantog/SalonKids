## Why

La operacion diaria necesita que la administradora edite actividades de evento con menos friccion y que las tareas generadas desde cuestionario no se dupliquen cuando ya fueron ajustadas manualmente. Ademas, el cronograma publico del cuestionario todavia no esta validado con la duena y debe ocultarse temporalmente sin eliminar la funcionalidad.

## What Changes

- Al editar una tarea de evento, la pantalla debe desplazarse automaticamente hacia el formulario de edicion para que la administradora pueda modificarla de inmediato.
- Al guardar el cuestionario, la sincronizacion no debe duplicar actividades si ya existe una tarea equivalente del mismo origen, incluso si fue modificada manualmente.
- Si una actividad generada fue editada manualmente y por ello queda marcada como manual, futuros guardados del cuestionario no deben crear una segunda copia generada por motor.
- En la vista publica del cuestionario se debe ocultar el bloque de cronograma sin quitar la logica ni los datos del backend.

## Capabilities

### New Capabilities

### Modified Capabilities
- `event-task-reporting`: La pantalla de tareas de evento debe enfocar el formulario al iniciar edicion.
- `questionnaire-task-rules`: Las tareas configurables generadas desde cuestionario deben sincronizarse sin duplicar tareas manualmente editadas.
- `client-event-questionnaire`: El cronograma publico del cuestionario debe poder ocultarse de la interfaz del cliente sin eliminar la funcionalidad.

## Impact

- Afecta `src/app/admin/events/[id]/tasks/page.tsx` para el flujo de edicion de tareas de evento.
- Afecta `src/lib/rule-engine.ts` y/o rutas de guardado de cuestionario para deduplicacion de tareas configurables.
- Afecta `src/app/event/[token]/QuestionnaireClient.tsx` para ocultar temporalmente el componente de cronograma.
- No requiere migraciones de base de datos si la deduplicacion puede resolverse con los campos existentes de tareas generadas/manuales.
