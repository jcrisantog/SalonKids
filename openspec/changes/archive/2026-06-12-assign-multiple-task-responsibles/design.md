## Context

El sistema ya tiene catalogo de `staff`, tareas maestras en `master_tasks`, reglas configurables en `questionnaire_task_rules`/`questionnaire_task_rule_tasks` y tareas de evento en `event_tasks`. La asignacion actual se basa en un solo `default_staff_id`, `override_staff_id` y `staff_id`, pero la operacion real requiere uno o varios responsables por actividad.

La duena tambien necesita una accion asistida en la pantalla de tareas del evento para repartir responsables automaticamente, sin perder la posibilidad de corregir una tarea manualmente.

## Goals / Non-Goals

**Goals:**

- Soportar multiples responsables predeterminados en tareas maestras.
- Soportar multiples responsables concretos en tareas de evento.
- Definir cuantos responsables requiere cada tarea maestra para que la asignacion automatica tenga una meta clara.
- Migrar asignaciones existentes de responsable unico a las nuevas relaciones multiples.
- Permitir asignacion automatica por evento usando staff activo, defaults configurados y seleccion aleatoria para completar cupos.
- Permitir que una misma persona del staff quede asignada a varias tareas del mismo evento.
- Mantener edicion manual por tarea y preservar cambios manuales frente a regeneraciones del cuestionario.

**Non-Goals:**

- Optimizar carga de trabajo por disponibilidad, turnos, habilidades o historial de eventos.
- Bloquear que una persona quede en varias tareas del mismo evento.
- Agregar permisos o auditoria avanzada de quien ejecuto la asignacion.
- Eliminar inmediatamente columnas heredadas de responsable unico si conviene conservarlas durante migracion.

## Decisions

1. Modelar responsables multiples con tablas de relacion.

   Se agregaran relaciones tipo `master_task_default_staff`, `questionnaire_task_rule_task_staff` y `event_task_staff` o nombres equivalentes alineados al esquema. Cada relacion guardara `task_id`/`rule_task_id`/`event_task_id`, `staff_id` y un orden estable opcional para mostrar nombres de manera consistente.

   Rationale: evita arrays JSON sin integridad, permite validar contra `staff`, soporta busqueda por persona y conserva compatibilidad con Supabase selects relacionales.

   Alternativa descartada: guardar `staff_ids` como JSONB en cada tabla. Es mas rapido de escribir, pero complica constraints, migraciones, filtros y relaciones con staff inactivo.

2. Mantener columnas heredadas durante una fase de compatibilidad.

   `default_staff_id`, `override_staff_id` y `staff_id` pueden conservarse temporalmente para no romper consultas existentes mientras APIs y UI pasan a leer las relaciones multiples. La migracion debe copiar esos valores a las nuevas tablas y el codigo nuevo debe tratar las relaciones multiples como fuente principal.

   Alternativa descartada: eliminar columnas en la misma entrega. Aumenta el riesgo de romper vistas como Live, reportes o sincronizacion de reglas que todavia lean el campo singular.

3. Agregar `required_responsible_count` a `master_tasks`.

   El campo sera entero positivo con default `1`. La UI lo mostrara como "Cantidad de responsables" y la asignacion automatica lo usara como cupo objetivo por tarea. Si una tarea de evento no viene de una tarea maestra o no tiene conteo, el sistema usara `1`.

   Alternativa descartada: inferir el conteo desde los defaults seleccionados. No sirve cuando la duena quiere configurar dos responsables pero todavia no sabe quienes seran.

4. Precedencia de responsables al generar tareas.

   Las reglas de cuestionario usaran responsables override de la relacion regla-tarea cuando existan; si no, usaran responsables predeterminados de la tarea maestra; si tampoco existen, la tarea se creara sin responsables asignados. Los cambios manuales en una tarea de evento marcaran la tarea como `is_manual_override = true` como ya ocurre con otros ajustes.

5. Asignacion automatica como endpoint de evento.

   Se agregara una accion administrativa, por ejemplo `POST /api/admin/events/[id]/tasks/assign-responsibles`, que cargue tareas del evento, staff activo y defaults de tareas maestras cuando haya origen disponible. Por cada tarea, respetara responsables ya asignados salvo que el payload pida reemplazar, completara hasta `required_responsible_count` y elegira al azar entre staff activo no duplicado dentro de esa misma tarea.

   Antes de ejecutar, si existen tareas con responsables ya asignados, la UI debe preguntar si la administradora desea completar solo faltantes o reemplazar las asignaciones existentes. La opcion conservadora sera completar faltantes. La primera version puede no balancear cargas globales; una misma persona puede quedar en varias tareas del evento. Para hacerla mas util, solo debe evitar duplicar una misma persona dentro de la misma tarea y debe reportar cuantas tareas quedaron completas, incompletas o sin cambios.

6. UI con multiselect reutilizable.

   Las pantallas de tareas maestras, reglas y tareas de evento deben reemplazar selects singulares por control multiseleccion. Debe mostrar responsables asignados como chips o lista compacta, permitir limpiar, y preservar responsables inactivos previamente asignados para no perder datos.

## Risks / Trade-offs

- Migracion incompleta de IDs singulares -> Copiar cada valor existente a la nueva tabla correspondiente y verificar conteos antes de dejar de leer columnas heredadas.
- Consultas mas complejas en Supabase -> Centralizar normalizacion de payloads y ampliar selects con relaciones anidadas en APIs administrativas.
- Asignacion aleatoria percibida como injusta -> Mostrar resultado editable y mantener la primera version como ayuda rapida, no como optimizador de carga.
- Staff activo insuficiente para completar cupos -> Asignar los disponibles sin repetir dentro de la tarea y reportar tareas incompletas con mensaje claro.
- Tareas generadas por reglas pueden perder ediciones manuales -> Mantener la regla existente de `is_manual_override` y no sobrescribir responsables de tareas manuales.
- La administradora podria ejecutar reemplazo accidentalmente -> Mostrar confirmacion cuando haya tareas con responsables existentes y usar "completar faltantes" como opcion predeterminada.

## Migration Plan

1. Agregar tablas de relacion para defaults, overrides y tareas de evento, mas `required_responsible_count` en `master_tasks`.
2. Poblar relaciones nuevas desde `default_staff_id`, `override_staff_id` y `staff_id` existentes.
3. Actualizar tipos, selects y APIs para leer/escribir arreglos de responsables.
4. Actualizar UI y motor de reglas para usar relaciones multiples como fuente principal.
5. Agregar endpoint y boton de asignacion automatica por evento con confirmacion para completar o reemplazar responsables existentes.
6. Verificar creacion, edicion, generacion por cuestionario, busqueda, filtros, PDF y Live con uno, varios y cero responsables.

Rollback: conservar columnas heredadas permite volver temporalmente a responsable unico si la nueva UI falla, aunque las asignaciones multiples creadas despues del despliegue no caben completamente en los campos singulares.

## Open Questions

- Si una tarea tiene mas responsables manuales que su cantidad requerida, el sistema debe conservarlos y no quitar personas automaticamente.
