## ADDED Requirements

### Requirement: Initial rules are curated from operational categories
El sistema SHALL sembrar reglas iniciales depuradas que cubran solo respuestas del cuestionario que generan trabajo accionable para el equipo.

#### Scenario: Sembrar regla accionable
- **WHEN** una pregunta genera una accion operativa clara como pastel, pinata, menu, alergia, decoracion, personaje, foto, servicio extra o dinamica
- **THEN** el seed crea una regla activa asociada a una o mas tareas maestras

#### Scenario: No sembrar pregunta informativa
- **WHEN** una pregunta solo aporta contexto para una tarea existente
- **THEN** el seed no crea una regla independiente para esa pregunta

#### Scenario: Sembrar multiples tareas por pregunta
- **WHEN** una respuesta requiere preparacion interna y momento publico
- **THEN** el seed asocia ambas tareas a la misma regla con visibilidad y orden operativo independientes

### Requirement: Configurable rules replace hardcoded questionnaire generation
El sistema SHALL usar reglas configurables como fuente principal para generar tareas desde el cuestionario.

#### Scenario: Existen reglas configurables activas
- **WHEN** el cliente guarda un cuestionario y hay reglas configurables activas
- **THEN** el sistema genera tareas desde esas reglas sin duplicarlas con reglas hardcodeadas equivalentes

#### Scenario: No existen reglas configurables activas
- **WHEN** el cliente guarda un cuestionario y no hay reglas configurables activas
- **THEN** el sistema puede usar fallback existente solo si no produce tareas duplicadas

### Requirement: Seeded rules remain editable by the owner
El sistema SHALL permitir que las reglas sembradas se editen, desactiven o eliminen desde la administracion como cualquier regla creada manualmente.

#### Scenario: Editar regla sembrada
- **WHEN** la duena modifica tareas, horarios, visibilidad o responsable de una regla sembrada
- **THEN** el sistema conserva esos cambios para futuros guardados de cuestionario

#### Scenario: Desactivar regla sembrada
- **WHEN** la duena desactiva una regla sembrada
- **THEN** el sistema deja de generar sus tareas en futuros guardados
