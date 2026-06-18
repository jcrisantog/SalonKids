## 1. Historial y equivalencia operativa

- [x] 1.1 Revisar las consultas actuales de tareas de evento, relaciones `event_task_staff`, tareas maestras y grupos catalogados.
- [x] 1.2 Crear helper para resolver la llave de actividad equivalente usando `assignment_group_id`, `assignment_group_key`, `source_master_task_id` o nombre normalizado.
- [x] 1.3 Crear consulta/helper para cargar eventos anteriores al evento actual limitado a los ultimos 3 eventos para autoasignacion.
- [x] 1.4 Crear consulta/helper para cargar historial de tareas por staff limitado a los ultimos 5 eventos para pantalla administrativa.
- [x] 1.5 Normalizar la salida de historial con evento, fecha, tarea, grupo resuelto, hora, estado y staff asignado.

## 2. Autoasignacion balanceada

- [x] 2.1 Actualizar `assign-responsibles` para cargar historial reciente antes de calcular candidatos.
- [x] 2.2 Calcular puntaje por candidato considerando repeticiones de la misma actividad en los ultimos 3 eventos.
- [x] 2.3 Usar carga historica total como desempate antes de aplicar aleatoriedad.
- [x] 2.4 Mantener defaults, cantidad requerida, grupos de asignacion, modo completar y modo reemplazar con el nuevo orden de candidatos.
- [x] 2.5 Reportar en el resumen cuando una repeticion fue inevitable por falta de alternativas.
- [x] 2.6 Verificar que grupos operativos sigan asignandose como bloque indivisible.

## 3. API de historial de personal

- [x] 3.1 Agregar endpoint administrativo para devolver historial de tareas por staff en los ultimos 5 eventos.
- [x] 3.2 Incluir personal activo sin historial reciente con estado vacio.
- [x] 3.3 Incluir personal inactivo que tenga asignaciones dentro de los ultimos 5 eventos.
- [x] 3.4 Agregar resumen de repeticiones por actividad o grupo operativo por cada miembro.
- [x] 3.5 Soportar filtros por staff y evento reciente desde parametros de consulta.

## 4. Pantalla administrativa de historial

- [x] 4.1 Agregar ruta/pantalla administrativa para historial de tareas del personal.
- [x] 4.2 Mostrar filtros por miembro del personal y evento reciente.
- [x] 4.3 Mostrar resumen por persona con conteos de repeticion por actividad o grupo.
- [x] 4.4 Mostrar detalle de tareas con evento, fecha, hora, tarea, grupo y estado.
- [x] 4.5 Mostrar estados vacios claros para staff sin historial y filtros sin resultados.
- [x] 4.6 Agregar acceso visible desde la navegacion administrativa o desde tareas de evento, siguiendo patrones existentes.

## 5. Impresion y PDF

- [x] 5.1 Agregar accion para imprimir/generar PDF del historial visible.
- [x] 5.2 Disenar plantilla imprimible con contexto, filtros aplicados, resumen de repeticion y detalle de tareas.
- [x] 5.3 Evitar generar PDF vacio cuando no haya resultados.
- [x] 5.4 Verificar legibilidad del PDF con historial completo y con filtros activos.

## 6. Verificacion

- [x] 6.1 Probar autoasignacion con una persona que hizo la misma actividad en los ultimos 3 eventos y otra sin repeticion reciente.
- [x] 6.2 Probar autoasignacion cuando todo el staff disponible ya repitio la actividad.
- [x] 6.3 Probar modo completar con responsables existentes y cupos faltantes.
- [x] 6.4 Probar modo reemplazar con grupos operativos y cantidad requerida mayor a uno.
- [x] 6.5 Probar pantalla de historial con staff activo sin tareas, staff inactivo con tareas y filtros combinados.
- [x] 6.6 Ejecutar lint/build o la verificacion disponible del proyecto.

## 7. Historial por tarea

- [x] 7.1 Agregar pantalla administrativa de historial por tarea para los ultimos 5 eventos.
- [x] 7.2 Permitir filtrar el historial por tarea.
- [x] 7.3 Mostrar tabla por tarea con columnas Evento, Hora y Responsable.
- [x] 7.4 Agregar accion para generar PDF del historial visible por tarea.
- [x] 7.5 Agregar acceso desde la navegacion administrativa.
- [x] 7.6 Separar fecha y evento en el historial por tarea y permitir ordenar por fecha del evento.
