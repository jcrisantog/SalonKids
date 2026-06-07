## Context

Las pantallas administrativas de eventos, tareas maestras, reglas de cuestionario y tareas de evento ya cargan sus datos completos en componentes cliente. La tabla de tareas de evento ya cuenta con filtros por responsable y visibilidad; la tabla de reglas ya cuenta con filtro por seccion. La necesidad nueva es agregar busqueda textual en vivo sin introducir cambios de base de datos ni endpoints.

## Goals / Non-Goals

**Goals:**

- Agregar busqueda textual en vivo en cuatro tablas administrativas.
- Mantener los filtros existentes y combinar busqueda con ellos cuando aplique.
- Usar una experiencia consistente: campo de busqueda visible sobre la tabla, icono de busqueda, boton de limpiar cuando hay texto y estado vacio especifico para busqueda sin resultados.
- Buscar contra campos operativamente utiles, no solo contra el nombre principal.

**Non-Goals:**

- No agregar busqueda server-side, paginacion ni cambios de API.
- No cambiar permisos, modelo de datos ni ordenamiento base de las tablas.
- No reemplazar filtros existentes por busqueda textual.
- No agregar dependencias nuevas.

## Decisions

1. Usar filtrado client-side con `useMemo`.

   Las pantallas ya reciben arreglos completos (`events`, `tasks`, `rules`) y renderizan tablas en cliente. La busqueda puede derivar listas filtradas con `useMemo` a partir del texto capturado.

   Alternativa considerada: agregar parametro `q` a APIs administrativas. Se descarta porque no hay paginacion ni volumen esperado que lo justifique ahora, y aumentaria el alcance.

2. Normalizar texto localmente.

   Cada pantalla debe comparar en minusculas y sin espacios extremos. Si se crea helper, puede vivir en el mismo archivo o en una utilidad compartida si la repeticion se vuelve notable. No hace falta eliminar acentos inicialmente, pero el helper puede hacerlo si queda simple y sin dependencia.

3. Definir campos de busqueda por tabla.

   - Eventos: festejado, padres, telefono/email del cliente si esta disponible, fecha, estado y horario.
   - Tareas maestras: nombre, descripcion, area, rol default, responsable default y visibilidad.
   - Reglas configuradas: etiqueta de pregunta, llave tecnica, seccion, operador, valor esperado, estado y nombres de tareas asociadas.
   - Tareas del evento: nombre, descripcion, hora, estado, visibilidad, rol responsable y nombre de staff asignado.

4. Combinar busqueda con filtros existentes.

   En tareas de evento, la busqueda se aplica junto con responsable y visibilidad. En reglas configuradas, la busqueda se aplica junto con seccion. Los contadores o textos de resumen deben reflejar la lista visible cuando sea util.

5. Estados vacios diferenciados.

   Si no hay datos cargados, mantener el mensaje actual. Si hay datos pero la busqueda/filtros no encuentran coincidencias, mostrar un mensaje que indique que no hubo resultados y permitir limpiar la busqueda.

## Risks / Trade-offs

- [Riesgo] La busqueda puede ocultar filas y confundirse con datos faltantes -> Mitigacion: mostrar texto de resultados y boton para limpiar busqueda.
- [Riesgo] Campos anidados como tareas asociadas o responsable default pueden no estar en la fila principal -> Mitigacion: construir el texto de busqueda usando mapas existentes (`staffById`) y arreglos asociados.
- [Riesgo] Repetir logica en cuatro pantallas -> Mitigacion: empezar con helper local pequeno; extraer solo si la repeticion crece durante implementacion.
- [Riesgo] Busqueda client-side puede quedarse corta si crece mucho el volumen -> Mitigacion: mantener la decision documentada y migrar a server-side cuando haya paginacion o volumen alto.

## Migration Plan

1. Agregar estado `searchQuery` en cada pantalla objetivo.
2. Agregar controles de busqueda sobre cada tabla.
3. Cambiar las listas renderizadas para usar listas derivadas por busqueda/filtros.
4. Ajustar estados vacios y textos de resultados.
5. Ejecutar lint/build y validar manualmente las cuatro pantallas.

## Open Questions

- Confirmar si se desea busqueda sin acentos desde esta primera version. La propuesta puede implementarla si el helper queda simple.
