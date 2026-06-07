## 1. Preparacion

- [x] 1.1 Revisar las tablas actuales en `src/app/admin/events/page.tsx`, `src/app/admin/tasks/page.tsx`, `src/app/admin/questionnaire-rules/page.tsx` y `src/app/admin/events/[id]/tasks/page.tsx`.
- [x] 1.2 Definir helper local o compartido para normalizar texto de busqueda sin agregar dependencias.
- [x] 1.3 Confirmar los campos que alimentan la busqueda de cada tabla segun la informacion disponible en cliente.

## 2. Eventos

- [x] 2.1 Agregar estado y control de busqueda en la pantalla de Eventos.
- [x] 2.2 Filtrar la tabla de Eventos mientras se escribe usando nombre del festejado, datos de cliente disponibles, fecha, horario y estado.
- [x] 2.3 Agregar estado vacio para busqueda sin coincidencias y accion para limpiar busqueda.

## 3. Tareas Maestras

- [x] 3.1 Agregar estado y control de busqueda en el catalogo de Tareas Maestras.
- [x] 3.2 Filtrar tareas maestras por nombre, descripcion, area, rol, responsable, visibilidad y campos visibles relacionados.
- [x] 3.3 Agregar estado vacio para busqueda sin coincidencias y accion para limpiar busqueda.

## 4. Reglas Configuradas

- [x] 4.1 Agregar estado y control de busqueda en la seccion de Reglas configuradas.
- [x] 4.2 Combinar busqueda textual con el filtro de seccion existente.
- [x] 4.3 Filtrar reglas por pregunta, llave tecnica, seccion, operador, valor esperado, estado y tareas asociadas.
- [x] 4.4 Agregar estado vacio para busqueda/filtro sin coincidencias y accion para limpiar busqueda.

## 5. Tareas Del Evento

- [x] 5.1 Agregar estado y control de busqueda en la seccion de Tareas del Evento.
- [x] 5.2 Combinar busqueda textual con filtros existentes de responsable y visibilidad.
- [x] 5.3 Filtrar tareas por nombre, descripcion, hora, estado, visibilidad, rol responsable y staff asignado.
- [x] 5.4 Asegurar que el PDF de tareas use la lista visible despues de aplicar busqueda y filtros.
- [x] 5.5 Agregar estado vacio para busqueda/filtros sin coincidencias y evitar impresion vacia.

## 6. Verificacion

- [x] 6.1 Ejecutar `npm.cmd run lint`.
- [x] 6.2 Ejecutar `npm.cmd run build`.
- [x] 6.3 Verificar manualmente busqueda en Eventos mientras se escribe.
- [x] 6.4 Verificar manualmente busqueda en Tareas Maestras mientras se escribe.
- [x] 6.5 Verificar manualmente busqueda en Reglas configuradas combinada con seccion.
- [x] 6.6 Verificar manualmente busqueda en Tareas del Evento combinada con responsable, visibilidad e impresion.
