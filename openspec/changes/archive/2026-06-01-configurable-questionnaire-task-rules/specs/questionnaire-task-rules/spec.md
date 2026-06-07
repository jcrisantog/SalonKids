## ADDED Requirements

### Requirement: Admin can manage questionnaire task rules
El sistema SHALL permitir que una administradora cree, edite, active, desactive y elimine reglas que relacionan preguntas del cuestionario con tareas maestras.

#### Scenario: Crear regla activa
- **WHEN** una administradora selecciona una pregunta, operador simple, valor esperado y una tarea maestra
- **THEN** el sistema guarda una regla activa disponible para futuros guardados de cuestionario

#### Scenario: Desactivar regla
- **WHEN** una administradora desactiva una regla
- **THEN** el sistema deja de generar tareas desde esa regla en futuros guardados del cuestionario

### Requirement: Rules use questionnaire fields
El sistema SHALL mostrar las preguntas configurables desde la metadata vigente del cuestionario y SHALL guardar la relacion usando el `field_key` estable del campo.

#### Scenario: Listar preguntas configurables
- **WHEN** la administradora abre la configuracion de reglas
- **THEN** el sistema muestra seccion, etiqueta visible, tipo de campo y llave tecnica de cada pregunta del cuestionario

#### Scenario: Pregunta sin regla
- **WHEN** una pregunta no tiene reglas activas
- **THEN** el sistema trata la respuesta como informativa y no genera tareas por esa pregunta

### Requirement: Rules support simple conditions
El sistema SHALL soportar condiciones simples por regla con operadores `answered`, `equals`, `not_equals`, `is_true`, `is_false`, `greater_than` y `contains`.

#### Scenario: Condicion booleana verdadera
- **WHEN** una regla usa `is_true` sobre un campo booleano y la respuesta es verdadera
- **THEN** el sistema considera que la regla aplica

#### Scenario: Condicion de texto respondido
- **WHEN** una regla usa `answered` sobre un campo de texto y el cliente escribe un valor no vacio
- **THEN** el sistema considera que la regla aplica

#### Scenario: Condicion numerica mayor que
- **WHEN** una regla usa `greater_than` sobre un campo numerico y la respuesta supera el valor esperado
- **THEN** el sistema considera que la regla aplica

### Requirement: Rules generate master tasks
El sistema SHALL permitir que cada regla genere una o mas tareas desde el catalogo `master_tasks`, con overrides opcionales de hora, responsable, visibilidad y descripcion.

#### Scenario: Generar tarea desde catalogo
- **WHEN** una respuesta cumple una regla activa
- **THEN** el sistema crea una tarea de evento basada en la tarea maestra relacionada

#### Scenario: Aplicar overrides de regla
- **WHEN** la relacion regla-tarea define hora, responsable, visibilidad o descripcion
- **THEN** el sistema usa esos valores en lugar de los defaults de la tarea maestra

### Requirement: Generated tasks are synchronized safely
El sistema SHALL regenerar tareas configurables sin duplicarlas y SHALL preservar tareas manuales marcadas con `is_manual_override = true`.

#### Scenario: Regenerar despues de cambiar respuestas
- **WHEN** el cliente cambia una respuesta y guarda el cuestionario
- **THEN** el sistema elimina o actualiza tareas generadas previamente por reglas configurables que ya no aplican y crea las que ahora aplican

#### Scenario: Preservar tarea manual
- **WHEN** una administradora edita o crea una tarea manual del evento
- **THEN** el sistema no borra ni reemplaza esa tarea durante la sincronizacion de reglas

### Requirement: Rule changes apply only to future saves
El sistema SHALL aplicar cambios de configuracion de reglas solo en futuros guardados de cuestionario o eventos nuevos.

#### Scenario: Guardar regla no recalcula evento antiguo
- **WHEN** una administradora edita una regla
- **THEN** el sistema no modifica tareas de eventos existentes hasta que su cuestionario se vuelva a guardar

#### Scenario: Siguiente guardado usa reglas actuales
- **WHEN** un cuestionario se guarda despues de cambiar reglas
- **THEN** el sistema evalua las reglas activas actuales y sincroniza tareas con esa configuracion

### Requirement: Initial rules match the operational matrix
El sistema SHALL incluir una configuracion inicial basada en la matriz operativa del cuestionario actual.

#### Scenario: Sembrar reglas iniciales
- **WHEN** se despliega la migracion o seed inicial
- **THEN** el sistema crea reglas para las preguntas que la matriz marca como generadoras de tareas

#### Scenario: Preguntas informativas quedan sin regla
- **WHEN** la matriz indique que una pregunta no debe generar tareas por si sola
- **THEN** el sistema no crea una regla inicial para esa pregunta
