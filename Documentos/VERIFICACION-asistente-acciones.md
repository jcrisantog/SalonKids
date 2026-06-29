# Verificacion asistente accionable

## Casos cubiertos por implementacion

- Mensaje no accionable: usa la respuesta informativa del asistente.
- Accion no soportada: responde con limite claro y pasos manuales.
- Crear evento: genera plan confirmable con festejado, fecha, edad opcional, datos de cliente opcionales y horarios default si no se indican.
- Modificar evento: resuelve el evento existente y genera plan confirmable para cambiar fecha, hora, festejado, edad, cliente o estatus.
- Eliminar evento: requiere confirmacion reforzada y elimina solo el evento resuelto.
- Crear tarea de evento: genera plan confirmable con evento, tarea, hora y responsables resueltos. Reconoce frases como "crea la tarea cargar cumpleanero para el evento de Angel a las 17:00" y "crea tarea para el evento de Angel de cargar cumpleanero, la tarea sera a las 17:00".
- Reasignar tarea: exige tarea existente dentro del evento resuelto y staff real.
- Cambiar hora: exige tarea existente y hora valida.
- Eliminar tarea: requiere confirmacion reforzada.
- Crear staff: genera plan confirmable y crea staff activo. Reconoce frases como "agrega a Javier Oli como nuevo personal" y "crea staff nuevo con el nombre de Javier Oli".
- Inactivar staff: requiere confirmacion reforzada si tiene tareas futuras detectadas.
- Eliminar staff: requiere confirmacion reforzada. Reconoce frases como "eliminar al personal Javier Oli".
- Plan alterado o vencido: se rechaza por firma HMAC y expiracion.

## Ambiguedad

- Si hay varios eventos posibles, el asistente pide elegir evento.
- Si hay varias tareas posibles dentro del evento, pide un nombre mas exacto.
- Si hay varias personas de staff posibles, pide nombre completo.
- Si falta evento, tarea, staff u hora requeridos, pide aclaracion antes de planear.

## Auditoria

- Las ejecuciones confirmadas intentan registrar usuario, mensaje original, tipo de accion, entidades y resultado.
- Para habilitar la tabla de auditoria, aplicar `Documentos/add-assistant-action-audit.sql`.

## Limitaciones de verificacion

- La experiencia visual desktop/movil y el flujo real de microfono requieren navegador local con sesion admin.
- El dictado por voz depende de `SpeechRecognition`/`webkitSpeechRecognition` del navegador y permisos del sitio.
