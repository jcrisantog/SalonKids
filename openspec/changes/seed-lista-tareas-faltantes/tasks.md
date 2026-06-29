## 1. Inventario y comparacion

- [x] 1.1 Leer `Documentos/ListaTareas.txt` ignorando etiquetas como `[Aplica]`, `[No aplica]`, `[Pendiente]` y variantes.
- [x] 1.2 Consultar o exportar el inventario actual de `master_tasks`, `questionnaire_task_rules` y `questionnaire_task_rule_tasks` de la BD actual.
- [x] 1.3 Comparar actividades del documento contra tareas maestras existentes por nombre, descripcion y equivalencia operativa.
- [x] 1.4 Clasificar cada actividad como alta nueva, cubierta por tarea existente, detalle de tarea mas amplia, candidata sin campo confiable o no accionable como tarea independiente.

## 2. Curacion operativa

- [x] 2.1 Definir las tareas maestras faltantes que aplican como tareas base de evento.
- [x] 2.2 Definir las tareas maestras faltantes que solo deben generarse por regla de cuestionario.
- [x] 2.3 Agrupar tareas nuevas por bloque operativo cuando compartan responsable natural.
- [x] 2.4 Definir para cada tarea generada la regla aplicable usando solo campos actuales del cuestionario.
- [x] 2.5 Separar actividades que requieren campos nuevos de cuestionario para una regla confiable y dejarlas documentadas como candidatas.

## 3. Scripts SQL

- [x] 3.1 Crear `Documentos/seed-lista-tareas-master-tasks.sql` con funciones idempotentes para tareas y grupos faltantes.
- [x] 3.2 Crear `Documentos/seed-lista-tareas-questionnaire-rules.sql` con funciones idempotentes para reglas y relaciones regla-tarea faltantes.
- [x] 3.3 Asegurar que los scripts no dupliquen tareas existentes ni relaciones existentes al reejecutarse.
- [x] 3.4 Asegurar que las reglas nuevas usen `schedule_source_field_key` cuando el horario venga de un campo relacionado.
- [x] 3.5 Evitar que los scripts ejecuten cambios destructivos o borren reglas/tareas actuales.

## 4. Reporte y documentacion

- [x] 4.1 Crear `Documentos/reporte-lista-tareas-vs-bd.md` con resumen de BD revisada, conteos y criterio de comparacion.
- [x] 4.2 Documentar en el reporte cada tarea dada de alta, origen en `ListaTareas.txt`, tipo de aplicacion y regla asociada cuando exista.
- [x] 4.3 Documentar en el reporte cada tarea ignorada y su motivo.
- [x] 4.4 Documentar actividades candidatas que requieren campos nuevos de cuestionario antes de poder sembrar reglas confiables.
- [x] 4.5 Actualizar `Documentos/matriz-operativa-tareas-reglas.md` si las nuevas tareas o reglas deben quedar integradas a la matriz principal.

## 5. Verificacion

- [x] 5.1 Revisar sintaxis SQL y consistencia de nombres contra `schema.sql`.
- [x] 5.2 Verificar que los scripts sean idempotentes por inspeccion y, si el usuario autoriza, con una ejecucion controlada contra la BD.
- [x] 5.3 Ejecutar `npm.cmd run lint` si se modifican archivos de codigo TypeScript o UI.
- [x] 5.4 Entregar resumen final indicando archivos creados, tareas sembradas, reglas sembradas y pendientes que requieren decision futura.
