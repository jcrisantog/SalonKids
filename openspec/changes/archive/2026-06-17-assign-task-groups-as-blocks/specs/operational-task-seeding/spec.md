## ADDED Requirements

### Requirement: Los seeds operativos definen grupos opcionales de asignacion de tareas
El sistema SHALL clasificar las tareas operativas existentes con agrupaciones de asignacion opcionales cuando pertenezcan a un mismo bloque de trabajo, sin obligar a agrupar tareas que deban seguir independientes.

#### Scenario: Auditar todas las tareas sembradas
- **WHEN** se actualizan los seeds operativos y de reglas del cuestionario
- **THEN** cada tarea maestra existente en esos seeds queda revisada y documentada como agrupada o sin agrupacion

#### Scenario: Sembrar grupo operativo claro
- **WHEN** dos o mas tareas sembradas pertenecen a la misma area de responsabilidad, como Arenero u otra area operativa equivalente
- **THEN** el seed guarda la misma agrupacion de asignacion para esas tareas

#### Scenario: Mantener tarea sembrada sin grupo
- **WHEN** una tarea sembrada no comparte responsable operativo natural con otras tareas
- **THEN** el seed la deja sin agrupacion para que la asignacion automatica la procese individualmente

#### Scenario: Documentar agrupaciones en la matriz
- **WHEN** la matriz operativa lista tareas base o tareas generadas por reglas
- **THEN** la documentacion muestra la agrupacion de asignacion cuando exista y deja claro cuando la tarea no tiene agrupacion

#### Scenario: Reejecutar seeds con agrupaciones
- **WHEN** los seeds se ejecutan mas de una vez
- **THEN** el sistema conserva una sola tarea maestra por nombre y actualiza de forma idempotente su agrupacion operativa
