## ADDED Requirements

### Requirement: Admin tables support live text search
El sistema SHALL permitir busqueda textual en vivo en tablas administrativas generales.

#### Scenario: Buscar mientras se escribe
- **WHEN** una administradora escribe texto en un filtro de busqueda de tabla
- **THEN** el sistema actualiza las filas visibles sin requerir enviar formulario ni presionar boton de busqueda

#### Scenario: Busqueda sin mayusculas estrictas
- **WHEN** la administradora escribe texto con mayusculas o minusculas distintas a los datos de la tabla
- **THEN** el sistema encuentra coincidencias equivalentes sin distinguir mayusculas/minusculas

#### Scenario: Limpiar busqueda
- **WHEN** la administradora limpia el texto de busqueda
- **THEN** el sistema vuelve a mostrar todas las filas que correspondan a los demas filtros activos

### Requirement: Events table can be searched
El sistema SHALL permitir busqueda en vivo en la tabla de Eventos.

#### Scenario: Buscar evento por festejado
- **WHEN** la administradora escribe parte del nombre del festejado en la busqueda de Eventos
- **THEN** la tabla muestra solo eventos cuyo nombre coincida con el texto

#### Scenario: Buscar evento por datos operativos
- **WHEN** la administradora escribe fecha, estado, horario, nombre de padres o datos disponibles del cliente
- **THEN** la tabla muestra eventos que coincidan con esos campos visibles o utiles para identificacion

#### Scenario: Eventos sin coincidencias
- **WHEN** la busqueda de Eventos no coincide con ninguna fila
- **THEN** la tabla muestra un estado vacio indicando que no hay eventos para esa busqueda

### Requirement: Master tasks table can be searched
El sistema SHALL permitir busqueda en vivo en el catalogo de Tareas Maestras.

#### Scenario: Buscar tarea maestra por nombre
- **WHEN** la administradora escribe parte del nombre de una tarea maestra
- **THEN** la tabla muestra solo tareas maestras cuyo nombre coincida

#### Scenario: Buscar tarea maestra por detalle operativo
- **WHEN** la administradora escribe area, rol, responsable, visibilidad o parte de la descripcion
- **THEN** la tabla muestra tareas maestras que coincidan con esos campos

#### Scenario: Tareas maestras sin coincidencias
- **WHEN** la busqueda de Tareas Maestras no coincide con ninguna fila
- **THEN** la tabla muestra un estado vacio indicando que no hay tareas maestras para esa busqueda
