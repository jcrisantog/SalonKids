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

## MODIFIED Requirements

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

### Requirement: Operational matrix is documented for owner review
El sistema SHALL entregar una matriz documental que clasifique tareas y reglas iniciales como indispensables, recomendadas u opcionales para que la duena pueda ajustarlas sin requerir Area ni Rol default como campos de captura diaria.

#### Scenario: Documentar tarea sembrada
- **WHEN** una tarea maestra se incluye en el seed operativo
- **THEN** la documentacion indica su visibilidad, motivo operativo y responsable por persona cuando exista

#### Scenario: Documentar regla candidata
- **WHEN** una pregunta del cuestionario podria generar una tarea pero no debe activarse inicialmente
- **THEN** la documentacion la lista como candidata opcional sin activarla en el seed
