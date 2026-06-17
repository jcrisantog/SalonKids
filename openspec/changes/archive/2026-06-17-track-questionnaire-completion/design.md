## Context

Actualmente el cuestionario publico guarda respuestas mediante autoguardado y guardado manual. Cada guardado persiste `questionnaire_data.data`, actualiza `updated_at` y marca el evento como `guardado`, pero esa informacion no permite saber si el cliente considera terminado el cuestionario o si solo avanzo una parte.

La administradora necesita una senal operativa clara para revisar cuestionarios completados. A la vez, el cliente debe poder corregir respuestas despues de enviar; cuando haga cambios, el cuestionario debe volver a "En progreso" hasta que lo envie de nuevo.

## Goals / Non-Goals

**Goals:**
- Registrar una finalizacion explicita del cuestionario del cliente.
- Derivar un estado legible del cuestionario: "Sin iniciar", "En progreso" o "Completado por cliente".
- Permitir ediciones posteriores al envio y limpiar la marca de completado cuando el cliente cambie respuestas.
- Mostrar la senal en administracion sin mezclarla con el estado administrativo del evento.
- Mantener sincronizacion de tareas reactivas con las respuestas guardadas.

**Non-Goals:**
- Bloquear el cuestionario despues de enviarlo.
- Crear notificaciones por WhatsApp, correo o push.
- Reemplazar el flujo administrativo de `pendiente`, `guardado`, `validado` y `finalizado`.
- Crear una aprobacion formal del cuestionario por parte de la administradora.

## Decisions

### Usar `questionnaire_data.completed_at` como marca de finalizacion

Se agregara una columna nullable `completed_at TIMESTAMPTZ` en `questionnaire_data`. Cuando sea `NULL`, el cuestionario no esta completado; cuando tenga valor, representa la ultima fecha/hora en que el cliente presiono enviar.

Alternativas consideradas:
- Agregar un nuevo valor al `events.status`: se descarta porque mezcla el estado del cuestionario con el ciclo administrativo del evento.
- Guardar la marca dentro del JSON `data`: se descarta porque dificulta consultas, filtros y conteos administrativos.

### Derivar el estado del cuestionario desde la fila y `completed_at`

La UI y APIs administrativas deberan mostrar:
- "Sin iniciar" cuando no existe fila en `questionnaire_data`.
- "En progreso" cuando existe fila y `completed_at` es `NULL`.
- "Completado por cliente" cuando existe fila y `completed_at` no es `NULL`.

No sera necesario comparar `updated_at` contra `completed_at`, porque cualquier guardado de edicion despues de completar limpiara `completed_at`.

### Extender la API publica con intencion de guardado

La ruta publica del cuestionario aceptara dos intenciones:
- `save`: guarda respuestas, actualiza `updated_at`, limpia `completed_at` y sincroniza tareas.
- `complete`: guarda las respuestas actuales, actualiza `updated_at`, establece `completed_at = NOW()` y sincroniza tareas.

Esto permite que el boton "Enviar cuestionario" persista la version mas reciente incluso si hay cambios pendientes.

### Mantener editable el cuestionario completado

La UI publica mostrara un estado de completado y permitira seguir editando. Al modificar respuestas despues de completar, el siguiente autoguardado o guardado manual debe cambiar el estado visible a "En progreso" y pedir al cliente que vuelva a enviar cuando termine sus correcciones.

### Exponer la senal al admin como dato separado

Las APIs administrativas que listan eventos deberan incluir campos derivados del cuestionario, por ejemplo `questionnaire_status` y `questionnaire_completed_at`. La UI administrativa debera presentarlos como una etiqueta independiente del estatus del evento.

## Risks / Trade-offs

- [Risk] Eventos antiguos con cuestionario guardado apareceran como "En progreso" porque no tienen `completed_at`. -> Mitigation: aceptar este comportamiento como conservador; la administradora solo vera "Completado por cliente" para envios explicitos nuevos.
- [Risk] Un autoguardado pendiente despues de enviar podria limpiar `completed_at` si no se controla el flujo del cliente. -> Mitigation: el boton de envio debe guardar la version actual y el cliente debe marcarse como completado solo cuando no haya una edicion posterior pendiente.
- [Risk] El estado del evento y el estado del cuestionario podrian parecer contradictorios, por ejemplo evento `validado` con cuestionario "En progreso" tras una correccion. -> Mitigation: mostrar ambos como senales separadas y no usar el estado administrativo como fuente de finalizacion del cuestionario.
- [Risk] Consultas administrativas con joins a `questionnaire_data` pueden devolver duplicados si hubiera datos inconsistentes. -> Mitigation: mantener `event_id` unico en `questionnaire_data` y consultar una sola fila por evento.

## Migration Plan

1. Agregar `completed_at TIMESTAMPTZ NULL` a `questionnaire_data` en `schema.sql` y documentar el SQL necesario para bases existentes.
2. No hacer backfill automatico: las filas existentes permaneceran como "En progreso" hasta que el cliente envie el cuestionario con la nueva accion.
3. Actualizar APIs publicas y administrativas para leer y escribir la nueva columna.
4. Actualizar la UI publica y administrativa.
5. Verificar manualmente guardado parcial, envio, edicion posterior y reenvio.

Rollback: si se revierte la UI/API, la columna puede permanecer sin uso; no afecta las lecturas existentes porque es nullable.
