## ADDED Requirements

### Requirement: Event task editing hides responsible role
El sistema SHALL permitir crear y editar Tareas del Evento sin mostrar ni requerir Rol responsable.

#### Scenario: Crear tarea de evento sin rol responsable
- **WHEN** la administradora captura una tarea de evento con nombre, hora, responsable por persona opcional, estado, descripcion y visibilidad
- **THEN** el sistema guarda la tarea sin pedir Rol responsable

#### Scenario: Editar tarea de evento existente
- **WHEN** la administradora edita una tarea que conserva `role_responsible` en datos existentes
- **THEN** el sistema permite guardar cambios visibles sin mostrar ni requerir Rol responsable

#### Scenario: Tabla de tareas de evento sin columna de rol
- **WHEN** la administradora consulta las tareas de un evento
- **THEN** el sistema no muestra una columna de Rol responsable

## MODIFIED Requirements

### Requirement: Filtered event tasks can be exported as a styled PDF
El sistema SHALL permitir que una administradora genere un PDF estetico y colorido con la informacion visible despues de aplicar filtros.

#### Scenario: Generar PDF con filtros activos
- **WHEN** una administradora aplica filtros y solicita generar PDF
- **THEN** el sistema genera un PDF con solo las tareas filtradas

#### Scenario: PDF incluye campos requeridos
- **WHEN** el sistema genera el PDF
- **THEN** el documento incluye columnas Hora, Tarea, Descripcion y Responsable

#### Scenario: PDF usa persona asignada como responsable
- **WHEN** el sistema genera el PDF y una tarea tiene `staff_id`
- **THEN** la columna Responsable muestra el nombre de la persona asignada a la tarea

#### Scenario: PDF muestra S/R sin persona asignada
- **WHEN** el sistema genera el PDF y una tarea no tiene `staff_id`
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

### Requirement: Event task table can be searched live
El sistema SHALL permitir busqueda textual en vivo dentro de la seccion de Tareas del Evento.

#### Scenario: Buscar tarea de evento por nombre
- **WHEN** una administradora escribe parte del nombre de una tarea del evento
- **THEN** la tabla muestra solo tareas cuyo nombre coincida con la busqueda

#### Scenario: Buscar tarea de evento por detalle
- **WHEN** una administradora escribe descripcion, hora, estado, visibilidad o nombre de staff asignado
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
