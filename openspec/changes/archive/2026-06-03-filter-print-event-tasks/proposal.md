## Why

La pantalla de tareas del evento ya permite gestionar actividades operativas, pero cuando la administradora necesita revisar o compartir solo una parte del plan no puede filtrar por responsable o visibilidad ni generar un documento presentable. Este cambio facilita preparar una lista clara para staff o cliente sin depender de una captura de pantalla.

## What Changes

- Agregar filtros en la pantalla de tareas del evento por responsable y visibilidad.
- Hacer que la tabla muestre solo las tareas que coinciden con los filtros aplicados.
- Agregar una accion para generar/imprimir un PDF basado en la tabla filtrada.
- El PDF debe incluir solo los campos Hora, Tarea, Descripcion y Responsable.
- El PDF debe tener un diseño estetico y colorido, con encabezado del evento, filtros aplicados y formato de tabla legible.
- Mantener la gestion actual de crear, editar y eliminar tareas sin cambios funcionales.

## Capabilities

### New Capabilities

- `event-task-reporting`: cubre filtros administrativos de tareas de evento y generacion de PDF estetico con la informacion filtrada.

### Modified Capabilities

Ninguna.

## Impact

- UI admin de tareas del evento: `src/app/admin/events/[id]/tasks/page.tsx`.
- Posible utilitario cliente para construir el documento PDF desde datos filtrados.
- Dependencias frontend si se decide usar una libreria de PDF; debe preferirse una solucion ligera y compatible con Next.js client components.
- Verificacion visual del PDF generado, incluyendo casos con filtros activos, sin filtros y sin resultados.
