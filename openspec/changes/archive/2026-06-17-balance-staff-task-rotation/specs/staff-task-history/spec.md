## ADDED Requirements

### Requirement: Admin can view staff task history
El sistema SHALL permitir que una administradora consulte el historial de tareas realizadas por cada miembro del personal en los ultimos 5 eventos.

#### Scenario: Mostrar historial por personal
- **WHEN** la administradora abre la pantalla de historial de tareas del personal
- **THEN** el sistema muestra cada miembro del personal con las tareas que realizo en los ultimos 5 eventos

#### Scenario: Mostrar contexto de evento
- **WHEN** el sistema lista una tarea historica
- **THEN** muestra nombre del evento, fecha, hora de la tarea, nombre de tarea y grupo operativo cuando exista

#### Scenario: Incluir personal con asignaciones recientes
- **WHEN** una persona inactiva tiene tareas asignadas en los ultimos 5 eventos
- **THEN** el sistema la muestra en el historial con una senal de inactividad

#### Scenario: Staff sin historial reciente
- **WHEN** una persona activa no tiene tareas asignadas en los ultimos 5 eventos
- **THEN** el sistema la muestra con estado de historial vacio o sin actividades recientes

### Requirement: Staff task history summarizes repetition
El sistema SHALL resumir cuantas veces cada persona realizo cada actividad o grupo operativo dentro de los ultimos 5 eventos.

#### Scenario: Conteo por actividad
- **WHEN** una persona realizo la misma actividad en mas de un evento reciente
- **THEN** el sistema muestra el conteo de repeticiones de esa actividad para esa persona

#### Scenario: Agrupar por grupo operativo
- **WHEN** varias tareas historicas pertenecen al mismo grupo operativo
- **THEN** el sistema resume la repeticion usando el grupo operativo como actividad equivalente

#### Scenario: Actividades sin grupo
- **WHEN** una tarea historica no tiene grupo operativo
- **THEN** el sistema la resume usando la tarea maestra de origen o el nombre normalizado de la tarea

### Requirement: Staff task history can be filtered
El sistema SHALL permitir filtrar el historial por miembro del personal y por evento reciente.

#### Scenario: Filtrar por persona
- **WHEN** la administradora selecciona una persona
- **THEN** el sistema muestra solo el historial y resumen de esa persona

#### Scenario: Filtrar por evento
- **WHEN** la administradora selecciona un evento reciente
- **THEN** el sistema muestra solo las tareas realizadas en ese evento

#### Scenario: Limpiar filtros de historial
- **WHEN** la administradora limpia los filtros
- **THEN** el sistema vuelve a mostrar el historial de todos los miembros para los ultimos 5 eventos

### Requirement: Staff task history can be printed as PDF
El sistema SHALL permitir imprimir o generar PDF del historial de tareas por staff para los ultimos 5 eventos.

#### Scenario: Generar PDF de historial completo
- **WHEN** la administradora solicita imprimir el historial sin filtros
- **THEN** el documento incluye el historial de todos los miembros del personal para los ultimos 5 eventos

#### Scenario: Generar PDF con filtros activos
- **WHEN** la administradora solicita imprimir el historial con filtros activos
- **THEN** el documento incluye solo el historial visible despues de aplicar esos filtros

#### Scenario: PDF incluye resumen de repeticion
- **WHEN** el sistema genera el PDF de historial
- **THEN** el documento incluye conteos por actividad o grupo para cada miembro del personal incluido

#### Scenario: PDF sin historial
- **WHEN** los filtros activos no tienen resultados
- **THEN** el sistema evita generar un PDF vacio o muestra claramente que no hay historial para imprimir
