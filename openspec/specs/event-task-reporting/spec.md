## ADDED Requirements

### Requirement: Admin can filter event tasks by responsible and visibility
El sistema SHALL permitir que una administradora filtre la tabla de tareas de un evento por responsable asignado y visibilidad.

#### Scenario: Filtrar por responsable asignado
- **WHEN** una administradora selecciona una persona del catalogo de responsables en la pantalla de tareas del evento
- **THEN** el sistema muestra solo las tareas cuyo `staff_id` corresponde a esa persona

#### Scenario: Filtrar tareas sin responsable
- **WHEN** una administradora selecciona el filtro de tareas sin responsable
- **THEN** el sistema muestra solo las tareas que no tienen `staff_id`

#### Scenario: Filtrar por visibilidad interna
- **WHEN** una administradora selecciona visibilidad interna
- **THEN** el sistema muestra solo las tareas con `visibility = interna`

#### Scenario: Filtrar por visibilidad publica
- **WHEN** una administradora selecciona visibilidad publica
- **THEN** el sistema muestra solo las tareas con `visibility = publica`

#### Scenario: Combinar filtros
- **WHEN** una administradora selecciona responsable y visibilidad al mismo tiempo
- **THEN** el sistema muestra solo las tareas que cumplen ambos filtros

#### Scenario: Limpiar filtros
- **WHEN** una administradora limpia los filtros
- **THEN** el sistema vuelve a mostrar todas las tareas del evento

### Requirement: Filtered event tasks can be exported as a styled PDF
El sistema SHALL permitir que una administradora genere un PDF estetico y colorido con la informacion visible despues de aplicar filtros.

#### Scenario: Generar PDF con filtros activos
- **WHEN** una administradora aplica filtros y solicita generar PDF
- **THEN** el sistema genera un PDF con solo las tareas filtradas

#### Scenario: PDF incluye campos requeridos
- **WHEN** el sistema genera el PDF
- **THEN** el documento incluye columnas Hora, Tarea, Descripcion y Responsable

#### Scenario: PDF excluye campos no requeridos
- **WHEN** el sistema genera el PDF
- **THEN** el documento no incluye acciones administrativas, visibilidad, estado, proteccion ni controles de filtro

#### Scenario: PDF muestra contexto del evento
- **WHEN** el sistema genera el PDF
- **THEN** el documento muestra nombre del evento, fecha, rango horario y resumen de filtros aplicados

#### Scenario: PDF con diseno estetico
- **WHEN** el sistema genera el PDF
- **THEN** el documento usa encabezado, colores, espaciado y tabla legible en lugar de una captura o impresion directa de pantalla

#### Scenario: PDF sin resultados
- **WHEN** los filtros aplicados no tienen tareas coincidentes
- **THEN** el sistema evita generar un PDF vacio o muestra claramente que no hay tareas para imprimir

### Requirement: Seeded tasks support operational filtering and printing
El sistema SHALL sembrar tareas con datos consistentes de area, responsable sugerido y visibilidad para que los filtros e impresion de tareas sean utiles desde la base inicial.

#### Scenario: Filtrar tareas internas sembradas
- **WHEN** una administradora filtra tareas por visibilidad interna
- **THEN** el sistema muestra tareas operativas sembradas como preparacion, montaje, cocina, seguridad, cierre y limpieza

#### Scenario: Filtrar tareas publicas sembradas
- **WHEN** una administradora filtra tareas por visibilidad publica
- **THEN** el sistema muestra solo momentos que pueden compartirse como parte del itinerario del evento

#### Scenario: Imprimir tareas base de cierre
- **WHEN** una administradora genera PDF de tareas de cierre
- **THEN** el documento incluye tareas sembradas de cierre con hora, descripcion y responsable sugerido

### Requirement: Seeded task names are operationally clear
El sistema SHALL usar nombres de tareas sembradas que distingan preparacion, ejecucion publica y cierre para evitar ambiguedad en reportes.

#### Scenario: Mostrar nombre de preparacion
- **WHEN** una tarea sembrada prepara un momento posterior
- **THEN** el listado muestra un nombre que inicia o expresa preparacion, revision, coordinacion o montaje

#### Scenario: Mostrar nombre de momento publico
- **WHEN** una tarea sembrada representa un momento visible para clientes
- **THEN** el listado muestra un nombre corto adecuado para itinerario o PDF publico

### Requirement: Event task table can be searched live
El sistema SHALL permitir busqueda textual en vivo dentro de la seccion de Tareas del Evento.

#### Scenario: Buscar tarea de evento por nombre
- **WHEN** una administradora escribe parte del nombre de una tarea del evento
- **THEN** la tabla muestra solo tareas cuyo nombre coincida con la busqueda

#### Scenario: Buscar tarea de evento por detalle
- **WHEN** una administradora escribe descripcion, hora, estado, visibilidad, rol responsable o nombre de staff asignado
- **THEN** la tabla muestra tareas que coincidan con esos campos

#### Scenario: Combinar busqueda con filtros existentes
- **WHEN** la administradora usa busqueda textual junto con filtro de responsable o visibilidad
- **THEN** la tabla muestra solo tareas que cumplan todos los criterios activos

#### Scenario: Imprimir con busqueda activa
- **WHEN** la administradora genera PDF con una busqueda y filtros activos
- **THEN** el PDF incluye solo las tareas visibles despues de aplicar busqueda y filtros

#### Scenario: Sin coincidencias en tareas de evento
- **WHEN** la busqueda y filtros activos no coinciden con ninguna tarea del evento
- **THEN** el sistema muestra un estado vacio claro y evita imprimir un PDF vacio

### Requirement: Editing an event task focuses the task form
El sistema SHALL desplazar la pantalla hacia el formulario de tareas cuando una administradora inicia la edicion de una tarea de evento.

#### Scenario: Editar tarea desde la tabla
- **WHEN** la administradora presiona editar en una tarea dentro de la tabla de tareas del evento
- **THEN** el sistema carga los datos de la tarea en el formulario y desplaza la pantalla hasta el formulario de edicion

#### Scenario: Cancelar edicion mantiene flujo actual
- **WHEN** la administradora cancela la edicion despues de que la pantalla fue desplazada al formulario
- **THEN** el sistema limpia el formulario y conserva la lista de tareas disponible para seguir trabajando
