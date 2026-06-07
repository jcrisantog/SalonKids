## Why

Las administradoras ya cuentan con un catalogo de personas/staff, pero al crear tareas maestras y al editar actividades de un evento todavia tienen que capturar el responsable como texto o hacerlo desde otras pantallas. Esto provoca asignaciones inconsistentes y obliga a corregir responsables manualmente cuando una actividad cambia de manos.

## What Changes

- Permitir que al dar de alta o editar una tarea maestra se seleccione un responsable predeterminado desde el catalogo activo de Persona/staff.
- Mantener el rol responsable como apoyo operativo, pero diferenciarlo del staff concreto asignado.
- Permitir que en actividades de evento la administradora cambie el responsable asignado desde el catalogo de staff al crear o editar una actividad.
- Mostrar el nombre del responsable asignado en listados administrativos de tareas/actividades y dejar claro cuando solo existe un rol sugerido.
- Validar que los responsables seleccionados existan en el catalogo de staff y permitir limpiar la asignacion cuando la actividad queda sin responsable definido.
- Conservar compatibilidad con tareas existentes que solo tienen `default_role` o `role_responsible`.

## Capabilities

### New Capabilities

- `staff-task-assignment`: cubre la asignacion de responsables concretos desde el catalogo de staff para tareas maestras y actividades de evento.

### Modified Capabilities

- `questionnaire-task-rules`: ajusta la generacion de tareas para respetar responsables predeterminados de tareas maestras cuando existan y seguir usando rol sugerido como fallback.

## Impact

- Modelo de datos: `master_tasks` necesitara guardar un responsable predeterminado opcional relacionado con `staff.id`; `event_tasks.staff_id` ya existe.
- APIs admin de tareas maestras: `src/app/api/admin/tasks/route.ts` y `src/app/api/admin/tasks/[id]/route.ts`.
- UI admin de tareas maestras: `src/app/admin/tasks/page.tsx`.
- APIs admin de actividades de evento: `src/app/api/admin/events/[id]/tasks/route.ts` y `src/app/api/admin/events/[id]/tasks/[taskId]/route.ts`.
- UI admin de actividades de evento: `src/app/admin/events/[id]/tasks/page.tsx`.
- Motor de reglas: `src/lib/rule-engine.ts` para propagar responsable predeterminado cuando se generen actividades desde reglas.
- Pruebas o verificaciones manuales de alta/edicion de tareas, edicion de actividades y sincronizacion de reglas.
