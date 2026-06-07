## 1. Estado Del Modal Y Formulario

- [x] 1.1 Agregar estado local en `src/app/admin/questionnaire-rules/page.tsx` para el modal de creacion de tarea, incluyendo estado abierto/cerrado, indice de la fila regla-tarea objetivo, valores del formulario, estado de guardado y error del modal.
- [x] 1.2 Agregar un modelo vacio para el formulario de creacion de tarea con defaults alineados a `POST /api/admin/tasks`, incluyendo `visibility = interna`.
- [x] 1.3 Agregar handlers para abrir el modal desde una fila regla-tarea especifica, cerrar/cancelar sin modificar la regla y reiniciar el estado del modal de forma segura.

## 2. Interfaz Para Crear Tarea En Linea

- [x] 2.1 Agregar una accion "Crear tarea" cerca de cada selector "Tarea maestra" dentro de la fila de tarea de la regla.
- [x] 2.2 Implementar un modal/popup con campos para nombre, descripcion base, area, visibilidad, rol predeterminado y staff predeterminado opcional.
- [x] 2.3 Mostrar errores de validacion y de servidor dentro del modal, conservando los valores capturados.
- [x] 2.4 Asegurar que los controles del modal sean comodos para teclado y movil, con acciones claras para cancelar y guardar.

## 3. Comportamiento De Guardado Y Seleccion

- [x] 3.1 Enviar el payload del modal a `POST /api/admin/tasks` usando el helper existente `adminFetch`.
- [x] 3.2 Al crear correctamente, insertar la tarea devuelta en `masterTasks` y mantener el catalogo ordenado de forma consistente por area/nombre.
- [x] 3.3 Asignar automaticamente el id de la tarea creada en `form.tasks[index].master_task_id` de la fila objetivo.
- [x] 3.4 Conservar el resto del formulario de regla en progreso, incluyendo pregunta, operador, valor esperado, bandera activa, overrides y otras filas de tareas.

## 4. Validacion Y Pruebas De Regresion

- [x] 4.1 Verificar que la deteccion de tareas duplicadas siga funcionando despues de seleccionar una tarea recien creada.
- [x] 4.2 Verificar que cancelar el modal no cambie el formulario de regla.
- [x] 4.3 Verificar que una creacion fallida mantenga el modal abierto con un error visible.
- [x] 4.4 Ejecutar `npm.cmd run lint` y `npm.cmd run build`.
