## MODIFIED Requirements

### Requirement: Rules generate master tasks
El sistema SHALL permitir que cada regla genere una o mas tareas desde el catalogo `master_tasks`, con overrides opcionales de hora, visibilidad, descripcion, orden y responsables asignados por cada tarea asociada.

#### Scenario: Generar una tarea desde catalogo
- **WHEN** una respuesta cumple una regla activa con una tarea maestra asociada
- **THEN** el sistema crea una tarea de evento basada en esa tarea maestra

#### Scenario: Generar varias tareas desde una pregunta
- **WHEN** una respuesta cumple una regla activa que tiene dos o mas tareas maestras asociadas a la regla
- **THEN** el sistema crea una tarea de evento por cada tarea maestra asociada a la regla

#### Scenario: Aplicar overrides independientes por tarea
- **WHEN** la relacion regla-tarea define hora, responsables asignados, visibilidad o descripcion para una tarea asociada
- **THEN** el sistema usa esos valores solo para esa tarea y conserva los valores de las demas tareas asociadas

#### Scenario: Respetar orden operativo
- **WHEN** una regla tiene multiples tareas asociadas con `sort_order`
- **THEN** el sistema muestra y genera las tareas en el orden configurado

#### Scenario: Propagar responsables predeterminados de tarea maestra
- **WHEN** una respuesta cumple una regla cuya tarea maestra tiene responsables predeterminados y la relacion regla-tarea no define responsables distintos
- **THEN** el sistema crea o actualiza la tarea de evento con esa lista de responsables

#### Scenario: Usar override de responsables de regla
- **WHEN** una respuesta cumple una regla cuya relacion regla-tarea define responsables override
- **THEN** el sistema crea o actualiza la tarea de evento con esa lista aunque la tarea maestra tenga otros responsables predeterminados

#### Scenario: Crear tarea sin staff asignado
- **WHEN** una regla genera una tarea sin responsables por override ni por tarea maestra
- **THEN** el sistema crea o actualiza la tarea de evento sin responsables asignados y sin requerir un responsable visible

#### Scenario: Preservar responsables manuales en tarea generada
- **WHEN** una tarea generada por una regla fue editada manualmente y tiene responsables personalizados
- **THEN** futuros guardados de cuestionario no reemplazan esa lista de responsables
