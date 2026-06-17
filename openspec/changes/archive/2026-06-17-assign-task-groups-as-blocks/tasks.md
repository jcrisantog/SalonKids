## 1. Guia del proyecto y modelo de datos

- [x] 1.1 Leer la guia local relevante de Next.js en `node_modules/next/dist/docs/` antes de editar rutas o paginas de la app.
- [x] 1.2 Agregar campos nulos de grupo de asignacion a `master_tasks` en `schema.sql`, incluyendo sentencias `ALTER TABLE` idempotentes para bases de datos existentes.
- [x] 1.3 Definir un helper pequeno de normalizacion para el grupo de asignacion que devuelva una clave estable y una etiqueta legible para la duena, conservando `null` para tareas sin grupo.
- [x] 1.4 Actualizar los tipos TypeScript de tareas maestras, tareas de regla y payloads de asignacion para incluir campos opcionales de grupo de asignacion.

## 2. Configuracion admin de tareas

- [x] 2.1 Actualizar `GET /api/admin/tasks` y las APIs de crear/actualizar tareas maestras para seleccionar, validar y persistir los campos de grupo de asignacion.
- [x] 2.2 Actualizar la pagina admin de tareas maestras para mostrar y editar el grupo de asignacion opcional sin hacerlo obligatorio.
- [x] 2.3 Actualizar el flujo de creacion rapida de tareas maestras en reglas del cuestionario para aceptar el grupo de asignacion opcional.
- [x] 2.4 Asegurar que la busqueda/visualizacion de tareas pueda mostrar informacion de grupo cuando sea util sin reintroducir Area o Rol default ocultos como campos requeridos para la duena.

## 3. Motor de reglas e insumos de asignacion

- [x] 3.1 Actualizar los selects de reglas configurables del cuestionario para que las tareas generadas puedan resolver grupos de asignacion desde sus tareas maestras vinculadas.
- [x] 3.2 Actualizar los selects de sincronizacion de tareas base de evento para incluir metadatos de grupo de asignacion desde las plantillas operativas.
- [x] 3.3 Preservar el comportamiento existente para tareas sin clave de grupo de asignacion o sin coincidencia de tarea maestra.

## 4. Autoasignacion agrupada

- [x] 4.1 Refactorizar `POST /api/admin/events/[id]/tasks/assign-responsibles` para construir unidades de asignacion: bloques agrupados por clave de grupo y unidades individuales para tareas sin grupo.
- [x] 4.2 Calcular la cantidad requerida de responsables de cada bloque agrupado usando la cantidad maxima requerida entre las tareas del bloque.
- [x] 4.3 Combinar IDs de responsables existentes en modo `complete` y IDs de responsables default desde reglas/tareas maestras antes de rellenar con staff activo mezclado aleatoriamente.
- [x] 4.4 Aplicar la misma lista resultante de responsables a cada tarea de un bloque agrupado y mantener asignacion por tarea para tareas sin grupo.
- [x] 4.5 Preservar el comportamiento actual del resumen para conteos de actualizadas, sin cambios, incompletas y errores, incluyendo bloques agrupados incompletos cuando el staff sea insuficiente.
- [x] 4.6 Mantener consistente el comportamiento de override manual marcando las tareas agrupadas actualizadas como `is_manual_override = true`.

## 5. Seeds y documentacion

- [x] 5.1 Auditar cada tarea en `Documentos/seed-operational-master-tasks.sql` y asignar un grupo solo cuando pertenezca a un bloque operativo claro.
- [x] 5.2 Auditar cada tarea maestra creada por `Documentos/seed-questionnaire-task-rules.sql` y asignar un grupo solo cuando pertenezca a un bloque operativo claro.
- [x] 5.3 Agregar soporte a los helpers de seed para que los grupos de asignacion se inserten o actualicen de forma idempotente.
- [x] 5.4 Actualizar `Documentos/matriz-operativa-tareas-reglas.md` para documentar el grupo de asignacion o el estado sin grupo de todas las tareas sembradas existentes.
- [x] 5.5 Incluir Arenero como etiqueta/clave de grupo soportada si existen tareas actuales o nuevas que coincidan; de lo contrario, documentar que las tareas de Arenero creadas manualmente pueden usar ese grupo.

## 6. Verificacion

- [x] 6.1 Verificar crear, editar y limpiar un grupo de asignacion en una tarea maestra.
- [x] 6.2 Verificar que la autoasignacion asigne la misma lista de responsables a todas las tareas de un bloque agrupado.
- [x] 6.3 Verificar que las tareas sin grupo sigan asignandose de forma independiente.
- [x] 6.4 Verificar que el modo `complete` conserve IDs de responsables existentes mientras alinea el bloque agrupado.
- [x] 6.5 Verificar que el modo `replace` recalcule y reemplace todas las listas de responsables del bloque agrupado.
- [x] 6.6 Verificar que staff insuficiente reporte bloques agrupados como incompletos sin duplicar una persona dentro del bloque.
- [x] 6.7 Ejecutar las verificaciones de lint/build del proyecto despues de implementar y corregir regresiones.
