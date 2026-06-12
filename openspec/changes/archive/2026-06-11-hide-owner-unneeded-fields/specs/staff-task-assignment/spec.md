## ADDED Requirements

### Requirement: Staff registration hides role
El sistema SHALL permitir crear y editar personal capturando nombre y disponibilidad sin mostrar ni requerir rol principal en el formulario.

#### Scenario: Crear personal sin rol visible
- **WHEN** la administradora registra una persona con nombre y estado activo
- **THEN** el sistema guarda el registro sin pedir rol principal en la interfaz

#### Scenario: Editar personal sin rol visible
- **WHEN** la administradora edita una persona existente
- **THEN** el sistema permite guardar cambios de nombre o disponibilidad sin mostrar ni requerir rol principal

#### Scenario: Listar personal sin rol visible
- **WHEN** la administradora consulta el catalogo de personal
- **THEN** el sistema muestra la persona y su disponibilidad sin columna ni etiqueta de rol principal

## MODIFIED Requirements

### Requirement: Event activities can be assigned to staff
El sistema SHALL permitir que una administradora asigne, cambie o limpie el responsable concreto de una actividad de evento desde el catalogo de staff.

#### Scenario: Crear actividad con responsable
- **WHEN** una administradora crea una actividad de evento y selecciona una persona del catalogo de staff
- **THEN** el sistema guarda la actividad con `staff_id` sin requerir rol responsable visible

#### Scenario: Editar responsable de actividad
- **WHEN** una administradora edita una actividad existente y selecciona otra persona de staff
- **THEN** el sistema actualiza `staff_id` de la actividad y mantiene la actividad protegida como ajuste manual cuando corresponda

#### Scenario: Limpiar responsable de actividad
- **WHEN** una administradora edita una actividad y deja el responsable sin seleccionar
- **THEN** el sistema guarda `staff_id` como nulo sin pedir un rol sustituto

### Requirement: Staff assignment display is explicit
El sistema SHALL mostrar el responsable asignado por nombre cuando exista y SHALL mostrar un estado sin responsable cuando no haya persona asignada.

#### Scenario: Actividad con persona asignada
- **WHEN** una actividad tiene `staff_id` relacionado con un registro de staff
- **THEN** el listado administrativo muestra el nombre de la persona responsable

#### Scenario: Actividad sin persona asignada
- **WHEN** una actividad no tiene `staff_id`
- **THEN** el listado administrativo muestra que no hay responsable asignado sin usar rol sugerido como fallback visible

#### Scenario: Staff inactivo previamente asignado
- **WHEN** una actividad o tarea maestra tiene asignado un staff que ya no esta activo
- **THEN** el sistema muestra la asignacion existente por nombre y permite cambiarla o limpiarla sin perderla automaticamente
