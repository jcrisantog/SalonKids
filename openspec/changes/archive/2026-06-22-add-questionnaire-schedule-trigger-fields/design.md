## Context

El cuestionario persiste todas sus respuestas en un payload JSON normalizado por `normalizeQuestionnaire`. La metadata de `questionnaireSections` controla tanto el renderizado público como el catálogo de campos que consume la administración de reglas. Actualmente `photoSessionTime` está en la sección 4; la sección 15 ya concentra horarios de programa, y el motor puede usar cualquier respuesta de tipo hora como disparador y como `scheduled_time`.

El cambio cruza esquema, interfaz pública, catálogo administrativo y sincronización de tareas. Debe mantener las llaves existentes, admitir payloads anteriores y evitar que un valor de fin de comida enviado por el cliente pueda quedar desfasado del inicio.

## Goals / Non-Goals

**Goals:**

- Capturar `characterTime`, `danceBlockTime` y `photoSessionTime` en la sección 15 con dependencias condicionales consistentes.
- Capturar `externalFoodProviderArrivalTime` en la sección 8 cuando aplique el menú externo.
- Mantener `foodEndTime` como dato oculto y canónico, calculado a partir de `foodStartTime`.
- Exponer las cinco llaves de horario en el catálogo administrativo para usarlas como disparadores o fuentes de programación.
- Conservar compatibilidad con payloads existentes y con reglas que ya usan `photoSessionTime`.

**Non-Goals:**

- Crear automáticamente reglas o tareas específicas para cada nuevo horario sin configuración administrativa.
- Cambiar la duración de comida a un valor configurable; en este cambio permanece fija en 60 minutos.
- Mostrar `foodEndTime` en el cuestionario público.
- Cambiar el modelo de almacenamiento JSON o introducir nuevas dependencias.

## Decisions

### Conservar llaves estables y agregar nuevas llaves en camelCase

Se conservará `photoSessionTime` y únicamente se moverá su metadata a la sección 15. Las nuevas llaves serán `characterTime`, `danceBlockTime`, `externalFoodProviderArrivalTime` y `foodEndTime`. Esto evita romper payloads y reglas existentes. La alternativa de renombrar `photoSessionTime` se descarta porque exigiría migrar datos y configuraciones ya guardadas.

### Modelar la visibilidad condicional desde la metadata

`characterTime` dependerá de `characterShow`, `danceBlockTime` de `djDanceMusic`, `photoSessionTime` de `photoSession` y `externalFoodProviderArrivalTime` de `externalMenu`, todos con valor esperado `true`. Así se reutiliza el mecanismo existente `dependsOn`/`dependsValue` y se preservan valores cuando un campo se oculta. La alternativa de condicionar campos directamente en el componente duplicaría reglas de presentación fuera del esquema.

### Derivar el fin de comida durante la normalización del payload

`normalizeQuestionnaire` calculará siempre `foodEndTime` sumando 60 minutos a un `foodStartTime` válido; si el inicio está vacío o no es válido, dejará el fin vacío. El cálculo manejará el cruce de medianoche y devolverá una hora normalizada. Al ejecutarse tanto al cargar como antes de persistir, también completa payloads antiguos y evita confiar en un valor derivado enviado por el navegador. La alternativa de calcularlo solo en React dejaría expuestos otros puntos de escritura y permitiría inconsistencias.

### Separar presencia en catálogo de visibilidad pública

`foodEndTime` tendrá metadata suficiente para aparecer bajo la sección 15 en el catálogo de reglas, pero quedará marcado como no renderizable y no contará para el progreso del cuestionario. Los otros cuatro campos seguirán el flujo normal de campos visibles. La alternativa de omitir `foodEndTime` de `questionnaireSections` requeriría mantener un segundo catálogo manual que podría divergir.

### Reutilizar la semántica actual del motor de reglas

Los horarios estarán disponibles como `field_key` y como `schedule_source_field_key`. Una regla con operador `answered` podrá dispararse por ellos y, cuando el horario sea el propio disparador y no haya otra fuente configurada, el motor usará el valor como `scheduled_time`. No se introduce un operador nuevo porque el comportamiento actual ya cubre campos de tipo hora.

## Risks / Trade-offs

- [Un horario oculto podría aparecer o afectar el progreso por error] → Incorporar una marca explícita de campo interno y cubrir catálogo, visibilidad y progreso con pruebas.
- [El cálculo al cruzar medianoche puede interpretarse como día siguiente sin guardar fecha] → Aplicar aritmética modular de 24 horas y documentar que el payload almacena solo la hora, igual que los demás campos de programa.
- [Reglas existentes de fotos podrían perder referencia al mover el campo] → Conservar exactamente la llave `photoSessionTime`; solo cambia su sección y etiqueta de agrupación en metadata.
- [Un valor residual de un campo condicional puede seguir disponible] → Mantener la semántica vigente de preservar valores ocultos; las reglas principales deben seguir condicionándose por el booleano de la actividad cuando se requiera evitar tareas residuales.
- [Seeds o documentación pueden quedar desalineados con el catálogo] → Actualizar la matriz y el seed de llaves/fuentes aplicable, sin crear reglas operativas no solicitadas.

## Migration Plan

1. Ampliar tipos, defaults, metadata y normalización manteniendo las llaves existentes.
2. Actualizar el catálogo de reglas para incluir el campo interno sin renderizarlo al cliente.
3. Ajustar seeds/documentación que enumeran campos programables.
4. Verificar cuestionarios antiguos, condiciones de UI, cálculo de fin de comida y evaluación de reglas.
5. Desplegar sin migración de base de datos; los payloads anteriores se completarán al normalizarse y persistirán el valor derivado en su siguiente guardado.

La reversión consiste en retirar los nuevos campos y el cálculo. Las llaves adicionales que permanezcan en JSON serán ignoradas por versiones anteriores, pero antes de revertir deben desactivarse reglas administrativas que dependan de ellas.

## Open Questions

Ninguna para iniciar la implementación. Se adopta una duración fija de comida de 60 minutos y el campo de llegada del proveedor se condiciona a `externalMenu`.
