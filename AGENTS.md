# AGENTS.md

Instrucciones para agentes que trabajen en este repositorio.

## Reglas Criticas

- NUNCA subir codigo a Git ni a GitHub sin que el usuario lo pida expresamente.
- PROHIBIDO ejecutar por cuenta propia comandos como:
  - `git add`
  - `git commit`
  - `git push`
- No hacer commits, pushes, merges, rebases, resets destructivos ni cambios de rama sin autorizacion explicita.
- Si el arbol de trabajo tiene cambios que no hiciste, no los reviertas. Asume que son del usuario y trabaja alrededor de ellos.
- Hablar con el usuario en español.

## Proyecto

Este proyecto es la aplicacion operativa de Salon Kids para administrar eventos, cuestionarios de cliente, reglas de tareas, staff, asignaciones y seguimiento operativo.

Areas importantes:

- `src/app/admin/events`: administracion de eventos y links de cuestionario.
- `src/app/event/[token]`: cuestionario publico del cliente.
- `src/app/admin/questionnaire-rules`: configuracion de reglas que generan tareas desde respuestas del cuestionario.
- `src/lib/questionnaire-schema.ts`: metadata, defaults y visibilidad condicional del cuestionario.
- `src/lib/rule-engine.ts`: evaluacion y sincronizacion de reglas/tareas.
- `Documentos/seed-questionnaire-task-rules.sql`: seed inicial de reglas de cuestionario.
- `Documentos/matriz-operativa-tareas-reglas.md`: documentacion operativa de reglas y tareas.
- `openspec/specs`: especificaciones activas.
- `openspec/changes`: cambios OpenSpec activos.
- `openspec/changes/archive`: cambios OpenSpec archivados.

## Next.js

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Antes de editar codigo de Next.js, lee la guia local relevante dentro de:

```text
node_modules/next/dist/docs/
```

Ejemplos:

- Componentes cliente/servidor: `01-app/01-getting-started/05-server-and-client-components.md`
- Mutaciones: `01-app/01-getting-started/07-mutating-data.md`
- Route handlers: `01-app/01-getting-started/15-route-handlers.md`

## OpenSpec

Usar OpenSpec para cambios funcionales relevantes.

Flujo recomendado:

1. Proponer cambio con artefactos (`proposal.md`, `design.md`, `specs`, `tasks.md`).
2. Implementar tareas marcando cada checkbox en `tasks.md`.
3. Sincronizar delta specs con `openspec/specs` antes de archivar.
4. Archivar en `openspec/changes/archive/YYYY-MM-DD-nombre-del-cambio`.

Reglas:

- No archivar cambios con tareas pendientes sin confirmar con el usuario.
- Antes de aplicar un cambio, leer los archivos de contexto que indique OpenSpec.
- Mantener `tasks.md` en español cuando sea posible.
- Si un cambio afecta comportamiento esperado, actualizar specs y documentacion relacionada.

## Cuestionario Y Reglas

El cuestionario usa un payload JSON dinamico. Para agregar campos:

- Agregar la llave a `QuestionnaireData` en `src/lib/rule-engine.ts`.
- Agregar default en `emptyQuestionnaire` dentro de `src/lib/questionnaire-schema.ts`.
- Agregar metadata en `questionnaireSections`.
- Usar `dependsOn` y `dependsValue` para campos condicionales.
- Confirmar que `normalizeQuestionnaire` conserva compatibilidad con payloads antiguos.

Para reglas de tareas:

- Preferir reglas configurables y seeds sobre reglas hardcodeadas.
- `schedule_source_field_key` permite que una regla disparada por un campo tome horario desde otro campo.
- `override_scheduled_time` tiene prioridad sobre `schedule_source_field_key`.
- Las reglas deben preservar overrides manuales y no duplicar tareas.
- Actualizar `Documentos/seed-questionnaire-task-rules.sql` y `Documentos/matriz-operativa-tareas-reglas.md` cuando cambien reglas iniciales.

## Verificacion

Despues de cambios de codigo, ejecutar cuando aplique:

```powershell
npm.cmd run lint
npm.cmd run build
```

Si hay cambios frontend visibles, intentar verificar en navegador local o por endpoint/API cuando sea suficiente. Si no se puede verificar por falta de servidor, token, sandbox o datos, reportarlo claramente.

## Estilo De Implementacion

- Mantener cambios pequeños y enfocados.
- Seguir patrones existentes antes de crear abstracciones nuevas.
- No hacer refactors no solicitados.
- No introducir dependencias nuevas sin necesidad clara.
- Mantener compatibilidad con datos existentes.
- Usar nombres estables de campos en camelCase para respuestas de cuestionario.
- Evitar textos largos de ayuda dentro de la UI si no son necesarios.

## Comandos Y Seguridad

- Preferir `rg` para buscar texto o archivos.
- No ejecutar comandos destructivos sin confirmacion.
- No modificar configuracion global del sistema o Git sin autorizacion.
- No instalar dependencias sin autorizacion.
- Si una accion requiere permisos elevados, pedir aprobacion explicando por que.
- Gestor de paquetes pnpm (no npm).
