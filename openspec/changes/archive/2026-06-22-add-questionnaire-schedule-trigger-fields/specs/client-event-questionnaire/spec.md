## ADDED Requirements

### Requirement: Questionnaire captures conditional operational schedule times
El sistema SHALL capturar horarios operativos en las secciones correspondientes y SHALL mostrarlos solo cuando la actividad relacionada esté activa.

#### Scenario: Capturar hora del personaje
- **WHEN** el cliente activa "Aparición de personaje"
- **THEN** la sección 15 muestra "Hora del personaje" y guarda su valor de tipo hora en el payload

#### Scenario: Ocultar hora del personaje
- **WHEN** "Aparición de personaje" no está activa
- **THEN** la sección 15 no muestra "Hora del personaje"

#### Scenario: Capturar bloque de baile
- **WHEN** el cliente activa "Desean música para bailar"
- **THEN** la sección 15 muestra "Bloque de baile" y guarda su valor de tipo hora en el payload

#### Scenario: Ocultar bloque de baile
- **WHEN** "Desean música para bailar" no está activa
- **THEN** la sección 15 no muestra "Bloque de baile"

#### Scenario: Capturar hora de fotos en programa
- **WHEN** el cliente activa "Sesión de fotos"
- **THEN** la sección 15 muestra "Hora de fotos" y guarda el valor usando la llave existente `photoSessionTime`

#### Scenario: No mostrar hora de fotos en presentación
- **WHEN** el cliente consulta la sección 4
- **THEN** la sección 4 conserva "Sesión de fotos" y sus demás datos, pero no muestra "Hora de fotos"

#### Scenario: Capturar llegada del proveedor de comida
- **WHEN** el cliente activa "Traerá servicio externo o alimentos"
- **THEN** la sección 8 muestra "Hora de llegada del proveedor de comida" y guarda su valor de tipo hora en el payload

#### Scenario: Ocultar llegada del proveedor de comida
- **WHEN** "Traerá servicio externo o alimentos" no está activa
- **THEN** la sección 8 no muestra "Hora de llegada del proveedor de comida"

### Requirement: Questionnaire derives a hidden food end time
El sistema SHALL calcular `foodEndTime` como 60 minutos posteriores a un `foodStartTime` válido, SHALL persistir el resultado en el payload y SHALL mantener el campo oculto en el cuestionario público.

#### Scenario: Calcular fin de comida
- **WHEN** el cliente guarda "Inicio de comida" con un horario válido
- **THEN** el sistema guarda "Hora Fin Comida" exactamente una hora después sin mostrar ese campo al cliente

#### Scenario: Recalcular al cambiar el inicio
- **WHEN** el cliente modifica un "Inicio de comida" previamente guardado
- **THEN** el sistema reemplaza `foodEndTime` con el nuevo horario derivado

#### Scenario: Inicio de comida vacío o inválido
- **WHEN** `foodStartTime` está vacío o no representa una hora válida
- **THEN** el sistema normaliza `foodEndTime` como vacío y no conserva un valor derivado obsoleto

#### Scenario: Cálculo cruza medianoche
- **WHEN** el inicio de comida más 60 minutos supera las 23:59
- **THEN** el sistema guarda la hora resultante dentro del siguiente ciclo de 24 horas

### Requirement: New schedule fields remain backward compatible
El sistema SHALL cargar payloads anteriores que no contengan los nuevos horarios visibles ni `foodEndTime` sin producir errores ni requerir una migración de base de datos.

#### Scenario: Cargar payload anterior sin nuevos horarios
- **WHEN** un cuestionario guardado no contiene `characterTime`, `danceBlockTime` o `externalFoodProviderArrivalTime`
- **THEN** el sistema carga esos horarios con valores vacíos por defecto y conserva las respuestas existentes

#### Scenario: Cargar payload anterior con inicio de comida
- **WHEN** un cuestionario anterior contiene un `foodStartTime` válido pero no contiene `foodEndTime`
- **THEN** el sistema expone internamente el fin de comida derivado sin alterar los campos visibles

