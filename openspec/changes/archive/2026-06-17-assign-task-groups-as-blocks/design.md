## Contexto

La asignacion automatica actual vive en `POST /api/admin/events/[id]/tasks/assign-responsibles` y procesa cada tarea de evento de forma independiente. Para cada tarea resuelve defaults desde la relacion regla-tarea o desde `master_tasks`, completa con staff activo aleatorio y respeta los modos `complete` y `replace`.

El catalogo de `master_tasks` ya concentra datos que se heredan a eventos: nombre, descripcion, visibilidad, responsables default y cantidad requerida. Las tareas base y las tareas por cuestionario se mantienen principalmente desde `Documentos/seed-operational-master-tasks.sql`, `Documentos/seed-questionnaire-task-rules.sql` y la matriz documental. El cliente necesita que ciertos conjuntos operativos, por ejemplo tareas de Arenero, queden asignados a una misma persona porque representan un area de responsabilidad completa.

## Objetivos / Fuera de alcance

**Objetivos:**
- Permitir una agrupacion operativa opcional por tarea maestra.
- Revisar las tareas existentes en seeds y matriz para definir grupos iniciales solo donde haya relacion operativa clara.
- Hacer que la asignacion automatica trate cada grupo como un bloque y aplique la misma lista de responsables a todas sus tareas.
- Mantener intacto el comportamiento individual para tareas sin grupo.
- Respetar defaults, responsables existentes, cantidad requerida, staff activo, modo `complete` y modo `replace`.

**Fuera de alcance:**
- Crear balanceo global de carga entre personas.
- Obligar a que todas las tareas pertenezcan a un grupo.
- Cambiar el flujo publico del cuestionario.
- Crear roles o areas visibles nuevos como requisito operativo diario.
- Reemplazar la edicion manual posterior de responsables.

## Decisiones

1. Guardar el metadato de agrupacion en `master_tasks`.

Usar campos nulos como `assignment_group_key` y `assignment_group_label` en `master_tasks`. La clave es el valor estable que usa la logica de asignacion; la etiqueta es el valor legible para la duena, por ejemplo `arenero` / `Arenero`.

Alternativa considerada: inferir grupos desde `area` o desde prefijos en el nombre de la tarea. Esto es fragil porque el area actualmente esta oculta en el flujo de la duena, puede ser dato heredado y no distingue tareas que comparten area pero deben seguir independientes.

2. Mantener la agrupacion opcional y heredada.

Las tareas sin `assignment_group_key` permanecen independientes. Las tareas de evento generadas desde una tarea maestra agrupada participan en ese grupo mediante `source_master_task_id`, mediante `source_rule_task_id` hacia la tarea maestra, o mediante fallback por nombre donde el endpoint actual de asignacion ya busca la tarea maestra.

Alternativa considerada: agregar agrupacion obligatoria a cada tarea de evento. Esto crearia captura innecesaria y cambiaria el comportamiento de tareas que el cliente espera asignar por separado.

3. Asignar bloques en el endpoint existente de autoasignacion.

El endpoint debe cargar el metadato de agrupacion junto con los defaults de tareas maestras, construir unidades de asignacion y procesar:
- una unidad por cada tarea sin grupo;
- una unidad por cada clave de grupo con todas las tareas de evento vinculadas a ese grupo.

Para una unidad agrupada, calcular una sola lista de responsables y escribir esa misma lista en cada tarea de la unidad. La unidad debe usar la mayor cantidad requerida entre las tareas incluidas, mas los IDs de responsables existentes o default de las tareas incluidas segun la precedencia actual.

Alternativa considerada: asignar aleatoriamente la primera tarea y despues copiar su lista final a las tareas hermanas. Es mas simple, pero vuelve mas dificil razonar sobre conteos incompletos y defaults porque una tarea hermana podria tener requisitos mas fuertes.

4. Preservar la semantica de control manual.

En modo `complete`, las tareas agrupadas con responsables existentes aportan esas personas a la lista candidata del bloque y no se limpian. En modo `replace`, las asignaciones existentes se ignoran y el bloque se recalcula desde defaults mas relleno aleatorio de staff activo. Si un bloque agrupado cambia, cada tarea actualizada por el bloque queda marcada como `is_manual_override = true`, igual que en el endpoint actual.

Alternativa considerada: omitir cualquier grupo si una tarea ya tiene responsable. Eso evitaria cambios accidentales, pero no resolveria la necesidad del cliente de completar un area entera de forma consistente.

5. Actualizar las superficies de admin y seeds.

El catalogo de tareas y la creacion rapida de tareas dentro de reglas del cuestionario deben persistir los campos opcionales de agrupacion. Los seeds y la documentacion deben auditar cada tarea sembrada actual y definir claves de grupo solo para tareas que representen una misma area operativa o bloque de deberes. Ejemplos probables incluyen cierre/limpieza, montaje, cocina, audio/DJ, pinata/pastel/mesa de dulces/grupos del programa publico, y cualquier tarea de Arenero cuando exista en la base de tareas.

Alternativa considerada: mantener la agrupacion oculta y administrada solo por SQL. Eso resolveria el seed, pero haria que futuros ajustes de la duena requieran codigo o SQL directo.

## Riesgos / Intercambios

- Los defaults del grupo entran en conflicto entre tareas -> Usar IDs unicos ordenados desde asignaciones existentes/default y limitar por la cantidad requerida del bloque para que el resultado sea suficientemente determinista y nunca duplique una persona dentro del bloque.
- Un bloque agrupado tiene mas tareas de las que una persona puede completar razonablemente -> Esta funcion modela intencionalmente la responsabilidad por area del cliente; el balanceo de carga puede agregarse despues si hace falta.
- El fallback por nombre puede agrupar una tarea de evento inesperadamente si hay nombres duplicados -> Preferir `source_master_task_id` cuando exista y conservar el fallback por nombre solo por compatibilidad con el endpoint actual.
- Los seeds pueden sobrescribir metadatos de agrupacion editados por la duena -> Hacer que las actualizaciones de seed sean idempotentes pero explicitas; documentar que reejecutar seeds puede refrescar agrupaciones para nombres de tareas sembradas.
- La UI de tareas maestras puede saturarse -> Presentar la agrupacion como campo o selector compacto opcional, con valor vacio como default comun.

## Plan de migracion

1. Agregar columnas nulas de agrupacion a `master_tasks` en `schema.sql`.
2. Actualizar selects, validacion de payloads y persistencia en APIs de tareas maestras.
3. Actualizar formularios admin que crean o editan tareas maestras para incluir agrupacion opcional.
4. Actualizar el motor de reglas y consultas de asignacion para incluir metadatos de agrupacion.
5. Actualizar la autoasignacion para construir y procesar unidades de asignacion por clave de grupo.
6. Auditar todas las tareas existentes en seeds y documentacion, asignando claves de grupo solo donde los deberes relacionados deban mantenerse juntos.
7. Verificar que las bases de datos anteriores funcionen porque las filas existentes tendran agrupacion `NULL` y conservaran el comportamiento actual.

El rollback es de bajo riesgo: dejar sin uso las columnas nulas restaura el comportamiento de asignacion por tarea si se limpian todos los valores de agrupacion.

## Preguntas abiertas

- Confirmar las etiquetas finales visibles para la duena, especialmente si Arenero debe sembrarse ahora o solo soportarse para tareas creadas manualmente si ningun seed actual contiene deberes de Arenero.
- Decidir si el campo de grupo debe iniciar como texto libre o como un selector pequeno derivado de etiquetas de grupo existentes en `master_tasks`.
