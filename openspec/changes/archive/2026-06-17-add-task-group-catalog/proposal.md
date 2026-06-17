## Por que

El grupo de asignacion ya permite tratar varias tareas como un bloque, pero hoy se captura como texto libre en cada tarea maestra. Eso permite variantes y errores de escritura, y hace dificil administrar, desactivar o reutilizar grupos como Arenero desde un lugar central.

## Que cambia

- Crear un catalogo administrable de grupos de tareas con alta, edicion, desactivacion y eliminacion segura.
- Cambiar el catalogo de tareas maestras para seleccionar el grupo desde un combo en lugar de escribir el nombre manualmente.
- Permitir filtrar tareas maestras por grupo con un combo, incluyendo "Todos" y "Sin grupo".
- Migrar o mapear los grupos existentes de `master_tasks.assignment_group_key/label` hacia el nuevo catalogo.
- Actualizar la autoasignacion para resolver bloques por el grupo catalogado, conservando compatibilidad durante la migracion.
- Mantener tareas sin grupo como un caso valido y visible.

## Capacidades

### Capacidades nuevas
- `task-group-catalog`: Administra el catalogo de grupos de asignacion de tareas y su ciclo de vida.

### Capacidades modificadas
- `staff-task-assignment`: Las tareas maestras seleccionaran un grupo catalogado opcional en lugar de depender de texto libre.
- `event-task-auto-responsible-assignment`: La autoasignacion resolvera bloques por grupo catalogado y conservara compatibilidad con grupos heredados durante la migracion.

## Impacto

- Base de datos: nueva tabla de grupos de tareas, relacion opcional desde `master_tasks` y migracion de grupos existentes.
- APIs/admin: nuevas rutas CRUD para grupos y cambios en APIs de tareas maestras para cargar/validar `assignment_group_id`.
- UI: nueva pantalla de catalogo de grupos, selector de grupo en tareas maestras y filtro por grupo en la tabla.
- Seeds/documentacion: actualizar seeds para crear grupos y referenciarlos desde tareas sembradas.
- Autoasignacion: usar el identificador de grupo catalogado como fuente principal para construir bloques.
