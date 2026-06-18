## MODIFIED Requirements

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
