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

### Requirement: Master tasks define required responsible count
El sistema SHALL permitir que una administradora configure cuantas personas responsables requiere cada tarea maestra.

#### Scenario: Crear tarea maestra con cantidad requerida
- **WHEN** una administradora captura una tarea maestra con cantidad de responsables mayor a cero
- **THEN** el sistema guarda esa cantidad para futuras tareas de evento

#### Scenario: Cantidad requerida por default
- **WHEN** una administradora crea una tarea maestra sin capturar cantidad de responsables
- **THEN** el sistema guarda la cantidad requerida como `1`

#### Scenario: Rechazar cantidad invalida
- **WHEN** una administradora intenta guardar una cantidad de responsables menor a uno o no numerica
- **THEN** el sistema rechaza el guardado con un mensaje claro de validacion

### Requirement: Master tasks can have a default staff responsible
El sistema SHALL permitir que una administradora asigne cero, uno o varios responsables predeterminados desde el catalogo de staff activo al crear o editar una tarea maestra.

#### Scenario: Crear tarea maestra con varios responsables
- **WHEN** una administradora captura nombre y selecciona varias personas activas del catalogo de staff
- **THEN** el sistema guarda la tarea maestra con la lista de responsables predeterminados y conserva datos heredados de rol solo como compatibilidad interna

#### Scenario: Crear tarea maestra sin responsable
- **WHEN** una administradora crea una tarea maestra sin seleccionar staff
- **THEN** el sistema guarda la tarea sin responsables predeterminados

#### Scenario: Editar responsables predeterminados
- **WHEN** una administradora agrega, quita o reordena responsables de una tarea maestra existente
- **THEN** el sistema actualiza solo la lista de responsables predeterminados salvo que otros campos tambien hayan cambiado

#### Scenario: Limpiar responsables predeterminados
- **WHEN** una administradora elimina todos los responsables de una tarea maestra existente
- **THEN** el sistema guarda la tarea maestra sin responsables predeterminados

### Requirement: Event activities can be assigned to staff
El sistema SHALL permitir que una administradora asigne, cambie o limpie uno o varios responsables concretos de una actividad de evento desde el catalogo de staff.

#### Scenario: Crear actividad con varios responsables
- **WHEN** una administradora crea una actividad de evento y selecciona una o varias personas del catalogo de staff
- **THEN** el sistema guarda la actividad con la lista de responsables sin requerir rol responsable visible

#### Scenario: Editar responsables de actividad
- **WHEN** una administradora edita una actividad existente y cambia su lista de responsables
- **THEN** el sistema actualiza los responsables de la actividad y mantiene la actividad protegida como ajuste manual cuando corresponda

#### Scenario: Limpiar responsables de actividad
- **WHEN** una administradora edita una actividad y deja la lista de responsables vacia
- **THEN** el sistema guarda la actividad sin responsables sin pedir un rol sustituto

### Requirement: Staff assignment display is explicit
El sistema SHALL mostrar los responsables asignados por nombre cuando existan y SHALL mostrar un estado sin responsable cuando no haya personas asignadas.

#### Scenario: Actividad con varias personas asignadas
- **WHEN** una actividad tiene dos o mas responsables relacionados con registros de staff
- **THEN** el listado administrativo muestra los nombres de esas personas como responsables de la actividad

#### Scenario: Actividad con una persona asignada
- **WHEN** una actividad tiene un responsable relacionado con un registro de staff
- **THEN** el listado administrativo muestra el nombre de esa persona responsable

#### Scenario: Actividad sin persona asignada
- **WHEN** una actividad no tiene responsables asignados
- **THEN** el listado administrativo muestra que no hay responsable asignado sin usar rol sugerido como fallback visible

#### Scenario: Staff inactivo previamente asignado
- **WHEN** una actividad o tarea maestra tiene asignado un staff que ya no esta activo
- **THEN** el sistema muestra la asignacion existente por nombre y permite cambiarla o limpiarla sin perderla automaticamente

### Requirement: Staff assignment validates catalog entries
El sistema SHALL aceptar solo responsables que existan en el catalogo de staff, SHALL evitar duplicados en la misma lista y SHALL permitir listas vacias para tareas o actividades sin responsable concreto.

#### Scenario: Responsable inexistente
- **WHEN** una administradora envia un ID de staff que no existe dentro de una lista de responsables
- **THEN** el sistema rechaza el guardado con un mensaje claro de validacion

#### Scenario: Responsable duplicado
- **WHEN** una administradora envia el mismo ID de staff mas de una vez para la misma tarea
- **THEN** el sistema rechaza el guardado o normaliza la lista para conservar una sola relacion por persona

#### Scenario: Lista vacia
- **WHEN** una administradora envia una lista vacia de responsables
- **THEN** el sistema guarda la tarea o actividad sin responsables concretos

### Requirement: Seeded tasks include role responsibility defaults
El sistema SHALL sembrar tareas maestras y relaciones regla-tarea con un rol responsable sugerido cuando no exista una persona de staff asignada.

#### Scenario: Tarea sembrada sin persona asignada
- **WHEN** una tarea maestra se crea desde el seed sin `default_staff_id`
- **THEN** el sistema guarda `default_role` para mostrar responsable sugerido

#### Scenario: Regla sembrada con rol override
- **WHEN** una relacion regla-tarea requiere un responsable distinto al default de la tarea maestra
- **THEN** el seed guarda `override_role_responsible` para esa relacion

### Requirement: Seeded tasks can later receive concrete staff
El sistema SHALL permitir que la administradora asigne una o varias personas concretas a tareas maestras sembradas o tareas generadas sin modificar la matriz logica.

#### Scenario: Asignar varios staff a tarea maestra sembrada
- **WHEN** la administradora selecciona varias personas activas como responsables default de una tarea maestra sembrada
- **THEN** futuros eventos usan esa lista salvo que una relacion regla-tarea defina override

#### Scenario: Asignar varios staff a tarea de evento generada
- **WHEN** la administradora cambia los responsables de una tarea de evento generada
- **THEN** el sistema conserva esa lista como ajuste manual de esa tarea sin cambiar la regla sembrada
