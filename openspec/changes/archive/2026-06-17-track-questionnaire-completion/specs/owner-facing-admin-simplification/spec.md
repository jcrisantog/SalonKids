## ADDED Requirements

### Requirement: Owner admin sees questionnaire completion signal
El sistema SHALL mostrar una senal administrativa clara del avance del cuestionario del cliente sin obligar a la duena a interpretar el estatus general del evento.

#### Scenario: Eventos muestran senal de cuestionario
- **WHEN** la duena revisa la tabla de eventos
- **THEN** el sistema muestra una etiqueta de cuestionario con "Sin iniciar", "En progreso" o "Completado por cliente"

#### Scenario: Senal no reemplaza estatus de evento
- **WHEN** la duena revisa un evento con estatus `pendiente`, `guardado`, `validado` o `finalizado`
- **THEN** el sistema conserva el estatus del evento y muestra la senal del cuestionario en un campo separado

#### Scenario: Correcciones del cliente se reflejan
- **WHEN** un cliente edita respuestas despues de haber enviado el cuestionario
- **THEN** la vista administrativa deja de mostrar "Completado por cliente" y muestra "En progreso" hasta que el cliente envie otra vez
