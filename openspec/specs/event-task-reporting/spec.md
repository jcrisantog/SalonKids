## ADDED Requirements

### Requirement: Event task editing hides responsible role
El sistema SHALL permitir crear y editar Tareas del Evento sin mostrar ni requerir Rol responsable y permitiendo seleccionar multiples responsables por persona.

#### Scenario: Crear tarea de evento sin rol responsable
- **WHEN** la administradora captura una tarea de evento con nombre, hora, responsables por persona opcionales, estado, descripcion y visibilidad
- **THEN** el sistema guarda la tarea sin pedir Rol responsable

#### Scenario: Editar tarea de evento existente
- **WHEN** la administradora edita una tarea que conserva `role_responsible` en datos existentes
- **THEN** el sistema permite guardar cambios visibles sin mostrar ni requerir Rol responsable

#### Scenario: Tabla de tareas de evento sin columna de rol
- **WHEN** la administradora consulta las tareas de un evento
- **THEN** el sistema no muestra una columna de Rol responsable

### Requirement: Admin can filter event tasks by responsible and visibility
El sistema SHALL permitir que una administradora filtre la tabla de tareas de un evento por cualquiera de sus responsables asignados y visibilidad.

#### Scenario: Filtrar por responsable asignado
- **WHEN** una administradora selecciona una persona del catalogo de responsables en la pantalla de tareas del evento
- **THEN** el sistema muestra las tareas donde esa persona aparece en la lista de responsables asignados

#### Scenario: Filtrar tareas sin responsable
- **WHEN** una administradora selecciona el filtro de tareas sin responsable
- **THEN** el sistema muestra solo las tareas que no tienen responsables asignados

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
El sistema SHALL permitir que una administradora genere un PDF estetico y colorido con la informacion visible despues de aplicar filtros, y SHALL permitir anexar los Lineamientos y Avisos guardados cuando la administradora lo confirme.

#### Scenario: Generar PDF con filtros activos
- **WHEN** una administradora aplica filtros y solicita generar PDF
- **THEN** el sistema genera un PDF con solo las tareas filtradas

#### Scenario: PDF pregunta por lineamientos guardados
- **WHEN** una administradora solicita generar PDF y existen Lineamientos y Avisos guardados
- **THEN** el sistema pregunta si desea incluirlos en el PDF antes de generar el documento

#### Scenario: PDF incluye lineamientos confirmados
- **WHEN** la administradora confirma que desea incluir Lineamientos y Avisos
- **THEN** el PDF generado incluye una seccion titulada "Lineamientos y Avisos" con el contenido enriquecido guardado

#### Scenario: PDF respeta formato enriquecido permitido
- **WHEN** los Lineamientos y Avisos guardados contienen formato permitido como parrafos, negritas, cursivas, encabezados, listas o enlaces
- **THEN** el PDF muestra ese formato de forma legible y consistente con el diseno del documento

#### Scenario: PDF no ejecuta contenido inseguro
- **WHEN** los Lineamientos y Avisos guardados contienen o intentan contener HTML inseguro
- **THEN** el PDF no ejecuta scripts ni conserva atributos o URLs peligrosas

#### Scenario: PDF omite lineamientos rechazados
- **WHEN** la administradora elige generar el PDF sin Lineamientos y Avisos
- **THEN** el PDF se genera sin esa seccion adicional

#### Scenario: PDF sin lineamientos guardados
- **WHEN** la administradora solicita generar PDF y no hay Lineamientos y Avisos guardados
- **THEN** el sistema genera el PDF sin preguntar por lineamientos

#### Scenario: PDF incluye campos requeridos
- **WHEN** el sistema genera el PDF
- **THEN** el documento incluye columnas Hora, Tarea, Descripcion y Responsable

#### Scenario: PDF usa personas asignadas como responsables
- **WHEN** el sistema genera el PDF y una tarea tiene uno o varios responsables asignados
- **THEN** la columna Responsable muestra los nombres de todas las personas asignadas a la tarea

#### Scenario: PDF muestra S/R sin persona asignada
- **WHEN** el sistema genera el PDF y una tarea no tiene responsables asignados
- **THEN** la columna Responsable muestra `S/R`

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
- **WHEN** una administradora escribe descripcion, hora, estado, visibilidad o nombre de cualquier staff asignado
- **THEN** la tabla muestra tareas que coincidan con esos campos visibles

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

### Requirement: Las tareas de evento se pueden filtrar por grupo catalogado
El sistema SHALL permitir filtrar la lista de tareas de un evento por el grupo catalogado resuelto desde su tarea maestra de origen.

#### Scenario: Filtrar tareas de evento por grupo
- **WHEN** una administradora selecciona un grupo de tareas en la pantalla de tareas del evento
- **THEN** el sistema muestra solo las tareas de evento cuyo origen pertenece a ese grupo catalogado

#### Scenario: Filtrar tareas de evento sin grupo
- **WHEN** una administradora selecciona la opcion "Sin grupo"
- **THEN** el sistema muestra solo tareas de evento sin grupo catalogado resuelto

#### Scenario: Combinar grupo con filtros existentes
- **WHEN** una administradora filtra por grupo y tambien usa responsable, visibilidad o busqueda
- **THEN** el sistema muestra solo tareas que cumplen todos los filtros aplicados

### Requirement: Admin can export staff task history from reporting
El sistema SHALL permitir que los reportes administrativos incluyan una vista imprimible del historial de tareas por miembro del personal.

#### Scenario: Exportar historial con ultimos eventos
- **WHEN** la administradora genera el reporte de historial del personal
- **THEN** el sistema incluye tareas realizadas en los ultimos 5 eventos con responsable, evento, fecha, actividad y grupo operativo

#### Scenario: Reporte muestra filtros aplicados
- **WHEN** la administradora imprime el historial con filtros por persona o evento
- **THEN** el documento muestra un resumen de los filtros aplicados

#### Scenario: Reporte apto para auditoria de rotacion
- **WHEN** la administradora revisa el PDF de historial
- **THEN** el documento permite identificar que actividades se han repetido por persona en eventos recientes
