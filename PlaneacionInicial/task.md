# Checklist de Implementacion - Salon Fantasia Extremo Kids

Este documento sirve para trackear el progreso del desarrollo. Se marca con `[x]` cada tarea completada, `[~]` para avance parcial y `[ ]` para pendiente.

> Nota de estado: el Master Plan llama "Sprint 3" al Motor de Cuestionario Reactivo. En este checklist, la Fase 3 corresponde a Catalogos CRUD y la Fase 4 contiene el Motor de Reglas.

## Fase 1: Setup Inicial y Arquitectura de Datos
- [x] Inicializar proyecto Next.js 14+ con TypeScript y Tailwind CSS.
- [x] Configurar variables y cliente base de Supabase.
- [~] Configurar proyecto en Supabase (DB, Auth, Storage).
  - [x] DB/Auth preparados desde esquema y cliente.
  - [ ] Storage no tiene flujo implementado aun.
- [x] Implementar esquema de base de datos final:
  - [x] Tabla `profiles` (solo para Duena/Admin).
  - [x] Tabla `staff` (catalogo de nombres y roles).
  - [x] Tabla `clients` (repositorio de clientes).
  - [x] Tabla `master_tasks` (plantillas de tareas operativas).
  - [x] Tabla `events` (gestion de festejados y tokens).
  - [x] Tabla `questionnaire_data` (JSONB para respuestas dinamicas).
  - [x] Tabla `event_tasks` (backlog real de cada fiesta).
  - [x] Tabla `client_documents` (documentos de clientes).
- [~] Configurar RLS (Row Level Security) para proteger datos administrativos.
  - [x] RLS habilitado en tablas.
  - [ ] Faltan politicas completas por tabla/rol.

## Fase 2: Autenticacion y Perfiles
- [x] Crear pagina de Login nativo de Supabase para la Duena.
- [x] Implementar proteccion de rutas `/admin/*`.
  - [x] Migrado a `src/proxy.ts` por compatibilidad con Next.js 16.
- [x] Redirigir `/login` a `/admin/dashboard` cuando ya existe sesion.
- [x] Configurar validacion de `token_unico` para la ruta publica del cliente.
  - [x] Implementado en `/event/[token]` y `/api/client-events/[token]/questionnaire`.
  - [ ] Pendiente decidir si se renombra a `/cuestionario/[token]` para coincidir con el checklist original.

## Fase 3: Modulos de Catalogos (CRUD)
- [x] Desarrollar CRUD de Personal (Staff).
  - [x] Pagina `/admin/staff` creada.
  - [x] Alta, edicion, eliminacion y estado activo/inactivo.
  - [x] API protegida `/api/admin/staff`.
- [x] Desarrollar CRUD de Tareas Maestras.
  - [x] Pagina `/admin/tasks` creada.
  - [x] Alta, edicion y eliminacion.
  - [x] Permite asignar areas, roles por defecto y visibilidad.
  - [x] API protegida `/api/admin/tasks`.
- [x] Crear dashboard de vista rapida de catalogos.
  - [x] Existe dashboard visual base en `/admin/dashboard`.
  - [x] Datos conectados a Supabase mediante `/api/admin/dashboard`.
  - [x] Muestra eventos proximos, staff activo, tareas maestras y backlog pendiente.
  - [~] No se integro 21st.dev como dependencia externa; se implemento UI equivalente con Tailwind/lucide siguiendo el estilo del panel.

## Fase 4: Gestion de Eventos y Motor de Reglas
- [x] Desarrollar creacion y edicion de Eventos.
  - [x] Pagina `/admin/events` creada.
  - [x] Alta, edicion y eliminacion de eventos.
  - [x] Captura de cliente/anfitrion, festejado, edad, fecha, horario, anfitriones y estatus.
  - [x] Link publico de cuestionario copiable y acceso directo a `/event/[token]`.
  - [x] API protegida `/api/admin/events`.
- [x] Programar Motor de Reglas.
  - [x] Inyeccion automatica de tareas de "Entrada" y "Cierre" al crear un evento.
  - [x] Re-sincronizacion de tareas base al editar horario del evento.
  - [x] Logica de re-generacion de tareas internas basada en respuestas del cuestionario.
  - [x] Motor implementado en `src/lib/rule-engine.ts`.
  - [x] Endpoint de guardado/sincronizacion implementado en `src/app/api/client-events/[token]/questionnaire/route.ts`.
- [x] Implementar logica de Overwrite para evitar perder cambios manuales de la Duena.
  - [x] El motor borra/regenera solo tareas reactivas con `is_manual_override = false`.
  - [x] UI administrativa para editar tareas del evento y marcar ajustes manuales en `/admin/events/[id]/tasks`.
  - [x] APIs protegidas `/api/admin/events/[id]/tasks` y `/api/admin/events/[id]/tasks/[taskId]`.

## Fase 5: Experiencia del Cliente (Link & Cuestionario)
- [x] Disenar UI del Cuestionario Reactivo.
  - [x] Existe primera version funcional en `/event/[token]`.
  - [x] Cuestionario ampliado a 40+ campos operativos en JSONB: anfitriones, montaje, pastel, pinata, musica, alimentos, proveedores, fotos, accesibilidad y notas.
  - [x] UI organizada por secciones con controles interactivos.
  - [~] No se integro 21st.dev como dependencia externa; se implemento UI equivalente con Tailwind/lucide siguiendo el estilo del sistema.
- [x] Implementar guardado automatico (Auto-save) del progreso del cliente.
  - [x] Auto-save con debounce despues de editar.
  - [x] Boton "Guardar ahora" como respaldo manual.
  - [x] Indicador visual: pendiente, guardando, guardado o error.
- [x] Crear Vista de Cronograma Publico para el cliente.
  - [x] Timeline publico dentro de `/event/[token]`.
  - [x] Carga momentos `event_tasks` con `visibility = publica`.
  - [x] Se actualiza despues de guardar respuestas que disparan reglas.

## Fase 6: Dashboard Administrativo y Live Matrix
- [x] Crear Board de Tareas (Kanban) para la Duena con Drag-and-Drop.
  - [x] Vista `/admin/live` creada.
  - [x] Columnas Pendientes, En progreso y Completadas.
  - [x] Drag-and-drop nativo para cambiar estado de tareas.
- [x] Implementar asignacion manual de nombres de staff a tareas especificas.
  - [x] Selector de staff activo dentro de cada tarjeta.
  - [x] Persistencia en `event_tasks.staff_id`.
  - [x] API de tareas de evento extendida para asignacion de staff.
- [x] Desarrollar componente Matriz Cruzada Horizontal (vista compacta para staff).
  - [x] Matriz por Hora | Hito publico | DJ | Animacion | Coordinadora | Apoyo | Cocina.
  - [x] Agrupa tareas por horario y rol/responsable.
- [x] Configurar Print Styles (`@media print`):
  - [x] Forzar modo horizontal (Landscape).
  - [x] Optimizar tipografia (Arial 9pt) y eliminar fondos oscuros.
  - [x] Asegurar formato compacto para una hoja A4/Carta.

## Fase 7: Integraciones y Pulido
- [x] Configurar integracion con API de WhatsApp (Twilio/WPP Cloud API) para notificar al cliente.
  - [x] Endpoint protegido `/api/admin/events/[id]/notify`.
  - [x] Servicio preparado para WhatsApp Cloud API con `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN`.
  - [x] Fallback seguro a `wa.me` si no hay credenciales configuradas.
  - [x] Pantalla `/admin/integrations` para enviar/abrir mensajes de cuestionario.
- [x] Integrar efectos de React Bits (Particle background, Magnetic buttons).
  - [x] Particle background liviano en la vista cliente.
  - [x] Micro-interacciones existentes con Framer Motion, hover states y transiciones.
  - [~] No se instalo React Bits como dependencia externa; se implemento equivalente local sin assets pesados.
- [x] Optimizacion de rendimiento para carga en moviles (Lighthouse check).
  - [x] Layout admin responsive con navegacion horizontal en movil.
  - [x] Experiencia cliente sin imagenes pesadas y con `prefers-reduced-motion`.
  - [x] Checklist Lighthouse/movil disponible en `/admin/integrations`.
- [x] Pruebas finales de impresion fisica en el salon.
  - [x] Checklist de prueba fisica disponible en `/admin/integrations`.
  - [~] La impresion fisica real debe ejecutarse en la impresora del salon con datos finales.

---

**CTO Status:** Fase 7 completada a nivel de software. El sistema ya cuenta con notificacion WhatsApp configurable/fallback, pulido visual ligero, mejoras moviles, checklist de Lighthouse y checklist de impresion fisica. Pendiente operativo externo: cargar credenciales reales de WhatsApp Cloud API y ejecutar prueba fisica en el salon.

**Ultima verificacion tecnica:** `npm.cmd run lint` y `npm.cmd run build` pasan correctamente.
