## Context

La aplicacion ya tiene tres fuentes relevantes para tareas operativas: `master_tasks`, reglas configurables en `questionnaire_task_rules`/`questionnaire_task_rule_tasks`, y seeds documentales en `Documentos/seed-operational-master-tasks.sql` y `Documentos/seed-questionnaire-task-rules.sql`. `Documentos/ListaTareas.txt` agrega un inventario mas granular con 355 actividades, pero mezcla tareas base, subtareas, servicios opcionales, horarios mencionados y elementos que ya estan cubiertos por tareas actuales con otra redaccion.

La BD actual ya contiene tareas equivalentes para bloques amplios como montaje, pastel, pinata, menu, cafe, gelatina, dinamicas y cierre. Por eso el cambio debe curar la lista antes de sembrar datos: no todo renglon del documento debe convertirse en una tarea maestra independiente.

## Goals / Non-Goals

**Goals:**

- Comparar `ListaTareas.txt` contra tareas maestras y reglas existentes.
- Crear seeds idempotentes para tareas faltantes y reglas accionables con campos actuales del cuestionario.
- Documentar altas, reglas aplicadas, omisiones y razones de omision en un reporte revisable por la duena.
- Mantener reglas y tareas editables desde el admin despues de sembrarlas.
- Evitar duplicados por diferencias menores de redaccion.

**Non-Goals:**

- No agregar campos nuevos al cuestionario.
- No modificar UI de reglas, tareas o cuestionario.
- No recalcular eventos existentes al ejecutar o crear seeds.
- No ejecutar los scripts contra produccion como parte de la implementacion sin indicacion explicita del usuario.
- No convertir cada subtarea del documento en una tarea maestra si ya esta cubierta por una tarea operativa mas amplia.

## Decisions

1. Separar tareas faltantes y reglas faltantes en dos scripts SQL.

   Las tareas maestras deben poder sembrarse antes que las reglas, siguiendo el patron existente de `seed-operational-master-tasks.sql` y `seed-questionnaire-task-rules.sql`. Alternativa considerada: un solo script mixto. Se descarta porque dificulta revisar que tareas nuevas son base y cuales dependen de cuestionario.

2. Mantener la comparacion como curacion operativa, no como matching automatico ciego.

   La similitud textual ayuda a detectar candidatos, pero la decision final debe marcar cada actividad como alta, cubierta o pendiente. Alternativa considerada: sembrar todas las actividades con baja similitud. Se descarta porque produciria ruido y duplicados operativos.

3. Usar solo campos de cuestionario existentes para nuevas reglas.

   Las reglas confiables deben apoyarse en llaves ya presentes como `cake`, `cakeTime`, `pinata`, `pinataTime`, `salonMenu`, `foodStartTime`, `coffeeServiceTiming`, `kidsMenu`, `adultMenu` y horarios de programa especificos de actividades estructuradas. Si una actividad solo podria detectarse con `otherActivityName` o texto libre, el reporte la debe clasificar como candidata pendiente para consultar con la duena, no crear una regla fragil. Alternativa considerada: crear reglas con `contains` sobre `otherActivityName` o notas generales. Se descarta porque puede generar tareas por texto accidental y porque esos servicios requieren decision operativa previa.

4. Preferir tareas maestras agrupadas por bloque operativo.

   Actividades como bebidas, limpieza durante evento, servicio infantil o preparacion de juegos pueden agruparse en tareas maestras accionables con descripciones ricas, en vez de crear decenas de tareas atomicas que saturen el tablero. Alternativa considerada: tarea por cada renglon. Se descarta para mantener el flujo operativo usable.

5. El reporte sera la fuente de auditoria de esta curacion.

   El reporte debe listar cada alta con la regla aplicada o indicar "tarea base" cuando aplica siempre. Tambien debe listar omisiones y justificar si la actividad esta cubierta por una tarea existente, es detalle de otra, no tiene campo confiable o no aplica como tarea independiente.

## Risks / Trade-offs

- Sembrar tareas demasiado amplias puede ocultar pasos importantes -> Mitigacion: descripciones de tareas nuevas deben incluir los pasos cubiertos y el reporte debe listar los renglones absorbidos.
- Sembrar tareas demasiado atomicas puede saturar eventos -> Mitigacion: agrupar por bloque operativo y usar reglas solo cuando haya una condicion clara.
- Usar `contains` sobre textos del cuestionario puede generar falsos positivos -> Mitigacion: no sembrar reglas basadas en `otherActivityName` o notas generales; documentar esas actividades como candidatas que requieren campo nuevo o decision operativa.
- Ejecutar seeds podria actualizar nombres/descripciones existentes por `ON CONFLICT` -> Mitigacion: usar nombres estables nuevos y evitar tocar tareas existentes salvo relaciones/reglas nuevas necesarias.
- El documento contiene etiquetas `[Aplica]`, `[No aplica]` y variantes -> Mitigacion: ignorar esas etiquetas en el analisis y basarse en el texto operativo, como solicito el usuario.

## Migration Plan

1. Implementar scripts en `Documentos/` sin ejecutarlos automaticamente.
2. Verificar idempotencia revisando que usen `ON CONFLICT` o busquedas por nombre/regla equivalente.
3. Actualizar el reporte con la lista final de altas, reglas y omisiones.
4. Opcionalmente ejecutar los scripts contra la BD cuando el usuario lo autorice.
5. Si un seed aplicado debe revertirse, desactivar reglas sembradas desde el admin o mediante SQL especifico por nombre de regla/tarea, sin borrar eventos historicos.
