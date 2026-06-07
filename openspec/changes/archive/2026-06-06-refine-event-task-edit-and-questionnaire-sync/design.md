## Context

El sistema ya permite editar tareas de evento en `src/app/admin/events/[id]/tasks/page.tsx`; al seleccionar editar, el formulario se llena, pero la administradora puede quedar visualmente en la tabla y tener que desplazarse manualmente al formulario.

Las tareas configurables del cuestionario se construyen en `src/lib/rule-engine.ts`. Hoy `syncReactiveTasks` borra solamente tareas con `is_manual_override = false` antes de insertar las tareas generadas. Si una tarea generada fue editada y marcada como manual, deja de borrarse y puede aparecer una copia nueva al guardar el cuestionario otra vez.

El cuestionario publico `src/app/event/[token]/QuestionnaireClient.tsx` muestra un componente `Timeline` con `publicTasks`. Esa UI aun no esta validada con la duena, pero conviene no eliminar la obtencion ni el guardado de datos para poder reactivarla despues.

## Goals / Non-Goals

**Goals:**
- Enfocar o desplazar automaticamente al formulario cuando se edita una tarea de evento.
- Evitar duplicados cuando una tarea generada ya existe y fue marcada como manual.
- Ocultar la UI del cronograma en el cuestionario publico sin remover APIs ni datos.

**Non-Goals:**
- Cambiar el modelo de base de datos.
- Eliminar permanentemente el cronograma publico.
- Cambiar la pantalla de Reglas Cuestionario.
- Cambiar la creacion manual de tareas de evento.

## Decisions

1. **Auto-scroll al formulario de tareas de evento**

   Agregar una referencia al formulario de tareas y, al ejecutar `startEdit`, llamar `scrollIntoView` despues de cargar el estado del formulario. Esto mantiene el flujo actual y evita reestructurar la pagina.

2. **Deduplicacion por origen configurable**

   Antes de insertar tareas generadas, consultar tareas existentes del evento con `source_rule_task_id` no nulo. Para cada tarea generada:
   - Si no existe tarea con ese `source_rule_task_id`, insertar normalmente.
   - Si existe una tarea no manual, actualizarla con los valores calculados.
   - Si existe una tarea manual, conservarla y no insertar una copia nueva.

   Esta decision evita duplicados y respeta ajustes manuales.

3. **Ocultar cronograma solo en UI**

   Remover o condicionar el render de `<Timeline tasks={publicTasks} />` en el cuestionario publico. Se conserva la carga de `publicTasks` y la respuesta API para no perder la capacidad si se decide reactivarla.

## Risks / Trade-offs

- **Tarea manual conserva datos antiguos aunque la respuesta cambie** -> Es el comportamiento buscado al marcarla como ajuste manual; la administradora mantiene control.
- **Multiples tareas existentes con el mismo `source_rule_task_id` por datos previos duplicados** -> La implementacion debe conservar una y evitar insertar mas; si se detectan duplicados existentes, no empeorar el estado.
- **Scroll automatico puede sentirse brusco** -> Usar `behavior: "smooth"` y respetar el formulario existente.
