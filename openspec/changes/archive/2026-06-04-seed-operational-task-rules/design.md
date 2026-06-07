## Context

El sistema ya cuenta con tres piezas relacionadas: `master_tasks`, reglas configurables en `questionnaire_task_rules`/`questionnaire_task_rule_tasks` y un `rule-engine` que todavia conserva reglas hardcodeadas antiguas. El seed actual de `Documentos/seed-questionnaire-task-rules.sql` crea algunas reglas iniciales, pero funciona mas como ejemplo que como base operativa completa.

Los documentos operativos de sabado 2026 describen actividades reales de entrada y cierre. La extraccion parcial confirma datos de referencia como preparacion desde las 13:00, evento de 14:00 a 20:00, coordinacion con colaboradores, inicio de actividades, bajada de pertenencias de anfitriones, retiro de charolas, separacion de residuos y manteleria. La base debe capturar estos patrones sin quedar atada a un solo evento o a nombres de personas especificas.

## Goals / Non-Goals

**Goals:**
- Entregar un seed inicial coherente para tareas maestras y reglas de cuestionario.
- Separar tareas base de entrada/cierre de tareas condicionales generadas por respuestas.
- Reducir duplicidad entre reglas hardcodeadas y reglas configurables.
- Usar nombres, areas, responsables sugeridos, visibilidad y horarios relativos/por defecto consistentes para filtrado e impresion.
- Dejar documentada la matriz inicial para que la duena pueda ajustar tareas y reglas desde el admin.

**Non-Goals:**
- No automatizar interpretacion completa de PDFs dentro del producto.
- No fijar nombres de colaboradores de un documento especifico como responsables permanentes.
- No recalcular eventos historicos al cambiar el seed.
- No cambiar el cuestionario salvo que se detecte una pregunta indispensable para una regla operativa faltante.

## Decisions

1. Mantener las tareas operativas fijas como `master_tasks` base.

   Las actividades de entrada y cierre ocurren para todos los eventos aunque el cuestionario no tenga respuestas especiales. Se deben sembrar como plantillas maestras con `area` como `Entrada`, `Montaje`, `Cierre`, `Limpieza`, `Cocina` o `Coordinacion`. `buildBaseEventTasks` ya puede tomar plantillas que incluyan entrada, cierre, montaje o desmontaje; por eso conviene alimentar ese mecanismo en vez de crear reglas artificiales.

   Alternativa considerada: crear reglas `answered` para preguntas generales como fecha u hora. Se descarta porque generaria tareas base desde respuestas informativas y mezclaria operacion fija con configuracion condicional.

2. Usar reglas configurables para senales del cuestionario.

   Pastel, pinata, menus, alergias, dinamicas, decoracion, personaje, fotos, servicios extra y horarios de programa deben generarse por `questionnaire_task_rules`. Cada regla puede asociar varias tareas con overrides independientes, asi que no hace falta mantener funciones hardcodeadas para esos casos.

   Alternativa considerada: conservar `questionnaireRules` como respaldo principal. Se descarta para la base operativa porque la duena no puede modificarlo desde el admin y puede duplicar tareas con el seed configurable.

3. Clasificar las preguntas en tres grupos.

   - `base`: no dependen de respuesta y se cubren con tareas maestras de entrada/cierre.
   - `generadora`: una respuesta crea una o mas tareas accionables.
   - `informativa`: se conserva en cuestionario o descripcion de una tarea generadora, pero no crea tarea propia.

   Esta clasificacion debe documentarse junto al seed para que la duena entienda por que algunas preguntas no tienen regla.

4. Preferir visibilidad interna salvo que la tarea sea parte del itinerario del cliente.

   Tareas como protocolo de pastel, pinata, presentacion, show o servicio programado pueden ser `publica`. Preparacion, seguridad, proveedores, cocina, residuos, montaje y cierre deben ser `interna`.

5. Sembrar responsables por rol y dejar `staff_id` opcional.

   Los PDFs mencionan colaboradores concretos, pero el seed debe usar roles sugeridos para ser reutilizable. Si el catalogo de staff ya esta definido, la administradora podra asignar personas desde el admin o mediante overrides futuros.

## Risks / Trade-offs

- Duplicacion de tareas si conviven reglas hardcodeadas y configurables -> Desactivar el camino hardcodeado para sincronizacion normal o limitarlo a fallback sin reglas configurables activas.
- Seed demasiado grande para operar -> Documentar prioridad: indispensables, recomendadas y opcionales; sembrar activas solo las indispensables/recomendadas.
- Horarios de seed no aplican a todos los eventos -> Usar `arrivalTime`, horarios del programa o inicio/fin del evento cuando existan; dejar horarios default editables.
- Texto operativo de PDFs parcialmente extraido -> Usar los documentos como referencia de categorias y completar los nombres/descripciones en lenguaje generico editable.
- Reejecutar seeds podria pisar ajustes de la duena -> Hacer seeds idempotentes y evitar actualizar reglas/tareas que ya fueron modificadas manualmente, o documentar claramente que el seed inicial se ejecuta una vez.

## Migration Plan

1. Crear o actualizar un seed idempotente para tareas maestras operativas base.
2. Reemplazar/ampliar `Documentos/seed-questionnaire-task-rules.sql` con la matriz depurada.
3. Ajustar `syncReactiveTasks` para usar reglas configurables como fuente principal y evitar duplicados con reglas hardcodeadas.
4. Ejecutar migracion/seed en ambiente de prueba.
5. Crear un evento de prueba, guardar cuestionario con combinaciones representativas y revisar tareas generadas.
6. Validar filtros e impresion por responsable/visibilidad.
7. Entregar documentacion de la matriz a la duena para ajustes posteriores.

Rollback: conservar respaldo del seed anterior y revertir los cambios de reglas/tareas sembradas antes de produccion. Para eventos ya creados, no recalcular automaticamente; corregir manualmente si el evento de prueba genero datos no deseados.

## Open Questions

- Confirmar si la base inicial debe activar todas las reglas recomendadas o dejar algunas como inactivas/candidatas.
- Confirmar si el admin actual permite editar `master_tasks` con suficiente comodidad para que la duena mantenga esta base sin SQL.
- Confirmar si se desea un documento adicional de matriz en formato tabla para revision no tecnica.
