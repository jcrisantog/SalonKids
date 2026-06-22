## ADDED Requirements

### Requirement: Operational schedule fields can trigger questionnaire rules
El sistema SHALL incluir `characterTime`, `danceBlockTime`, `photoSessionTime`, `externalFoodProviderArrivalTime` y `foodEndTime` en el catálogo de campos configurables para reglas de tareas usando llaves estables y tipo hora.

#### Scenario: Administradora selecciona un horario visible como disparador
- **WHEN** la administradora crea o edita una regla de cuestionario
- **THEN** puede seleccionar la hora del personaje, bloque de baile, hora de fotos o llegada del proveedor de comida como campo disparador

#### Scenario: Administradora selecciona fin de comida oculto como disparador
- **WHEN** la administradora crea o edita una regla de cuestionario
- **THEN** puede seleccionar "Hora Fin Comida" como disparador aunque el campo no se muestre en el cuestionario público

#### Scenario: Horario respondido activa una regla
- **WHEN** uno de los nuevos campos de hora contiene un valor válido y una regla activa usa el operador `answered` sobre esa llave
- **THEN** el motor considera cumplida la regla y sincroniza sus tareas asociadas

#### Scenario: Campo de hora dispara y programa una tarea
- **WHEN** una regla se dispara por uno de estos campos de hora y su tarea no define `override_scheduled_time` ni otra `schedule_source_field_key`
- **THEN** el sistema usa la respuesta del campo disparador como `scheduled_time`

#### Scenario: Fin de comida se evalúa con el valor canónico
- **WHEN** una regla activa usa `foodEndTime` y se guarda un inicio de comida válido
- **THEN** el motor evalúa y programa la tarea usando el horario derivado de 60 minutos, no un valor desfasado enviado por el cliente

### Requirement: Activity rules remain safe with preserved conditional times
El sistema SHALL permitir conservar horarios capturados cuando su campo condicional se oculta, pero SHALL NOT obligar a que una regla de actividad se dispare únicamente por un horario residual.

#### Scenario: Horario condicional se preserva
- **WHEN** el cliente desactiva una actividad después de capturar su horario y posteriormente vuelve a activarla
- **THEN** el cuestionario conserva el horario previamente capturado

#### Scenario: Regla principal usa el booleano de actividad
- **WHEN** una regla se configura sobre el booleano de personaje, baile, fotos o menú externo y la actividad está desactivada
- **THEN** la regla no se cumple aunque el payload conserve un horario relacionado para usarlo como fuente cuando la actividad vuelva a activarse
