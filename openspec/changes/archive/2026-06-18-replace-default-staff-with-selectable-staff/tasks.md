## 1. Mapeo y nombres de dominio

- [x] 1.1 Revisar usos actuales de `default_staff_id`, `default_staff_ids`, `master_task_default_staff`, `override_staff_id` y `questionnaire_task_rule_task_staff`.
- [x] 1.2 Definir helpers o nombres internos `selectableStaffIds` manteniendo compatibilidad con columnas existentes.
- [x] 1.3 Actualizar textos de errores y variables visibles para evitar llamar responsables default al personal seleccionable.

## 2. Tareas maestras

- [x] 2.1 Cambiar el formulario de tareas maestras para mostrar `Personal seleccionable` en lugar de `Responsables default`.
- [x] 2.2 Actualizar tabla, busqueda y etiquetas para describir la lista como candidatos permitidos.
- [x] 2.3 Mantener guardado y lectura en las relaciones existentes sin romper datos actuales.
- [x] 2.4 Validar que lista vacia se interprete como todo el staff activo disponible para autoasignacion.

## 3. Reglas de cuestionario

- [x] 3.1 Cambiar la UI de reglas para mostrar `Personal seleccionable` por tarea asociada.
- [x] 3.2 Actualizar creacion inline de tareas para usar el nuevo texto y semantica.
- [x] 3.3 Ajustar APIs de reglas para seguir aceptando payloads actuales pero nombrar internamente la lista como personal seleccionable.
- [x] 3.4 Verificar que una lista de regla tenga prioridad sobre la lista de la tarea maestra.

## 4. Generacion de tareas desde cuestionario

- [x] 4.1 Actualizar el motor de reglas para no copiar personal seleccionable como responsables asignados al crear tareas de evento.
- [x] 4.2 Conservar `source_rule_task_id` y `source_master_task_id` para que la autoasignacion pueda resolver candidatos despues.
- [x] 4.3 Preservar responsables manuales existentes en tareas generadas durante sincronizaciones futuras.
- [x] 4.4 Verificar que tareas generadas sin responsables sigan apareciendo correctamente como pendientes de asignacion.

## 5. Autoasignacion

- [x] 5.1 Resolver candidatos permitidos por tarea usando regla, tarea maestra o todo el staff activo.
- [x] 5.2 Filtrar candidatos permitidos a staff activo antes de aplicar rotacion.
- [x] 5.3 Cambiar el ordenamiento para que el personal seleccionable limite candidatos y no funcione como prioridad/default.
- [x] 5.4 Ajustar modo completar para llenar cupos faltantes solo con candidatos permitidos.
- [x] 5.5 Ajustar modo reemplazar para recalcular responsables solo con candidatos permitidos.
- [x] 5.6 Resolver candidatos de grupos operativos combinando listas configuradas y reportar incompleto si no hay suficientes.
- [x] 5.7 Actualizar resumen de autoasignacion para distinguir candidatos insuficientes y repeticion inevitable dentro de la lista permitida.

## 6. Compatibilidad y datos existentes

- [x] 6.1 Mantener compatibilidad con columnas heredadas `default_staff_id` y `override_staff_id`.
- [x] 6.2 Asegurar que eventos existentes con responsables ya asignados no se modifiquen salvo al ejecutar autoasignacion.
- [x] 6.3 Revisar seeds o datos iniciales para que los textos y listas representen personal seleccionable.

## 7. Verificacion

- [x] 7.1 Probar tarea maestra sin personal seleccionable y confirmar que considera todo el staff activo.
- [x] 7.2 Probar tarea maestra con personal seleccionable y confirmar que solo esas personas participan.
- [x] 7.3 Probar regla con personal seleccionable propio y confirmar que reemplaza la lista de la tarea maestra.
- [x] 7.4 Probar generacion de cuestionario y confirmar que no crea responsables asignados desde personal seleccionable.
- [x] 7.5 Probar autoasignacion con rotacion historica dentro de una lista limitada.
- [x] 7.6 Probar grupo operativo con listas compatibles e incompatibles.
- [x] 7.7 Ejecutar lint/build o la verificacion disponible del proyecto.
