## ADDED Requirements

### Requirement: La autoasignacion usa grupos catalogados
El sistema SHALL usar el grupo catalogado de la tarea maestra como fuente principal para formar bloques de autoasignacion.

#### Scenario: Agrupar por ID de grupo catalogado
- **WHEN** dos o mas tareas de evento provienen de tareas maestras asociadas al mismo grupo catalogado
- **THEN** la autoasignacion las trata como un solo bloque aunque sus nombres o areas sean distintos

#### Scenario: Tarea con grupo catalogado diferente
- **WHEN** dos tareas tienen grupos catalogados distintos
- **THEN** la autoasignacion las procesa en bloques separados

#### Scenario: Tarea sin grupo catalogado
- **WHEN** una tarea no tiene grupo catalogado ni grupo heredado
- **THEN** la autoasignacion conserva el comportamiento individual por tarea

#### Scenario: Compatibilidad con grupo heredado
- **WHEN** una tarea aun no tiene `assignment_group_id` pero conserva `assignment_group_key`
- **THEN** la autoasignacion puede usar la clave heredada como fallback para no romper bloques existentes

#### Scenario: Grupo catalogado tiene prioridad sobre grupo heredado
- **WHEN** una tarea tiene `assignment_group_id` y tambien conserva una clave heredada distinta
- **THEN** la autoasignacion usa el grupo catalogado para decidir el bloque
