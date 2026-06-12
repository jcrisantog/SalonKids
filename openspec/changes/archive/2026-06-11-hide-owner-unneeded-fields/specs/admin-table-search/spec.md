## MODIFIED Requirements

### Requirement: Master tasks table can be searched
El sistema SHALL permitir busqueda en vivo en el catalogo de Tareas Maestras usando solo datos visibles o utiles para la duena.

#### Scenario: Buscar tarea maestra por nombre
- **WHEN** la administradora escribe parte del nombre de una tarea maestra
- **THEN** la tabla muestra solo tareas maestras cuyo nombre coincida

#### Scenario: Buscar tarea maestra por detalle visible
- **WHEN** la administradora escribe responsable asignado, visibilidad o parte de la descripcion
- **THEN** la tabla muestra tareas maestras que coincidan con esos campos visibles

#### Scenario: Tareas maestras sin coincidencias
- **WHEN** la busqueda de Tareas Maestras no coincide con ninguna fila
- **THEN** la tabla muestra un estado vacio indicando que no hay tareas maestras para esa busqueda
