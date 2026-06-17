## 1. Preparacion y modelo de datos

- [x] 1.1 Revisar la documentacion local de Next.js en `node_modules/next/dist/docs/` antes de editar rutas o componentes Next.
- [x] 1.2 Agregar `completed_at TIMESTAMPTZ NULL` a `questionnaire_data` en `schema.sql`.
- [x] 1.3 Documentar o preparar el SQL necesario para aplicar la columna en una base existente sin hacer backfill automatico.
- [x] 1.4 Definir helpers o tipos compartidos para el estado derivado del cuestionario: `sin_iniciar`, `en_progreso` y `completado_por_cliente`.

## 2. API publica del cuestionario

- [x] 2.1 Actualizar la carga del cuestionario publico para devolver `completed_at` y el estado derivado de finalizacion.
- [x] 2.2 Extender el guardado del cuestionario para aceptar una intencion `save` que persista respuestas, sincronice tareas y limpie `completed_at`.
- [x] 2.3 Agregar la intencion `complete` para guardar la version actual, sincronizar tareas y establecer `completed_at = NOW()`.
- [x] 2.4 Asegurar que los errores de guardado o envio devuelvan mensajes claros sin marcar el cuestionario como completado.

## 3. UI publica del cliente

- [x] 3.1 Mostrar el estado del cuestionario como "En progreso" o "Cuestionario enviado" segun la respuesta de la API.
- [x] 3.2 Agregar una accion visible para "Enviar cuestionario" que use la intencion `complete`.
- [x] 3.3 Mantener el formulario editable despues de enviar y advertir que las correcciones deben enviarse nuevamente.
- [x] 3.4 Al editar despues de enviar, reflejar que el cuestionario vuelve a estar en progreso cuando se guarde la correccion.

## 4. API administrativa

- [x] 4.1 Incluir informacion de `questionnaire_data.completed_at` en la carga administrativa de eventos.
- [x] 4.2 Devolver para cada evento el estado derivado del cuestionario y la fecha de finalizacion cuando exista.
- [x] 4.3 Actualizar el dashboard administrativo para identificar cuestionarios completados por cliente que pueden requerir revision.
- [x] 4.4 Mantener el estatus administrativo del evento separado de la senal de finalizacion del cuestionario.

## 5. UI administrativa

- [x] 5.1 Mostrar en el catalogo de eventos una etiqueta de cuestionario con "Sin iniciar", "En progreso" o "Completado por cliente".
- [x] 5.2 Mostrar la fecha de envio del cuestionario cuando exista y sea util para revision.
- [x] 5.3 Agregar o ajustar una senal en el dashboard para que la administradora identifique cuestionarios enviados.
- [x] 5.4 Verificar que la senal de cuestionario no reemplace ni oculte el estatus administrativo del evento.

## 6. Verificacion

- [x] 6.1 Validar que un evento sin `questionnaire_data` aparezca como "Sin iniciar".
- [x] 6.2 Validar que un guardado parcial aparezca como "En progreso".
- [x] 6.3 Validar que al enviar el cuestionario aparezca como "Completado por cliente" para cliente y admin.
- [x] 6.4 Validar que editar despues de enviar cambie el cuestionario a "En progreso".
- [x] 6.5 Validar que reenviar despues de correcciones vuelva a mostrar "Completado por cliente".
- [x] 6.6 Validar que los estados `validado` y `finalizado` del evento no dependan de la senal del cuestionario.
- [x] 6.7 Ejecutar lint/build o las pruebas disponibles del proyecto.
