## Por que

La asignacion aleatoria actual reparte tareas relacionadas entre distintas personas y rompe el flujo operativo del cliente, donde una persona suele hacerse responsable de todos los deberes de un area concreta, por ejemplo Arenero. El sistema necesita conservar esa forma de trabajo sin obligar a agrupar todas las tareas ni perder la flexibilidad de tareas independientes.

## Que cambia

- Permitir que algunas tareas maestras tengan una clave de agrupacion operativa opcional.
- Tratar las tareas de evento que comparten esa agrupacion como un bloque durante la asignacion automatica de responsables.
- Asignar el bloque completo a la misma persona o lista de personas, respetando defaults, responsables existentes y modo de completar/reemplazar.
- Mantener las tareas sin agrupacion con el comportamiento actual de asignacion por tarea individual.
- Actualizar la base documental y seeds operativos para que las tareas existentes puedan quedar clasificadas en grupos cuando corresponda, sin forzar agrupaciones para todas.

## Capacidades

### Capacidades nuevas

### Capacidades modificadas
- `staff-task-assignment`: Las tareas maestras podran declarar una agrupacion operativa opcional que se hereda a las tareas de evento.
- `event-task-auto-responsible-assignment`: La asignacion automatica debera asignar como bloque las tareas relacionadas por agrupacion, manteniendo independientes las tareas sin grupo.
- `operational-task-seeding`: La matriz y seeds operativos deberan considerar las tareas existentes y sembrar agrupaciones iniciales cuando haya relacion operativa clara.

## Impacto

- Base de datos: agregar metadato opcional de agrupacion a `master_tasks` y propagarlo o resolverlo para `event_tasks` durante la asignacion.
- APIs/admin: cargar, validar y persistir la agrupacion en catalogo de tareas maestras y en cualquier flujo de creacion rapida de tareas.
- Motor de reglas y tareas base: incluir el metadato de agrupacion en las consultas necesarias para tareas generadas.
- Autoasignacion: cambiar `POST /api/admin/events/[id]/tasks/assign-responsibles` para formar bloques por grupo antes de elegir responsables.
- Documentacion/seeds: actualizar `Documentos/seed-operational-master-tasks.sql`, `Documentos/seed-questionnaire-task-rules.sql` y la matriz operativa para clasificar las tareas existentes que deban agruparse.
