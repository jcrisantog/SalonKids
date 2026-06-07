## ADDED Requirements

### Requirement: Master tasks can have a default staff responsible
El sistema SHALL permitir que una administradora asigne un responsable predeterminado opcional desde el catalogo de staff activo al crear o editar una tarea maestra.

#### Scenario: Crear tarea maestra con responsable
- **WHEN** una administradora captura nombre, rol default y selecciona una persona activa del catalogo de staff
- **THEN** el sistema guarda la tarea maestra con `default_staff_id` y conserva `default_role` como rol sugerido

#### Scenario: Crear tarea maestra sin responsable
- **WHEN** una administradora crea una tarea maestra sin seleccionar staff
- **THEN** el sistema guarda la tarea con `default_staff_id` nulo y permite seguir usando `default_role`

#### Scenario: Editar responsable predeterminado
- **WHEN** una administradora cambia el responsable seleccionado de una tarea maestra existente
- **THEN** el sistema actualiza `default_staff_id` sin modificar nombre, descripcion, area, visibilidad ni rol default salvo que tambien hayan cambiado

#### Scenario: Limpiar responsable predeterminado
- **WHEN** una administradora selecciona la opcion sin responsable en una tarea maestra existente
- **THEN** el sistema guarda `default_staff_id` como nulo

### Requirement: Event activities can be assigned to staff
El sistema SHALL permitir que una administradora asigne, cambie o limpie el responsable concreto de una actividad de evento desde el catalogo de staff.

#### Scenario: Crear actividad con responsable
- **WHEN** una administradora crea una actividad de evento y selecciona una persona del catalogo de staff
- **THEN** el sistema guarda la actividad con `staff_id` y conserva `role_responsible` como rol sugerido

#### Scenario: Editar responsable de actividad
- **WHEN** una administradora edita una actividad existente y selecciona otra persona de staff
- **THEN** el sistema actualiza `staff_id` de la actividad y mantiene la actividad protegida como ajuste manual cuando corresponda

#### Scenario: Limpiar responsable de actividad
- **WHEN** una administradora edita una actividad y deja el responsable sin seleccionar
- **THEN** el sistema guarda `staff_id` como nulo y muestra el rol sugerido si existe

### Requirement: Staff assignment display is explicit
El sistema SHALL mostrar el responsable asignado por nombre cuando exista y SHALL mostrar el rol sugerido solo como fallback cuando no haya persona asignada.

#### Scenario: Actividad con persona asignada
- **WHEN** una actividad tiene `staff_id` relacionado con un registro de staff
- **THEN** el listado administrativo muestra el nombre de la persona responsable

#### Scenario: Actividad sin persona asignada
- **WHEN** una actividad no tiene `staff_id` pero si tiene `role_responsible`
- **THEN** el listado administrativo muestra el rol sugerido como responsable pendiente de asignar

#### Scenario: Staff inactivo previamente asignado
- **WHEN** una actividad o tarea maestra tiene asignado un staff que ya no esta activo
- **THEN** el sistema muestra la asignacion existente y permite cambiarla o limpiarla sin perderla automaticamente

### Requirement: Staff assignment validates catalog entries
El sistema SHALL aceptar solo responsables que existan en el catalogo de staff y SHALL permitir valores nulos para tareas o actividades sin responsable concreto.

#### Scenario: Responsable inexistente
- **WHEN** una administradora envia un `staff_id` que no existe
- **THEN** el sistema rechaza el guardado con un mensaje claro de validacion

#### Scenario: Responsable nulo
- **WHEN** una administradora envia `staff_id` o `default_staff_id` nulo
- **THEN** el sistema guarda la tarea o actividad sin responsable concreto

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
