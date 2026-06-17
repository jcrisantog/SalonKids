## ADDED Requirements

### Requirement: La administradora puede gestionar grupos de tareas
El sistema SHALL permitir administrar un catalogo de grupos de asignacion de tareas para reutilizarlos en tareas maestras.

#### Scenario: Crear grupo de tareas
- **WHEN** una administradora captura nombre de grupo valido y guarda
- **THEN** el sistema crea el grupo con clave normalizada, estado activo y lo deja disponible para seleccion en tareas maestras

#### Scenario: Rechazar grupo duplicado
- **WHEN** una administradora intenta crear o renombrar un grupo con una clave normalizada que ya existe
- **THEN** el sistema rechaza el guardado con un mensaje claro de validacion

#### Scenario: Editar grupo de tareas
- **WHEN** una administradora cambia nombre, descripcion, orden o estado de un grupo existente
- **THEN** el sistema actualiza el grupo sin perder las tareas maestras que lo usan

#### Scenario: Desactivar grupo
- **WHEN** una administradora desactiva un grupo
- **THEN** el sistema conserva sus relaciones existentes y deja de ofrecerlo como opcion principal para nuevas tareas

#### Scenario: Mostrar grupo inactivo en tareas existentes
- **WHEN** una tarea maestra esta asociada a un grupo inactivo
- **THEN** el sistema muestra el nombre del grupo y permite cambiarlo o limpiarlo

#### Scenario: Bloquear eliminacion de grupo en uso
- **WHEN** una administradora intenta eliminar un grupo asociado a una o mas tareas maestras
- **THEN** el sistema impide la eliminacion y muestra cuantas tareas lo usan

#### Scenario: Eliminar grupo sin uso
- **WHEN** una administradora elimina un grupo sin tareas maestras asociadas
- **THEN** el sistema elimina el grupo del catalogo sin afectar tareas ni eventos existentes

### Requirement: El catalogo de grupos se puede consultar para seleccion y filtros
El sistema SHALL entregar los grupos de tareas ordenados para alimentar combos, filtros y vistas administrativas.

#### Scenario: Cargar grupos activos para formularios
- **WHEN** una pantalla administrativa necesita seleccionar grupo
- **THEN** el sistema devuelve los grupos activos ordenados por `sort_order` y nombre

#### Scenario: Cargar todos los grupos para administracion
- **WHEN** una administradora entra al catalogo de grupos
- **THEN** el sistema muestra grupos activos e inactivos con conteo de tareas asociadas

#### Scenario: Incluir opcion sin grupo
- **WHEN** una pantalla permite filtrar o asignar grupo
- **THEN** el sistema ofrece una opcion explicita para tareas sin grupo
