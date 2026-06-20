## Context

El cuestionario guarda respuestas dinamicas en JSON y `src/lib/questionnaire-schema.ts` define tanto los defaults como la metadata de secciones y campos. La seccion 15 ya captura horarios de programa, pero no tiene campos para el momento de pastel, piñata ni para cada dinamica seleccionada en la seccion 13.

La generacion configurable de tareas ya soporta `schedule_source_field_key`, por lo que las tareas pueden dispararse por una respuesta booleana y tomar su hora desde otro campo del cuestionario. Esto permite resolver el cambio sin agregar columnas nuevas.

## Goals / Non-Goals

**Goals:**

- Capturar `cakeTime` y `pinataTime` en la seccion 15 solo cuando `cake` o `pinata` sean verdaderos.
- Capturar un horario por cada dinamica seleccionada: `reyPideTime`, `loboTime`, `camisetaTime`, `gatoGiganteTime`, `sillasTime`, `loteriaTime`, `futbolTime` y `tetrixTime`.
- Guardar los nuevos horarios como campos `time` en el payload del cuestionario, con defaults vacios y compatibilidad para datos existentes.
- Actualizar reglas/seeds para que las tareas publicas de pastel, piñata y dinamicas usen esos horarios mediante `schedule_source_field_key`.

**Non-Goals:**

- Mostrar el cronograma publico en la interfaz del cuestionario.
- Cambiar la estructura de base de datos del cuestionario.
- Reemplazar la administracion existente de reglas de cuestionario.
- Forzar que el cliente capture horarios obligatorios.

## Decisions

1. Usar campos planos en el payload del cuestionario.

   Se agregaran llaves camelCase al tipo `QuestionnaireData` y a `emptyQuestionnaire`. Alternativa considerada: guardar una lista anidada de dinamicas con horarios. Se descarta porque la metadata actual del cuestionario, la UI y el motor de reglas trabajan con `field_key` plano y estable.

2. Ubicar todos los horarios nuevos en la seccion 15.

   Los campos de actividad se capturan en el programa aunque sus respuestas habilitadoras vivan en secciones anteriores. Alternativa considerada: poner cada horario junto a su actividad original. Se descarta porque la operacion pidio especificamente agregarlo en la seccion 15 y eso mantiene el programa en un solo bloque.

3. Usar dependencias de visibilidad existentes.

   `cakeTime` dependera de `cake`, `pinataTime` dependera de `pinata` y cada horario de dinamica dependera de la bandera de esa dinamica. Alternativa considerada: depender solo de `danceGames`. Se descarta porque mostraria horarios para dinamicas no seleccionadas.

4. Mapear horarios por `schedule_source_field_key`.

   Las reglas existentes o sembradas para `cake`, `pinata` y cada dinamica conservaran la pregunta booleana como disparador y tomaran la hora del nuevo campo relacionado. Alternativa considerada: crear reglas que se disparen por el campo de hora. Se descarta porque perderia la relacion directa con la seleccion de la actividad y podria generar tareas solo por capturar una hora accidental.

## Risks / Trade-offs

- Horarios capturados pero reglas no actualizadas -> Mitigacion: incluir tareas para actualizar seeds, matriz/documentacion y verificar `schedule_source_field_key`.
- Dinamicas existentes estan agregadas en una sola tarea -> Mitigacion: permitir reglas sembradas por dinamica seleccionada para tareas publicas individuales, conservando la tarea agregada solo si sigue siendo necesaria para preparacion.
- Campos ocultos conservan valores anteriores -> Mitigacion: mantener el comportamiento actual de preservar valores ocultos y hacer que las reglas dependan de la bandera de seleccion, no solo del horario.
- Eventos con cuestionarios anteriores no tienen los nuevos campos -> Mitigacion: defaults vacios en `emptyQuestionnaire` y merge de `normalizeQuestionnaire`.
