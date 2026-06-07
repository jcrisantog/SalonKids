## Why

Las tablas administrativas ya concentran mucha informacion operativa, pero encontrar rapidamente eventos, tareas maestras, tareas de un evento o reglas configuradas requiere escanear filas manualmente. Agregar busqueda en vivo reduce friccion para la duena y acelera la operacion diaria.

## What Changes

- Agregar un filtro de busqueda en la seccion de `Tareas del Evento`.
- Agregar un filtro de busqueda en el catalogo de `Tareas Maestras`.
- Agregar un filtro de busqueda en `Reglas configuradas`.
- Agregar un filtro de busqueda en la tabla de `Eventos`.
- Todos los filtros SHALL actualizar la tabla mientras la administradora escribe, sin requerir boton de buscar.
- La busqueda SHALL ser insensible a mayusculas/minusculas y SHALL comparar contra los campos visibles mas utiles de cada tabla.
- Cuando no haya resultados, cada tabla SHALL mostrar un estado vacio claro y conservar la opcion de limpiar la busqueda.

## Capabilities

### New Capabilities

- `admin-table-search`: Busqueda en vivo para tablas administrativas generales como eventos y tareas maestras.

### Modified Capabilities

- `event-task-reporting`: La tabla de tareas de evento debe soportar busqueda textual en vivo combinable con filtros existentes.
- `questionnaire-task-rules`: La tabla de reglas configuradas debe soportar busqueda textual en vivo.

## Impact

- `src/app/admin/events/page.tsx`
- `src/app/admin/tasks/page.tsx`
- `src/app/admin/events/[id]/tasks/page.tsx`
- `src/app/admin/questionnaire-rules/page.tsx`
- Posibles ajustes menores en componentes compartidos si existe un patron local reutilizable para controles de busqueda.
- No se esperan cambios de base de datos ni APIs si las tablas ya cargan sus datos completos en cliente.
