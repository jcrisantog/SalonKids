# SECCIÓN 1 — Visión del producto
Un sistema web que automatiza la planeación logística de un salón de eventos infantiles, transformando un cuestionario dinámico respondido por el cliente en un cronograma visual público y una matriz operativa cruzada, compacta e imprimible para el staff. Resuelve el problema de las 5 a 7 horas de redacción manual de la dueña y la fatiga de lectura de los empleados bajo la estricta restricción de no usar teléfonos celulares durante el evento.

# SECCIÓN 5 — Arquitectura
●	Tipo de aplicación: Sistema Web Autocontenido (Monolito modular o desacoplado).
●	Backend: Java 17+ / Spring Boot (Spring Web, Spring Data JPA, Spring Security para protección de rutas de administración).
●	Frontend: Thymeleaf (si se prefiere monolito en Antigravity) o HTML5/JavaScript Vanilla robusto con Bootstrap/Tailwind CSS enfocado en Mobile-First para la interfaz de la dueña.
●	Base de Datos: PostgreSQL / MySQL para persistencia relacional completa de los catálogos y tareas inyectadas.
●	Generación de Vistas Físicas: Estilos nativos de impresión CSS3 (`@media print`) para mitigar dependencias externas pesadas de renderizado de PDF en el servidor.
