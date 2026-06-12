## Context

El panel administrativo ya tiene navegacion lateral en `src/app/admin/layout.tsx` y pantallas de catalogos/configuracion bajo `src/app/admin`. La pantalla de Tareas del Evento genera el PDF desde `src/app/admin/events/[id]/tasks/page.tsx`, usando las tareas visibles despues de filtros y busqueda.

Actualmente no existe una pantalla para contenido general administrable ni una tabla de configuracion global. La nueva necesidad es que la duena capture "Lineamientos y Avisos" con formato enriquecido y decida, al momento de generar el PDF de tareas, si desea anexarlos.

## Goals / Non-Goals

**Goals:**
- Agregar una opcion visible de menu administrativo llamada "Lineamientos y Avisos".
- Permitir consultar, editar y guardar un unico contenido vigente de lineamientos y avisos con formato basico.
- Preguntar al generar PDF de Tareas del Evento si se desea incluir el texto guardado.
- Incluir el texto en el PDF solamente cuando exista contenido guardado y la duena confirme.
- Mantener el comportamiento actual del PDF cuando no se incluya el texto.

**Non-Goals:**
- No se versionaran historiales de lineamientos.
- No se manejaran lineamientos distintos por evento.
- No se modificara el PDF publico del cliente salvo que una futura solicitud lo pida.

## Decisions

1. Guardar los lineamientos como configuracion global administrable.

   Se propone una tabla simple `admin_settings` con llave unica, valor de texto y timestamps, o una tabla especifica equivalente si el proyecto ya adopta otro patron durante implementacion. Para este caso conviene un registro global con clave `guidelines_notices`, porque la duena quiere un texto general reutilizable y no un dato por evento.

   Alternativa considerada: agregar columnas a `events`. Se descarta porque obligaria a copiar el mismo texto en cada evento y haria mas dificil mantener un aviso general vigente.

2. Exponer una API admin dedicada.

   Se propone `GET /api/admin/guidelines-notices` para cargar el contenido HTML vigente y `PUT /api/admin/guidelines-notices` para guardarlo. Ambas rutas deben usar `requireAdmin`, validar longitud razonable, sanitizar o permitir solo un subconjunto seguro de etiquetas y normalizar contenido vacio como ausencia de contenido.

   Alternativa considerada: usar una API generica de settings. Se descarta para esta primera iteracion porque el sistema solo necesita una configuracion concreta y una ruta explicita reduce ambiguedad.

3. Crear una pantalla administrativa con editor WYSIWYG.

   La nueva pantalla `/admin/guidelines-notices` debe seguir el estilo del panel: encabezado claro, superficie de edicion enriquecida, toolbar de formato, estado de guardado, boton principal y estado vacio. El editor debe permitir formato basico suficiente para avisos operativos: negritas, cursivas, subrayado, listas, enlaces, encabezados simples y parrafos.

   Alternativa considerada: textarea con Markdown. Se descarta porque la dueña pidio explicitamente un editor enriquecido tipo WYSIWYG y conviene que vea el resultado mientras escribe.

4. Preguntar antes de generar el PDF.

   El boton "Generar PDF" debe cargar o conocer si hay lineamientos guardados. Si hay texto, muestra una confirmacion estetica en la app para elegir "Incluir lineamientos" o "Generar sin lineamientos". Si no hay texto guardado, genera el PDF directamente como hoy.

   Alternativa considerada: incluirlos siempre. Se descarta porque la duena pidio que el sistema pregunte.

5. Renderizar los lineamientos enriquecidos como seccion adicional del PDF.

   La funcion de impresion debe recibir el HTML enriquecido opcional y agregar una seccion posterior al resumen/contexto o al final de la tabla, con titulo "Lineamientos y Avisos". Debe renderizar solo HTML sanitizado, conservar el formato permitido y evitar que el contenido rompa visualmente el documento.

6. Sanitizar contenido antes de guardarlo o renderizarlo.

   Como el contenido enriquecido se usara en una ventana de impresion, la implementacion debe impedir scripts, handlers inline, iframes, estilos peligrosos y URLs no seguras. Se puede usar una libreria probada de sanitizacion si ya existe o agregar una dependencia ligera; si se agrega dependencia, debe quedar documentada en tareas y validada con build.

## Risks / Trade-offs

- Contenido muy largo puede producir PDFs extensos o saltos de pagina poco elegantes -> Mitigar con estilos de impresion, margenes claros y pruebas con contenido corto/largo.
- HTML enriquecido puede abrir riesgo de XSS si se guarda o imprime sin control -> Mitigar sanitizando etiquetas, atributos y URLs permitidas antes de persistir o antes de renderizar.
- El editor WYSIWYG puede agregar peso o complejidad de dependencia -> Mitigar usando una libreria madura y acotada, o una implementacion `contenteditable` simple si cubre los controles requeridos.
- El texto global puede cambiar despues de generar un PDF anterior -> Mitigar entendiendo que el PDF representa el contenido vigente al momento de generarse; no se requiere historico.
- Fallo al cargar lineamientos antes de imprimir -> Mitigar mostrando mensaje claro y permitiendo generar sin lineamientos si la carga falla.
- Tabla nueva requiere aplicar SQL en ambientes existentes -> Mitigar con migracion idempotente en `schema.sql` y RLS consistente con el resto de tablas admin.
