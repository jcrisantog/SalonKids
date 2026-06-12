## Context

El panel administrativo ya tiene pantallas separadas para Integraciones, Personal, Tareas Maestras, Reglas Cuestionario y Tareas del Evento. Varias de esas pantallas exponen campos heredados de la matriz operativa, especialmente roles y areas, aunque el flujo actual de la dueña se basa mas en seleccionar personas concretas para cada tarea.

El esquema conserva columnas como `staff.primary_role`, `master_tasks.area`, `master_tasks.default_role`, `questionnaire_task_rule_tasks.override_role_responsible` y `event_tasks.role_responsible`. La mayoria son nullable, excepto `staff.primary_role`, por lo que el cambio debe simplificar la experiencia sin romper datos existentes ni requerir una migracion riesgosa.

## Goals / Non-Goals

**Goals:**
- Reducir la UI visible para que la dueña vea solo secciones y campos accionables.
- Ocultar campos de rol/area/responsable que ya no deben capturarse manualmente.
- Relajar validaciones de API para que los campos ocultos no sean obligatorios desde formularios.
- Mantener compatibilidad con registros existentes y con la sincronizacion de tareas generadas.
- Hacer que el PDF reporte responsables por persona asignada y use `S/R` cuando no exista `staff_id`.

**Non-Goals:**
- Eliminar columnas de base de datos o borrar datos historicos.
- Rediseñar el motor completo de reglas de cuestionario.
- Cambiar permisos, autenticacion o roles de usuarios administrativos.
- Cambiar el modelo de asignacion por `staff_id` como fuente principal de responsables.

## Decisions

1. Ocultar campos en UI y conservar columnas en payloads internos.

   Los formularios dejaran de renderizar Rol principal, Area, Rol default, Responsable de reglas y Rol responsable de evento. Los tipos de formulario pueden conservar esas propiedades si simplifica reutilizar payloads existentes, pero deben inicializarse con cadena vacia o valor interno seguro.

   Alternativa considerada: eliminar las propiedades de todos los tipos y selects. Se descarta para mantener el cambio acotado y evitar tocar consultas/reglas que todavia leen esos campos como fallback.

2. Resolver `staff.primary_role` con fallback interno mientras la columna siga siendo `NOT NULL`.

   La API de staff dejara de rechazar solicitudes sin `primary_role`. Si el cliente no envia rol, persistira un valor interno estable, por ejemplo `General`, para satisfacer el esquema actual. La UI no debe mostrar ese valor en formularios ni tablas, y los selects de responsables deben mostrar solo el nombre de la persona.

   Alternativa considerada: migrar `staff.primary_role` a nullable. Se descarta por ahora porque el requerimiento es ocultar y no eliminar, y un fallback interno evita una migracion de datos.

3. Priorizar persona asignada sobre rol en tareas y PDF.

   En Tareas del Evento, `staff_id` sera la fuente visible para responsable. `role_responsible` podra seguir viajando como cadena vacia para compatibilidad, pero no se mostrara ni se usara como fallback visible en tabla o PDF. La columna Responsable del PDF mostrara el nombre del staff asignado; si no hay `staff_id`, mostrara `S/R`.

   Alternativa considerada: seguir mostrando `role_responsible` cuando no hay persona asignada. Se descarta porque el requerimiento pide explicitamente `S/R` si no hay persona asignada.

4. Limpiar busquedas y tablas de campos ocultos.

   Cuando una tabla deja de mostrar rol o area, la busqueda, placeholder y columnas deben alinearse con lo visible. Esto evita que la dueña busque por datos que ya no puede ver ni editar.

   Alternativa considerada: mantener busqueda por campos ocultos. Se descarta por inconsistencia operativa.

5. Eliminar secciones completas de Integraciones y Live Matriz de la navegacion.

   Integraciones conservara el envio de WhatsApp/link de cuestionario si sigue siendo util, pero quitara Pulido visual, Checklist movil / Lighthouse y Checklist de impresion fisica. La seccion Live Matriz debe desaparecer de la navegacion y de cualquier acceso principal del panel; no hace falta borrar archivos si no afectan la experiencia visible.

   Alternativa considerada: ocultar con feature flag. Se descarta porque no hay indicio de que la dueña necesite reactivarlo dinamicamente.

## Risks / Trade-offs

- Registros existentes con roles/areas seguiran en base de datos -> Mitigacion: no mostrarlos en UI nueva y no usarlos como fallback visible donde el requerimiento lo elimina.
- `staff.primary_role` sigue siendo `NOT NULL` -> Mitigacion: fallback interno en API y remocion del rol en labels visibles.
- El motor de reglas puede seguir creando `role_responsible` desde `default_role` -> Mitigacion: permitir que siga por compatibilidad, pero ocultar el campo y priorizar `staff_id`/`S/R` en experiencia visible y PDF.
- Quitar columnas puede reducir contexto para administracion avanzada -> Mitigacion: mantener nombre, descripcion, visibilidad, estado y responsable por persona como informacion principal.

## Migration Plan

1. Actualizar UI administrativa para ocultar secciones/campos y ajustar labels, placeholders, tablas y busquedas.
2. Actualizar APIs de staff y tareas relacionadas para aceptar payloads sin campos ocultos.
3. Ajustar generacion de PDF y labels de responsables para usar `staff_id` o `S/R`.
4. Verificar build/lint y probar manualmente crear/editar personal, tareas maestras, reglas y tareas de evento.
5. Rollback: revertir cambios de UI/API; no se esperan migraciones de datos.

## Open Questions

- Ninguna bloqueante. Si mas adelante la dueña confirma que los roles no se usaran nunca, se puede proponer otra mejora para migrar `staff.primary_role` a nullable o eliminar su uso interno.
