## Context

La capacidad `questionnaire-task-rules` ya define que una regla puede generar una o mas tareas desde `master_tasks`, y el modelo `questionnaire_task_rule_tasks` permite varias relaciones por regla. La necesidad actual es reforzar esa funcionalidad para que sea clara para la administradora y confiable durante alta, edicion, vista previa y generacion.

El flujo afectado esta concentrado en la pantalla `/admin/questionnaire-rules`, las rutas API admin de reglas y el motor `syncReactiveTasks`. No se busca crear un nuevo modelo, sino validar y pulir el uso multiple del modelo existente.

## Goals / Non-Goals

**Goals:**

- Hacer evidente que una pregunta/regla puede generar varias tareas.
- Permitir editar overrides independientes por cada tarea asociada.
- Evitar duplicar la misma tarea maestra dentro de una regla.
- Mantener un orden estable para vista previa, listado y generacion.
- Verificar que el motor genere todas las tareas asociadas cuando la condicion aplique.
- Mantener compatibilidad con reglas existentes que solo tienen una tarea.

**Non-Goals:**

- No se agregaran condiciones compuestas tipo AND/OR entre preguntas.
- No se creara un nuevo catalogo de tareas.
- No se recalcularan automaticamente eventos historicos al editar reglas.
- No se modificara la estructura principal del cuestionario del cliente.

## Decisions

### Reusar `questionnaire_task_rule_tasks`

La relacion actual entre regla y tarea maestra ya es la estructura correcta para multiples tareas. Se mantendra como fuente de verdad y se reforzaran validaciones de UI/API alrededor de `master_task_id` y `sort_order`.

Alternativa considerada: guardar un arreglo de tareas dentro de `questionnaire_task_rules`. Se descarta porque complicaria overrides, orden, integridad referencial y futuras consultas.

### Validar duplicados en UI y API

La UI debe prevenir seleccionar dos veces la misma tarea maestra en una misma regla, y la API debe rechazar el payload si llega duplicado. La validacion de servidor es necesaria aunque la UI lo prevenga, porque las rutas pueden ser llamadas directamente.

Alternativa considerada: depender solo del indice unico de base de datos. Se descarta porque el mensaje seria menos claro para la administradora y podria dejar una edicion parcialmente dificil de entender.

### Orden estable por `sort_order`

Cada tarea asociada debe persistirse con `sort_order` consecutivo. El listado, vista previa y generacion deben respetar ese orden para que la configuracion sea predecible.

Alternativa considerada: ordenar alfabeticamente por nombre de tarea. Se descarta porque la administradora puede querer que las tareas aparezcan en orden operativo, no alfabetico.

### Vista previa orientada a multiples tareas

La vista previa debe mostrar los nombres de las tareas que se generaran, no solo un contador. Esto reduce errores al configurar una pregunta que dispara varias areas operativas.

## Risks / Trade-offs

- Duplicados enviados por API -> Validar `master_task_id` repetidos antes de insertar relaciones.
- Orden inconsistente al editar -> Normalizar `sort_order` al guardar y ordenar al cargar.
- UI saturada si hay muchas tareas -> Mantener filas compactas, etiquetas claras y resumen en vista previa.
- Reglas existentes de una tarea -> Mantener el payload actual y tratar una sola tarea como caso valido.
