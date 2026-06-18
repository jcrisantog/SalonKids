## ADDED Requirements

### Requirement: Master tasks define selectable staff
El sistema SHALL permitir que una administradora configure cero, una o varias personas seleccionables para una tarea maestra.

#### Scenario: Tarea maestra sin personal seleccionable
- **WHEN** una administradora guarda una tarea maestra sin seleccionar personal
- **THEN** el sistema interpreta que todo el staff activo puede ser considerado por la autoasignacion para esa tarea

#### Scenario: Tarea maestra con personal seleccionable
- **WHEN** una administradora guarda una tarea maestra con una lista de personas seleccionables
- **THEN** el sistema guarda esa lista como los unicos candidatos permitidos para autoasignar esa tarea

#### Scenario: Editar personal seleccionable
- **WHEN** una administradora agrega, quita o limpia personas seleccionables de una tarea maestra
- **THEN** el sistema actualiza la lista sin modificar responsables ya asignados manualmente en eventos existentes

### Requirement: Rule task relations can override selectable staff
El sistema SHALL permitir que una relacion regla-tarea defina personal seleccionable especifico para esa regla.

#### Scenario: Regla sin personal seleccionable propio
- **WHEN** una relacion regla-tarea no define personal seleccionable
- **THEN** el sistema usa el personal seleccionable de la tarea maestra asociada para futuras autoasignaciones

#### Scenario: Regla con personal seleccionable propio
- **WHEN** una relacion regla-tarea define personal seleccionable
- **THEN** el sistema usa esa lista como candidatos permitidos en lugar de la lista de la tarea maestra

#### Scenario: Lista vacia significa heredar o todos
- **WHEN** una relacion regla-tarea deja vacia la lista de personal seleccionable y la tarea maestra tampoco tiene lista
- **THEN** el sistema permite que todo el staff activo participe en la autoasignacion

### Requirement: Selectable staff is separate from assigned responsibles
El sistema SHALL distinguir entre personal seleccionable configurado y responsables concretos asignados a una tarea de evento.

#### Scenario: Personal seleccionable no aparece como responsable
- **WHEN** una tarea maestra o regla tiene personal seleccionable configurado
- **THEN** el sistema no muestra esa lista como responsables reales de una tarea de evento hasta que la autoasignacion o una edicion manual los asigne

#### Scenario: Responsable manual conserva significado
- **WHEN** una administradora selecciona responsables en una tarea de evento
- **THEN** el sistema guarda esas personas como responsables concretos y no como personal seleccionable
