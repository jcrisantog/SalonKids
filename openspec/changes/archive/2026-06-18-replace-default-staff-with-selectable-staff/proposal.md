## Why

La duena ya no necesita responsables predeterminados por tarea; necesita limitar que personas pueden participar en la autoasignacion de cada actividad. Esto evita que una tarea especializada se asigne a personal no apto, sin perder la rotacion equitativa entre quienes si pueden hacerla.

## What Changes

- Cambiar el significado visible de los responsables default de tareas maestras a `Personal seleccionable`.
- Cuando una tarea maestra no tenga personal seleccionable, la autoasignacion SHALL considerar a todo el staff activo.
- Cuando una tarea maestra tenga personal seleccionable, la autoasignacion SHALL considerar solo a esas personas activas para esa tarea.
- Cambiar los overrides de staff en relaciones regla-tarea para que funcionen como personal seleccionable especifico de esa regla, no como responsables ya asignados.
- Dejar de crear tareas generadas por cuestionario con responsables asignados automaticamente desde defaults o overrides; la asignacion concreta queda para la autoasignacion o ajustes manuales.
- Mantener la asignacion manual en tareas de evento como responsable real, separada del personal seleccionable.
- **BREAKING**: Las listas actuales guardadas en `master_task_default_staff` y `questionnaire_task_rule_task_staff` cambian de semantica: ya no son responsables preferidos/default, sino candidatos permitidos para autoasignacion.

## Capabilities

### New Capabilities

- `selectable-staff-for-tasks`: Cubre la configuracion de personal seleccionable por tarea maestra y por relacion regla-tarea.

### Modified Capabilities

- `staff-task-assignment`: Cambia el significado de responsables predeterminados en tareas maestras hacia personal seleccionable.
- `questionnaire-task-rules`: Cambia la generacion de tareas para no propagar responsables asignados desde tareas maestras o reglas.
- `event-task-auto-responsible-assignment`: Cambia el algoritmo para limitar candidatos por personal seleccionable antes de aplicar rotacion.

## Impact

- UI administrativa de Tareas Maestras: etiquetas, ayudas, listado y formulario de seleccion de personal.
- UI administrativa de Reglas Cuestionario: etiquetas y comportamiento del selector de staff por tarea asociada.
- APIs administrativas de tareas maestras y reglas: payloads y nombres compatibles con campos actuales, con nueva semantica.
- Motor de reglas del cuestionario: generacion/sincronizacion de tareas sin responsables concretos salvo ajustes manuales existentes.
- Endpoint de autoasignacion: calcular candidatos permitidos por tarea o grupo antes de ordenar por historial y carga.
- Base de datos: puede reutilizar las tablas relacionales actuales como almacenamiento de personal seleccionable, con posible renombrado logico en codigo y textos.
