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
