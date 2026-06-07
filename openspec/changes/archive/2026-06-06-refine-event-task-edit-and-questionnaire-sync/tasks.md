## 1. Edicion De Tareas De Evento

- [x] 1.1 Agregar una referencia al formulario en `src/app/admin/events/[id]/tasks/page.tsx`.
- [x] 1.2 Hacer que `startEdit` desplace la pantalla hacia el formulario despues de cargar los datos de la tarea.
- [x] 1.3 Verificar que cancelar la edicion limpie el formulario sin afectar la tabla ni filtros activos.

## 2. Sincronizacion Sin Duplicados

- [x] 2.1 Cambiar `syncReactiveTasks` para consultar tareas existentes del evento con `source_rule_task_id` no nulo antes de insertar.
- [x] 2.2 Actualizar tareas existentes no manuales con el mismo `source_rule_task_id` en lugar de insertar copias.
- [x] 2.3 Preservar tareas existentes manuales con el mismo `source_rule_task_id` sin borrarlas ni reemplazarlas.
- [x] 2.4 Insertar solo tareas generadas cuyo `source_rule_task_id` no exista previamente en el evento.
- [x] 2.5 Verificar que guardar el cuestionario dos veces no duplique actividades generadas ni actividades editadas manualmente.

## 3. Cronograma Publico Oculto

- [x] 3.1 Ocultar el render de `Timeline` en `src/app/event/[token]/QuestionnaireClient.tsx` sin eliminar la carga de `publicTasks`.
- [x] 3.2 Verificar que el cuestionario siga cargando, guardando y mostrando estado de guardado sin el bloque de cronograma.

## 4. Validacion

- [x] 4.1 Ejecutar `npm.cmd run lint`.
- [x] 4.2 Ejecutar `npm.cmd run build`.
