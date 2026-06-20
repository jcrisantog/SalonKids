## 1. Preparacion

- [x] 1.1 Leer la guia local relevante de Next.js en `node_modules/next/dist/docs/` antes de editar codigo de la app o de rutas.
- [x] 1.2 Revisar `src/lib/questionnaire-schema.ts`, `src/lib/rule-engine.ts`, `Documentos/seed-questionnaire-task-rules.sql` y el flujo de guardado del cuestionario del cliente para confirmar patrones actuales de campos y reglas.

## 2. Campos Del Cuestionario

- [x] 2.1 Agregar `cakeTime`, `pinataTime`, `reyPideTime`, `loboTime`, `camisetaTime`, `gatoGiganteTime`, `sillasTime`, `loteriaTime`, `futbolTime` y `tetrixTime` a `QuestionnaireData`.
- [x] 2.2 Agregar valores por defecto como cadena vacia para los nuevos campos de horario en `emptyQuestionnaire`.
- [x] 2.3 Agregar campos condicionales de horario en la seccion 15 para pastel y pinata usando la metadata de dependencias existente.
- [x] 2.4 Agregar campos condicionales de horario en la seccion 15 para cada dinamica seleccionada en la seccion 13 usando la metadata de dependencias existente.
- [x] 2.5 Verificar que los payloads anteriores del cuestionario carguen mediante `normalizeQuestionnaire` con los nuevos campos vacios por defecto.

## 3. Programacion De Reglas De Tareas

- [x] 3.1 Actualizar las reglas sembradas del cuestionario para que la tarea publica de pastel use `cakeTime` como `schedule_source_field_key`.
- [x] 3.2 Actualizar las reglas sembradas del cuestionario para que la tarea publica de pinata use `pinataTime` como `schedule_source_field_key`.
- [x] 3.3 Agregar o actualizar reglas sembradas y tareas maestras para dinamicas seleccionadas, de modo que cada dinamica soportada pueda generar una tarea publica programada.
- [x] 3.4 Mapear cada tarea de regla de dinamica con su campo de horario correspondiente mediante `schedule_source_field_key`.
- [x] 3.5 Asegurar que los valores residuales de horario no generen tareas cuando el booleano de la actividad que dispara la regla sea falso.

## 4. Documentacion Y Verificacion

- [x] 4.1 Actualizar la documentacion operativa o las entradas de la matriz para los nuevos campos fuente de horario.
- [x] 4.2 Ejecutar las verificaciones de lint/build disponibles para el proyecto.
- [x] 4.3 Verificar manualmente que el cuestionario publico muestre los campos de horario de pastel, pinata y dinamicas solo cuando apliquen sus respuestas padre.
- [x] 4.4 Verificar manualmente que las respuestas guardadas del cuestionario generen o actualicen tareas programadas con los horarios capturados.
