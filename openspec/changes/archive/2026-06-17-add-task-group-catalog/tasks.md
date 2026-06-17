## 1. Guia del proyecto y modelo de datos

- [x] 1.1 Leer la guia local relevante de Next.js en `node_modules/next/dist/docs/` antes de editar rutas o paginas de la app.
- [x] 1.2 Agregar tabla `task_groups` en `schema.sql` con `id`, `name`, `key`, `description`, `is_active`, `sort_order`, timestamps e indice unico por `key`.
- [x] 1.3 Agregar `master_tasks.assignment_group_id` nullable con FK a `task_groups(id)` y `ON DELETE SET NULL`.
- [x] 1.4 Agregar migracion idempotente que cree grupos desde `master_tasks.assignment_group_key/label` existentes y rellene `assignment_group_id`.
- [x] 1.5 Ajustar helpers de normalizacion para reutilizar clave/etiqueta de grupos sin duplicar logica.

## 2. APIs de grupos

- [x] 2.1 Crear `GET /api/admin/task-groups` para listar grupos activos e inactivos con conteo de tareas asociadas.
- [x] 2.2 Crear `POST /api/admin/task-groups` para crear grupos validando nombre requerido y clave unica.
- [x] 2.3 Crear `PATCH /api/admin/task-groups/[id]` para editar nombre, descripcion, estado y orden.
- [x] 2.4 Crear `DELETE /api/admin/task-groups/[id]` bloqueando eliminacion cuando el grupo tenga tareas asociadas.
- [x] 2.5 Asegurar mensajes claros para grupo duplicado, grupo inexistente y grupo en uso.

## 3. Catalogo admin de grupos

- [x] 3.1 Agregar pantalla admin de grupos de tareas con tabla, formulario de alta/edicion, estado activo/inactivo y acciones.
- [x] 3.2 Mostrar conteo de tareas asociadas por grupo.
- [x] 3.3 Permitir desactivar grupos sin perder relaciones existentes.
- [x] 3.4 Integrar navegacion/admin para acceder al catalogo de grupos de tareas.

## 4. Tareas maestras con grupo catalogado

- [x] 4.1 Actualizar `GET /api/admin/tasks` para devolver grupos disponibles junto con tareas y staff.
- [x] 4.2 Actualizar APIs de crear/editar tareas maestras para aceptar `assignment_group_id`, validar que exista y persistirlo.
- [x] 4.3 Mantener compatibilidad temporal con `assignment_group_key/label` cuando aun existan datos heredados.
- [x] 4.4 Cambiar el formulario de tareas maestras para usar combo de grupo con opcion "Sin grupo".
- [x] 4.5 Mostrar grupos inactivos cuando una tarea existente los tenga seleccionados.
- [x] 4.6 Agregar filtro por grupo en la tabla de tareas maestras con opciones "Todos", "Sin grupo" y grupos disponibles.
- [x] 4.7 Combinar filtro por grupo con busqueda existente.

## 5. Reglas, seeds y autoasignacion

- [x] 5.1 Actualizar creacion rapida de tareas desde reglas del cuestionario para seleccionar grupo catalogado.
- [x] 5.2 Actualizar selects del motor de reglas y tareas base para cargar `assignment_group_id` y datos del grupo.
- [x] 5.3 Refactorizar autoasignacion para agrupar primero por `assignment_group_id` y usar `assignment_group_key` solo como fallback heredado.
- [x] 5.4 Actualizar `Documentos/seed-operational-master-tasks.sql` para crear grupos y asociarlos por ID/clave de forma idempotente.
- [x] 5.5 Actualizar `Documentos/seed-questionnaire-task-rules.sql` para crear grupos y asociarlos por ID/clave de forma idempotente.
- [x] 5.6 Actualizar `Documentos/matriz-operativa-tareas-reglas.md` para reflejar que los grupos vienen del catalogo.

## 6. Verificacion

- [x] 6.1 Verificar crear, editar, desactivar y eliminar un grupo sin uso.
- [x] 6.2 Verificar que no se puede eliminar un grupo con tareas asociadas.
- [x] 6.3 Verificar crear, editar y limpiar grupo catalogado en una tarea maestra.
- [x] 6.4 Verificar filtro por grupo, "Sin grupo", "Todos" y combinacion con busqueda.
- [x] 6.5 Verificar que la autoasignacion agrupa por `assignment_group_id`.
- [x] 6.6 Verificar que una tarea sin `assignment_group_id` conserva fallback por `assignment_group_key`.
- [x] 6.7 Ejecutar lint/build del proyecto y corregir regresiones.
