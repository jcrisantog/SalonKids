## Context

La pantalla `src/app/admin/questionnaire-rules/page.tsx` carga reglas, preguntas, tareas maestras y staff desde `GET /api/admin/questionnaire-rules`. El formulario de regla permite asociar una o varias tareas maestras (`master_task_id`) y mantiene el catalogo disponible en el estado local `masterTasks`.

La pantalla de tareas ya expone `POST /api/admin/tasks` para crear registros en `master_tasks` con los mismos campos que necesita una tarea maestra: nombre, descripcion base, visibilidad, area, rol default y responsable default opcional. Ese endpoint ya valida nombre obligatorio y `default_staff_id` contra el catalogo de staff.

## Goals / Non-Goals

**Goals:**
- Permitir crear una tarea maestra desde el flujo de Reglas Cuestionario sin abandonar el formulario actual.
- Reutilizar el endpoint y validaciones actuales de tareas maestras.
- Agregar la tarea creada al catalogo local de tareas y seleccionarla automaticamente en la fila de tarea que originó la accion.
- Mantener intacto el estado de la regla en edicion si el modal se cancela o falla el guardado.
- Presentar errores del modal de manera local y clara.

**Non-Goals:**
- Cambiar el modelo de datos de `master_tasks`.
- Cambiar como se evaluan reglas o como se generan tareas de evento.
- Crear tareas de evento directamente desde el modal.
- Crear staff nuevo desde este flujo.

## Decisions

1. **Usar modal local en Reglas Cuestionario**

   La UI agregara un estado local para controlar un modal de creacion de tarea maestra. El modal recibira el indice de la fila `form.tasks[index]` que necesita la nueva tarea. Al cancelar, solo se cierra el modal; al guardar exitosamente, actualiza `masterTasks` y aplica `updateTask(index, { master_task_id: newTask.id })`.

   Alternativa considerada: redirigir a `/admin/tasks` con query params para volver. Se descarta porque conserva peor el contexto de la regla y no cumple la necesidad de no salir del flujo.

2. **Reutilizar `POST /api/admin/tasks`**

   El modal enviara el mismo payload que la pantalla de tareas maestras. Esto evita duplicar validaciones de servidor y mantiene una sola fuente de verdad para crear tareas.

   Alternativa considerada: crear un endpoint especifico bajo `/api/admin/questionnaire-rules/tasks`. Se descarta porque la operacion real es crear una tarea maestra global, no una entidad exclusiva de reglas.

3. **Actualizar estado local sin recargar toda la pantalla**

   Despues del `201`, la tarea creada se insertara en `masterTasks`, ordenada de manera consistente por area/nombre o agregada y luego reordenada localmente. La regla actual no se reseteara ni se recargara.

   Alternativa considerada: llamar `loadRules()` despues de crear la tarea. Se descarta porque puede sobrescribir el estado local de la regla en edicion y hacer que la administradora pierda configuracion pendiente.

4. **Modal con campos esenciales y defaults seguros**

   El modal incluira nombre obligatorio, descripcion, area, visibilidad, rol default y responsable default opcional. Visibilidad default sera `interna`, igual que el endpoint actual.

## Risks / Trade-offs

- **Duplicacion visual de formulario de tarea** -> Mantener los campos alineados con el contrato existente de `POST /api/admin/tasks`; si crece mucho, extraer componente compartido.
- **Tarea creada duplicada por nombre** -> El endpoint actual no bloquea nombres duplicados; el modal mostrara errores de servidor, pero no agregara validacion nueva salvo que ya exista en backend.
- **Indice de fila obsoleto si la administradora elimina filas con el modal abierto** -> Cerrar el modal al eliminar la fila activa o validar que el indice siga existiendo antes de seleccionar.
- **Error al crear tarea** -> Mostrar el error dentro del modal y conservar el formulario de tarea para correccion.
- **Tarea creada no aparece ordenada donde la usuaria espera** -> Reordenar localmente por area y nombre para coincidir con la carga inicial.
