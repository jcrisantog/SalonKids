## ADDED Requirements

### Requirement: Seeded tasks include role responsibility defaults
El sistema SHALL sembrar tareas maestras y relaciones regla-tarea con un rol responsable sugerido cuando no exista una persona de staff asignada.

#### Scenario: Tarea sembrada sin persona asignada
- **WHEN** una tarea maestra se crea desde el seed sin `default_staff_id`
- **THEN** el sistema guarda `default_role` para mostrar responsable sugerido

#### Scenario: Regla sembrada con rol override
- **WHEN** una relacion regla-tarea requiere un responsable distinto al default de la tarea maestra
- **THEN** el seed guarda `override_role_responsible` para esa relacion

### Requirement: Seeded tasks can later receive concrete staff
El sistema SHALL permitir que la administradora asigne personal concreto a tareas maestras sembradas o tareas generadas sin modificar la matriz logica.

#### Scenario: Asignar staff a tarea maestra sembrada
- **WHEN** la administradora selecciona una persona activa como responsable default de una tarea maestra sembrada
- **THEN** futuros eventos usan esa persona salvo que una relacion regla-tarea defina override

#### Scenario: Asignar staff a tarea de evento generada
- **WHEN** la administradora cambia el responsable de una tarea de evento generada
- **THEN** el sistema conserva esa asignacion como ajuste manual de esa tarea sin cambiar la regla sembrada
