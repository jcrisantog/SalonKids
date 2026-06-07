# Verificacion de reglas y tareas operativas

Este checklist valida la base inicial sin requerir un framework de pruebas adicional.

## Seeds

- Ejecutar `schema.sql`.
- Ejecutar `Documentos/seed-operational-master-tasks.sql`.
- Ejecutar `Documentos/seed-questionnaire-task-rules.sql`.
- Ejecutar de nuevo ambos seeds y confirmar que:
  - No se duplican nombres en `master_tasks`.
  - No se duplican reglas por `field_key`, `operator` y `expected_value`.
  - No se duplican relaciones en `questionnaire_task_rule_tasks`.

## Evento base

Crear un evento de prueba con inicio `14:00` y fin `20:00`.

Resultado esperado:

- Las tareas de entrada y montaje se generan cerca del inicio.
- Las tareas de cierre se generan cerca del fin.
- Las tareas base aparecen como internas y con rol sugerido.

## Cuestionario con reglas

Guardar un cuestionario de prueba con:

- `cake = true`
- `pinata = true`
- `salonMenu = true`
- `allergies` con texto
- `externalDecoration = true`
- `danceGames = true`
- `trampolineSocksOption` respondido
- `foodStartTime = 15:00`
- `showTime = 17:00`

Resultado esperado:

- Pastel genera preparacion interna y protocolo publico.
- Pinata genera preparacion interna y momento publico.
- Menu y alergias generan tareas internas de cocina.
- Decoracion genera recepcion o coordinacion interna.
- Dinamicas genera tarea publica.
- Seguridad genera tarea interna.
- Inicio de comida y show usan la hora capturada en el cuestionario.

## Duplicados

Guardar el mismo cuestionario dos veces.

Resultado esperado:

- Las tareas generadas por reglas configurables se reemplazan sin duplicarse.
- Las tareas manuales con `is_manual_override = true` se conservan.

## Filtros e impresion

En la pantalla de tareas del evento:

- Filtrar por visibilidad interna.
- Filtrar por visibilidad publica.
- Filtrar por responsable sugerido o asignado.
- Generar PDF con filtros activos.

Resultado esperado:

- Las tareas internas muestran preparacion, montaje, cocina, seguridad y cierre.
- Las tareas publicas muestran momentos del itinerario.
- El PDF respeta filtros y no incluye controles administrativos.
