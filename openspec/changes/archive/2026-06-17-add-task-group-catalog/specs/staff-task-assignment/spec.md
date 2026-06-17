## ADDED Requirements

### Requirement: Las tareas maestras seleccionan grupos desde catalogo
El sistema SHALL permitir que una administradora asocie una tarea maestra a cero o un grupo de asignacion existente desde un combo.

#### Scenario: Crear tarea con grupo catalogado
- **WHEN** una administradora crea una tarea maestra y selecciona un grupo activo del catalogo
- **THEN** el sistema guarda la relacion con ese grupo y muestra su nombre en la tabla de tareas maestras

#### Scenario: Crear tarea sin grupo catalogado
- **WHEN** una administradora crea una tarea maestra con la opcion "Sin grupo"
- **THEN** el sistema guarda la tarea sin grupo y la deja disponible para asignacion individual

#### Scenario: Editar grupo catalogado de tarea
- **WHEN** una administradora cambia el grupo seleccionado de una tarea maestra
- **THEN** el sistema actualiza solo la relacion de grupo sin modificar responsables predeterminados ni cantidad requerida

#### Scenario: Limpiar grupo catalogado de tarea
- **WHEN** una administradora selecciona "Sin grupo" en una tarea que tenia grupo
- **THEN** el sistema limpia la relacion de grupo y la tarea vuelve a asignarse individualmente

#### Scenario: Rechazar grupo inexistente
- **WHEN** una administradora envia un ID de grupo que no existe
- **THEN** el sistema rechaza el guardado con un mensaje claro de validacion

### Requirement: La tabla de tareas maestras se puede filtrar por grupo
El sistema SHALL permitir filtrar el catalogo de tareas maestras por grupo de asignacion.

#### Scenario: Filtrar por grupo especifico
- **WHEN** una administradora selecciona un grupo en el filtro de tareas maestras
- **THEN** la tabla muestra solo tareas asociadas a ese grupo

#### Scenario: Filtrar tareas sin grupo
- **WHEN** una administradora selecciona el filtro "Sin grupo"
- **THEN** la tabla muestra solo tareas maestras sin grupo asignado

#### Scenario: Mostrar todos los grupos
- **WHEN** una administradora selecciona el filtro "Todos"
- **THEN** la tabla vuelve a mostrar tareas con y sin grupo

#### Scenario: Combinar busqueda y filtro de grupo
- **WHEN** una administradora escribe una busqueda y selecciona un grupo
- **THEN** la tabla muestra solo tareas que cumplen ambos criterios
