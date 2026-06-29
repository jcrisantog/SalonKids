## ADDED Requirements

### Requirement: ListaTareas review seeds missing questionnaire rules
El sistema SHALL incluir un seed idempotente para registrar reglas faltantes que generen tareas accionables de `ListaTareas.txt` usando solo campos de cuestionario existentes.

#### Scenario: Sembrar regla faltante con campo existente
- **WHEN** una actividad faltante depende de una respuesta ya capturada por el cuestionario
- **THEN** el seed crea o actualiza una regla activa asociada a la tarea maestra correspondiente usando el `field_key`, operador y valor esperado apropiados

#### Scenario: Usar fuente de horario relacionada
- **WHEN** la tarea generada por una regla tiene un horario relacionado existente como `cakeTime`, `pinataTime`, `foodStartTime` o un horario de programa
- **THEN** la relacion regla-tarea define `schedule_source_field_key` para programar la tarea con ese horario cuando exista

#### Scenario: Reejecutar seed de reglas faltantes
- **WHEN** el seed de reglas faltantes se ejecuta mas de una vez
- **THEN** el sistema mantiene una sola regla por condicion y una sola relacion por regla y tarea maestra

### Requirement: Activities without reliable questionnaire fields are not seeded as rules
El sistema SHALL evitar crear reglas iniciales para actividades de `ListaTareas.txt` que no puedan evaluarse de forma confiable con los campos actuales del cuestionario.

#### Scenario: Actividad requiere campo nuevo
- **WHEN** una actividad depende de un servicio o opcion que no existe como campo estructurado en el cuestionario actual
- **THEN** el seed no crea una regla para esa actividad y el reporte la marca como candidata pendiente de campo nuevo

#### Scenario: Texto libre ambiguo no dispara regla
- **WHEN** una actividad solo podria detectarse buscando texto ambiguo en notas generales o comentarios
- **THEN** el seed no crea una regla automatica salvo que el campo y valor sean suficientemente intencionales para evitar falsos positivos

### Requirement: Seeded missing rules preserve owner editability
El sistema SHALL dejar las reglas faltantes sembradas como reglas configurables normales que la duena pueda editar, desactivar o eliminar desde la administracion.

#### Scenario: Editar regla faltante sembrada
- **WHEN** la duena edita una regla creada por el seed de reglas faltantes
- **THEN** el sistema conserva su comportamiento como cualquier otra regla configurable para futuros guardados de cuestionario

#### Scenario: Desactivar regla faltante sembrada
- **WHEN** la duena desactiva una regla creada por el seed de reglas faltantes
- **THEN** el sistema deja de generar sus tareas en futuros guardados sin afectar tareas manuales existentes
