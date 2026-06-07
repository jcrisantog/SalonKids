## MODIFIED Requirements

### Requirement: Rules generate master tasks
El sistema SHALL permitir que cada regla genere una o mas tareas desde el catalogo `master_tasks`, con overrides opcionales de hora, responsable, visibilidad, descripcion, orden y staff asignado por cada tarea asociada.

#### Scenario: Generar una tarea desde catalogo
- **WHEN** una respuesta cumple una regla activa con una tarea maestra asociada
- **THEN** el sistema crea una tarea de evento basada en esa tarea maestra

#### Scenario: Generar varias tareas desde una pregunta
- **WHEN** una respuesta cumple una regla activa que tiene dos o mas tareas maestras asociadas a la regla
- **THEN** el sistema crea una tarea de evento por cada tarea maestra asociada a la regla

#### Scenario: Aplicar overrides independientes por tarea
- **WHEN** la relacion regla-tarea define hora, responsable, staff asignado, visibilidad o descripcion para una tarea asociada
- **THEN** el sistema usa esos valores solo para esa tarea y conserva los valores de las demas tareas asociadas

#### Scenario: Respetar orden operativo
- **WHEN** una regla tiene multiples tareas asociadas con `sort_order`
- **THEN** el sistema muestra y genera las tareas en el orden configurado

#### Scenario: Propagar responsable predeterminado de tarea maestra
- **WHEN** una respuesta cumple una regla cuya tarea maestra tiene `default_staff_id` y la relacion regla-tarea no define un staff asignado distinto
- **THEN** el sistema crea o actualiza la tarea de evento con ese `staff_id`

#### Scenario: Usar override de staff de regla
- **WHEN** una respuesta cumple una regla cuya relacion regla-tarea define `override_staff_id`
- **THEN** el sistema crea o actualiza la tarea de evento con ese `staff_id` aunque la tarea maestra tenga otro responsable predeterminado

#### Scenario: Conservar fallback de rol responsable
- **WHEN** una regla genera una tarea sin staff asignado por override ni por tarea maestra
- **THEN** el sistema crea o actualiza la tarea de evento sin `staff_id` y con `role_responsible` basado en el override de rol, el rol default de tarea maestra o el fallback operativo
