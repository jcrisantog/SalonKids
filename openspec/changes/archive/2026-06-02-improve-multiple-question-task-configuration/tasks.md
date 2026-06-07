## 1. Revision Inicial

- [x] 1.1 Leer la documentacion local relevante de Next.js en `node_modules/next/dist/docs/` antes de editar rutas App Router o componentes cliente/servidor.
- [x] 1.2 Revisar la UI actual en `/admin/questionnaire-rules` para confirmar soporte existente de multiples tareas.
- [x] 1.3 Revisar las rutas API admin de reglas para identificar validaciones faltantes de duplicados y orden.
- [x] 1.4 Revisar `syncReactiveTasks` para confirmar que genera todas las relaciones regla-tarea.

## 2. UI Admin

- [x] 2.1 Mejorar el texto y estructura visual del formulario para indicar que una regla puede generar varias tareas.
- [x] 2.2 Mostrar en la vista previa los nombres de todas las tareas seleccionadas, no solo el conteo.
- [x] 2.3 Evitar o advertir seleccion de la misma tarea maestra mas de una vez en la misma regla.
- [x] 2.4 Mantener overrides independientes por tarea: descripcion, hora, responsable y visibilidad.
- [x] 2.5 Mostrar en el listado de reglas todas las tareas asociadas en orden operativo.

## 3. API y Validaciones

- [x] 3.1 Validar en `POST /api/admin/questionnaire-rules` que el payload incluya al menos una tarea.
- [x] 3.2 Validar en `POST /api/admin/questionnaire-rules` que no se repita `master_task_id` dentro de la misma regla.
- [x] 3.3 Validar en `PATCH /api/admin/questionnaire-rules/[id]` que no se repita `master_task_id` dentro de la misma regla.
- [x] 3.4 Normalizar `sort_order` consecutivo al guardar relaciones regla-tarea.
- [x] 3.5 Devolver mensajes de error claros para duplicados o tareas faltantes.

## 4. Motor de Reglas

- [x] 4.1 Confirmar que una regla con multiples relaciones genera una tarea de evento por cada relacion.
- [x] 4.2 Confirmar que cada tarea generada usa sus propios overrides.
- [x] 4.3 Confirmar que la sincronizacion no duplica tareas al guardar el cuestionario mas de una vez.
- [x] 4.4 Confirmar que tareas manuales siguen preservandose durante el recalculo.

## 5. Seed y Documentacion

- [x] 5.1 Actualizar el seed o agregar ejemplo para una pregunta que genere mas de una tarea.
- [x] 5.2 Actualizar la documentacion de reglas para explicar como configurar multiples tareas por pregunta.
- [x] 5.3 Documentar que las reglas existentes con una sola tarea siguen siendo validas.

## 6. Verificacion

- [x] 6.1 Probar crear una regla nueva con dos tareas asociadas.
- [x] 6.2 Probar editar una regla existente para agregar y quitar tareas asociadas.
- [x] 6.3 Probar que una regla con dos tareas genera dos `event_tasks` en el siguiente guardado de cuestionario.
- [x] 6.4 Probar que intentar guardar una tarea duplicada muestra error claro.
- [x] 6.5 Ejecutar `npm.cmd run lint`.
- [x] 6.6 Ejecutar `npm.cmd run build`.
