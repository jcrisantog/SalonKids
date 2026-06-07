## ADDED Requirements

### Requirement: Seeded tasks support operational filtering and printing
El sistema SHALL sembrar tareas con datos consistentes de area, responsable sugerido y visibilidad para que los filtros e impresion de tareas sean utiles desde la base inicial.

#### Scenario: Filtrar tareas internas sembradas
- **WHEN** una administradora filtra tareas por visibilidad interna
- **THEN** el sistema muestra tareas operativas sembradas como preparacion, montaje, cocina, seguridad, cierre y limpieza

#### Scenario: Filtrar tareas publicas sembradas
- **WHEN** una administradora filtra tareas por visibilidad publica
- **THEN** el sistema muestra solo momentos que pueden compartirse como parte del itinerario del evento

#### Scenario: Imprimir tareas base de cierre
- **WHEN** una administradora genera PDF de tareas de cierre
- **THEN** el documento incluye tareas sembradas de cierre con hora, descripcion y responsable sugerido

### Requirement: Seeded task names are operationally clear
El sistema SHALL usar nombres de tareas sembradas que distingan preparacion, ejecucion publica y cierre para evitar ambiguedad en reportes.

#### Scenario: Mostrar nombre de preparacion
- **WHEN** una tarea sembrada prepara un momento posterior
- **THEN** el listado muestra un nombre que inicia o expresa preparacion, revision, coordinacion o montaje

#### Scenario: Mostrar nombre de momento publico
- **WHEN** una tarea sembrada representa un momento visible para clientes
- **THEN** el listado muestra un nombre corto adecuado para itinerario o PDF publico
