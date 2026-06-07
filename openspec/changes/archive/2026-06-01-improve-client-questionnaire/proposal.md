## Why

El cuestionario digital actual captura solo una parte del flujo operativo real del salon. Las administradoras ya usan un documento mucho mas completo con preguntas sobre pastel, musica, presentacion, pinata, mesas, menu, decoracion, dinamicas, seguridad y programa; llevar esa estructura al sistema reduce capturas externas, omisiones y ajustes manuales el dia del evento.

## What Changes

- Reemplazar el formulario publico actual por un cuestionario organizado por secciones equivalentes al documento operativo `CUESTIONARIO_MEJORADO.docx`.
- Agregar campos estructurados para respuestas de opcion unica, opcion multiple, cantidades, horarios, textos largos y notas por seccion.
- Mantener autosave, estado visual de guardado y carga por token publico del evento.
- Sincronizar las respuestas relevantes con tareas reactivas, cronograma publico y notas operativas internas.
- Mejorar la experiencia de captura para clientas y administradoras con secciones navegables, estados de avance y campos condicionales.
- Conservar compatibilidad con respuestas existentes guardadas como JSONB, aplicando valores por defecto cuando falten nuevos campos.

## Capabilities

### New Capabilities

- `client-event-questionnaire`: Defines the public client questionnaire behavior, supported sections, field persistence, conditional questions, progress state, and operational task synchronization.

### Modified Capabilities

None.

## Impact

- Affects the public questionnaire page at `src/app/event/[token]/QuestionnaireClient.tsx`.
- Affects the questionnaire API at `src/app/api/client-events/[token]/questionnaire/route.ts`.
- Affects the questionnaire data shape in `src/lib/rule-engine.ts`.
- May require new helper components for questionnaire sections, inputs, conditional groups and progress/navigation.
- May require updates to reactive task rules for pastel, pinata, menu, dinamicas, servicios, decoracion and programa.
- No new external dependency is required unless implementation chooses a local form helper already compatible with the project.
