## 1. Preparacion

- [x] 1.1 Leer la documentacion local relevante de Next.js en `node_modules/next/dist/docs/` antes de editar rutas App Router o componentes cliente/servidor.
- [x] 1.2 Revisar `questionnaire-schema.ts`, `rule-engine.ts`, APIs admin actuales y `schema.sql`.
- [x] 1.3 Identificar tareas maestras existentes que pueden reutilizarse para el seed inicial de reglas.
- [x] 1.4 Definir el mapeo inicial de la matriz operativa: pregunta, operador, valor, tarea maestra, responsable, momento y visibilidad.

## 2. Modelo de Datos

- [x] 2.1 Agregar `questionnaire_task_rules` a `schema.sql` con campo, operador, valor esperado, estado activo y metadatos visibles.
- [x] 2.2 Agregar `questionnaire_task_rule_tasks` a `schema.sql` para relacionar reglas con `master_tasks` y guardar overrides.
- [x] 2.3 Agregar identificador de origen a `event_tasks` para rastrear tareas generadas por regla sin depender del nombre.
- [x] 2.4 Crear tipos TypeScript para reglas, operadores, relaciones regla-tarea y resultados de evaluacion.

## 3. Motor Configurable

- [x] 3.1 Implementar evaluador de operadores simples: `answered`, `equals`, `not_equals`, `is_true`, `is_false`, `greater_than`, `contains`.
- [x] 3.2 Implementar carga de reglas activas con sus tareas maestras y overrides desde Supabase.
- [x] 3.3 Reemplazar reglas hardcodeadas por generacion basada en reglas configurables.
- [x] 3.4 Sincronizar tareas generadas eliminando solo tareas con origen de regla y preservando `is_manual_override = true`.
- [x] 3.5 Mantener el contrato actual de `PUT /api/client-events/[token]/questionnaire`.

## 4. API Admin

- [x] 4.1 Crear `GET /api/admin/questionnaire-rules` para listar reglas con pregunta, condicion y tareas asociadas.
- [x] 4.2 Crear `POST /api/admin/questionnaire-rules` para crear regla y asociar tareas maestras.
- [x] 4.3 Crear `PATCH /api/admin/questionnaire-rules/[id]` para editar regla, estado activo y tareas asociadas.
- [x] 4.4 Crear `DELETE /api/admin/questionnaire-rules/[id]` para desactivar o eliminar regla.
- [x] 4.5 Validar autenticacion admin en todas las rutas usando `requireAdmin`.

## 5. UI Admin

- [x] 5.1 Agregar enlace de navegacion admin para reglas del cuestionario.
- [x] 5.2 Crear pantalla `/admin/questionnaire-rules` con listado de reglas, filtro por seccion/pregunta y estado activo.
- [x] 5.3 Crear formulario para seleccionar pregunta desde `questionnaireSections`, operador simple y valor esperado.
- [x] 5.4 Permitir seleccionar una o mas tareas maestras y configurar overrides por tarea.
- [x] 5.5 Mostrar vista previa legible de la regla antes de guardar.
- [x] 5.6 Soportar activar/desactivar, editar y eliminar con confirmaciones esteticas existentes.

## 6. Seed Inicial

- [x] 6.1 Crear utilitario o script de seed para insertar reglas iniciales desde la matriz operativa.
- [x] 6.2 Mapear preguntas informativas sin tarea para que no generen reglas iniciales.
- [x] 6.3 Verificar que el seed no duplique reglas si se ejecuta mas de una vez.
- [x] 6.4 Documentar como ejecutar o aplicar el seed en ambiente local.

## 7. Verificacion

- [x] 7.1 Probar regla booleana simple: `cake is_true` genera tarea de pastel.
- [x] 7.2 Probar regla de texto: `blockedGenres answered` genera tarea de bloqueo musical.
- [x] 7.3 Probar regla numerica: `guestCount greater_than 80` genera tarea de ajuste de montaje.
- [x] 7.4 Probar que una pregunta sin regla guarda respuesta sin generar tareas.
- [x] 7.5 Probar que tareas manuales no se borran al recalcular reglas.
- [x] 7.6 Probar que desactivar una regla evita nuevas generaciones en el siguiente guardado.
- [x] 7.7 Ejecutar `npm.cmd run lint`.
- [x] 7.8 Ejecutar `npm.cmd run build`.
