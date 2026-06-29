## ADDED Requirements

### Requirement: Admin assistant is available globally
El sistema SHALL mostrar un asistente de ayuda dentro del panel administrativo para guiar a la duena en tareas operativas del sistema.

#### Scenario: Abrir asistente desde cualquier pantalla admin
- **WHEN** la duena navega por una pantalla dentro de `/admin`
- **THEN** el sistema muestra una accion persistente para abrir el asistente

#### Scenario: Cerrar asistente conserva pantalla actual
- **WHEN** la duena cierra el asistente
- **THEN** el sistema conserva la pantalla administrativa actual sin recargarla

### Requirement: Assistant answers operational questions
El sistema SHALL responder preguntas administrativas con pasos claros basados en funciones reales del sistema.

#### Scenario: Preguntar como crear evento
- **WHEN** la duena pregunta como crear un evento
- **THEN** el asistente responde con pasos para entrar a Eventos, capturar datos y guardar

#### Scenario: Preguntar como asignar responsables
- **WHEN** la duena pregunta como asignar responsables automaticamente
- **THEN** el asistente explica la diferencia entre Completar y Reemplazar y como ejecutar la accion

#### Scenario: Pregunta fuera del alcance
- **WHEN** la duena pregunta algo que el asistente no puede responder con la guia interna
- **THEN** el asistente indica que no tiene suficiente informacion y sugiere una pantalla o accion relacionada si existe

### Requirement: Assistant uses current admin context
El sistema SHALL enviar al asistente el contexto de la pantalla administrativa actual para personalizar la respuesta.

#### Scenario: Ayuda contextual en tareas de evento
- **WHEN** la duena abre el asistente desde la pantalla de tareas de un evento
- **THEN** el asistente puede mencionar acciones disponibles en esa pantalla, como generar PDF o asignar responsables

#### Scenario: Ayuda contextual en reglas
- **WHEN** la duena abre el asistente desde Reglas Cuestionario
- **THEN** el asistente puede orientar sobre preguntas, operadores, tareas asociadas y fuentes de horario

### Requirement: Assistant supports text and voice input
El sistema SHALL permitir que la duena consulte al asistente escribiendo texto o dictando por audio.

#### Scenario: Consulta por texto
- **WHEN** la duena escribe una pregunta y la envia
- **THEN** el asistente procesa el texto y muestra una respuesta

#### Scenario: Consulta por audio
- **WHEN** la duena presiona el microfono y dicta una pregunta
- **THEN** el sistema convierte el audio a texto y permite enviarlo al asistente

#### Scenario: Audio no disponible
- **WHEN** el navegador no soporta reconocimiento de voz o la captura falla
- **THEN** el sistema muestra un mensaje claro y mantiene disponible la entrada por texto

### Requirement: Assistant provides actionable navigation links
El sistema SHALL incluir enlaces internos relevantes cuando la respuesta apunte a una pantalla administrativa.

#### Scenario: Respuesta incluye enlace de pantalla
- **WHEN** la respuesta indica que la duena debe abrir una seccion del admin
- **THEN** el asistente muestra un enlace interno con etiqueta clara para navegar a esa seccion

#### Scenario: Enlace no reemplaza instrucciones
- **WHEN** el asistente muestra enlaces internos
- **THEN** tambien conserva los pasos escritos para que la duena entienda que hacer al llegar

### Requirement: Assistant is informational only
El sistema SHALL limitar la primera version del asistente a guiar y explicar, sin ejecutar cambios administrativos.

#### Scenario: Solicitud de crear o borrar datos
- **WHEN** la duena pide al asistente crear, editar, borrar o asignar datos directamente
- **THEN** el asistente explica como hacerlo manualmente en la pantalla correspondiente y no modifica datos

#### Scenario: Confirmacion de limite
- **WHEN** el asistente no puede ejecutar una accion
- **THEN** el sistema lo comunica de forma breve y ofrece pasos para completar la accion
