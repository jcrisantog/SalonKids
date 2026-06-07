# Proposal

## Why

Las tareas actuales y las reglas iniciales del cuestionario existen, pero estan repartidas entre un motor hardcodeado, un seed generico y plantillas base muy amplias. La duena del sistema necesita recibir una base operativa limpia, editable y alineada con las actividades reales de entrada y cierre del evento para poder modificarla sin depender de cambios de codigo.

## What Changes

- Depurar el catalogo inicial de `master_tasks` para separar tareas fijas de operacion, tareas publicas del itinerario y tareas internas generadas por respuestas del cuestionario.
- Sembrar plantillas base de entrada y cierre basadas en los documentos operativos de sabado 2026, incluyendo preparacion desde 13:00, evento 14:00-20:00, colaboracion de staff, bajada de pertenencias de anfitriones, retiro de charolas, separacion de residuos y manteleria.
- Reemplazar la dependencia practica de reglas hardcodeadas por reglas configurables sembradas en base de datos.
- Ampliar el seed de reglas para cubrir preguntas que probablemente generen tareas utiles: pastel, musica, presentacion, personaje, fotos, sorpresa, pinata, montaje, menus, restricciones alimentarias, cafe/dulces/gelatina, servicios extra, decoracion, entregables, dinamicas, seguridad y programa.
- Marcar preguntas meramente informativas como sin regla inicial, para que no produzcan ruido operativo.
- Agregar documentacion de depuracion que explique que reglas/tareas quedan activas, cuales son candidatas opcionales y como la duena puede ajustarlas desde el admin.

## Capabilities

### New Capabilities

- `operational-task-seeding`: Sembrado y mantenimiento de una base editable de tareas maestras operativas de entrada, durante evento y cierre.

### Modified Capabilities

- `questionnaire-task-rules`: La matriz inicial de reglas debe representar una base depurada y ampliada, no solo ejemplos genericos.
- `event-task-reporting`: Las tareas generadas y plantillas base deben tener nombres, areas, visibilidad y responsables consistentes para filtrado e impresion operativa.
- `staff-task-assignment`: Las tareas sembradas deben conservar rol sugerido y permitir responsable concreto opcional sin romper asignaciones posteriores.

## Impact

- `Documentos/seed-questionnaire-task-rules.sql` y posibles seeds/documentacion complementaria para tareas maestras base.
- `src/lib/rule-engine.ts`, para retirar o aislar reglas hardcodeadas que dupliquen el motor configurable.
- `schema.sql`, si el seed requiere restricciones o campos auxiliares no existentes.
- Pantallas y APIs de administracion de tareas maestras, reglas de cuestionario y tareas de evento solo si necesitan mostrar categorias, visibilidad o responsables sembrados.
- Documentacion operativa en `Documentos/` para que la duena pueda revisar y ajustar la base inicial.
