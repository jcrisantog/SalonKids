## MODIFIED Requirements

### Requirement: Public questionnaire loads by event token
El sistema SHALL permitir que un cliente abra el cuestionario usando el token publico del evento y SHALL mostrar el resumen del evento, respuestas guardadas y estado de guardado. El sistema SHALL conservar los datos del cronograma disponibles internamente pero SHALL NOT mostrar el cronograma publico en la interfaz del cuestionario mientras la funcionalidad esta en revision.

#### Scenario: Existing token loads questionnaire
- **WHEN** un cliente abre `/event/{token}` con un token valido
- **THEN** el sistema muestra el cuestionario con nombre del evento, fecha, respuestas actuales y estado de guardado sin mostrar el bloque de cronograma

#### Scenario: Invalid token shows error
- **WHEN** un cliente abre `/event/{token}` con un token invalido
- **THEN** el sistema muestra un estado de error no editable y no expone datos del cuestionario

### Requirement: Operational task synchronization
El sistema SHALL convertir respuestas relevantes del cuestionario en tareas reactivas del evento usando reglas configurables activas y preservando overrides manuales hechos por administradoras.

#### Scenario: Pastel answers create tasks
- **WHEN** el cliente responde que se necesitan pastel, velitas, batukada, souvenirs o canciones especiales y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza las tareas operativas correspondientes para el staff desde tareas maestras configuradas

#### Scenario: Pinata answers create tasks
- **WHEN** el cliente responde que se necesita pinata, bolsitas, palo, participacion de adultos o apertura con seguridad y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza las tareas correspondientes de preparacion de pinata desde tareas maestras configuradas

#### Scenario: Menu answers create tasks
- **WHEN** el cliente captura menu del salon, menu externo, horarios de comida o permisos de comida para staff y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza tareas de cocina, servicio o coordinacion de proveedor desde tareas maestras configuradas

#### Scenario: Program answers create scheduled tasks
- **WHEN** el cliente proporciona horarios para comida, presentacion, show, mesa de dulces, fuente de chocolate, baile, tamales, helado u otra actividad y existen reglas activas para esas respuestas
- **THEN** el sistema crea o actualiza tareas programadas para staff sin mostrarlas en el cronograma del cuestionario

#### Scenario: Informative answer does not create tasks
- **WHEN** el cliente responde un campo del cuestionario que no tiene regla configurable activa
- **THEN** el sistema guarda la respuesta sin generar tareas de evento para ese campo

### Requirement: Public timeline remains focused
El sistema SHALL conservar internamente los datos del cronograma publico y SHALL ocultar el bloque de cronograma de la interfaz del cliente hasta que la duena apruebe mostrarlo.

#### Scenario: Task generated
- **WHEN** una respuesta del cuestionario genera una tarea para staff
- **THEN** la tarea no se muestra en la interfaz publica del cuestionario

#### Scenario: Public timeline data exists
- **WHEN** existen datos de tareas visibles publicamente para un evento
- **THEN** el cuestionario sigue cargando y guardando normalmente sin renderizar un bloque de cronograma al cliente
