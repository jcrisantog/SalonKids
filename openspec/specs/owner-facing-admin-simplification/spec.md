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
