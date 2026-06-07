## ADDED Requirements

### Requirement: Event task table can be searched live
El sistema SHALL permitir busqueda textual en vivo dentro de la seccion de Tareas del Evento.

#### Scenario: Buscar tarea de evento por nombre
- **WHEN** una administradora escribe parte del nombre de una tarea del evento
- **THEN** la tabla muestra solo tareas cuyo nombre coincida con la busqueda

#### Scenario: Buscar tarea de evento por detalle
- **WHEN** una administradora escribe descripcion, hora, estado, visibilidad, rol responsable o nombre de staff asignado
- **THEN** la tabla muestra tareas que coincidan con esos campos

#### Scenario: Combinar busqueda con filtros existentes
- **WHEN** la administradora usa busqueda textual junto con filtro de responsable o visibilidad
- **THEN** la tabla muestra solo tareas que cumplan todos los criterios activos

#### Scenario: Imprimir con busqueda activa
- **WHEN** la administradora genera PDF con una busqueda y filtros activos
- **THEN** el PDF incluye solo las tareas visibles despues de aplicar busqueda y filtros

#### Scenario: Sin coincidencias en tareas de evento
- **WHEN** la busqueda y filtros activos no coinciden con ninguna tarea del evento
- **THEN** el sistema muestra un estado vacio claro y evita imprimir un PDF vacio
