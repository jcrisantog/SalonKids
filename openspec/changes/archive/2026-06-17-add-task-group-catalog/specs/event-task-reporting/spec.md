## ADDED Requirements

### Requirement: Las tareas de evento se pueden filtrar por grupo catalogado
El sistema SHALL permitir filtrar la lista de tareas de un evento por el grupo catalogado resuelto desde su tarea maestra de origen.

#### Scenario: Filtrar tareas de evento por grupo
- **WHEN** una administradora selecciona un grupo de tareas en la pantalla de tareas del evento
- **THEN** el sistema muestra solo las tareas de evento cuyo origen pertenece a ese grupo catalogado

#### Scenario: Filtrar tareas de evento sin grupo
- **WHEN** una administradora selecciona la opcion "Sin grupo"
- **THEN** el sistema muestra solo tareas de evento sin grupo catalogado resuelto

#### Scenario: Combinar grupo con filtros existentes
- **WHEN** una administradora filtra por grupo y tambien usa responsable, visibilidad o busqueda
- **THEN** el sistema muestra solo tareas que cumplen todos los filtros aplicados
