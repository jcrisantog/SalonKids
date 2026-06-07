## Context

El proyecto ya tiene un catalogo `staff` con personas activas/inactivas y `event_tasks.staff_id` para asignar actividades a una persona concreta. La pantalla Live ya usa esa relacion, pero la pantalla administrativa de actividades de evento solo edita `role_responsible` como texto y no permite seleccionar staff. El catalogo `master_tasks` guarda `default_role`, pero no guarda un responsable predeterminado concreto.

El cambio debe conectar esas piezas sin romper tareas existentes: `default_role` y `role_responsible` siguen siendo utiles como rol sugerido cuando aun no hay persona asignada, mientras que `staff_id` representa la asignacion concreta.

## Goals / Non-Goals

**Goals:**

- Agregar responsable predeterminado opcional en tareas maestras usando `staff.id`.
- Permitir asignar, cambiar o limpiar responsable concreto al crear o editar actividades de evento.
- Mostrar nombre de staff asignado en UI administrativa y conservar rol sugerido como fallback visible.
- Propagar el responsable predeterminado de una tarea maestra a actividades generadas por reglas cuando exista.
- Validar en APIs que los `staff_id` enviados existan y permitir `null` para dejar sin asignar.

**Non-Goals:**

- No reemplazar `default_role` ni `role_responsible`; seguiran existiendo como texto operativo.
- No crear agenda, disponibilidad, turnos ni reglas de carga de trabajo para staff.
- No modificar permisos o autenticacion mas alla de reutilizar `requireAdmin`.
- No actualizar automaticamente eventos historicos hasta que se editen o se regenere su cuestionario.

## Decisions

1. Guardar el responsable predeterminado de tareas maestras como `master_tasks.default_staff_id`.

   Rationale: `event_tasks` ya usa `staff_id`, asi que el catalogo maestro debe apuntar al mismo catalogo de personas. La columna sera nullable y tendra `ON DELETE SET NULL` para no bloquear bajas del catalogo.

   Alternativa descartada: guardar el nombre de la persona como texto en `master_tasks`. Es mas simple, pero pierde integridad referencial y queda inconsistente cuando cambia el catalogo de staff.

2. Mantener rol y persona como campos separados.

   Rationale: el rol indica la funcion requerida y la persona indica quien queda asignado. Una tarea puede requerir "DJ" aunque todavia no se haya asignado un DJ concreto.

   Alternativa descartada: derivar siempre el rol desde `staff.primary_role`. Eso impediria capturar excepciones operativas y perderia el rol sugerido cuando no haya responsable asignado.

3. Cargar staff activo para selects administrativos, pero preservar asignaciones existentes aunque el staff este inactivo.

   Rationale: las nuevas asignaciones deben favorecer personas activas, pero un evento existente puede tener asignada una persona que luego fue desactivada. La UI debe mostrarla para no convertir la edicion en una perdida accidental de informacion.

   Alternativa descartada: filtrar siempre solo `is_active = true`. Eso ocultaria responsables historicos y podria borrar asignaciones al guardar.

4. Validar `staff_id` en APIs antes de insertar o actualizar.

   Rationale: aunque la base de datos tenga llave foranea, validar permite responder con errores claros y evitar que la UI dependa de mensajes internos de Supabase.

   Alternativa descartada: confiar solo en la FK. Funciona tecnicamente, pero produce errores menos utiles para la administradora.

5. En la generacion por reglas, usar `override_staff_id` si se agrega en la relacion regla-tarea; si no existe, usar `master_tasks.default_staff_id`; si tampoco existe, dejar `staff_id` en `null` y conservar `role_responsible`.

   Rationale: respeta el orden natural de especificidad: override de regla, default de plantilla, fallback de rol. Tambien mantiene compatibilidad con reglas actuales que solo definen responsable como texto.

   Alternativa descartada: asignar siempre el default de plantilla e ignorar overrides. Eso haria menos flexible la configuracion por pregunta.

## Risks / Trade-offs

- Migracion de `master_tasks.default_staff_id` puede requerir actualizar tipos y selects en varias APIs -> Mitigacion: agregar la columna como nullable y ampliar selects de forma incremental.
- Staff inactivo asignado podria aparecer en formularios -> Mitigacion: mostrarlo con etiqueta de inactivo y permitir cambiarlo o limpiarlo.
- El motor de reglas podria sobrescribir cambios manuales de responsable -> Mitigacion: conservar la regla existente de preservar `is_manual_override = true`.
- El catalogo de tareas maestras podria mezclar default de rol y default de persona -> Mitigacion: UI con labels separados: "Rol default" y "Responsable default".

## Migration Plan

1. Agregar `default_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL` a `master_tasks`.
2. Si se soporta override por regla, agregar `override_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL` a `questionnaire_task_rule_tasks`.
3. Actualizar selects e inserts/updates de APIs para incluir los nuevos campos.
4. Actualizar UI de tareas maestras y actividades para cargar staff y enviar `staff_id`.
5. Actualizar motor de reglas para propagar `staff_id` segun el orden de precedencia.
6. Rollback: dejar las columnas nullable sin uso y revertir UI/APIs; los datos existentes de rol siguen funcionando.
