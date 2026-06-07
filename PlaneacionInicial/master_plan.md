# Plan Maestro: Sistema de Automatización Logística — Salón Fantasía Extremo Kids

Este documento define la arquitectura técnica, el diseño de datos y la estrategia de UI/UX para transformar la operación manual del salón en una plataforma digital de alto impacto.

## 1. Visión Técnica y Stack Sugerido

Para lograr el efecto "WOW" y el dinamismo solicitado, como CTO recomiendo el siguiente cambio en el stack (respecto al spec inicial):

- **Backend/Base de Datos:** [Supabase](https://supabase.com) (PostgreSQL + Realtime + Auth + Storage).
- **Frontend:** [Next.js](https://nextjs.org) (App Router) + [Tailwind CSS](https://tailwindcss.com).
- **Librerías de UI:** [21st.dev](https://21st.dev) (Componentes Shadcn avanzados) y [React Bits](https://reactbits.dev) (Animaciones).
- **Generación de Reportes:** Estilos `@media print` nativos para la matriz operativa en una sola hoja.

---

## 2. Estructura de Base de Datos (Supabase)

Diseño relacional optimizado para la inyección reactiva de tareas:

### Tablas Principales

| Tabla | Columnas Clave | Propósito |
| :--- | :--- | :--- |
| `profiles` | `id (PK)`, `email`, `role (admin/staff)`, `full_name` | Gestión de usuarios internos. |
| `staff` | `id (PK)`, `name`, `primary_role`, `is_active` | Catálogo de empleados (DJ, Coordinadora, etc). |
| `clients` | `id (PK)`, `full_name`, `phone`, `email` | Repositorio de clientes recurrentes. |
| `events` | `id (PK)`, `client_id (FK)`, `celebratory_name`, `age`, `date`, `start_time`, `end_time`, `token`, `status` | El núcleo del sistema. |
| `questionnaire_data` | `id (PK)`, `event_id (FK)`, `data (JSONB)` | Almacena las 40+ respuestas del CUESTIONARIO.pdf. |
| `master_tasks` | `id (PK)`, `name`, `base_description`, `visibility (enum)`, `area` | Plantillas de tareas estándar (Entrada/Cierre). |
| `event_tasks` | `id (PK)`, `event_id (FK)`, `task_name`, `description`, `time`, `staff_id (FK)`, `status`, `visibility` | Backlog dinámico generado por el motor de reglas. |
| `client_documents` | `id (PK)`, `event_id (FK)`, `file_url`, `doc_type` | Contratos o PDFs firmados guardados en Storage. |

> [!TIP]
> Usaremos **JSONB** para `questionnaire_data` para permitir que el cuestionario evolucione sin necesidad de migrar tablas de base de datos cada vez que se agregue una pregunta.

---

## 3. Flujo de Autenticación y Seguridad

El sistema tendrá dos métodos de acceso:

1.  **Acceso Administrativo (Dueña/Staff):**
    - Autenticación nativa de Supabase (Email/Password).
    - El Dashboard detecta el rol y permite la edición completa o solo consulta.
2.  **Acceso Cliente (Anfitriones):**
    - **Passwordless/Token-based:** El cliente recibe un link único (URL + Token).
    - No requiere registro. El sistema valida el token y la fecha del evento para permitir el llenado del cuestionario.

---

## 4. Estrategia de UI/UX: Futurista y "Vivo"

Para que el sistema se sienta premium, implementaremos una estética **Dark Mode / Glassmorphism** con acentos vibrantes.

### Selección de Componentes (21st.dev)
1.  **Glass Task Board:** Para el "Dashboard de la Dueña", permitiendo drag-and-drop para reasignar personal.
2.  **Neo-brutalism Forms:** Para el cuestionario del cliente, haciendo que el llenado sea interactivo y no tedioso.
3.  **Dynamic Timeline:** Una vista vertical elegante para el cronograma público del cliente.
4.  **Bento Grid Stats:** Reportes rápidos de eventos del mes y carga de trabajo del staff.
5.  **Animated Modal/Drawer:** Para los detalles de las tareas operativas sin salir de la vista principal.

### Animaciones (React Bits)
1.  **Reveal Text / Magnetic Text:** Para el título del festejado en la vista pública, dándole un toque de lujo.
2.  **Particles Background (Subtle):** En el fondo del cuestionario para que la página se sienta "eterea".
3.  **Smooth Page Transitions:** Transiciones suaves entre los módulos de Catálogos y Eventos.

---

## 5. Lógica de Negocio (Business Logic)

### Gestión de Eventos y Tareas
- **Alta de Evento:** Al crear un evento, el sistema dispara automáticamente el **Motor de Reglas** que inyecta las tareas de "Entrada" (13:00 hrs) y "Cierre" (20:00 hrs) basadas en `master_tasks`.
- **Dinamismo del Cuestionario:** Cada vez que el cliente guarda un cambio (ej. selecciona "Piñata = Sí"), el backend verifica la regla y crea/borra la tarea `EventTask` correspondiente (ej. "Disfrazarse de Spiderman").
- **Timeline Inteligente:** El timeline se construye ordenando `event_tasks` por `time`. Si una tarea de última hora se mueve, el sistema puede recalcular slots libres.

### Matriz Operativa (Print Logic)
El corazón del sistema es la **Matriz Cruzada**.
- Utilizaremos una tabla HTML horizontal de alta densidad.
- Columnas: Hora | Hito Público | Responsable DJ | Responsable Animación | Responsable Apoyo.
- **CSS Print Profile:** Oculta encabezados web, fuerza orientación `landscape` y ajusta el tamaño de fuente a `9pt` para garantizar que todo quepa en una hoja A4.

---

## 6. Plan de Ejecución

1.  **Sprint 1:** Setup de Supabase y Modelado de Datos inicial.
2.  **Sprint 2:** Dashboard Administrativo (CRUD de Staff y Master Tasks).
3.  **Sprint 3:** Motor de Cuestionario Reactivo (Lógica de Inyección de Tareas).
4.  **Sprint 4:** Vista Pública del Cliente y Motor de Impresión CSS.
5.  **Sprint 5:** Pulido de UI con animaciones de React Bits.

---

## Preguntas Abiertas para el Usuario
1. ¿Deseas que el sistema maneje el inventario de "Productos" (ej. dulces, refrescos) o solo la asignación de tareas?
2. ¿El personal del staff tiene cuentas de usuario o solo la dueña asigna nombres de forma manual? (Recomendado: Manual para evitar que usen el celular).
3. ¿Te gustaría que el cliente reciba notificaciones (WhatsApp/Email) cuando su cronograma está listo?
