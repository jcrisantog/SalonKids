# Design

## Placement
El asistente se integrara en el layout administrativo global para que este disponible desde cualquier pantalla del panel. La primera version usara un boton flotante discreto que abre un panel lateral o modal de chat.

## Interaction model
El asistente recibira:

- Texto escrito por la duena.
- Audio dictado y convertido a texto antes de enviar la consulta.
- Contexto de la pantalla actual, por ejemplo la ruta `/admin/events` o `/admin/questionnaire-rules`.

El asistente respondera con instrucciones breves, accionables y en espanol. Cuando aplique, incluira enlaces internos como "Abrir Eventos" o "Abrir Reglas Cuestionario".

## Knowledge source
La respuesta debe basarse en una guia interna curada del sistema, no solo en conocimiento general del modelo. La guia puede vivir como modulo local o documento estructurado con temas como:

- Crear y editar eventos.
- Enviar link del cuestionario.
- Revisar estado del cuestionario.
- Generar y sincronizar tareas.
- Asignar responsables.
- Configurar tareas maestras, grupos y reglas del cuestionario.
- Consultar historiales.
- Generar PDFs.

## Audio input
La primera opcion sera usar reconocimiento de voz del navegador si esta disponible. Si el navegador no lo soporta o falla, la interfaz debe permitir seguir usando texto.

Una version posterior podria subir audio al servidor para transcripcion con IA. Para esta propuesta inicial, el requisito critico es que la duena pueda dictar y que el sistema use el texto transcrito como consulta.

## Safety and boundaries
El asistente no debe modificar datos, crear registros, borrar tareas ni ejecutar acciones administrativas en esta version. Solo guia a la duena. Si no conoce una respuesta, debe decirlo y sugerir la pantalla o accion mas cercana.

## API shape
Se propone una ruta protegida:

`POST /api/admin/assistant`

Payload:

```json
{
  "message": "Como asigno responsables automaticamente?",
  "currentPath": "/admin/events/123/tasks"
}
```

Response:

```json
{
  "answer": "Para asignar responsables...",
  "steps": ["Abre el evento", "Presiona Asignar responsables"],
  "links": [{ "label": "Eventos", "href": "/admin/events" }]
}
```

## UI states
- Cerrado.
- Abierto sin conversacion.
- Grabando audio.
- Transcribiendo o preparando consulta.
- Respondiendo.
- Error recuperable.
- Historial de conversacion de la sesion actual.
