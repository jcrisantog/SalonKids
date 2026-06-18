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
El sistema SHALL permitir que la administradora configure personal seleccionable en tareas maestras sembradas y responsables concretos en tareas generadas sin modificar la matriz logica.

#### Scenario: Asignar varios staff a tarea maestra sembrada
- **WHEN** la administradora selecciona varias personas activas como personal seleccionable de una tarea maestra sembrada
- **THEN** futuros eventos usan esa lista como candidatos permitidos salvo que una relacion regla-tarea defina su propia lista

#### Scenario: Asignar varios staff a tarea de evento generada
- **WHEN** la administradora cambia los responsables de una tarea de evento generada
- **THEN** el sistema conserva esa lista como ajuste manual de esa tarea sin cambiar la regla sembrada ni el personal seleccionable de la tarea maestra

### Requirement: Las tareas maestras pueden declarar grupos de asignacion opcionales
El sistema SHALL permitir que una administradora configure una agrupacion operativa opcional en cada tarea maestra para indicar que tareas relacionadas deben asignarse como un bloque.

#### Scenario: Crear tarea maestra con grupo operativo
- **WHEN** una administradora crea una tarea maestra y captura una agrupacion operativa
- **THEN** el sistema guarda la clave de agrupacion y la etiqueta visible junto con la tarea maestra

#### Scenario: Crear tarea maestra sin grupo operativo
- **WHEN** una administradora crea una tarea maestra sin capturar agrupacion operativa
- **THEN** el sistema guarda la tarea sin grupo y la deja disponible para asignacion individual

#### Scenario: Editar grupo operativo
- **WHEN** una administradora agrega, cambia o limpia la agrupacion operativa de una tarea maestra existente
- **THEN** el sistema persiste el cambio sin modificar sus responsables predeterminados ni su cantidad requerida

#### Scenario: Reutilizar grupo en varias tareas
- **WHEN** una administradora asigna la misma agrupacion operativa a dos o mas tareas maestras
- **THEN** el sistema conserva una clave comun que la asignacion automatica puede usar para reconocerlas como un bloque

#### Scenario: Validar grupo operativo
- **WHEN** una administradora guarda una agrupacion operativa con espacios sobrantes, mayusculas o acentos
- **THEN** el sistema normaliza la clave estable y conserva una etiqueta legible para mostrarla en el admin

### Requirement: Las tareas maestras seleccionan grupos desde catalogo
El sistema SHALL permitir que una administradora asocie una tarea maestra a cero o un grupo de asignacion existente desde un combo.

#### Scenario: Crear tarea con grupo catalogado
- **WHEN** una administradora crea una tarea maestra y selecciona un grupo activo del catalogo
- **THEN** el sistema guarda la relacion con ese grupo y muestra su nombre en la tabla de tareas maestras

#### Scenario: Crear tarea sin grupo catalogado
- **WHEN** una administradora crea una tarea maestra con la opcion "Sin grupo"
- **THEN** el sistema guarda la tarea sin grupo y la deja disponible para asignacion individual

#### Scenario: Editar grupo catalogado de tarea
- **WHEN** una administradora cambia el grupo seleccionado de una tarea maestra
- **THEN** el sistema actualiza solo la relacion de grupo sin modificar responsables predeterminados ni cantidad requerida

#### Scenario: Limpiar grupo catalogado de tarea
- **WHEN** una administradora selecciona "Sin grupo" en una tarea que tenia grupo
- **THEN** el sistema limpia la relacion de grupo y la tarea vuelve a asignarse individualmente

#### Scenario: Rechazar grupo inexistente
- **WHEN** una administradora envia un ID de grupo que no existe
- **THEN** el sistema rechaza el guardado con un mensaje claro de validacion

### Requirement: La tabla de tareas maestras se puede filtrar por grupo
El sistema SHALL permitir filtrar el catalogo de tareas maestras por grupo de asignacion.

#### Scenario: Filtrar por grupo especifico
- **WHEN** una administradora selecciona un grupo en el filtro de tareas maestras
- **THEN** la tabla muestra solo tareas asociadas a ese grupo

#### Scenario: Filtrar tareas sin grupo
- **WHEN** una administradora selecciona el filtro "Sin grupo"
- **THEN** la tabla muestra solo tareas maestras sin grupo asignado

#### Scenario: Mostrar todos los grupos
- **WHEN** una administradora selecciona el filtro "Todos"
- **THEN** la tabla vuelve a mostrar tareas con y sin grupo

#### Scenario: Combinar busqueda y filtro de grupo
- **WHEN** una administradora escribe una busqueda y selecciona un grupo
- **THEN** la tabla muestra solo tareas que cumplen ambos criterios
