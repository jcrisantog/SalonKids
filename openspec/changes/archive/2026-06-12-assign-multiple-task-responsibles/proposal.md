## Why

La duena necesita distribuir el trabajo real de cada evento entre una o varias personas por actividad, porque algunas tareas requieren solo un responsable y otras requieren equipos de tamano variable. Hoy el sistema modela un unico responsable, lo que obliga a perder informacion, duplicar tareas o corregir manualmente despues.

## What Changes

- Permitir que las tareas maestras tengan varios responsables predeterminados del catalogo de staff, no solo uno.
- Agregar un campo de cantidad requerida de responsables por tarea maestra para indicar cuantos responsables debe intentar asignar el sistema en eventos.
- Permitir que cada tarea de evento guarde y edite varios responsables concretos.
- Agregar una accion en las tareas de un evento seleccionado para asignar responsables automaticamente de forma aleatoria usando staff activo, la cantidad requerida por tarea y los defaults configurados cuando existan.
- Mantener edicion manual por tarea de evento para agregar, quitar o cambiar responsables despues de la asignacion automatica.
- Actualizar listados, filtros, busquedas y reportes para mostrar y encontrar tareas con multiples responsables.
- Propagar responsables multiples desde tareas maestras y reglas de cuestionario al generar tareas de evento.

## Capabilities

### New Capabilities

- `event-task-auto-responsible-assignment`: cubre la accion asistida para asignar responsables automaticamente a las tareas de un evento seleccionado.

### Modified Capabilities

- `staff-task-assignment`: cambia de responsable unico a multiples responsables en tareas maestras y tareas de evento, con validacion y edicion manual.
- `questionnaire-task-rules`: cambia la propagacion de responsables para generar tareas de evento con listas de responsables desde defaults u overrides.
- `event-task-reporting`: cambia la visualizacion, busqueda, filtrado e impresion de tareas para soportar varios responsables por tarea.

## Impact

- Modelo de datos y migraciones para reemplazar o complementar `default_staff_id` y `event_tasks.staff_id` con relaciones muchos-a-muchos, ademas de guardar la cantidad requerida de responsables por tarea maestra.
- APIs administrativas de tareas maestras, reglas de cuestionario y tareas de evento para aceptar arreglos de staff y validar IDs.
- Pantallas administrativas de tareas maestras, reglas y tareas de evento para seleccionar multiples responsables y editar asignaciones.
- Motor de reglas de cuestionario para crear o actualizar tareas con responsables multiples sin duplicar ni perder overrides manuales.
- Generacion de PDF, busqueda y filtros de tablas para mostrar nombres concatenados y encontrar coincidencias por cualquiera de los responsables asignados.
