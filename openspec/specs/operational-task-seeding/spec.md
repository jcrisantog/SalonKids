## ADDED Requirements

### Requirement: System seeds operational master tasks
El sistema SHALL incluir una base inicial de tareas maestras operativas para entrada, montaje, actividades durante evento, cierre, limpieza y resguardo.

#### Scenario: Sembrar tareas de entrada
- **WHEN** se ejecuta el seed operativo inicial
- **THEN** el sistema crea tareas maestras de entrada y montaje con area, descripcion, visibilidad interna y rol responsable sugerido

#### Scenario: Sembrar tareas de cierre
- **WHEN** se ejecuta el seed operativo inicial
- **THEN** el sistema crea tareas maestras de cierre para bajada de pertenencias, retiro de charolas, separacion de residuos, manteleria, limpieza y resguardo

#### Scenario: Evitar duplicados al reejecutar seed
- **WHEN** el seed operativo se ejecuta mas de una vez
- **THEN** el sistema conserva una sola tarea maestra por nombre operativo unico

### Requirement: Base event tasks come from operational templates
El sistema SHALL generar tareas base de evento desde plantillas maestras operativas de entrada, montaje, cierre o desmontaje cuando existan.

#### Scenario: Crear tareas base desde plantillas
- **WHEN** se crea o sincroniza un evento con horario de inicio y fin
- **THEN** el sistema crea tareas base usando las plantillas maestras operativas disponibles

#### Scenario: Usar horario de inicio para entrada
- **WHEN** una plantilla base corresponde a entrada o montaje
- **THEN** el sistema agenda la tarea usando el horario inicial del evento o el horario default de la plantilla cuando aplique

#### Scenario: Usar horario de fin para cierre
- **WHEN** una plantilla base corresponde a cierre, salida o desmontaje
- **THEN** el sistema agenda la tarea usando el horario final del evento o el horario default de la plantilla cuando aplique

### Requirement: Operational matrix is documented for owner review
El sistema SHALL entregar una matriz documental que clasifique tareas y reglas iniciales como indispensables, recomendadas u opcionales para que la duena pueda ajustarlas.

#### Scenario: Documentar tarea sembrada
- **WHEN** una tarea maestra se incluye en el seed operativo
- **THEN** la documentacion indica su area, visibilidad, rol sugerido y motivo operativo

#### Scenario: Documentar regla candidata
- **WHEN** una pregunta del cuestionario podria generar una tarea pero no debe activarse inicialmente
- **THEN** la documentacion la lista como candidata opcional sin activarla en el seed
