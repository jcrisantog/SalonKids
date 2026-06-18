## Context

El sistema ya permite seleccionar varias personas en tareas maestras (`master_task_default_staff`) y en relaciones regla-tarea (`questionnaire_task_rule_task_staff`). Esas listas se tratan hoy como responsables predeterminados: el cuestionario puede copiarlas a tareas de evento y la autoasignacion las favorece como defaults.

La necesidad nueva es distinta: esas listas deben representar quienes pueden hacer una tarea. La asignacion concreta debe seguir siendo resultado del proceso de autoasignacion balanceada o de una edicion manual en la tarea del evento.

## Goals / Non-Goals

**Goals:**

- Reetiquetar la configuracion actual de staff en tareas maestras y reglas como `Personal seleccionable`.
- Reutilizar las tablas relacionales existentes para evitar una migracion estructural innecesaria.
- Hacer que la autoasignacion limite candidatos por personal seleccionable antes de aplicar rotacion historica.
- Evitar que tareas generadas por cuestionario nazcan con responsables concretos solo por tener personal seleccionable configurado.
- Mantener intacta la asignacion manual de responsables en tareas de evento.

**Non-Goals:**

- No crear roles, habilidades ni permisos por persona.
- No eliminar columnas heredadas como `default_staff_id` u `override_staff_id`; seguiran como compatibilidad mientras existan datos antiguos.
- No recalcular automaticamente eventos ya creados al guardar tareas maestras o reglas.
- No cambiar la cantidad requerida ni la logica de grupos operativos salvo por el universo de candidatos.

## Decisions

### Reutilizar relaciones existentes con nueva semantica

`master_task_default_staff` y `questionnaire_task_rule_task_staff` se usaran como almacenamiento de personal seleccionable. Esto evita crear tablas paralelas con la misma forma y permite migrar la interfaz de forma incremental.

Alternativa considerada: crear tablas nuevas `master_task_selectable_staff` y `rule_task_selectable_staff`. Se descarta por costo y duplicacion, aunque el codigo debera nombrar helpers y variables como `selectableStaffIds` para no perpetuar la confusion.

### Precedencia de candidatos

Para cada tarea de evento, el conjunto de candidatos se resolvera asi:

1. Si la relacion regla-tarea tiene personal seleccionable, usar esa lista.
2. Si no, usar el personal seleccionable de la tarea maestra.
3. Si no hay lista en ninguna fuente, usar todo el staff activo.

En todos los casos se filtrara a staff activo para autoasignacion. El staff inactivo puede seguir visible en asignaciones manuales/historicas existentes, pero no debe entrar como candidato automatico.

### Autoasignacion primero limita, luego rota

El orden correcto sera:

```text
resolver personal seleccionable
  -> filtrar activos
  -> excluir responsables existentes cuando aplique
  -> ordenar por repeticion historica y carga
  -> asignar cantidad requerida
```

Los defaults ya no deben dar prioridad. La rotacion debe decidir dentro del grupo permitido.

### Tareas generadas sin responsables concretos

El motor del cuestionario seguira guardando `source_rule_task_id` y `source_master_task_id`, pero no copiara personal seleccionable a `event_task_staff`. Asi las tareas quedan listas para autoasignacion y se evita confundir elegibilidad con asignacion real.

Si una tarea generada ya fue editada manualmente, la sincronizacion actual debe seguir preservando sus responsables.

### Grupos operativos combinan elegibilidad

Cuando varias tareas forman un bloque por grupo operativo, el conjunto permitido del bloque debe ser la interseccion de listas configuradas cuando existan listas explicitas en varias tareas. Si solo una tarea del bloque define lista, esa lista limita el bloque completo. Si ninguna define lista, todo el staff activo participa.

Esta decision evita asignar el bloque a alguien que no puede hacer una de las tareas del grupo.

## Risks / Trade-offs

- Riesgo: Datos existentes se reinterpretan y podrian dejar tareas con menos candidatos de lo esperado. Mitigacion: comunicar el cambio en etiquetas y permitir limpiar la lista para volver a "todo el staff activo".
- Riesgo: Un grupo operativo puede quedar con interseccion vacia si sus tareas tienen listas incompatibles. Mitigacion: reportar el bloque como incompleto y mostrar candidatos insuficientes en el resumen.
- Riesgo: Nombres internos `default_*` pueden confundir futuras ediciones. Mitigacion: usar nombres de variables, textos y helpers nuevos como `selectableStaffIds`, manteniendo columnas solo como compatibilidad.
- Riesgo: Eventos existentes conservaran responsables generados bajo la semantica anterior. Mitigacion: no reescribir historicos; modo reemplazar puede recalcular asignaciones de un evento con la nueva regla.
