# Tareas Operativas

## 1. Auditar Datos Operativos Actuales

- [x] 1.1 Revisar los supuestos actuales de `master_tasks`, `questionnaire_task_rules` y `questionnaire_task_rule_tasks` en `schema.sql` y las APIs administrativas.
- [x] 1.2 Extraer la lista actual de tareas hardcodeadas desde `src/lib/rule-engine.ts` y clasificar cada tarea como base, configurable, duplicada u obsoleta.
- [x] 1.3 Construir una matriz preliminar desde los dos PDFs operativos de sabado 2026 con categorias de entrada, durante el evento y cierre.
- [x] 1.4 Mapear los campos del cuestionario desde `src/lib/questionnaire-schema.ts` en grupos: generadora, informativa, base o candidata opcional.

## 2. Sembrar Tareas Maestras Operativas

- [x] 2.1 Agregar un seed idempotente para tareas maestras de entrada y montaje con area, rol predeterminado, visibilidad y descripcion.
- [x] 2.2 Agregar un seed idempotente para tareas maestras de cierre y desmontaje que cubran pertenencias, charolas, separacion de residuos, manteleria, limpieza y resguardo.
- [x] 2.3 Agregar o actualizar tareas maestras visibles en programa para momentos publicos como pastel, pinata, presentacion, show y servicios programados de comida.
- [x] 2.4 Asegurar que reejecutar el seed operativo no cree nombres duplicados de tareas maestras.

## 3. Depurar Seed De Reglas Del Cuestionario

- [x] 3.1 Reemplazar las entradas genericas de `Documentos/seed-questionnaire-task-rules.sql` con la matriz operativa depurada.
- [x] 3.2 Configurar reglas con multiples tareas para respuestas que requieren preparacion interna y ejecucion publica.
- [x] 3.3 Dejar los campos puramente informativos sin reglas iniciales activas y documentar el motivo.
- [x] 3.4 Agregar reglas candidatas opcionales como entradas inactivas documentadas o como recomendaciones solo documentales, segun el soporte actual del admin.
- [x] 3.5 Conservar overrides por tarea para hora programada, rol, visibilidad, orden y asignacion opcional de staff.

## 4. Quitar Duplicidad En La Generacion

- [x] 4.1 Actualizar la sincronizacion de tareas del cuestionario para que las reglas configurables sean la fuente principal de tareas generadas.
- [x] 4.2 Evitar que las reglas hardcodeadas generen duplicados cuando existan reglas configurables.
- [x] 4.3 Conservar un fallback seguro solo para ambientes sin reglas configurables, si todavia es necesario.
- [x] 4.4 Agregar o actualizar pruebas para evaluacion de reglas, generacion de multiples tareas y prevencion de duplicados.

## 5. Documentacion Para La Duena

- [x] 5.1 Crear un documento de matriz operativa legible en `Documentos/` con tareas sembradas, areas, visibilidad, roles y categoria de origen.
- [x] 5.2 Documentar que campos del cuestionario generan reglas y cuales permanecen como informativos.
- [x] 5.3 Documentar como la duena puede editar, desactivar o agregar reglas desde el admin despues de la entrega inicial.

## 6. Verificacion

- [x] 6.1 Ejecutar verificaciones de lint/build despues de la implementacion.
- [x] 6.2 Aplicar los seeds en una base local o de staging y verificar que no se creen tareas maestras ni relaciones regla-tarea duplicadas.
- [x] 6.3 Crear un evento de prueba y confirmar que las tareas base de entrada/cierre se generen desde plantillas operativas.
- [x] 6.4 Guardar ejemplos de cuestionario que cubran pastel, pinata, menu, alergias, decoracion, dinamicas y horarios de programa.
- [x] 6.5 Verificar que las tareas generadas puedan filtrarse e imprimirse por responsable y visibilidad.
