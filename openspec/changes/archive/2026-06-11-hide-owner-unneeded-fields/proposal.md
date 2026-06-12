## Why

La dueña necesita operar el panel sin campos y secciones que agregan complejidad pero no aportan a su flujo diario. Este cambio reduce ruido visual, evita validaciones innecesarias y mantiene la asignación real por persona como fuente principal para tareas y PDF.

## What Changes

- Eliminar la sección de navegación o pantalla de Live Matriz de la experiencia administrativa.
- Quitar de Integraciones las secciones de Pulido visual, Checklist movil / Lighthouse y Checklist de impresion fisica.
- Ocultar el campo Rol en el registro de personal y dejar de requerirlo al crear o editar personal.
- Ocultar Area y Rol default en el registro de Tareas Maestras y dejar de requerirlos.
- Ocultar Responsable en las reglas del cuestionario y dejar de requerirlo.
- Ocultar Rol responsable en Tareas del Evento y dejar de requerirlo.
- Cambiar la generacion de PDF para que la columna Responsable muestre la persona asignada a la tarea; si no hay persona asignada, debe mostrar `S/R`.

## Capabilities

### New Capabilities
- `owner-facing-admin-simplification`: Cubre la eliminacion u ocultamiento de secciones administrativas que no son necesarias para la dueña.

### Modified Capabilities
- `staff-task-assignment`: El registro de personal ya no debe requerir ni mostrar rol principal como dato operativo para asignaciones.
- `operational-task-seeding`: El catalogo de Tareas Maestras ya no debe requerir ni mostrar Area o Rol default en el formulario principal.
- `questionnaire-task-rules`: Las reglas de cuestionario ya no deben mostrar ni requerir Responsable como override configurable.
- `event-task-reporting`: Las tareas del evento ya no deben mostrar ni requerir Rol responsable, y el PDF debe reportar responsable por persona asignada o `S/R`.
- `admin-table-search`: Las busquedas y tablas administrativas deben dejar de depender de campos ocultos cuando esos campos ya no sean parte de la experiencia visible.

## Impact

- Pantallas administrativas bajo `src/app/admin`, especialmente Integraciones, Personal, Tareas Maestras, Reglas Cuestionario y Tareas del Evento.
- APIs de admin para personal, tareas maestras, reglas de cuestionario y tareas de evento, para relajar validaciones de campos ocultos.
- Logica de generacion de PDF/listado imprimible de tareas del evento.
- Specs existentes de asignacion de personal, reglas de cuestionario, tareas operativas, reportes de tareas y busqueda administrativa.
