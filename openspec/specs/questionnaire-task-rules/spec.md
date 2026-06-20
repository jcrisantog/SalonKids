## ADDED Requirements

### Requirement: Questionnaire rule configuration hides responsible override
El sistema SHALL permitir configurar reglas de cuestionario sin mostrar ni requerir el campo Responsable como override manual.

#### Scenario: Crear regla sin responsable override
- **WHEN** la administradora crea una regla con pregunta, condicion y tareas maestras asociadas
- **THEN** el sistema guarda la regla sin pedir Responsable en la interfaz

#### Scenario: Editar regla existente con responsable heredado
- **WHEN** la administradora edita una regla que conserva un responsable heredado en datos existentes
- **THEN** el sistema permite guardar cambios visibles sin mostrar ni requerir ese responsable heredado

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
El sistema SHALL permitir que cada regla genere una o mas tareas desde el catalogo `master_tasks`, con overrides opcionales de hora, visibilidad, descripcion, orden y personal seleccionable por cada tarea asociada.

#### Scenario: Generar una tarea desde catalogo
- **WHEN** una respuesta cumple una regla activa con una tarea maestra asociada
- **THEN** el sistema crea una tarea de evento basada en esa tarea maestra

#### Scenario: Generar varias tareas desde una pregunta
- **WHEN** una respuesta cumple una regla activa que tiene dos o mas tareas maestras asociadas a la regla
- **THEN** el sistema crea una tarea de evento por cada tarea maestra asociada a la regla

#### Scenario: Aplicar overrides independientes por tarea
- **WHEN** la relacion regla-tarea define hora, personal seleccionable, visibilidad o descripcion para una tarea asociada
- **THEN** el sistema usa esos valores solo para esa tarea y conserva los valores de las demas tareas asociadas

#### Scenario: Respetar orden operativo
- **WHEN** una regla tiene multiples tareas asociadas con `sort_order`
- **THEN** el sistema muestra y genera las tareas en el orden configurado

#### Scenario: No propagar personal seleccionable como responsables
- **WHEN** una respuesta cumple una regla cuya tarea maestra tiene personal seleccionable y la relacion regla-tarea no define una lista distinta
- **THEN** el sistema crea o actualiza la tarea de evento sin copiar esa lista como responsables asignados

#### Scenario: Usar override de personal seleccionable de regla
- **WHEN** una respuesta cumple una regla cuya relacion regla-tarea define personal seleccionable
- **THEN** el sistema conserva esa lista como candidatos permitidos para la autoasignacion de esa tarea sin asignarlos como responsables concretos

#### Scenario: Crear tarea sin staff asignado
- **WHEN** una regla genera una tarea sin responsables manuales existentes
- **THEN** el sistema crea o actualiza la tarea de evento sin responsables asignados y sin requerir un responsable visible

#### Scenario: Preservar responsables manuales en tarea generada
- **WHEN** una tarea generada por una regla fue editada manualmente y tiene responsables personalizados
- **THEN** futuros guardados de cuestionario no reemplazan esa lista de responsables

### Requirement: Rule task can use a related questionnaire time
El sistema SHALL permitir que cada tarea asociada a una regla de cuestionario tome su horario desde un campo de respuesta configurable, independiente del campo que dispara la regla.

#### Scenario: Tarea usa horario relacionado
- **WHEN** una regla activa se cumple y una tarea asociada define `schedule_source_field_key`
- **THEN** el sistema usa el valor de ese campo como `scheduled_time` si es una hora valida

#### Scenario: Override de hora tiene prioridad
- **WHEN** una tarea asociada define `override_scheduled_time` y tambien `schedule_source_field_key`
- **THEN** el sistema usa `override_scheduled_time`

#### Scenario: Compatibilidad con reglas de hora existentes
- **WHEN** una regla se dispara por un campo de tipo hora y no define fuente de horario
- **THEN** el sistema usa la respuesta del campo disparador como horario de la tarea

### Requirement: Multiple task preview is explicit
El sistema SHALL mostrar una vista previa clara de todas las tareas que se generaran cuando una regla de cuestionario tenga multiples tareas asociadas.

#### Scenario: Vista previa lista varias tareas
- **WHEN** la administradora configura una regla con dos o mas tareas seleccionadas
- **THEN** el sistema muestra los nombres de las tareas seleccionadas en la vista previa antes de guardar

#### Scenario: Listado muestra multiples tareas por regla
- **WHEN** la administradora consulta la tabla de reglas configuradas
- **THEN** el sistema muestra todas las tareas asociadas a cada regla en orden operativo

### Requirement: Generated tasks are synchronized safely
El sistema SHALL sincronizar tareas configurables sin duplicarlas, SHALL preservar tareas manuales marcadas con `is_manual_override = true` y SHALL evitar crear una nueva tarea generada cuando ya existe una tarea del mismo origen configurable.

#### Scenario: Regenerar despues de cambiar respuestas
- **WHEN** el cliente cambia una respuesta y guarda el cuestionario
- **THEN** el sistema elimina, actualiza o crea tareas generadas por reglas configurables segun las reglas que aplican actualmente, sin duplicar tareas con el mismo origen

#### Scenario: Preservar tarea manual
- **WHEN** una administradora edita o crea una tarea manual del evento
- **THEN** el sistema no borra ni reemplaza esa tarea durante la sincronizacion de reglas

#### Scenario: Tarea generada editada manualmente no se duplica
- **WHEN** una tarea generada por una regla configurable fue editada y marcada como manual
- **THEN** futuros guardados del cuestionario no crean una segunda tarea para el mismo `source_rule_task_id`

#### Scenario: Tarea generada existente se actualiza
- **WHEN** una tarea generada por una regla configurable existe y no esta marcada como manual
- **THEN** futuros guardados del cuestionario actualizan esa tarea en lugar de insertar una nueva copia

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

### Requirement: Initial program rules map related activity times
El sistema SHALL sembrar reglas iniciales para actividades programadas que tomen el horario del campo de hora correspondiente, aun cuando la regla se dispare por un campo relacionado.

#### Scenario: Presentacion usa hora de programa
- **WHEN** la regla de presentacion genera la tarea publica de presentacion
- **THEN** la tarea usa `presentationTime` como fuente de horario cuando exista

#### Scenario: Mesa de dulces usa hora de programa
- **WHEN** la regla de mesa de dulces genera la tarea publica de mesa de dulces
- **THEN** la tarea usa `candyTableTime` como fuente de horario cuando exista

#### Scenario: Otra actividad usa nombre y hora
- **WHEN** el cliente captura otra actividad y su horario
- **THEN** la tarea "Otra actividad programada" usa el nombre capturado y el horario capturado

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
- **WHEN** la duena modifica tareas, horarios, visibilidad o staff asignado de una regla sembrada
- **THEN** el sistema conserva esos cambios para futuros guardados de cuestionario

#### Scenario: Desactivar regla sembrada
- **WHEN** la duena desactiva una regla sembrada
- **THEN** el sistema deja de generar sus tareas en futuros guardados

### Requirement: Configured rules table can be searched live
El sistema SHALL permitir busqueda textual en vivo dentro de la tabla de Reglas configuradas.

#### Scenario: Buscar regla por pregunta
- **WHEN** la administradora escribe parte de la etiqueta visible o llave tecnica de una pregunta
- **THEN** la tabla muestra solo reglas que coincidan con esa pregunta

#### Scenario: Buscar regla por condicion
- **WHEN** la administradora escribe operador, valor esperado, estado o seccion
- **THEN** la tabla muestra reglas que coincidan con esos datos

#### Scenario: Buscar regla por tareas asociadas
- **WHEN** la administradora escribe parte del nombre de una tarea asociada a una regla
- **THEN** la tabla muestra reglas que generan esa tarea

#### Scenario: Combinar busqueda con seccion
- **WHEN** la administradora usa busqueda textual y filtro de seccion al mismo tiempo
- **THEN** la tabla muestra solo reglas que cumplan ambos criterios

#### Scenario: Sin coincidencias en reglas
- **WHEN** la busqueda y filtro de seccion no coinciden con ninguna regla
- **THEN** la tabla muestra un estado vacio indicando que no hay reglas para esa busqueda

### Requirement: Admin can create missing master tasks while configuring questionnaire rules
El sistema SHALL permitir que una administradora cree una tarea maestra faltante desde el formulario de Reglas Cuestionario sin abandonar la regla que esta creando o editando.

#### Scenario: Abrir creacion de tarea desde fila de regla
- **WHEN** la administradora configura una tarea asociada dentro de una regla y no encuentra la tarea maestra requerida
- **THEN** el sistema muestra una accion para crear una nueva tarea maestra desde esa misma fila o seccion de tareas

#### Scenario: Crear tarea en modal
- **WHEN** la administradora usa la accion de crear tarea
- **THEN** el sistema abre un modal o popup con los campos necesarios para crear una tarea maestra

#### Scenario: Cancelar creacion conserva regla
- **WHEN** la administradora cancela el modal de creacion de tarea
- **THEN** el sistema cierra el modal y conserva sin cambios la regla en edicion

### Requirement: Created task is immediately selectable in the current rule
El sistema SHALL agregar la tarea maestra recien creada al catalogo disponible de la pantalla de Reglas Cuestionario y SHALL seleccionarla automaticamente en la relacion regla-tarea que origino la creacion.

#### Scenario: Tarea creada queda seleccionada
- **WHEN** la administradora guarda correctamente una nueva tarea maestra desde el modal de reglas
- **THEN** el sistema cierra el modal, agrega la tarea al combobox de tareas maestras y deja esa tarea seleccionada en la fila de configuracion activa

#### Scenario: Regla mantiene otros campos pendientes
- **WHEN** una tarea nueva se crea y selecciona dentro de una regla con pregunta, condicion u otras tareas ya configuradas
- **THEN** el sistema conserva esos valores pendientes sin reiniciar el formulario de regla

#### Scenario: Tarea creada disponible para otras filas
- **WHEN** una tarea nueva fue creada desde una fila de regla
- **THEN** el sistema permite seleccionar esa misma tarea en otros formularios o reglas posteriores como parte del catalogo actualizado

### Requirement: Inline task creation uses existing master task validation
El sistema SHALL crear tareas desde Reglas Cuestionario usando las mismas reglas de validacion y persistencia que el catalogo de Tareas Maestras.

#### Scenario: Nombre obligatorio
- **WHEN** la administradora intenta crear una tarea sin nombre desde el modal
- **THEN** el sistema rechaza el guardado y muestra un mensaje claro sin cerrar el modal

#### Scenario: Responsable predeterminado invalido
- **WHEN** la administradora selecciona uno o mas integrantes de personal seleccionable que no existen en el catalogo de staff
- **THEN** el sistema rechaza la creacion y muestra el mensaje de validacion del servidor

#### Scenario: Error de servidor conserva datos del modal
- **WHEN** la creacion de tarea falla por un error de servidor o red
- **THEN** el sistema mantiene abierto el modal con los valores capturados para que la administradora pueda corregir o reintentar

### Requirement: Rules use cake and pinata program times
El sistema SHALL permitir que las tareas generadas por pastel y pinata usen los horarios capturados en la seccion 15 como fuente de `scheduled_time`.

#### Scenario: Tarea de pastel usa horario de programa
- **WHEN** una regla activa se cumple porque el cliente indico que habra pastel y la tarea asociada define `schedule_source_field_key` hacia el horario de pastel
- **THEN** el sistema usa el horario de pastel capturado en la seccion 15 como `scheduled_time` de la tarea

#### Scenario: Tarea de pinata usa horario de programa
- **WHEN** una regla activa se cumple porque el cliente indico que traera pinata y la tarea asociada define `schedule_source_field_key` hacia el horario de pinata
- **THEN** el sistema usa el horario de pinata capturado en la seccion 15 como `scheduled_time` de la tarea

#### Scenario: Horario vacio mantiene comportamiento seguro
- **WHEN** una actividad aplica pero su horario de seccion 15 esta vacio
- **THEN** el sistema genera o actualiza la tarea sin usar un horario invalido y conserva la prioridad de `override_scheduled_time` cuando exista

### Requirement: Rules use selected dynamic program times
El sistema SHALL permitir que cada dinamica seleccionada genere una tarea programada con el horario capturado para esa dinamica en la seccion 15.

#### Scenario: Dinamica seleccionada usa su propio horario
- **WHEN** una regla activa se cumple por una dinamica seleccionada y la tarea asociada define `schedule_source_field_key` hacia el horario de esa dinamica
- **THEN** el sistema usa ese horario como `scheduled_time` de la tarea generada

#### Scenario: Dinamicas multiples conservan horarios independientes
- **WHEN** el cliente selecciona dos o mas dinamicas y captura horarios distintos para ellas
- **THEN** el sistema genera o actualiza las tareas de esas dinamicas con sus horarios correspondientes sin reutilizar el horario de otra dinamica

#### Scenario: Dinamica no seleccionada no genera tarea por horario residual
- **WHEN** existe un horario guardado para una dinamica pero la dinamica ya no esta seleccionada
- **THEN** el sistema no genera la tarea de esa dinamica solo por el horario residual

### Requirement: Initial rules map new activity times
El sistema SHALL sembrar o actualizar reglas iniciales para que pastel, pinata y dinamicas seleccionadas puedan tomar horarios desde los nuevos campos de programa.

#### Scenario: Sembrar fuentes de horario de pastel y pinata
- **WHEN** se ejecuta el seed de reglas de cuestionario
- **THEN** las tareas publicas relacionadas con pastel y pinata quedan configuradas con la fuente de horario capturada en la seccion 15

#### Scenario: Sembrar fuentes de horario por dinamica
- **WHEN** se ejecuta el seed de reglas de cuestionario
- **THEN** cada dinamica soportada queda configurada para usar su propio campo de horario de la seccion 15 cuando genere una tarea programada
