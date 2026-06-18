## ADDED Requirements

### Requirement: La autoasignacion evita repetir actividades recientes
El sistema SHALL usar el historial de responsables de los ultimos 3 eventos anteriores para priorizar personal que no haya realizado la misma actividad o grupo operativo recientemente.

#### Scenario: Priorizar persona sin repeticion reciente
- **WHEN** la administradora ejecuta la autoasignacion y una actividad tiene dos candidatos activos disponibles
- **THEN** el sistema asigna primero a la persona que no haya realizado esa misma actividad o grupo operativo en los ultimos 3 eventos

#### Scenario: Detectar actividad por grupo catalogado
- **WHEN** una tarea de evento proviene de una tarea maestra con `assignment_group_id`
- **THEN** el sistema compara el historial usando ese grupo catalogado para decidir si la actividad fue repetida

#### Scenario: Usar fallback para tareas sin grupo
- **WHEN** una tarea no tiene grupo catalogado ni grupo heredado
- **THEN** el sistema compara el historial usando la tarea maestra de origen o el nombre normalizado de la actividad

#### Scenario: Permitir repeticion si no hay alternativa
- **WHEN** todo el personal activo disponible ya realizo la misma actividad en los ultimos 3 eventos
- **THEN** el sistema permite repetir responsable para no dejar la tarea sin asignacion

#### Scenario: Desempatar con carga historica total
- **WHEN** dos candidatos tienen el mismo historial para la actividad evaluada
- **THEN** el sistema prioriza a quien tenga menos tareas asignadas en los ultimos 3 eventos

#### Scenario: Aleatoriedad solo entre candidatos equivalentes
- **WHEN** dos o mas candidatos tienen el mismo puntaje de repeticion y carga historica
- **THEN** el sistema puede elegir aleatoriamente entre esos candidatos equivalentes

### Requirement: La rotacion respeta reglas existentes de autoasignacion
El sistema SHALL aplicar rotacion historica sin romper defaults, grupos, cantidad requerida, modo completar, modo reemplazar ni ajustes manuales existentes.

#### Scenario: Completar faltantes con rotacion
- **WHEN** la administradora ejecuta autoasignacion en modo completar
- **THEN** el sistema conserva responsables existentes y usa rotacion historica solo para los cupos faltantes

#### Scenario: Reemplazar con rotacion
- **WHEN** la administradora ejecuta autoasignacion en modo reemplazar
- **THEN** el sistema recalcula responsables usando defaults, grupos, cantidad requerida y puntaje de rotacion historica

#### Scenario: Mantener grupo como bloque
- **WHEN** varias tareas pertenecen al mismo grupo operativo
- **THEN** el sistema calcula una sola lista de responsables balanceada por historial y la aplica al bloque completo

#### Scenario: Reportar repeticion inevitable
- **WHEN** una tarea o grupo queda asignado a alguien que hizo la misma actividad recientemente por falta de alternativas
- **THEN** el resumen de autoasignacion indica que hubo repeticion inevitable o candidatos insuficientes
