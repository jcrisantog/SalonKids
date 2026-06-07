## ADDED Requirements

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
El sistema SHALL agregar la tarea maestra recien creada al catalogo disponible de la pantalla de Reglas Cuestionario y SHALL seleccionarla automaticamente en la relacion regla-tarea que originó la creacion.

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
- **WHEN** la administradora selecciona un responsable predeterminado que no existe en el catalogo de staff
- **THEN** el sistema rechaza la creacion y muestra el mensaje de validacion del servidor

#### Scenario: Error de servidor conserva datos del modal
- **WHEN** la creacion de tarea falla por un error de servidor o red
- **THEN** el sistema mantiene abierto el modal con los valores capturados para que la administradora pueda corregir o reintentar
