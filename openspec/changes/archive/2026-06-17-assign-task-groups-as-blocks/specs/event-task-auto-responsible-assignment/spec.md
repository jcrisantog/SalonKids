## ADDED Requirements

### Requirement: La autoasignacion asigna tareas agrupadas como bloques
El sistema SHALL tratar las tareas de evento vinculadas a tareas maestras con la misma agrupacion operativa como un bloque indivisible durante la asignacion automatica de responsables.

#### Scenario: Asignar un grupo completo a la misma persona
- **WHEN** dos o mas tareas de evento pertenecen a la misma agrupacion operativa y la administradora ejecuta la asignacion automatica
- **THEN** el sistema asigna la misma lista de responsables a todas las tareas de ese grupo

#### Scenario: Mantener tareas sin grupo como independientes
- **WHEN** una tarea de evento no tiene agrupacion operativa resuelta desde su tarea maestra
- **THEN** el sistema la asigna de forma individual usando el comportamiento existente por tarea

#### Scenario: Usar defaults dentro del grupo antes de aleatorio
- **WHEN** una agrupacion contiene tareas con responsables predeterminados por regla o tarea maestra
- **THEN** el sistema usa esos responsables como candidatos iniciales del bloque antes de completar con seleccion aleatoria de staff activo

#### Scenario: Respetar cantidad requerida del bloque
- **WHEN** las tareas de una misma agrupacion tienen distintas cantidades requeridas de responsables
- **THEN** el sistema calcula la lista del bloque usando la mayor cantidad requerida entre esas tareas

#### Scenario: Completar faltantes en grupo
- **WHEN** la administradora ejecuta la asignacion automatica en modo completar y una tarea del grupo ya tiene responsables asignados
- **THEN** el sistema conserva esos responsables como parte del bloque y completa faltantes para que todas las tareas del grupo queden con la misma lista resultante

#### Scenario: Reemplazar asignaciones de grupo
- **WHEN** la administradora ejecuta la asignacion automatica en modo reemplazar sobre tareas agrupadas
- **THEN** el sistema recalcula una lista unica para el bloque y reemplaza con ella los responsables de todas las tareas del grupo

#### Scenario: Grupo incompleto por falta de staff
- **WHEN** no hay suficiente staff activo para cubrir la cantidad requerida de un grupo
- **THEN** el sistema asigna los responsables disponibles sin duplicarlos dentro del bloque y reporta el bloque como incompleto en el resumen

#### Scenario: Una persona puede cubrir varias tareas del grupo
- **WHEN** un grupo contiene varias tareas relacionadas de la misma area operativa
- **THEN** el sistema permite que la misma persona aparezca en todas las tareas del grupo porque representan un solo bloque de responsabilidad

#### Scenario: Resolver grupo desde regla o tarea maestra
- **WHEN** una tarea de evento viene de una relacion regla-tarea o de una tarea base con tarea maestra asociada
- **THEN** el sistema usa la agrupacion de la tarea maestra vinculada para decidir si participa en un bloque
