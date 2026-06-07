# Reglas configurables del cuestionario

Para habilitar el modulo:

1. Aplicar `schema.sql` en Supabase para crear las tablas y columnas nuevas.
2. Ejecutar `Documentos/seed-operational-master-tasks.sql` para cargar tareas base de entrada, montaje y cierre.
3. Ejecutar `Documentos/seed-questionnaire-task-rules.sql` para cargar reglas iniciales basadas en la matriz operativa.
4. Entrar a `/admin/questionnaire-rules` y ajustar reglas, tareas maestras, horarios, responsables y visibilidad.

Las preguntas sin regla activa se guardan como informacion y no generan tareas.

Una regla puede generar una o varias tareas. En la pantalla de reglas usa **Agregar tarea** para asociar mas tareas maestras a la misma pregunta; cada tarea puede tener su propia descripcion, hora, responsable y visibilidad. La vista previa muestra los nombres de todas las tareas que se generaran.

No selecciones la misma tarea maestra dos veces dentro de la misma regla. El sistema rechazara duplicados para evitar tareas repetidas en el evento.

Las reglas existentes con una sola tarea siguen siendo validas y no requieren cambios.

Los cambios en reglas aplican al siguiente guardado del cuestionario. No recalculan eventos anteriores automaticamente.

La matriz entregada esta documentada en `Documentos/matriz-operativa-tareas-reglas.md`. Ahi se listan tareas base, reglas activas, campos informativos y reglas candidatas opcionales para que la duena pueda depurar la base inicial sin depender de codigo.
