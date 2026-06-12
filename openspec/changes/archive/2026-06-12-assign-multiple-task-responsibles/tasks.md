## 1. Modelo de Datos y Migracion

- [x] 1.1 Revisar las relaciones de `schema.sql` para `staff`, `master_tasks`, `questionnaire_task_rule_tasks` y `event_tasks`.
- [x] 1.2 Agregar `required_responsible_count` a `master_tasks` con un valor positivo por default de `1`.
- [x] 1.3 Agregar una relacion muchos-a-muchos para staff default en tareas maestras con indice unico `(master_task_id, staff_id)`.
- [x] 1.4 Agregar una relacion muchos-a-muchos para staff override en tareas de reglas de cuestionario con indice unico `(rule_task_id, staff_id)`.
- [x] 1.5 Agregar una relacion muchos-a-muchos para staff asignado en tareas de evento con indice unico `(event_task_id, staff_id)`.
- [x] 1.6 Migrar datos existentes a las nuevas relaciones desde `default_staff_id`, `override_staff_id` y `event_tasks.staff_id`.
- [x] 1.7 Mantener legibles las columnas singulares de staff durante la migracion de compatibilidad y documentarlas como campos heredados.

## 2. Tipos Compartidos y Validacion

- [x] 2.1 Agregar helpers para normalizar arreglos de staff responsable desde payloads de API.
- [x] 2.2 Agregar validacion para arreglos de IDs de staff, IDs faltantes, IDs duplicados y listas vacias.
- [x] 2.3 Agregar validacion para que `required_responsible_count` sea un entero mayor que cero.
- [x] 2.4 Actualizar tipos TypeScript para tareas maestras, tareas de reglas, tareas de evento y relaciones de asignacion de staff.

## 3. APIs y UI de Tareas Maestras

- [x] 3.1 Actualizar `GET /api/admin/tasks` para devolver `required_responsible_count` y arreglos de staff responsable default.
- [x] 3.2 Actualizar la API de creacion de tareas maestras para aceptar cantidad requerida y multiples IDs de staff default.
- [x] 3.3 Actualizar la API de edicion de tareas maestras para reemplazar de forma segura el conjunto de relaciones de staff default.
- [x] 3.4 Reemplazar el select de responsable unico en `/admin/tasks` por un control multiseleccion.
- [x] 3.5 Agregar el input de cantidad requerida de responsables en `/admin/tasks`.
- [x] 3.6 Actualizar la lista de tareas maestras, texto de busqueda y estados vacios para mostrar multiples responsables default.

## 4. APIs y UI de Reglas de Cuestionario

- [x] 4.1 Actualizar las APIs de listado de reglas de cuestionario para devolver arreglos de staff responsable override y arreglos de staff default de tareas maestras.
- [x] 4.2 Actualizar la API de creacion de reglas de cuestionario para aceptar multiples IDs de staff override por tarea asociada.
- [x] 4.3 Actualizar la API de edicion de reglas de cuestionario para reemplazar de forma segura los conjuntos de relaciones de staff override.
- [x] 4.4 Reemplazar el select de responsable unico en tarea-regla por un control multiseleccion.
- [x] 4.5 Actualizar la creacion inline de tareas maestras desde reglas de cuestionario para soportar cantidad requerida y multiples staff default.
- [x] 4.6 Actualizar vistas previas de reglas y tablas de reglas configuradas para mostrar multiples nombres de responsables cuando aplique.

## 5. APIs de Tareas de Evento y Motor de Reglas

- [x] 5.1 Actualizar la API de listado de tareas de evento para devolver arreglos de staff responsable asignado.
- [x] 5.2 Actualizar la API de creacion de tareas de evento para aceptar multiples IDs de staff asignado.
- [x] 5.3 Actualizar la API de edicion de tareas de evento para reemplazar de forma segura los conjuntos de relaciones de staff asignado y marcar overrides manuales.
- [x] 5.4 Actualizar los selects de `src/lib/rule-engine.ts` para cargar arreglos de responsables default y override.
- [x] 5.5 Actualizar inserts y updates de tareas generadas por reglas para persistir arreglos de responsables usando lista override, luego lista default de tarea maestra y luego lista vacia.
- [x] 5.6 Preservar arreglos de responsables editados manualmente cuando las tareas de evento generadas tengan `is_manual_override = true`.
- [x] 5.7 Actualizar la generacion de tareas operativas base para copiar arreglos de responsables default desde las plantillas.

## 6. Asignacion Automatica

- [x] 6.1 Agregar un endpoint admin para asignar responsables automaticamente a todas las tareas de un evento seleccionado.
- [x] 6.2 Cargar staff activo, asignaciones existentes de tareas, defaults de plantillas y cantidades requeridas de responsables en el endpoint de asignacion automatica.
- [x] 6.3 Implementar logica de asignacion que permita que la misma persona de staff aparezca en distintas tareas y evite duplicados dentro de una sola tarea.
- [x] 6.4 Implementar modo de completar que preserve responsables existentes, use defaults primero y llene aleatoriamente solo los espacios faltantes.
- [x] 6.5 Implementar modo de reemplazo que recalcule las listas de responsables de las tareas despues de confirmacion explicita.
- [x] 6.6 Devolver un resumen de resultado con conteos de actualizadas, incompletas, sin cambios y errores.
- [x] 6.7 Agregar un boton "Asignar responsables" en la pantalla de tareas del evento.
- [x] 6.8 Mostrar una confirmacion cuando las tareas ya tengan responsables, con "completar faltantes" como default y "reemplazar" como eleccion explicita.
- [x] 6.9 Mostrar feedback de exito y de completado parcial despues de la asignacion automatica y refrescar la tabla de tareas.

## 7. UI, Filtros, PDF y Vista Live de Tareas de Evento

- [x] 7.1 Reemplazar el select de responsable unico de tareas de evento por un control multiseleccion.
- [x] 7.2 Actualizar filas de la tabla de tareas de evento para mostrar uno o multiples nombres de responsables.
- [x] 7.3 Actualizar opciones del filtro de responsable para incluir a cada miembro de staff asignado en todas las tareas.
- [x] 7.4 Actualizar el filtrado para que seleccionar una persona coincida con tareas donde esa persona sea cualquier responsable asignado.
- [x] 7.5 Actualizar el filtro "Sin responsable" para coincidir con tareas que tengan una lista vacia de responsables.
- [x] 7.6 Actualizar la busqueda de tareas de evento para coincidir con cualquier nombre de responsable asignado.
- [x] 7.7 Actualizar la generacion de PDF para que Responsable muestre todos los nombres asignados o `S/R`.
- [x] 7.8 Actualizar display y controles de asignacion en `/admin/live` para manejar multiples responsables o dar una visualizacion compatible de solo lectura hasta que sea editable.

## 8. Verificacion

- [x] 8.1 Verificar la creacion de una tarea maestra con cantidad requerida y multiples responsables default.
- [x] 8.2 Verificar que editar una tarea maestra permita agregar, quitar y limpiar responsables default.
- [x] 8.3 Verificar que las reglas de cuestionario puedan generar tareas con responsables override, responsables default y sin responsables.
- [x] 8.4 Verificar que las ediciones manuales de tareas de evento preserven listas personalizadas de responsables en guardados posteriores del cuestionario.
- [x] 8.5 Verificar que la asignacion automatica complete tareas de acuerdo con la cantidad requerida cuando exista suficiente staff activo.
- [x] 8.6 Verificar que la asignacion automatica reporte tareas incompletas cuando el staff activo sea insuficiente.
- [x] 8.7 Verificar que la asignacion automatica permita que una persona de staff aparezca en multiples tareas distintas.
- [x] 8.8 Verificar que la asignacion automatica pregunte si se desea completar o reemplazar cuando las tareas ya tengan responsables.
- [x] 8.9 Verificar filtros, busqueda, PDF y vista Live con cero, uno y multiples responsables.
- [x] 8.10 Ejecutar lint/build y registrar cualquier nota restante de verificacion manual.
