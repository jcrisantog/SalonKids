## Why

`Documentos/ListaTareas.txt` contiene actividades operativas mas detalladas que el catalogo actual de tareas maestras y reglas de cuestionario. Necesitamos convertir esa revision en seeds auditables para cerrar tareas faltantes sin duplicar tareas equivalentes que ya existen con otra redaccion.

## What Changes

- Agregar un script SQL idempotente para dar de alta tareas maestras faltantes detectadas desde `Documentos/ListaTareas.txt`.
- Agregar un script SQL idempotente para dar de alta o actualizar reglas de cuestionario que generen esas tareas cuando dependan de respuestas existentes.
- Generar un reporte documental que indique que tareas se dieron de alta, que regla se les aplico, que tareas se ignoraron y el motivo de omision.
- Clasificar tareas ignoradas como cubiertas por tarea existente, detalle operativo incluido en una tarea mas amplia, servicio sin campo de cuestionario confiable, o elemento no accionable como tarea independiente.
- Mantener compatibilidad con tareas y reglas existentes: no crear duplicados por nombres equivalentes y no reemplazar configuraciones manuales de eventos ya generados.
- No cambiar la interfaz ni agregar campos al cuestionario en este cambio; cuando una actividad requiera un campo nuevo para una regla confiable, el reporte debe documentarla como pendiente/candidata.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `operational-task-seeding`: ampliar la base inicial de tareas maestras desde la revision de `ListaTareas.txt` y exigir trazabilidad de altas/omisiones.
- `questionnaire-task-rules`: ampliar las reglas iniciales sembradas para cubrir tareas faltantes accionables con campos de cuestionario existentes, preservando idempotencia y edicion desde admin.

## Impact

- Documentos SQL nuevos en `Documentos/` para tareas maestras faltantes y reglas faltantes.
- Reporte nuevo en `Documentos/` con altas, reglas aplicadas, omisiones y razones.
- Posibles actualizaciones a `Documentos/matriz-operativa-tareas-reglas.md` si la nueva matriz de tareas/reglas debe quedar integrada a la documentacion operativa principal.
- No requiere migracion de esquema ni dependencias nuevas.
- No ejecuta cambios en Git ni GitHub.
