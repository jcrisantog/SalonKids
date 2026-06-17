## ADDED Requirements

### Requirement: Owner admin hides non-operational sections
El sistema SHALL ocultar de la experiencia administrativa las secciones que no son necesarias para la operacion diaria de la duena.

#### Scenario: Live Matriz no aparece como seccion operativa
- **WHEN** la duena navega por el panel administrativo
- **THEN** el sistema no muestra la seccion Live Matriz como opcion de navegacion principal

#### Scenario: Integraciones conserva solo acciones utiles
- **WHEN** la duena abre la pantalla de Integraciones
- **THEN** el sistema muestra acciones utiles como envio de link al cliente y no muestra secciones de pulido visual, checklist movil / Lighthouse ni checklist de impresion fisica

### Requirement: Hidden administrative fields are not required
El sistema SHALL permitir guardar formularios administrativos aunque los campos ocultos de rol, area o responsable operativo no sean enviados por el cliente.

#### Scenario: Guardar formulario sin campos ocultos
- **WHEN** un formulario administrativo oculta un campo operativo heredado y envia el guardado sin ese campo
- **THEN** el sistema guarda el registro usando valores nulos, vacios o fallbacks internos segun corresponda

#### Scenario: Editar registro existente con datos ocultos
- **WHEN** la duena edita un registro existente que conserva datos en campos ahora ocultos
- **THEN** el sistema permite guardar los cambios visibles sin obligarla a revisar o capturar los campos ocultos

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
