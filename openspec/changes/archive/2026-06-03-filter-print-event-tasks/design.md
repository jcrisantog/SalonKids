## Context

La pantalla `src/app/admin/events/[id]/tasks/page.tsx` es un Client Component que ya carga evento, tareas y staff desde `/api/admin/events/[id]/tasks`. La tabla muestra tareas completas con hora, responsable, rol, estado, proteccion y acciones, pero no tiene filtros operativos ni una salida formal para compartir.

La necesidad es generar un PDF basado en los datos ya cargados y filtrados, no una impresion visual de la pantalla. El documento debe ser presentable, colorido y limitado a los campos Hora, Tarea, Descripcion y Responsable.

## Goals / Non-Goals

**Goals:**

- Filtrar tareas de evento por responsable y visibilidad desde la pantalla administrativa.
- Aplicar los filtros sobre la tabla visible y sobre el PDF generado.
- Generar un PDF estetico con encabezado del evento, resumen de filtros y tabla con Hora, Tarea, Descripcion y Responsable.
- Mantener el flujo actual de alta, edicion, eliminacion y proteccion manual de tareas.
- Mantener una experiencia usable en desktop y mobile sin romper el ancho estable de la tabla.

**Non-Goals:**

- No cambiar la API para filtrar en servidor; el volumen de tareas por evento permite filtrar en cliente.
- No exportar CSV, Excel ni otros formatos.
- No incluir estado, visibilidad o acciones en el PDF.
- No generar PDFs publicos desde rutas de cliente ni exponer informacion sin autenticacion admin.

## Decisions

1. Filtrar en cliente usando `filteredTasks`.

   Rationale: la pantalla ya carga todas las tareas del evento y el staff necesario. Filtrar localmente evita cambios de API y mantiene los filtros reactivos.

   Alternativa descartada: enviar filtros al endpoint. Aporta poco para el volumen esperado y complica el estado de UI sin necesidad.

2. El filtro de responsable usara `staff_id` como valor principal e incluira una opcion para tareas sin responsable.

   Rationale: `staff_id` identifica a la persona concreta. Para tareas sin staff asignado se debe poder aislar el caso operativo "Sin responsable".

   Alternativa descartada: filtrar por texto de rol responsable. El rol puede repetirse o variar, y el requerimiento habla de Responsable como persona/staff.

3. El filtro de visibilidad usara las opciones `todas`, `interna` y `publica`.

   Rationale: mantiene el vocabulario actual del modelo y permite volver rapidamente a la vista completa.

4. El PDF se generara desde una plantilla de datos y estilos, no desde captura de pantalla.

   Rationale: permite controlar columnas, colores, espaciado, encabezado y paginacion. Tambien evita imprimir botones, inputs o layout administrativo.

   Alternativa descartada: usar `window.print()` sobre la pantalla. Es rapido, pero imprimira una interfaz administrativa y no cumple con "no solo impresion de pantalla".

5. Preferir una libreria ligera de PDF en cliente si se aprueba instalar dependencia; si no, usar una ventana HTML dedicada con estilos de impresion y exportacion del navegador.

   Rationale: una libreria como `jspdf` + `jspdf-autotable` puede generar un PDF descargable de forma consistente. Si no se quiere nueva dependencia, HTML imprimible sigue generando PDF desde el navegador, pero requiere que la usuaria elija "Guardar como PDF".

## Risks / Trade-offs

- Nueva dependencia de PDF puede aumentar el bundle de la pagina -> Mitigacion: importacion dinamica solo al hacer clic en generar PDF.
- PDF con muchas tareas puede necesitar salto de pagina -> Mitigacion: usar tabla paginada y repetir encabezados.
- Tareas sin hora pueden desordenarse o verse ambiguas -> Mitigacion: mostrar "Sin hora" y ordenar esas tareas al final si la tabla actual lo requiere.
- Tareas con responsable inactivo pueden aparecer en filtros -> Mitigacion: conservarlas en opciones si existen en los datos cargados y etiquetarlas como inactivas.
- El PDF podria quedar vacio si filtros no tienen resultados -> Mitigacion: mostrar estado vacio y deshabilitar o confirmar generacion con cero tareas.

## Migration Plan

1. Agregar estado de filtros en `src/app/admin/events/[id]/tasks/page.tsx`.
2. Derivar `filteredTasks` y usarlo para la tabla visible.
3. Agregar controles de filtro y accion de PDF en una barra superior de la seccion de tabla.
4. Implementar generacion de PDF desde datos filtrados con estilos propios.
5. Verificar filtros, tabla visible y PDF en desktop/mobile.
6. Rollback: retirar controles, utilitario PDF y volver a renderizar `tasks` directamente.
