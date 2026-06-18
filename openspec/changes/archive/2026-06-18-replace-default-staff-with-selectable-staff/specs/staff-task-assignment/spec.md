## MODIFIED Requirements

### Requirement: Master tasks can have a default staff responsible
El sistema SHALL permitir que una administradora asigne cero, uno o varios integrantes del catalogo de staff activo como personal seleccionable de una tarea maestra; esta lista SHALL limitar candidatos de autoasignacion y no SHALL representar responsables ya asignados por default.

#### Scenario: Crear tarea maestra con varios responsables
- **WHEN** una administradora captura nombre y selecciona varias personas activas del catalogo de staff en el campo de personal seleccionable
- **THEN** el sistema guarda la tarea maestra con la lista de candidatos permitidos y conserva datos heredados de rol solo como compatibilidad interna

#### Scenario: Crear tarea maestra sin responsable
- **WHEN** una administradora crea una tarea maestra sin seleccionar staff
- **THEN** el sistema guarda la tarea sin restriccion de personal seleccionable y la autoasignacion puede considerar todo el staff activo

#### Scenario: Editar responsables predeterminados
- **WHEN** una administradora agrega, quita o reordena personal seleccionable de una tarea maestra existente
- **THEN** el sistema actualiza solo la lista de candidatos permitidos salvo que otros campos tambien hayan cambiado

#### Scenario: Limpiar responsables predeterminados
- **WHEN** una administradora elimina todo el personal seleccionable de una tarea maestra existente
- **THEN** el sistema guarda la tarea maestra sin restriccion de personal seleccionable para que todo el staff activo pueda participar

### Requirement: Seeded tasks can later receive concrete staff
El sistema SHALL permitir que la administradora configure personal seleccionable en tareas maestras sembradas y responsables concretos en tareas generadas sin modificar la matriz logica.

#### Scenario: Asignar varios staff a tarea maestra sembrada
- **WHEN** la administradora selecciona varias personas activas como personal seleccionable de una tarea maestra sembrada
- **THEN** futuros eventos usan esa lista como candidatos permitidos salvo que una relacion regla-tarea defina su propia lista

#### Scenario: Asignar varios staff a tarea de evento generada
- **WHEN** la administradora cambia los responsables de una tarea de evento generada
- **THEN** el sistema conserva esa lista como ajuste manual de esa tarea sin cambiar la regla sembrada ni el personal seleccionable de la tarea maestra
