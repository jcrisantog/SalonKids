## ADDED Requirements

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
