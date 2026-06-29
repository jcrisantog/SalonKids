# add-admin-assistant-actions

## Why

La duena quiere poder hablarle al asistente administrativo para ejecutar trabajo operativo real, no solo recibir instrucciones. Casos como crear una tarea para el evento de Matias, asignarla a Juan y ponerle hora requieren convertir lenguaje natural en acciones sobre eventos, tareas y staff.

El cambio activo `add-admin-assistant-chatbot` propone una primera version informativa que no modifica datos. Esta propuesta agrega una segunda capa de acciones confirmables para que el asistente pueda operar dentro de limites seguros, reutilizando las APIs existentes del admin y evitando cambios accidentales.

## What Changes

- Agregar una capacidad de acciones administrativas al asistente para crear, reasignar, actualizar hora y eliminar tareas de evento.
- Permitir que el asistente cree personal, inactive personal y elimine personal cuando la accion sea confirmada.
- Interpretar instrucciones por texto o audio transcrito en una intencion estructurada antes de ejecutar.
- Resolver entidades ambiguas como evento, fecha, tarea y staff antes de pedir confirmacion.
- Mostrar una tarjeta de confirmacion con el plan exacto de cambios y ejecutar solo cuando la administradora confirme.
- Exigir confirmacion reforzada para acciones destructivas como eliminar tareas o eliminar personal.
- Registrar auditoria basica de solicitudes, planes, confirmaciones y resultados de acciones ejecutadas por el asistente.
- Mantener al asistente sin acceso directo libre a la base de datos: las acciones deben pasar por contratos validados y APIs/helper functions existentes.

## Capabilities

### New Capabilities

- `admin-assistant-actions`: permite que el asistente prepare y ejecute acciones administrativas confirmadas sobre tareas de evento y staff.

### Modified Capabilities

- `admin-assistant-chatbot`: el asistente deja de ser solamente informativo cuando la accion pertenece a una lista permitida y ha sido confirmada por la administradora.
- `staff-task-assignment`: las tareas de evento pueden recibir responsables desde una accion confirmada del asistente.
- `owner-facing-admin-simplification`: la experiencia administrativa agrega un flujo guiado por lenguaje natural para operaciones frecuentes.

## Impact

- Nueva logica de interpretacion de comandos administrativos en el backend.
- Nueva UI de planes de accion confirmables dentro del panel del asistente.
- Posible nueva tabla o mecanismo de auditoria para acciones del asistente.
- Reutiliza rutas y validaciones existentes para tareas de evento y staff cuando sea posible.
- No debe ejecutar cambios automaticos sin confirmacion explicita.
- No requiere subir codigo a Git ni GitHub.
