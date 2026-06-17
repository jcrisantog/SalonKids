## ADDED Requirements

### Requirement: Client can submit questionnaire as completed
El sistema SHALL permitir que el cliente envie el cuestionario mediante una accion explicita de finalizacion y SHALL guardar la version mas reciente de sus respuestas al enviarlo.

#### Scenario: Cliente envia cuestionario
- **WHEN** el cliente presiona la accion para enviar el cuestionario
- **THEN** el sistema guarda las respuestas actuales, registra la finalizacion y muestra una confirmacion de cuestionario enviado

#### Scenario: Error al enviar cuestionario
- **WHEN** el cliente intenta enviar el cuestionario y la API falla
- **THEN** el sistema conserva las respuestas en pantalla y muestra un error claro sin marcar el cuestionario como completado

### Requirement: Completed questionnaire remains editable
El sistema SHALL mantener editable el cuestionario despues de enviarlo y SHALL indicar que cualquier correccion requiere enviarlo nuevamente.

#### Scenario: Cliente corrige despues de enviar
- **WHEN** el cliente modifica una respuesta de un cuestionario previamente enviado
- **THEN** el sistema permite la edicion y cambia el estado visible a "En progreso" despues de guardar la correccion

#### Scenario: Cliente reenvia correcciones
- **WHEN** el cliente termina de corregir y vuelve a enviar el cuestionario
- **THEN** el sistema actualiza la marca de finalizacion y muestra nuevamente la confirmacion de cuestionario enviado

### Requirement: Public questionnaire exposes completion status
El sistema SHALL cargar y mostrar el estado de finalizacion del cuestionario junto con las respuestas guardadas.

#### Scenario: Cargar cuestionario completado
- **WHEN** el cliente abre un cuestionario que ya fue enviado y no tiene correcciones posteriores
- **THEN** el sistema muestra las respuestas guardadas y una senal de "Cuestionario enviado"

#### Scenario: Cargar cuestionario en progreso
- **WHEN** el cliente abre un cuestionario con respuestas guardadas pero sin finalizacion vigente
- **THEN** el sistema muestra las respuestas guardadas y una senal de "En progreso"
