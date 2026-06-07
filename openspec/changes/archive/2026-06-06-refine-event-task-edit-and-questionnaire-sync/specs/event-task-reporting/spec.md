## ADDED Requirements

### Requirement: Editing an event task focuses the task form
El sistema SHALL desplazar la pantalla hacia el formulario de tareas cuando una administradora inicia la edicion de una tarea de evento.

#### Scenario: Editar tarea desde la tabla
- **WHEN** la administradora presiona editar en una tarea dentro de la tabla de tareas del evento
- **THEN** el sistema carga los datos de la tarea en el formulario y desplaza la pantalla hasta el formulario de edicion

#### Scenario: Cancelar edicion mantiene flujo actual
- **WHEN** la administradora cancela la edicion despues de que la pantalla fue desplazada al formulario
- **THEN** el sistema limpia el formulario y conserva la lista de tareas disponible para seguir trabajando
