## ADDED Requirements

### Requirement: Configured rules table can be searched live
El sistema SHALL permitir busqueda textual en vivo dentro de la tabla de Reglas configuradas.

#### Scenario: Buscar regla por pregunta
- **WHEN** la administradora escribe parte de la etiqueta visible o llave tecnica de una pregunta
- **THEN** la tabla muestra solo reglas que coincidan con esa pregunta

#### Scenario: Buscar regla por condicion
- **WHEN** la administradora escribe operador, valor esperado, estado o seccion
- **THEN** la tabla muestra reglas que coincidan con esos datos

#### Scenario: Buscar regla por tareas asociadas
- **WHEN** la administradora escribe parte del nombre de una tarea asociada a una regla
- **THEN** la tabla muestra reglas que generan esa tarea

#### Scenario: Combinar busqueda con seccion
- **WHEN** la administradora usa busqueda textual y filtro de seccion al mismo tiempo
- **THEN** la tabla muestra solo reglas que cumplan ambos criterios

#### Scenario: Sin coincidencias en reglas
- **WHEN** la busqueda y filtro de seccion no coinciden con ninguna regla
- **THEN** la tabla muestra un estado vacio indicando que no hay reglas para esa busqueda
