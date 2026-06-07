# Plantilla Spec-First para Antigravity IDE

**Proyecto:** Sistema de Automatización y Optimización de Logística — Salón Fantasía Extremo Kids
**Estructura técnica orientada a:** Java + Spring Boot

## SECCIÓN 1 — Visión del producto
Un sistema web que automatiza la planeación logística de un salón de eventos infantiles, transformando un cuestionario dinámico respondido por el cliente en un cronograma visual público y una matriz operativa cruzada, compacta e imprimible para el staff. Resuelve el problema de las 5 a 7 horas de redacción manual de la dueña y la fatiga de lectura de los empleados bajo la estricta restricción de no usar teléfonos celulares durante el evento.

## SECCIÓN 2 — Usuarios y casos de uso

### Dueña / Administradora (Única con acceso a celular en el evento)
- **Crear y gestionar eventos:** Registra la fecha, anfitriones (ej. María Esther y José), festejado (ej. Matías, 10 años) y genera tokens únicos para el cuestionario del cliente.
- **Monitorear y ajustar tareas en tiempo real:** Visualiza el backlog generado por el motor de reglas, reasigna personal (ej. Luis Santiago, Brian, Melany) o edita horarios desde un dashboard responsive móvil.
- **Exportar/Imprimir Matriz Operativa:** Genera con un solo clic el formato físico consolidado para el staff antes de iniciar el turno (13:00 hrs).

### Clientes / Anfitriones
- **Llenar cuestionario único:** Ingresa la información del protocolo del pastel (nombres a convocar), detalles de audio/DJ (canciones especiales o lista negra de géneros) y dinámicas de baile a través de un link web exclusivo.
- **Visualizar Cronograma del Cliente:** Consulta una vista limpia, estética y libre de tecnicismos operativos con la secuencia de hitos de la fiesta (ej. Entrada, Comida de niños, Piñatas, Pastel).

### Personal del Salón / Staff (Sin acceso a celular)
- **Consultar la Matriz de Responsabilidad Colectiva:** Lee en una sola hoja impresa el flujo del evento minuto a minuto, sabiendo qué le toca hacer a su rol y qué están haciendo sus compañeros (corresponsabilidad informada).
- **Ejecutar tareas de montaje y desmontaje:** Consulta instrucciones rígidas de infraestructura (ej. colocar 16 mesas en barandales/pared blanca, ubicar futbolito junto a resbaladilla amarilla, lavar manteles ahulados con fibra verde y agua jabonosa).

## SECCIÓN 3 — Funcionalidades

### Módulo 1: Catálogos Maestros (CRUD)
- El usuario administrador puede gestionar el Catálogo de Personal (ID, Nombre, Rol Principal como DJ, Coordinadora, Apoyo, Limpieza, Atracciones como Tirolesa/Space Roller).
- El usuario administrador puede gestionar el Catálogo de Tareas Maestras, clasificándolas por Área Física del salón y Tipo de Visibilidad (Interna Staff / Pública Cliente).
- El usuario administrador puede gestionar el Catálogo de Eventos para centralizar las fechas, horarios y estado del cuestionario.

### Módulo 2: Motor de Cuestionario Reactivo
- El sistema genera un enlace seguro por evento basado en un token único.
- El sistema guarda los cambios del cliente en tiempo real y desencadena el **Motor de Reglas Backend** para poblar el backlog de tareas automáticamente al detectar respuestas específicas (ej. Si Pastel = "Sí", inyectar la tarea del "Sillón Rojo").

### Módulo 3: Dashboard de la Dueña y Ajustes en Vivo
- El usuario administrador puede visualizar de manera responsive las tareas internas divididas de las públicas.
- El usuario administrador puede reordenar el orden cronológico o reasignar un operador a una tarea específica de última hora de forma ágil.

### Módulo 4: Motor de Renderizado e Impresión (CSS Print Profile)
- El sistema compila todas las tareas internas paralelas de los distintos roles en una **Matriz Cruzada Horizontal**.
- El sistema expone un botón de impresión directa que activa estilos `@media print`, formateando la hoja automáticamente en orientación horizontal (Landscape), forzando el ajuste a una sola página física A4/Carta y ocultando barras de navegación web.

## SECCIÓN 4 — Modelos de datos
Diseño de base de datos relacional propuesto para Spring Boot (JPA / Hibernate):
- **Personal (Staff):** `id` (PK), `nombre`, `rol_principal`, `activo` (boolean).
- **Evento (Event):** `id` (PK), `token_unico`, `nombre_festejado`, `edad`, `nombre_mama`, `nombre_papa`, `fecha_evento`, `hora_inicio`, `hora_fin`, `estatus_cuestionario`.
- **TareaMaestra (MasterTask):** `id` (PK), `nombre_tarea`, `descripcion_estandar`, `tipo_visibilidad` (ENUM: INTERNA, PUBLICA), `area_salon`.
- **TareaEvento (EventTask):** `id` (PK), `evento_id` (FK), `nombre_tarea`, `descripcion_operativa`, `hora_programada`, `rol_responsable`, `empleado_id` (FK, Nullable), `tipo_visibilidad`.

## SECCIÓN 5 — Arquitectura
- **Tipo de aplicación:** Sistema Web Autocontenido (Monolito modular o desacoplado).
- **Backend:** Java 17+ / Spring Boot (Spring Web, Spring Data JPA, Spring Security para protección de rutas de administración).
- **Frontend:** Thymeleaf (si se prefiere monolito en Antigravity) o HTML5/JavaScript Vanilla robusto con Bootstrap/Tailwind CSS enfocado en Mobile-First para la interfaz de la dueña.
- **Base de Datos:** PostgreSQL / MySQL para persistencia relacional completa de los catálogos y tareas inyectadas.
- **Generación de Vistas Físicas:** Estilos nativos de impresión CSS3 (`@media print`) para mitigar dependencias externas pesadas de renderizado de PDF en el servidor.

## SECCIÓN 6 — Requisitos no funcionales
- **Rendimiento:** Carga de la Matriz Operativa en el celular de la dueña en menos de 2 segundos, incluso con redes móviles de baja cobertura dentro del salón.
- **Restricción Física de Medios (Impresión):** La interfaz de salida para el staff debe garantizar legibilidad tipográfica estricta (fuentes Arial/Helvetica entre 9pt y 10pt) al ser impresa en papel, eliminando cualquier fondo oscuro o de alto consumo de tóner.
- **Seguridad:** El formulario del cliente debe ser inaccesible si el token único no coincide o si el evento ya está marcado como "Cerrado/Terminado", evitando manipulaciones accidentales post-evento.
- **Idioma:** Interfaz, mensajes del sistema y salidas impresas 100% en español.
