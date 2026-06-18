## MODIFIED Requirements

### Requirement: Admin can auto-assign event task responsibles
El sistema SHALL permitir que una administradora asigne responsables automaticamente a las tareas de un evento seleccionado usando el personal seleccionable de cada tarea como universo de candidatos.

#### Scenario: Asignar responsables automaticamente desde evento
- **WHEN** la administradora ejecuta la accion de asignar responsables en la pantalla de tareas de un evento
- **THEN** el sistema asigna responsables a las tareas del evento usando personal seleccionable activo o todo el staff activo cuando la tarea no tenga restriccion

#### Scenario: Usar cantidad requerida por tarea
- **WHEN** una tarea de evento esta vinculada a una tarea maestra con `required_responsible_count = 3`
- **THEN** el sistema intenta dejar tres responsables distintos asignados a esa tarea desde sus candidatos permitidos

#### Scenario: Usar default de tarea maestra antes de aleatorio
- **WHEN** una tarea de evento proviene de una tarea maestra con personal seleccionable
- **THEN** el sistema limita la autoasignacion a esa lista y aplica rotacion historica dentro de esos candidatos

#### Scenario: Evitar duplicados dentro de la misma tarea
- **WHEN** el sistema asigna multiples responsables a una tarea
- **THEN** el sistema no asigna dos veces a la misma persona en esa tarea

#### Scenario: Permitir staff en varias tareas
- **WHEN** el sistema asigna responsables a varias tareas del mismo evento
- **THEN** el sistema puede asignar la misma persona de staff a mas de una tarea distinta

#### Scenario: Staff insuficiente
- **WHEN** no hay suficiente staff activo dentro del personal seleccionable para cubrir la cantidad requerida de una tarea
- **THEN** el sistema asigna los candidatos disponibles sin duplicarlos y reporta que la tarea quedo incompleta

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
- **THEN** el sistema conserva responsables existentes y solo agrega responsables donde falten cupos usando los candidatos permitidos de cada tarea

#### Scenario: Reemplazar asignaciones existentes
- **WHEN** la administradora confirma que desea reemplazar responsables existentes
- **THEN** el sistema recalcula las listas de responsables de las tareas incluidas usando personal seleccionable, rotacion historica y cantidad requerida

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

### Requirement: La autoasignacion asigna tareas agrupadas como bloques
El sistema SHALL tratar las tareas de evento vinculadas a tareas maestras con la misma agrupacion operativa como un bloque indivisible durante la asignacion automatica de responsables.

#### Scenario: Asignar un grupo completo a la misma persona
- **WHEN** dos o mas tareas de evento pertenecen a la misma agrupacion operativa y la administradora ejecuta la asignacion automatica
- **THEN** el sistema asigna la misma lista de responsables a todas las tareas de ese grupo

#### Scenario: Mantener tareas sin grupo como independientes
- **WHEN** una tarea de evento no tiene agrupacion operativa resuelta desde su tarea maestra
- **THEN** el sistema la asigna de forma individual usando el comportamiento existente por tarea

#### Scenario: Usar defaults dentro del grupo antes de aleatorio
- **WHEN** una agrupacion contiene tareas con personal seleccionable configurado por regla o tarea maestra
- **THEN** el sistema calcula candidatos permitidos para el bloque y aplica rotacion solo entre esos candidatos

#### Scenario: Respetar cantidad requerida del bloque
- **WHEN** las tareas de una misma agrupacion tienen distintas cantidades requeridas de responsables
- **THEN** el sistema calcula la lista del bloque usando la mayor cantidad requerida entre esas tareas

#### Scenario: Completar faltantes en grupo
- **WHEN** la administradora ejecuta la asignacion automatica en modo completar y una tarea del grupo ya tiene responsables asignados
- **THEN** el sistema conserva esos responsables como parte del bloque y completa faltantes para que todas las tareas del grupo queden con la misma lista resultante

#### Scenario: Reemplazar asignaciones de grupo
- **WHEN** la administradora ejecuta la asignacion automatica en modo reemplazar sobre tareas agrupadas
- **THEN** el sistema recalcula una lista unica para el bloque y reemplaza con ella los responsables de todas las tareas del grupo

#### Scenario: Grupo incompleto por falta de staff
- **WHEN** no hay suficiente staff activo permitido para cubrir la cantidad requerida de un grupo
- **THEN** el sistema asigna los responsables disponibles sin duplicarlos dentro del bloque y reporta el bloque como incompleto en el resumen

#### Scenario: Una persona puede cubrir varias tareas del grupo
- **WHEN** un grupo contiene varias tareas relacionadas de la misma area operativa
- **THEN** el sistema permite que la misma persona aparezca en todas las tareas del grupo porque representan un solo bloque de responsabilidad

#### Scenario: Resolver grupo desde regla o tarea maestra
- **WHEN** una tarea de evento viene de una relacion regla-tarea o de una tarea base con tarea maestra asociada
- **THEN** el sistema usa la agrupacion de la tarea maestra vinculada para decidir si participa en un bloque

### Requirement: La rotacion respeta reglas existentes de autoasignacion
El sistema SHALL aplicar rotacion historica sin romper personal seleccionable, grupos, cantidad requerida, modo completar, modo reemplazar ni ajustes manuales existentes.

#### Scenario: Completar faltantes con rotacion
- **WHEN** la administradora ejecuta autoasignacion en modo completar
- **THEN** el sistema conserva responsables existentes y usa rotacion historica solo para los cupos faltantes

#### Scenario: Reemplazar con rotacion
- **WHEN** la administradora ejecuta autoasignacion en modo reemplazar
- **THEN** el sistema recalcula responsables usando personal seleccionable, grupos, cantidad requerida y puntaje de rotacion historica

#### Scenario: Mantener grupo como bloque
- **WHEN** varias tareas pertenecen al mismo grupo operativo
- **THEN** el sistema calcula una sola lista de responsables balanceada por historial y la aplica al bloque completo

#### Scenario: Reportar repeticion inevitable
- **WHEN** una tarea o grupo queda asignado a alguien que hizo la misma actividad recientemente por falta de alternativas dentro de sus candidatos permitidos
- **THEN** el resumen de autoasignacion indica que hubo repeticion inevitable o candidatos insuficientes
