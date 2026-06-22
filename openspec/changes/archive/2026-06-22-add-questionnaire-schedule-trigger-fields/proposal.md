## Why

El cuestionario no captura varios horarios operativos necesarios para coordinar personaje, baile, fotos y llegada del proveedor de comida, y tampoco expone un horario derivado de fin de comida. Incorporarlos como campos utilizables por las reglas permitirá programar tareas desde datos consistentes sin recurrir a horarios manuales o cálculos repetidos.

## What Changes

- Agregar en la sección 15 el campo condicional "Hora del personaje" cuando esté activa "Aparición de personaje".
- Agregar en la sección 15 el campo condicional "Bloque de baile" cuando esté activa "Desean música para bailar".
- Mover "Hora de fotos" de la sección 4 a la sección 15, conservando su visibilidad condicionada a "Sesión de fotos" y su llave estable para mantener compatibilidad.
- Agregar en la sección 8 el campo condicional "Hora de llegada del proveedor de comida" para eventos con servicio externo o alimentos del cliente.
- Calcular y persistir el campo oculto "Hora Fin Comida" como una hora posterior a "Inicio de comida", actualizándolo cuando cambie el horario de inicio.
- Hacer que los cuatro horarios visibles y el horario derivado estén disponibles como campos disparadores en la configuración y evaluación de reglas de tareas.
- Mantener compatibilidad con cuestionarios guardados antes de incorporar estos campos, usando valores vacíos o derivados seguros según corresponda.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `client-event-questionnaire`: Amplía la captura condicional de horarios en las secciones 8 y 15, reubica la hora de fotos y persiste el fin de comida calculado sin mostrarlo al cliente.
- `questionnaire-task-rules`: Expone los nuevos horarios, incluido el campo derivado oculto, como llaves estables que pueden disparar reglas y programar tareas.

## Impact

- Tipos, valores por defecto, normalización y metadata en `src/lib/rule-engine.ts` y `src/lib/questionnaire-schema.ts`.
- Renderizado y guardado del cuestionario público en `src/app/event/[token]`, incluido el cálculo de una hora para `foodEndTime`.
- Catálogo de campos disponible en `src/app/admin/questionnaire-rules` y evaluación de reglas de tareas.
- Seeds y documentación operativa en `Documentos/seed-questionnaire-task-rules.sql` y `Documentos/matriz-operativa-tareas-reglas.md` cuando corresponda registrar las nuevas llaves.
- Payloads JSON existentes de cuestionarios, sin requerir una migración destructiva.
