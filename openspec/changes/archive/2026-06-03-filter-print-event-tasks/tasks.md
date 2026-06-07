## 1. Filtros de tareas del evento

- [x] 1.1 Agregar estado local para filtro de responsable y filtro de visibilidad en `src/app/admin/events/[id]/tasks/page.tsx`.
- [x] 1.2 Construir opciones de responsable desde el staff cargado, incluyendo opcion "Sin responsable".
- [x] 1.3 Crear `filteredTasks` combinando responsable y visibilidad.
- [x] 1.4 Renderizar la tabla usando `filteredTasks` en lugar de `tasks`.
- [x] 1.5 Agregar controles para limpiar filtros y mostrar el conteo de tareas filtradas.

## 2. Generacion de PDF

- [x] 2.1 Decidir e instalar dependencia ligera de PDF o implementar alternativa HTML imprimible segun disponibilidad del entorno.
- [x] 2.2 Crear funcion de generacion basada en datos filtrados, no en captura de pantalla.
- [x] 2.3 Incluir en el PDF encabezado del evento, fecha, horario y filtros aplicados.
- [x] 2.4 Incluir solo columnas Hora, Tarea, Descripcion y Responsable.
- [x] 2.5 Aplicar diseno colorido, espaciado, encabezados visibles y filas legibles.
- [x] 2.6 Manejar tareas sin hora y sin responsable con textos claros.

## 3. Estados y UX

- [x] 3.1 Agregar boton con icono para generar PDF desde la tabla filtrada.
- [x] 3.2 Deshabilitar o manejar la accion cuando no hay tareas filtradas.
- [x] 3.3 Mantener el formulario de alta/edicion de tareas sin cambios funcionales.
- [x] 3.4 Asegurar que los controles no rompan layout mobile ni desktop.

## 4. Verificacion

- [x] 4.1 Verificar filtro por responsable asignado.
- [x] 4.2 Verificar filtro por "Sin responsable".
- [x] 4.3 Verificar filtro por visibilidad interna y publica.
- [x] 4.4 Verificar combinacion de filtros y limpieza.
- [x] 4.5 Verificar que el PDF respete filtros y contenga solo Hora, Tarea, Descripcion y Responsable.
- [x] 4.6 Ejecutar lint/build del proyecto y corregir errores.
