## 1. Persistencia y API

- [x] 1.1 Revisar el patron actual de tablas admin, RLS y rutas API antes de agregar la configuracion.
- [x] 1.2 Agregar persistencia para Lineamientos y Avisos enriquecidos en `schema.sql` con llave unica, contenido HTML sanitizado y timestamps.
- [x] 1.3 Agregar RLS o permisos consistentes con el resto de configuraciones administrativas.
- [x] 1.4 Definir el subconjunto permitido de HTML, atributos y URLs para el contenido enriquecido.
- [x] 1.5 Crear `GET /api/admin/guidelines-notices` para devolver el contenido guardado o contenido vacio si no existe.
- [x] 1.6 Crear `PUT /api/admin/guidelines-notices` para validar, sanitizar, normalizar y guardar el contenido.
- [x] 1.7 Manejar errores de lectura y guardado con mensajes claros para la interfaz.

## 2. Pantalla de Lineamientos y Avisos

- [x] 2.1 Agregar la opcion "Lineamientos y Avisos" al menu administrativo.
- [x] 2.2 Crear la pantalla `/admin/guidelines-notices` con encabezado, editor WYSIWYG y boton de guardar.
- [x] 2.3 Agregar toolbar de formato para negritas, cursivas, subrayado, encabezados simples, listas y enlaces.
- [x] 2.4 Cargar el contenido guardado al abrir la pantalla y mostrar estado de carga.
- [x] 2.5 Permitir guardar contenido nuevo, editar contenido existente y limpiar el contenido.
- [x] 2.6 Mostrar confirmacion de guardado exitoso y errores de servidor o red.
- [x] 2.7 Preservar parrafos, listas, enlaces y formato permitido capturado por la duena.

## 3. Integracion con PDF de Tareas del Evento

- [x] 3.1 Cargar o consultar si existen Lineamientos y Avisos al presionar "Generar PDF".
- [x] 3.2 Si existe texto guardado, mostrar una confirmacion estetica para incluirlo o generar el PDF sin incluirlo.
- [x] 3.3 Si no existe texto guardado, generar el PDF directamente sin preguntar.
- [x] 3.4 Ajustar la funcion de generacion de PDF para recibir contenido enriquecido opcional de Lineamientos y Avisos.
- [x] 3.5 Agregar al PDF una seccion "Lineamientos y Avisos" cuando la duena confirme incluirlos.
- [x] 3.6 Renderizar solo HTML sanitizado dentro del PDF y conservar formato permitido.
- [x] 3.7 Mantener filtros, busqueda, columnas y comportamiento actual del PDF cuando no se incluyan lineamientos.

## 4. Experiencia visual

- [x] 4.1 Disenar la pantalla de Lineamientos y Avisos consistente con el panel administrativo existente.
- [x] 4.2 Disenar la confirmacion de PDF sin usar `window.confirm` ni elementos visuales tipo inbox.
- [x] 4.3 Asegurar que el editor WYSIWYG sea usable en escritorio y movil.
- [x] 4.4 Asegurar que la seccion de Lineamientos y Avisos en el PDF sea legible con contenido corto, largo y formateado.
- [x] 4.5 Asegurar que botones y textos no se encimen en escritorio ni movil.

## 5. Verificacion

- [x] 5.1 Ejecutar lint y build.
- [x] 5.2 Verificar que el menu abra la nueva pantalla.
- [x] 5.3 Verificar guardar, editar y limpiar Lineamientos y Avisos.
- [x] 5.4 Verificar aplicar y guardar formato enriquecido basico desde el editor.
- [x] 5.5 Verificar que generar PDF sin lineamientos guardados no pregunte y conserve el PDF actual.
- [x] 5.6 Verificar que generar PDF con lineamientos guardados pregunte antes de generar.
- [x] 5.7 Verificar que elegir incluir lineamientos los agregue al PDF con formato permitido.
- [x] 5.8 Verificar que elegir no incluir lineamientos genere el PDF sin esa seccion.
- [x] 5.9 Verificar que parrafos, listas, enlaces, caracteres especiales y contenido inseguro se manejen correctamente en pantalla y PDF.
