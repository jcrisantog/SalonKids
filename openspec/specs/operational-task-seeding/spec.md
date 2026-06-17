## ADDED Requirements

### Requirement: Master task registration hides area and default role
El sistema SHALL permitir crear y editar Tareas Maestras sin mostrar ni requerir Area o Rol default en el formulario principal.

#### Scenario: Crear tarea maestra sin area ni rol default
- **WHEN** la administradora captura una tarea maestra con nombre, descripcion, visibilidad y responsable default opcional
- **THEN** el sistema guarda la tarea sin exigir Area ni Rol default

#### Scenario: Editar tarea maestra existente
- **WHEN** la administradora edita una tarea maestra que ya tiene Area o Rol default guardados
- **THEN** el sistema permite guardar cambios visibles sin mostrar ni requerir esos campos heredados

#### Scenario: Tabla de tareas maestras sin columnas ocultas
- **WHEN** la administradora consulta el catalogo de Tareas Maestras
- **THEN** el sistema no muestra columnas de Area ni Rol default

### Requirement: System seeds operational master tasks
El sistema SHALL incluir una base inicial de tareas maestras operativas para entrada, montaje, actividades durante evento, cierre, limpieza y resguardo, sin depender de Area o Rol default como datos visibles para la duena.

#### Scenario: Sembrar tareas de entrada
- **WHEN** se ejecuta el seed operativo inicial
- **THEN** el sistema crea tareas maestras de entrada y montaje con descripcion, visibilidad interna y datos heredados opcionales cuando existan

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
El sistema SHALL entregar una matriz documental que clasifique tareas y reglas iniciales como indispensables, recomendadas u opcionales para que la duena pueda ajustarlas sin requerir Area ni Rol default como campos de captura diaria.

#### Scenario: Documentar tarea sembrada
- **WHEN** una tarea maestra se incluye en el seed operativo
- **THEN** la documentacion indica su visibilidad, motivo operativo y responsable por persona cuando exista

#### Scenario: Documentar regla candidata
- **WHEN** una pregunta del cuestionario podria generar una tarea pero no debe activarse inicialmente
- **THEN** la documentacion la lista como candidata opcional sin activarla en el seed

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
