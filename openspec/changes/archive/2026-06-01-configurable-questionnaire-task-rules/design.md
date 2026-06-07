## Context

El cuestionario publico ya guarda respuestas en `questionnaire_data.data` como JSONB y sincroniza tareas desde `src/lib/rule-engine.ts`. Actualmente esa sincronizacion depende de reglas hardcodeadas en codigo: cada regla evalua campos del cuestionario y crea tareas directamente en `event_tasks`.

La matriz operativa adjunta define una relacion mas amplia entre secciones, preguntas, respuestas que aplican, tareas internas, actividades publicas, responsables y momentos. La necesidad nueva es convertir esa matriz en configuracion administrable para que la duena pueda mantener reglas sin tocar codigo, especialmente cuando se agreguen nuevas preguntas al cuestionario.

## Goals / Non-Goals

**Goals:**

- Permitir configurar reglas simples pregunta -> tareas desde admin.
- Usar `questionnaireSections` como fuente de preguntas disponibles.
- Usar `master_tasks` como catalogo obligatorio de tareas generables.
- Evaluar reglas activas al guardar cuestionarios y generar tareas de evento.
- Mantener `is_manual_override = true` protegido contra borrado/regeneracion.
- Sembrar reglas iniciales equivalentes a la matriz operativa actual.
- Aplicar cambios de reglas solo hacia futuros guardados o eventos nuevos.

**Non-Goals:**

- No crear un constructor avanzado con grupos AND/OR.
- No permitir tareas inline fuera del catalogo `master_tasks`.
- No recalcular automaticamente eventos ya contestados al guardar reglas.
- No cambiar la estructura JSONB del cuestionario.
- No implementar calculo de costos, ventas o pagos de add-ons.

## Decisions

1. Guardar reglas en tablas relacionales.

   Se agregaran `questionnaire_task_rules` y `questionnaire_task_rule_tasks`. Esto permite listar, filtrar, activar/desactivar y auditar reglas sin depender de un JSON grande dificil de editar.

   Alternativa descartada: guardar todas las reglas como JSONB en una sola tabla. Es mas rapido al inicio, pero complica validacion, edicion granular y relacion con `master_tasks`.

2. Usar condiciones simples por regla.

   Cada regla tendra `field_key`, `operator` y `expected_value`. Los operadores iniciales seran `answered`, `equals`, `not_equals`, `is_true`, `is_false`, `greater_than` y `contains`.

   Alternativa descartada: motor avanzado con expresiones. Seria mas potente, pero menos claro para la duena y mas riesgoso para datos operativos.

3. Reutilizar `master_tasks` como fuente de tareas.

   La relacion `questionnaire_task_rule_tasks` apuntara a `master_tasks.id` y permitira overrides operativos por regla: descripcion, hora, rol responsable y visibilidad.

   Alternativa descartada: tareas libres por regla. Duplicaria catalogos y haria mas dificil mantener consistencia operativa.

4. Generar tareas con una llave estable de regla.

   Las tareas generadas por reglas configurables deben poder regenerarse sin duplicarse. Como `event_tasks` no tiene una columna de origen, la implementacion debera agregar un identificador estable de origen, por ejemplo `source_rule_task_id UUID`, o una estrategia equivalente que permita borrar solo tareas generadas por reglas y preservar tareas manuales.

   Alternativa descartada: borrar por `task_name`. Ya existe y funciona para reglas hardcodeadas, pero se vuelve fragil cuando la duena puede cambiar nombres o reutilizar plantillas.

5. Mantener compatibilidad durante transicion.

   El motor nuevo debe reemplazar las reglas hardcodeadas, pero el seed inicial debe cubrir la matriz actual para que el comportamiento operativo no desaparezca.

## Risks / Trade-offs

- Reglas mal configuradas pueden generar tareas de mas -> La UI debe mostrar vista previa de condicion, tarea y visibilidad antes de guardar.
- Preguntas renombradas pueden confundir a la duena -> Guardar `field_key` estable y mostrar etiqueta actual desde `questionnaireSections`.
- Cambios de reglas no afectan eventos antiguos automaticamente -> Documentar que aplican al siguiente guardado del cuestionario.
- Falta de columna de origen en `event_tasks` puede causar duplicados -> Agregar identificador de origen para regeneracion segura.
- Seed inicial puede no cubrir toda la matriz -> Importar reglas prioritarias desde el documento y dejar preguntas informativas sin regla.

## Migration Plan

1. Agregar tablas nuevas al `schema.sql`.
2. Agregar campo de origen a `event_tasks` si se confirma necesario para regeneracion segura.
3. Crear seed inicial de reglas basado en la matriz operativa y tareas maestras existentes.
4. Crear APIs admin para CRUD de reglas y relaciones con tareas maestras.
5. Crear pantalla admin para editar reglas.
6. Cambiar `syncReactiveTasks` para leer y evaluar reglas configurables.
7. Mantener el contrato publico del guardado del cuestionario.
8. Validar con lint, build y pruebas manuales de generacion.

## Open Questions

- Ninguna decision de producto pendiente: se usaran condiciones simples, tareas del catalogo y aplicacion solo futura.
