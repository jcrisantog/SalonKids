## ADDED Requirements

### Requirement: Questionnaire completion state is tracked separately
El sistema SHALL registrar la finalizacion explicita del cuestionario del cliente sin depender del estatus administrativo del evento.

#### Scenario: Cuestionario sin fila guardada
- **WHEN** un evento no tiene registro en `questionnaire_data`
- **THEN** el sistema identifica el cuestionario como "Sin iniciar"

#### Scenario: Cuestionario guardado sin envio
- **WHEN** un evento tiene respuestas guardadas pero no tiene marca de finalizacion
- **THEN** el sistema identifica el cuestionario como "En progreso"

#### Scenario: Cuestionario enviado por cliente
- **WHEN** el cliente envia el cuestionario
- **THEN** el sistema registra la fecha y hora de finalizacion y lo identifica como "Completado por cliente"

### Requirement: Editing after completion reopens the questionnaire
El sistema SHALL regresar el cuestionario a "En progreso" cuando el cliente edite respuestas despues de haberlo enviado.

#### Scenario: Autoguardado despues de envio
- **WHEN** un cuestionario esta "Completado por cliente" y el cliente modifica una respuesta que se autoguarda
- **THEN** el sistema limpia la marca de finalizacion y muestra el cuestionario como "En progreso"

#### Scenario: Reenvio despues de correcciones
- **WHEN** un cuestionario volvio a "En progreso" por correcciones y el cliente lo envia de nuevo
- **THEN** el sistema registra una nueva fecha y hora de finalizacion

### Requirement: Admin can distinguish questionnaire progress
El sistema SHALL mostrar a la administradora el estado derivado del cuestionario como una senal separada del estatus administrativo del evento.

#### Scenario: Lista administrativa muestra estado de cuestionario
- **WHEN** la administradora abre el catalogo de eventos
- **THEN** el sistema muestra para cada evento si el cuestionario esta "Sin iniciar", "En progreso" o "Completado por cliente"

#### Scenario: Estado administrativo permanece separado
- **WHEN** un evento tiene estatus administrativo `validado` o `finalizado`
- **THEN** el sistema conserva ese estatus y muestra aparte la senal de finalizacion del cuestionario

#### Scenario: Dashboard destaca cuestionarios completados
- **WHEN** existen cuestionarios marcados como "Completado por cliente"
- **THEN** el dashboard administrativo permite identificar que hay cuestionarios enviados que pueden requerir revision
