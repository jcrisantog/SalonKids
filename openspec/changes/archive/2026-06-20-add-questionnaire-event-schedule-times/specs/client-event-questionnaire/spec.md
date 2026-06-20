## ADDED Requirements

### Requirement: Program section captures conditional cake and pinata times
El sistema SHALL mostrar en la seccion 15 del cuestionario campos de horario para pastel y piñata solo cuando el cliente haya indicado previamente que si habra esas actividades.

#### Scenario: Capturar horario de pastel
- **WHEN** el cliente responde que habra momento de pastel
- **THEN** la seccion 15 muestra un campo de hora para el momento de pastel y guarda el valor en el payload del cuestionario

#### Scenario: Ocultar horario de pastel no aplicable
- **WHEN** el cliente responde que no habra momento de pastel
- **THEN** la seccion 15 no muestra el campo de horario de pastel

#### Scenario: Capturar horario de pinata
- **WHEN** el cliente responde que traera piñata
- **THEN** la seccion 15 muestra un campo de hora para piñata y guarda el valor en el payload del cuestionario

#### Scenario: Ocultar horario de pinata no aplicable
- **WHEN** el cliente responde que no traera piñata
- **THEN** la seccion 15 no muestra el campo de horario de piñata

### Requirement: Program section captures selected dynamic times
El sistema SHALL mostrar en la seccion 15 un campo de horario para cada dinamica seleccionada en la seccion 13.

#### Scenario: Capturar horario de dinamica seleccionada
- **WHEN** el cliente selecciona una dinamica especifica en la seccion 13
- **THEN** la seccion 15 muestra un campo de hora para esa dinamica y guarda el valor en el payload del cuestionario

#### Scenario: Ocultar horario de dinamica no seleccionada
- **WHEN** una dinamica de la seccion 13 no esta seleccionada
- **THEN** la seccion 15 no muestra el campo de horario correspondiente a esa dinamica

#### Scenario: Preservar horarios al alternar respuestas
- **WHEN** el cliente oculta una actividad despues de capturar su horario y luego vuelve a seleccionarla
- **THEN** el sistema conserva el horario previamente capturado mientras el cuestionario no haya sido sobrescrito con otro valor

### Requirement: Schedule time fields remain backward compatible
El sistema SHALL cargar cuestionarios existentes sin horarios de pastel, piñata o dinamicas usando valores vacios por defecto.

#### Scenario: Cargar cuestionario anterior
- **WHEN** un cuestionario guardado no contiene los nuevos campos de horario
- **THEN** el sistema carga el cuestionario normalmente y deja esos horarios vacios por defecto

#### Scenario: Guardar cuestionario con horarios nuevos
- **WHEN** el cliente guarda horarios de pastel, piñata o dinamicas seleccionadas
- **THEN** el sistema persiste esos horarios como valores de tipo hora dentro del payload del cuestionario
