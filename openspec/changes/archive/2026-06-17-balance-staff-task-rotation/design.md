## Context

La autoasignacion de responsables ya existe en la pantalla de tareas de evento y respeta personal activo, defaults de reglas o tareas maestras, cantidad requerida, grupos operativos y modos de completar o reemplazar. El criterio aleatorio actual no consulta eventos anteriores, por lo que puede repetir a la misma persona en la misma actividad aunque exista personal disponible para rotar.

La duena quiere que el sistema reduzca repeticion de actividades para evitar cansancio operativo y aburrimiento: si alguien hizo una actividad en los ultimos eventos, el sistema debe preferir asignarle otra actividad cuando sea posible. Tambien necesita una pantalla que muestre el historial de tareas por personal en los ultimos eventos y permita imprimirlo en PDF.

## Goals / Non-Goals

**Goals:**

- Usar los ultimos 3 eventos anteriores como historial para balancear la autoasignacion del evento actual.
- Evitar repetir la misma actividad o grupo operativo para una persona cuando existan candidatos activos alternativos.
- Conservar los defaults y asignaciones existentes como senales fuertes, sin borrar ajustes manuales fuera de los modos actuales.
- Mostrar historial por miembro del personal para los ultimos 5 eventos.
- Permitir imprimir o generar PDF del historial con informacion clara para auditoria operativa.

**Non-Goals:**

- No crear una IA externa ni integrar modelos para decidir asignaciones.
- No cambiar la estructura principal de `event_tasks` ni `event_task_staff` si las consultas actuales pueden resolver el historial.
- No impedir manualmente que una administradora asigne a alguien a una actividad repetida.
- No recalcular automaticamente eventos pasados.

## Decisions

### Resolver equivalencia de actividad por identidad operativa

La rotacion comparara actividades usando una llave estable:

1. `assignment_group_id` de la tarea maestra cuando exista.
2. `assignment_group_key` heredado cuando no exista grupo catalogado.
3. `source_master_task_id` cuando la tarea tenga origen maestro pero no grupo.
4. Nombre normalizado de la tarea como ultimo fallback.

Rationale: el grupo catalogado representa mejor una responsabilidad operativa que el texto visible de la tarea. El fallback mantiene compatibilidad con tareas antiguas o manuales.

Alternativa considerada: comparar solo por `task_name`. Se descarta porque variaciones de texto o tareas agrupadas romperian la deteccion de repeticion.

### Ordenar candidatos con puntaje de rotacion antes de aleatoriedad

La autoasignacion construira candidatos activos y calculara un puntaje por unidad de asignacion:

- Menor cantidad de veces que hizo la misma actividad en los ultimos 3 eventos.
- Menor cantidad total de tareas asignadas en esos eventos como desempate.
- Orden aleatorio solo entre candidatos con puntaje equivalente.

Los defaults se conservaran como candidatos preferentes, pero si un default hizo esa misma actividad recientemente y hay otro default o staff activo valido con mejor puntaje, el sistema podra completar faltantes con la opcion menos repetida.

Alternativa considerada: excluir totalmente a quien hizo la misma tarea recientemente. Se descarta porque podria dejar tareas incompletas cuando hay poco personal activo.

### Mantener grupos como bloque indivisible

Cuando una unidad de asignacion representa un grupo de tareas, el historial se evaluara con la llave de grupo y se asignara una lista unica al bloque completo. Esto conserva el comportamiento actual donde varias tareas relacionadas se asignan a la misma persona o equipo.

### Crear endpoint de historial administrativo

Se agregara una API administrativa para devolver historial por staff de los ultimos 5 eventos, incluyendo:

- Staff activo e inactivo que haya tenido asignaciones recientes.
- Evento, fecha y nombre del evento.
- Tarea, grupo resuelto, hora y estado.
- Conteos por actividad o grupo para facilitar revision.

La pantalla consumira este endpoint y hara impresion/PDF desde el cliente usando el patron actual de reportes imprimibles.

### Ventanas historicas distintas

La autoasignacion usara ultimos 3 eventos para tomar decisiones. La pantalla de historial mostrara ultimos 5 eventos para auditoria. Son ventanas separadas porque decidir con demasiados eventos puede volver rigida la rotacion, mientras que auditar necesita mas contexto visual.

## Risks / Trade-offs

- Historial incompleto por tareas antiguas sin grupo ni master task -> usar nombre normalizado como fallback y mostrar la actividad resuelta en pantalla.
- Poco personal activo para evitar repeticion -> permitir repeticion y reportar que no habia alternativa suficiente.
- Defaults pueden parecer ignorados -> conservarlos como prioridad, pero documentar en el resumen cuando la rotacion eligio otro candidato para evitar repeticion.
- Consultas historicas pueden crecer -> limitar a ultimos 3 o 5 eventos y seleccionar solo columnas necesarias.
- Impresion desde navegador puede variar -> reutilizar el patron actual de PDF/print con estilos dedicados y verificar legibilidad.
