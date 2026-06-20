## ADDED Requirements

### Requirement: Owner admin includes contextual assistant entry point
El sistema SHALL incluir una entrada persistente al asistente dentro de la experiencia administrativa de la duena sin interferir con las tareas principales.

#### Scenario: Asistente visible sin ocupar navegacion principal
- **WHEN** la duena entra al panel administrativo
- **THEN** el sistema muestra el asistente como accion secundaria persistente y no como una seccion mas del menu principal

#### Scenario: Asistente no bloquea controles
- **WHEN** el asistente esta cerrado
- **THEN** su accion flotante no oculta botones criticos, formularios ni controles de navegacion

#### Scenario: Panel del asistente respeta pantalla movil
- **WHEN** la duena usa el panel administrativo en un telefono
- **THEN** el asistente se muestra en un panel usable sin provocar desbordamiento horizontal ni ocultar permanentemente la pantalla actual
