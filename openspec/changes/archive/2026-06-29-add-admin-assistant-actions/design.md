# Design

## Relationship with the informational assistant

Este cambio depende conceptualmente de `add-admin-assistant-chatbot`. El chatbot sigue siendo la entrada global por texto/audio y la fuente de ayuda contextual. Esta propuesta agrega un modo accionable para instrucciones que coincidan con operaciones permitidas.

Cuando el mensaje no represente una accion soportada, el asistente debe responder como guia informativa. Cuando represente una accion soportada, debe producir un plan estructurado y pedir confirmacion.

## Interaction model

El flujo de una accion sera:

1. Recibir texto escrito o transcripcion de audio.
2. Clasificar la intencion: crear evento, modificar evento, eliminar evento, crear tarea, reasignar tarea, cambiar hora, eliminar tarea, crear staff, inactivar staff o eliminar staff.
3. Extraer datos candidatos: evento, cliente, festejado, edad, fecha, horarios, tarea, staff, motivo o descripcion.
4. Resolver entidades contra datos reales del sistema.
5. Si hay ambiguedad, pedir una aclaracion antes de generar el plan.
6. Mostrar una tarjeta de confirmacion con los cambios exactos.
7. Ejecutar solo si la administradora confirma.
8. Mostrar resultado y registrar auditoria.

Ejemplo:

```text
Para el evento de Matias del 15 de septiembre crea la tarea Ofrecer fruta cuando lleguen los invitados y asignasela a Juan, la tarea se iniciara a las 2:15 pm
```

Plan esperado:

```json
{
  "type": "create_event_task",
  "eventId": "resolved-event-id",
  "eventLabel": "Matias - 2026-09-15",
  "taskName": "Ofrecer fruta cuando lleguen los invitados",
  "scheduledTime": "14:15",
  "staffIds": ["resolved-staff-id"],
  "staffLabels": ["Juan"],
  "visibility": "interna"
}
```

## Supported actions

La primera version accionable debe limitarse a operaciones concretas:

- Crear tarea de evento.
- Reasignar responsables de una tarea de evento.
- Cambiar hora de una tarea de evento.
- Eliminar tarea de evento.
- Crear evento.
- Modificar evento.
- Eliminar evento.
- Crear persona de staff.
- Inactivar persona de staff.
- Eliminar persona de staff.
- Buscar/listar candidatos cuando una instruccion sea ambigua.

Otras solicitudes deben responderse como ayuda o indicar que todavia no estan soportadas.

## Entity resolution

El asistente debe resolver entidades con datos reales:

- Evento por nombre del festejado, fecha y, si existe, hora o estado.
- Tarea por nombre dentro del evento seleccionado.
- Staff por nombre exacto o coincidencia cercana entre personal existente.
- Datos de evento por campos reales del formulario: festejado, edad, fecha, hora inicio, hora fin, cliente, telefono, email, papas y estatus.

Si una fecha no incluye ano, el sistema puede sugerir el siguiente evento futuro que coincida. Si hay dos o mas coincidencias razonables, debe pedir seleccion explicita.

## Confirmation and safety

Ninguna accion escribe datos durante la interpretacion. La respuesta de interpretacion solo puede generar:

- Una respuesta informativa.
- Una pregunta de aclaracion.
- Un plan pendiente de confirmacion.

Las acciones destructivas requieren confirmacion reforzada:

- Eliminar tarea.
- Eliminar evento.
- Eliminar staff.
- Inactivar staff cuando tenga tareas asignadas futuras o activas.

La UI debe distinguir visualmente acciones destructivas y usar botones claros como Confirmar y Cancelar. El texto de confirmacion debe incluir evento, tarea/persona afectada y consecuencia.

## Execution boundary

El modelo no debe recibir permiso para ejecutar SQL arbitrario ni escribir directo en Supabase. El backend debe validar cada plan con un contrato cerrado antes de ejecutar.

Las ejecuciones deben reutilizar helpers o rutas existentes cuando sea practico:

- `POST /api/admin/events/[id]/tasks` para crear tareas.
- `PATCH /api/admin/events/[id]/tasks/[taskId]` para actualizar tarea, hora y responsables.
- `DELETE /api/admin/events/[id]/tasks/[taskId]` para eliminar tarea.
- `POST /api/admin/events` para crear eventos.
- `PATCH /api/admin/events/[id]` para modificar eventos.
- `DELETE /api/admin/events/[id]` para eliminar eventos.
- `POST /api/admin/staff` para crear staff.
- `PATCH /api/admin/staff/[id]` para inactivar o editar staff.
- `DELETE /api/admin/staff/[id]` para eliminar staff.

Si se crea una API nueva para el asistente, debe funcionar como orquestador validado y no duplicar reglas de negocio innecesariamente.

## API shape

Se propone separar interpretacion y ejecucion:

`POST /api/admin/assistant/actions/plan`

```json
{
  "message": "Reasigna la tarea de pastel a Ana en el evento de Matias",
  "currentPath": "/admin/events",
  "conversationId": "session-id"
}
```

Respuesta posible:

```json
{
  "kind": "confirmation_required",
  "planId": "pending-plan-id",
  "summary": "Reasignar Pastel a Ana en Matias - 2026-09-15",
  "action": {
    "type": "reassign_event_task",
    "eventId": "event-id",
    "taskId": "task-id",
    "staffIds": ["staff-id"]
  },
  "requiresStrongConfirmation": false
}
```

`POST /api/admin/assistant/actions/execute`

```json
{
  "planId": "pending-plan-id",
  "confirmation": "confirmed"
}
```

El backend debe volver a validar el plan antes de ejecutar para evitar planes vencidos o manipulados desde el cliente.

## Audit

Cada ejecucion confirmada debe guardar como minimo:

- Usuario admin que confirmo.
- Fecha/hora.
- Mensaje original.
- Tipo de accion.
- Entidades afectadas.
- Resultado exitoso o error.

La auditoria puede iniciar como tabla dedicada o como mecanismo interno si ya existe un patron de historiales. Debe evitar guardar informacion sensible innecesaria.

## UI states

El panel del asistente debe contemplar:

- Respuesta informativa.
- Aclaracion requerida.
- Plan pendiente de confirmacion.
- Confirmando/ejecutando.
- Accion completada.
- Accion cancelada.
- Error recuperable.
- Accion no soportada.

## Non-goals

- No ejecutar acciones sin confirmacion.
- No permitir SQL libre ni acciones genericas fuera de la lista permitida.
- No crear reglas de cuestionario, tareas maestras ni grupos de tareas desde lenguaje natural en esta primera version.
- No reemplazar las pantallas administrativas existentes.
