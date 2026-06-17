## Contexto

El cambio anterior agrego agrupacion opcional de tareas usando `master_tasks.assignment_group_key` y `assignment_group_label`. Eso resolvio la asignacion por bloques, pero deja la administracion del grupo como texto libre dentro de cada tarea maestra.

La duena necesita tratar los grupos como un catalogo operativo: crear grupos como Arenero, Montaje o Pastel, reutilizarlos sin errores de escritura, desactivar grupos que ya no se usen y filtrar tareas por grupo. La pantalla de tareas maestras ya carga tareas, staff y metadatos de grupo; la autoasignacion ya usa la clave de grupo para formar bloques.

## Objetivos / Fuera de alcance

**Objetivos:**
- Crear un catalogo CRUD de grupos de asignacion de tareas.
- Permitir que una tarea maestra seleccione cero o un grupo desde un combo.
- Permitir filtrar la tabla de tareas maestras por grupo.
- Migrar los grupos existentes de texto libre al catalogo.
- Hacer que la autoasignacion use el grupo catalogado como fuente principal.
- Mantener tareas sin grupo como caso valido.

**Fuera de alcance:**
- Agrupar tareas de evento manuales sin relacion con tarea maestra.
- Crear jerarquias de grupos o subgrupos.
- Cambiar la logica de cantidad requerida o responsables default.
- Balancear carga entre personas.
- Eliminar de inmediato las columnas heredadas `assignment_group_key` y `assignment_group_label`.

## Decisiones

1. Crear tabla `task_groups`.

La tabla debe guardar `id`, `name`, `key`, `description`, `is_active`, `sort_order` y timestamps. `key` sera unico y normalizado para uso interno; `name` sera la etiqueta visible para la duena.

Alternativa considerada: mantener una lista derivada de los grupos existentes en `master_tasks`. Es mas rapido, pero no permite administrar grupos sin tocar tareas ni controlar activos/inactivos.

2. Relacionar `master_tasks` con `task_groups` mediante `assignment_group_id`.

`master_tasks.assignment_group_id` sera nullable y tendra `ON DELETE SET NULL`. Las columnas heredadas `assignment_group_key` y `assignment_group_label` pueden mantenerse durante la migracion para compatibilidad y seeds antiguos.

Alternativa considerada: reemplazar inmediatamente las columnas heredadas. Es mas limpio a largo plazo, pero aumenta el riesgo de romper consultas, seeds o datos existentes.

3. Migrar grupos existentes de texto libre.

El schema o un bloque idempotente de seed debe crear grupos distintos desde `assignment_group_key/label` existentes y rellenar `assignment_group_id` en tareas maestras. Los seeds futuros deben crear o asegurar grupos por clave antes de asociarlos a tareas.

Alternativa considerada: dejar que la duena recree grupos manualmente. Eso es menos seguro porque perderia agrupaciones ya sembradas o capturadas.

4. Exponer CRUD en admin.

Agregar una pantalla de catalogo de grupos con crear, editar, activar/desactivar y eliminar seguro. La eliminacion debe impedirse o limpiar relaciones si el grupo esta en uso; la ruta preferida es bloquear eliminacion con mensaje claro cuando hay tareas asociadas.

Alternativa considerada: solo permitir crear grupos desde el combo de tareas. Eso reduce pantallas, pero vuelve dificil revisar y ordenar el catalogo.

5. Usar combo y filtro por grupo en tareas maestras.

El formulario de tareas maestras cargara grupos activos y permitira elegir "Sin grupo". La tabla agregara filtro por grupo con opciones "Todos", "Sin grupo" y cada grupo disponible. Las tareas asociadas a grupos inactivos deben seguir mostrando el nombre del grupo para no ocultar datos existentes.

Alternativa considerada: autocompletar de texto libre con sugerencias. Sigue permitiendo variaciones y no resuelve CRUD.

6. Resolver autoasignacion por `assignment_group_id`.

La autoasignacion debe agrupar primero por `assignment_group_id`; si no existe, puede usar `assignment_group_key` como fallback heredado. Esto permite implementar sin romper eventos/tareas creadas antes de la migracion.

Alternativa considerada: usar solo `assignment_group_id` desde el primer dia. Es ideal despues de migrar, pero menos tolerante si algun ambiente no ejecuto el seed/migracion completa.

## Riesgos / Intercambios

- Datos existentes con claves duplicadas o etiquetas distintas -> Normalizar por key y usar una etiqueta estable, preferentemente la primera no vacia encontrada o la definida por seed.
- Eliminar un grupo en uso puede dejar tareas sin bloque accidentalmente -> Bloquear eliminacion si hay tareas asociadas y ofrecer desactivar como opcion segura.
- Grupos inactivos asociados a tareas existentes pueden desaparecer del combo -> Mostrar grupos inactivos cuando sean el valor actual, pero no ofrecerlos para nuevas selecciones salvo que se reactiven.
- Seeds y schema pueden competir por la fuente de verdad -> Centralizar helpers SQL idempotentes para asegurar grupo y asociarlo por key.
- UI de admin puede crecer demasiado -> Mantener el catalogo de grupos como pagina sencilla de tabla/formulario, consistente con staff y tareas.

## Plan de migracion

1. Crear `task_groups` y `master_tasks.assignment_group_id` en `schema.sql`.
2. Crear grupos desde valores existentes de `master_tasks.assignment_group_key/label`.
3. Rellenar `assignment_group_id` en tareas maestras existentes.
4. Actualizar APIs para devolver grupos y aceptar `assignment_group_id`.
5. Actualizar UI de tareas maestras para combo y filtro.
6. Agregar CRUD admin de grupos.
7. Actualizar autoasignacion para agrupar por ID con fallback por key.
8. Actualizar seeds y matriz para usar catalogo.

Rollback: mantener columnas heredadas permite volver temporalmente a la agrupacion por texto si el catalogo necesita revertirse. Si se revierte, limpiar `assignment_group_id` no debe borrar tareas ni responsables.

## Preguntas abiertas

- Confirmar si la eliminacion de grupos en uso debe bloquearse siempre o permitir "eliminar y dejar tareas sin grupo".
- Confirmar si el catalogo de grupos debe aparecer en el menu lateral junto a Tareas Maestras o dentro de la misma pantalla como una pestana.
