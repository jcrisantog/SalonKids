## Why

El sistema hoy marca el evento como `guardado` cuando el cliente guarda o el autoguardado persiste el cuestionario, pero esa senal no distingue entre "avance parcial" y "el cliente ya termino". La administradora necesita una senal clara y confiable para saber cuando un cuestionario quedo enviado por el cliente y requiere revision.

## What Changes

- Agregar un estado explicito de finalizacion del cuestionario del cliente, separado del ciclo administrativo del evento.
- Permitir que el cliente presione una accion clara para enviar/finalizar el cuestionario.
- Mantener el cuestionario editable despues de enviarlo; si el cliente corrige cualquier respuesta, el cuestionario vuelve a quedar "En progreso" hasta que lo envie de nuevo.
- Mostrar en administracion una senal legible del estado del cuestionario: "Sin iniciar", "En progreso" o "Completado por cliente".
- Conservar los estados administrativos existentes del evento, como `pendiente`, `guardado`, `validado` y `finalizado`, sin usarlos como unica fuente para saber si el cliente termino el cuestionario.

## Capabilities

### New Capabilities
- `questionnaire-completion-tracking`: cubre la marca explicita de finalizacion del cuestionario, la transicion a en progreso cuando el cliente edita despues de enviar y la visibilidad administrativa de esa senal.

### Modified Capabilities
- `client-event-questionnaire`: el cuestionario publico cambia de solo guardar respuestas a permitir una accion explicita de envio/finalizacion.
- `owner-facing-admin-simplification`: la administracion debe mostrar una senal clara y separada del estado del cuestionario para facilitar la revision operativa.

## Impact

- Base de datos: agregar un campo de finalizacion al registro de `questionnaire_data`.
- API publica del cuestionario: guardar respuestas, finalizar cuestionario y devolver el estado de finalizacion.
- UI publica del cuestionario: agregar accion de envio, mensajes de estado y comportamiento al editar despues de enviar.
- API y UI administrativa de eventos/dashboard: consultar y mostrar el estado derivado del cuestionario.
- Pruebas y validacion manual: cubrir guardado parcial, envio, edicion posterior y reenvio.
