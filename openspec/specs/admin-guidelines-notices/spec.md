## ADDED Requirements

### Requirement: Admin can manage guidelines and notices
El sistema SHALL permitir que una administradora capture, edite y guarde contenido global enriquecido de Lineamientos y Avisos desde el panel administrativo.

#### Scenario: Abrir opcion de menu
- **WHEN** la administradora navega por el panel administrativo
- **THEN** el sistema muestra una opcion de menu llamada "Lineamientos y Avisos"

#### Scenario: Cargar texto guardado
- **WHEN** la administradora abre la pantalla de Lineamientos y Avisos y ya existe texto guardado
- **THEN** el sistema muestra ese texto en un campo editable

#### Scenario: Pantalla sin texto guardado
- **WHEN** la administradora abre la pantalla de Lineamientos y Avisos y no existe texto guardado
- **THEN** el sistema muestra el editor vacio y permite capturar contenido

#### Scenario: Guardar lineamientos
- **WHEN** la administradora captura contenido de lineamientos y avisos y presiona guardar
- **THEN** el sistema persiste el contenido y muestra confirmacion de guardado exitoso

#### Scenario: Editar lineamientos existentes
- **WHEN** la administradora modifica el texto guardado y presiona guardar
- **THEN** el sistema reemplaza el texto anterior por la nueva version

#### Scenario: Limpiar lineamientos
- **WHEN** la administradora guarda el campo sin contenido
- **THEN** el sistema conserva la configuracion como vacia para que no se ofrezca anexarla al PDF

#### Scenario: Editar con formato enriquecido
- **WHEN** la administradora aplica formato como negritas, cursivas, subrayado, encabezados, listas o enlaces
- **THEN** el sistema conserva el formato permitido para mostrarlo posteriormente en la pantalla y en el PDF

#### Scenario: Sanitizar contenido enriquecido
- **WHEN** la administradora guarda contenido enriquecido
- **THEN** el sistema elimina o rechaza etiquetas, atributos, scripts y URLs no seguras antes de persistir o renderizar el contenido

#### Scenario: Preservar estructura visual
- **WHEN** la administradora guarda contenido con parrafos, saltos de linea o listas
- **THEN** el sistema conserva esa estructura para mostrarla posteriormente en el PDF
