## MODIFIED Requirements

### Requirement: Rules generate master tasks
El sistema SHALL permitir que cada regla genere una o mas tareas desde el catalogo `master_tasks`, con overrides opcionales de hora, responsable, visibilidad, descripcion y orden por cada tarea asociada.

#### Scenario: Generar una tarea desde catalogo
- **WHEN** una respuesta cumple una regla activa con una tarea maestra asociada
- **THEN** el sistema crea una tarea de evento basada en esa tarea maestra

#### Scenario: Generar varias tareas desde una pregunta
- **WHEN** una respuesta cumple una regla activa que tiene dos o mas tareas maestras asociadas
- **THEN** el sistema crea una tarea de evento por cada tarea maestra asociada a la regla

#### Scenario: Aplicar overrides independientes por tarea
- **WHEN** la relacion regla-tarea define hora, responsable, visibilidad o descripcion para una tarea asociada
- **THEN** el sistema usa esos valores solo para esa tarea y conserva los valores de las demas tareas asociadas

#### Scenario: Respetar orden operativo
- **WHEN** una regla tiene multiples tareas asociadas con `sort_order`
- **THEN** el sistema muestra y genera las tareas en el orden configurado

### Requirement: Admin can manage questionnaire task rules
El sistema SHALL permitir que una administradora cree, edite, active, desactive y elimine reglas que relacionan preguntas del cuestionario con una o varias tareas maestras.

#### Scenario: Crear regla activa con una tarea
- **WHEN** una administradora selecciona una pregunta, operador simple, valor esperado y una tarea maestra
- **THEN** el sistema guarda una regla activa disponible para futuros guardados de cuestionario

#### Scenario: Crear regla activa con varias tareas
- **WHEN** una administradora selecciona una pregunta, operador simple, valor esperado y varias tareas maestras
- **THEN** el sistema guarda todas las tareas asociadas dentro de la misma regla activa

#### Scenario: Editar lista de tareas asociadas
- **WHEN** una administradora agrega, quita o reordena tareas de una regla existente
- **THEN** el sistema guarda la nueva lista completa de tareas asociadas sin cambiar la condicion de la regla

#### Scenario: Evitar tarea duplicada en la misma regla
- **WHEN** una administradora intenta guardar la misma tarea maestra mas de una vez dentro de una regla
- **THEN** el sistema rechaza la configuracion y muestra un mensaje claro de validacion

#### Scenario: Desactivar regla
- **WHEN** una administradora desactiva una regla
- **THEN** el sistema deja de generar tareas desde esa regla en futuros guardados del cuestionario

## ADDED Requirements

### Requirement: Multiple task preview is explicit
El sistema SHALL mostrar una vista previa clara de todas las tareas que se generaran cuando una regla de cuestionario tenga multiples tareas asociadas.

#### Scenario: Vista previa lista varias tareas
- **WHEN** la administradora configura una regla con dos o mas tareas seleccionadas
- **THEN** el sistema muestra los nombres de las tareas seleccionadas en la vista previa antes de guardar

#### Scenario: Listado muestra multiples tareas por regla
- **WHEN** la administradora consulta la tabla de reglas configuradas
- **THEN** el sistema muestra todas las tareas asociadas a cada regla en orden operativo
