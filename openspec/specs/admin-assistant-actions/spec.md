## Requirements

### Requirement: Assistant can prepare supported admin actions
El sistema SHALL permitir que el asistente interprete instrucciones administrativas de texto o audio transcrito y las convierta en planes estructurados solo para acciones soportadas.

#### Scenario: Crear tarea de evento desde instruccion natural
- **WHEN** la duena pide crear una tarea para un evento indicando evento, tarea, responsable y hora
- **THEN** el sistema prepara un plan de creacion de tarea con evento, nombre de tarea, hora y responsables resueltos

#### Scenario: Crear evento desde instruccion natural
- **WHEN** la duena pide crear un evento indicando festejado y fecha
- **THEN** el sistema prepara un plan de creacion de evento con los campos resueltos y horarios default si no fueron indicados

#### Scenario: Solicitud fuera de acciones soportadas
- **WHEN** la duena pide una accion administrativa que no pertenece a la lista permitida
- **THEN** el asistente responde que la accion no esta soportada todavia y ofrece pasos manuales o ayuda informativa

#### Scenario: Interpretacion no escribe datos
- **WHEN** el sistema interpreta una instruccion accionable
- **THEN** no crea, actualiza, inactiva ni elimina registros hasta recibir confirmacion explicita

### Requirement: Assistant resolves real admin entities before confirmation
El sistema SHALL resolver eventos, tareas de evento y staff contra datos reales antes de mostrar un plan ejecutable.

#### Scenario: Evento identificado por nombre y fecha
- **WHEN** la instruccion menciona un festejado y una fecha que coinciden con un unico evento
- **THEN** el plan usa el ID real del evento y muestra una etiqueta legible con nombre y fecha

#### Scenario: Evento ambiguo
- **WHEN** la instruccion coincide con dos o mas eventos razonables
- **THEN** el asistente pide a la duena elegir el evento antes de preparar el plan ejecutable

#### Scenario: Staff ambiguo
- **WHEN** la instruccion menciona un nombre de staff que coincide con varias personas
- **THEN** el asistente pide seleccionar la persona correcta antes de preparar o ejecutar la accion

#### Scenario: Tarea no encontrada para reasignacion
- **WHEN** la duena pide reasignar o eliminar una tarea que no existe en el evento resuelto
- **THEN** el asistente informa que no encontro la tarea y no genera plan ejecutable

### Requirement: Assistant requires explicit confirmation before executing
El sistema SHALL mostrar un resumen confirmable de cada accion y ejecutar solo cuando la administradora confirme.

#### Scenario: Confirmar creacion de tarea
- **WHEN** el asistente muestra un plan de crear tarea y la duena confirma
- **THEN** el sistema crea la tarea en el evento con los datos confirmados

#### Scenario: Cancelar accion pendiente
- **WHEN** el asistente muestra un plan pendiente y la duena cancela
- **THEN** el sistema descarta el plan sin modificar datos

#### Scenario: Plan manipulado o vencido
- **WHEN** el cliente intenta ejecutar un plan inexistente, vencido o alterado
- **THEN** el sistema rechaza la ejecucion y no modifica datos

### Requirement: Destructive assistant actions require stronger confirmation
El sistema SHALL exigir confirmacion reforzada para eliminar tareas, eliminar staff o inactivar staff con impacto operativo relevante.

#### Scenario: Eliminar tarea requiere confirmacion reforzada
- **WHEN** la duena pide eliminar una tarea de evento
- **THEN** el asistente muestra una advertencia con evento y tarea afectada y requiere confirmacion reforzada antes de eliminar

#### Scenario: Eliminar staff requiere confirmacion reforzada
- **WHEN** la duena pide eliminar una persona de staff
- **THEN** el asistente muestra una advertencia con la persona afectada y requiere confirmacion reforzada antes de eliminar

#### Scenario: Inactivar staff con tareas futuras
- **WHEN** la duena pide inactivar staff que tiene tareas asignadas en eventos futuros o activos
- **THEN** el asistente informa el impacto y requiere confirmacion reforzada antes de inactivar

### Requirement: Assistant can manage event tasks through validated actions
El sistema SHALL permitir crear, reasignar, cambiar hora y eliminar tareas de evento mediante acciones confirmadas del asistente.

#### Scenario: Crear tarea con responsable y hora
- **WHEN** la duena confirma un plan de crear tarea con responsable y hora
- **THEN** el sistema crea una tarea manual del evento con `is_manual_override` activo, hora normalizada y responsables asignados

#### Scenario: Reasignar responsables
- **WHEN** la duena confirma un plan de reasignar una tarea existente
- **THEN** el sistema actualiza los responsables de la tarea y conserva la tarea como ajuste manual cuando corresponda

#### Scenario: Cambiar hora de tarea
- **WHEN** la duena confirma un plan de cambiar hora
- **THEN** el sistema actualiza la hora programada de la tarea usando formato valido

#### Scenario: Eliminar tarea confirmada
- **WHEN** la duena completa la confirmacion reforzada de eliminar tarea
- **THEN** el sistema elimina solo la tarea indicada del evento indicado

### Requirement: Assistant can manage events through validated actions
El sistema SHALL permitir crear, modificar y eliminar eventos mediante acciones confirmadas del asistente.

#### Scenario: Crear evento
- **WHEN** la duena confirma un plan para crear evento con festejado, fecha y horarios
- **THEN** el sistema crea el evento con los datos confirmados y sincroniza las tareas base aplicables

#### Scenario: Modificar evento
- **WHEN** la duena confirma un plan para modificar fecha, hora, festejado, edad, cliente o estatus de un evento existente
- **THEN** el sistema actualiza solo el evento resuelto usando valores validados y sincroniza tareas base si corresponde

#### Scenario: Eliminar evento
- **WHEN** la duena completa la confirmacion reforzada para eliminar un evento
- **THEN** el sistema elimina solo el evento indicado o muestra un error claro si la base de datos impide eliminarlo

### Requirement: Assistant can manage staff through validated actions
El sistema SHALL permitir crear, inactivar y eliminar staff mediante acciones confirmadas del asistente.

#### Scenario: Crear staff
- **WHEN** la duena confirma un plan para crear una persona de staff
- **THEN** el sistema crea el registro activo con nombre validado y valores internos por default cuando apliquen

#### Scenario: Inactivar staff
- **WHEN** la duena confirma un plan para inactivar una persona de staff
- **THEN** el sistema actualiza el registro para que no aparezca como staff activo disponible

#### Scenario: Eliminar staff
- **WHEN** la duena completa la confirmacion reforzada para eliminar una persona de staff
- **THEN** el sistema elimina solo el registro de staff indicado o muestra un error claro si la base de datos impide eliminarlo

### Requirement: Assistant action execution is audited
El sistema SHALL registrar las acciones confirmadas y ejecutadas por el asistente para permitir seguimiento operativo.

#### Scenario: Accion exitosa auditada
- **WHEN** una accion confirmada se ejecuta correctamente
- **THEN** el sistema registra usuario admin, fecha/hora, mensaje original, tipo de accion, entidades afectadas y resultado exitoso

#### Scenario: Accion fallida auditada
- **WHEN** una accion confirmada falla durante la ejecucion
- **THEN** el sistema registra el intento con resultado fallido y muestra un error claro a la duena

#### Scenario: Accion cancelada no se audita como ejecutada
- **WHEN** la duena cancela un plan pendiente
- **THEN** el sistema no registra una accion ejecutada ni modifica datos
