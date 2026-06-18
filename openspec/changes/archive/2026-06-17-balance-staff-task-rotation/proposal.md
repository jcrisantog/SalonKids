## Why

La autoasignacion actual reparte responsables con seleccion aleatoria, pero no considera que una persona haya hecho la misma actividad en eventos recientes. La duena necesita rotacion operativa real para que el personal no repita siempre lo mismo y una forma visible de revisar el historial antes o despues de asignar.

## What Changes

- Cambiar la seleccion aleatoria de responsables para usar historial reciente como senal de rotacion, evitando repetir la misma tarea o grupo operativo cuando sea posible.
- Consultar quienes realizaron actividades equivalentes en los ultimos 3 eventos anteriores al evento actual y priorizar personal que no haya hecho esa misma actividad recientemente.
- Mantener defaults, grupos de asignacion, cantidad requerida, modo completar/reemplazar y control manual existentes.
- Agregar una pantalla administrativa de historial por miembro del personal para los ultimos 5 eventos.
- Permitir imprimir o generar PDF del historial de tareas por staff, mostrando evento, fecha, actividad, grupo y responsables.
- Mostrar suficientes datos para que la administradora pueda verificar por que una asignacion fue o no fue equitativa.

## Capabilities

### New Capabilities

- `staff-task-history`: historial administrativo de tareas realizadas por cada miembro del personal y exportacion imprimible/PDF.

### Modified Capabilities

- `event-task-auto-responsible-assignment`: la autoasignacion deja de usar aleatoriedad pura como criterio principal y usa rotacion basada en tareas/grupos realizados en eventos recientes.
- `event-task-reporting`: la administradora puede consultar y exportar informacion historica de tareas por staff, no solo las tareas del evento actual.

## Impact

- Afecta `src/app/api/admin/events/[id]/tasks/assign-responsibles/route.ts` para cargar historial reciente y ordenar candidatos.
- Afecta las consultas de `event_tasks`, `event_task_staff`, `events`, `master_tasks` y grupos de tareas.
- Agrega endpoint(s) administrativos para consultar historial de tareas por staff.
- Agrega pantalla administrativa para historial de personal y accion de impresion/PDF.
- Puede requerir helpers compartidos para resolver equivalencia de actividad por `assignment_group_id`, fallback heredado o nombre de tarea.
