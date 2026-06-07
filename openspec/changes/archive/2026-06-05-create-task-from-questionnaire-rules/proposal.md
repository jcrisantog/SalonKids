## Why

La configuracion de reglas de cuestionario depende de tareas maestras existentes, pero cuando una tarea falta la administradora debe abandonar el flujo, ir al catalogo de tareas, crearla y regresar a la regla. Esto interrumpe la configuracion y aumenta el riesgo de perder contexto sobre la condicion que se estaba armando.

## What Changes

- Agregar en la pantalla de Reglas Cuestionario una accion para crear una tarea maestra sin salir del formulario de regla.
- Abrir la creacion en un modal/popup con los campos necesarios para una tarea maestra.
- Al guardar la nueva tarea, actualizar el catalogo de tareas disponible en la regla.
- Seleccionar automaticamente la tarea recien creada en el combobox/lista de tareas de la relacion regla-tarea que se estaba configurando.
- Mostrar errores de validacion o guardado dentro del modal sin perder el estado de la regla actual.

## Capabilities

### New Capabilities

### Modified Capabilities
- `questionnaire-task-rules`: La administradora puede crear tareas maestras faltantes desde la configuracion de reglas y usarlas inmediatamente en la regla en edicion.

## Impact

- Afecta la pantalla `src/app/admin/questionnaire-rules/page.tsx`.
- Reutiliza o extiende el endpoint existente de tareas maestras `src/app/api/admin/tasks/route.ts`.
- Reutiliza validaciones existentes del catalogo `master_tasks` para nombre, descripcion, area, visibilidad, rol y responsable predeterminado.
- No requiere cambios de base de datos si la tarea creada usa el mismo contrato actual de tareas maestras.
