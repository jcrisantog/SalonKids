## MODIFIED Requirements

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
