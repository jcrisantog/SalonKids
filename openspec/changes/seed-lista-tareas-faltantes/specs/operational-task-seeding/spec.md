## ADDED Requirements

### Requirement: ListaTareas review seeds missing operational master tasks
El sistema SHALL incluir un seed idempotente para registrar tareas maestras faltantes identificadas desde `Documentos/ListaTareas.txt`, excluyendo actividades ya cubiertas por tareas maestras existentes aunque usen redaccion distinta.

#### Scenario: Sembrar tareas faltantes
- **WHEN** se ejecuta el seed de tareas faltantes despues de aplicar el esquema
- **THEN** el sistema crea tareas maestras accionables que no existian en el catalogo y conserva una sola tarea por nombre operativo unico

#### Scenario: Omitir tarea equivalente existente
- **WHEN** una actividad de `ListaTareas.txt` esta cubierta por una tarea maestra existente con nombre o descripcion equivalente
- **THEN** el seed no crea una nueva tarea duplicada para esa actividad

#### Scenario: Reejecutar seed de tareas faltantes
- **WHEN** el seed de tareas faltantes se ejecuta mas de una vez
- **THEN** el sistema mantiene una sola tarea maestra por nombre y actualiza de forma idempotente los datos sembrados por ese seed

### Requirement: ListaTareas audit report documents registrations and omissions
El sistema SHALL entregar un reporte documental de la revision de `ListaTareas.txt` que indique tareas dadas de alta, regla aplicada y tareas ignoradas con motivo.

#### Scenario: Documentar tarea dada de alta
- **WHEN** una actividad del documento genera una nueva tarea maestra
- **THEN** el reporte lista el numero o texto de origen, la tarea maestra creada, su clasificacion como tarea base o generada por regla, y la regla aplicable cuando exista

#### Scenario: Documentar tarea ignorada
- **WHEN** una actividad del documento no genera una tarea nueva
- **THEN** el reporte lista la actividad ignorada y explica si fue omitida por estar cubierta por una tarea existente, ser detalle de una tarea mas amplia, carecer de campo confiable de cuestionario o no ser accionable como tarea independiente

#### Scenario: Ignorar etiquetas del documento
- **WHEN** el reporte evalua actividades marcadas con textos como `[Aplica]`, `[No aplica]` o variantes
- **THEN** el sistema basa la clasificacion en el texto operativo de la actividad y no en esas etiquetas

### Requirement: Seeded missing tasks remain operationally grouped
El sistema SHALL clasificar las nuevas tareas maestras faltantes en grupos de asignacion existentes o nuevos solo cuando pertenezcan a un bloque operativo claro.

#### Scenario: Agrupar bloque operativo claro
- **WHEN** dos o mas tareas nuevas pertenecen naturalmente al mismo bloque de trabajo
- **THEN** el seed asigna una misma agrupacion de asignacion para que puedan autoasignarse como bloque

#### Scenario: Mantener tarea sin grupo
- **WHEN** una tarea nueva no comparte responsable operativo natural con otras tareas
- **THEN** el seed la deja sin agrupacion para conservar asignacion individual
