## ADDED Requirements

### Requirement: Admin can auto-assign event task responsibles
El sistema SHALL permitir que una administradora asigne responsables automaticamente a las tareas de un evento seleccionado.

#### Scenario: Asignar responsables automaticamente desde evento
- **WHEN** la administradora ejecuta la accion de asignar responsables en la pantalla de tareas de un evento
- **THEN** el sistema asigna responsables a las tareas del evento usando personal activo y la cantidad requerida por cada tarea

#### Scenario: Usar cantidad requerida por tarea
- **WHEN** una tarea de evento esta vinculada a una tarea maestra con `required_responsible_count = 3`
- **THEN** el sistema intenta dejar tres responsables distintos asignados a esa tarea

#### Scenario: Usar default de tarea maestra antes de aleatorio
- **WHEN** una tarea de evento proviene de una tarea maestra con responsables predeterminados
- **THEN** el sistema conserva esos responsables como primeras asignaciones y usa seleccion aleatoria solo para completar faltantes

#### Scenario: Evitar duplicados dentro de la misma tarea
- **WHEN** el sistema asigna multiples responsables a una tarea
- **THEN** el sistema no asigna dos veces a la misma persona en esa tarea

#### Scenario: Permitir staff en varias tareas
- **WHEN** el sistema asigna responsables a varias tareas del mismo evento
- **THEN** el sistema puede asignar la misma persona de staff a mas de una tarea distinta

#### Scenario: Staff insuficiente
- **WHEN** no hay suficiente staff activo para cubrir la cantidad requerida de una tarea
- **THEN** el sistema asigna los responsables disponibles sin duplicarlos y reporta que la tarea quedo incompleta

#### Scenario: Tarea sin plantilla usa un responsable
- **WHEN** una tarea de evento no tiene tarea maestra asociada ni cantidad requerida especifica
- **THEN** el sistema intenta asignar un responsable activo

### Requirement: Auto assignment preserves manual control
El sistema SHALL permitir que la asignacion automatica ayude a repartir responsables sin impedir ajustes manuales posteriores.

#### Scenario: Preguntar antes de cambiar tareas con responsables
- **WHEN** la administradora ejecuta la asignacion automatica y existen tareas con responsables ya asignados
- **THEN** el sistema pregunta si desea completar solo faltantes o reemplazar las asignaciones existentes

#### Scenario: Completar faltantes como opcion predeterminada
- **WHEN** la administradora confirma la asignacion automatica sin elegir reemplazo total
- **THEN** el sistema conserva responsables existentes y solo agrega responsables donde falten cupos

#### Scenario: Reemplazar asignaciones existentes
- **WHEN** la administradora confirma que desea reemplazar responsables existentes
- **THEN** el sistema recalcula las listas de responsables de las tareas incluidas usando defaults y seleccion aleatoria segun la cantidad requerida

#### Scenario: Completar tarea parcialmente asignada
- **WHEN** una tarea ya tiene responsables manuales y aun tiene menos que su cantidad requerida
- **THEN** el sistema conserva los responsables existentes y completa solo los faltantes

#### Scenario: No quitar responsables extra
- **WHEN** una tarea tiene mas responsables asignados que su cantidad requerida
- **THEN** el sistema conserva esas asignaciones y no elimina responsables automaticamente

#### Scenario: Editar despues de asignacion automatica
- **WHEN** la administradora cambia responsables de una tarea despues de ejecutar la asignacion automatica
- **THEN** el sistema guarda la lista editada como ajuste manual de esa tarea

#### Scenario: Mostrar resumen de resultado
- **WHEN** termina la asignacion automatica
- **THEN** el sistema informa cuantas tareas fueron actualizadas, cuantas quedaron incompletas y cuantas no cambiaron
