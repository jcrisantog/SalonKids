## ADDED Requirements

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
