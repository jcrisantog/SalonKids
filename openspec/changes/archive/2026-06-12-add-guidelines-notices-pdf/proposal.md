## Why

La duena necesita capturar lineamientos y avisos operativos una sola vez desde el panel administrativo, para poder anexarlos al PDF de tareas cuando quiera compartir instrucciones completas del evento.

## What Changes

- Agregar una nueva opcion de menu administrativo llamada "Lineamientos y Avisos".
- Permitir que la duena capture, edite y guarde Lineamientos y Avisos con editor enriquecido tipo WYSIWYG.
- Al generar el PDF de Tareas del Evento, preguntar si desea incluir los lineamientos y avisos guardados.
- Si la duena confirma, incluir el texto guardado dentro del PDF generado.
- Si no hay lineamientos guardados o la duena decide no incluirlos, el PDF de tareas se genera como actualmente.

## Capabilities

### New Capabilities
- `admin-guidelines-notices`: Administracion de contenido enriquecido de lineamientos y avisos desde una nueva opcion del menu.

### Modified Capabilities
- `event-task-reporting`: El flujo de generacion de PDF de tareas preguntara si se incluyen lineamientos y avisos, y los agregara al PDF cuando corresponda.

## Impact

- Nueva pantalla administrativa bajo `src/app/admin`.
- Nueva opcion de navegacion en `src/app/admin/layout.tsx`.
- Persistencia de lineamientos y avisos enriquecidos en base de datos o configuracion administrable.
- Nueva ruta API admin para leer y guardar el texto.
- Ajuste al generador de PDF en `src/app/admin/events/[id]/tasks/page.tsx`.
