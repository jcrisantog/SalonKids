# Matriz operativa de tareas y reglas

Esta matriz resume la base inicial que se entrega para que la duena del sistema pueda empezar a operar, editar y depurar desde el admin. Las tareas y reglas se basan en el cuestionario actual, el motor configurable y los documentos operativos de sabado 2026.

## Como aplicar la base inicial

1. Aplicar `schema.sql`.
2. Ejecutar `Documentos/seed-operational-master-tasks.sql`.
3. Ejecutar `Documentos/seed-questionnaire-task-rules.sql`.
4. Entrar al admin para ajustar nombres, responsables, horarios, visibilidad y reglas.

Los seeds son idempotentes: se pueden reejecutar sin crear tareas maestras duplicadas ni duplicar la misma tarea dentro de una regla.

## Tareas base de entrada y cierre

Estas tareas aplican a todos los eventos. Se siembran como `master_tasks` y el sistema las usa como plantillas base al crear o sincronizar el evento.

| Categoria | Tarea | Area | Visibilidad | Rol sugerido | Motivo |
| --- | --- | --- | --- | --- | --- |
| Indispensable | Entrada - Revision inicial del salon | Entrada | interna | Coordinadora | Abrir salon y validar limpieza, banos, cocina, pista y area infantil. |
| Indispensable | Entrada - Encendido y prueba tecnica | Entrada | interna | DJ | Probar sonido, microfono, luces, pantalla o proyector. |
| Indispensable | Montaje - Mesas y flujo de invitados | Montaje | interna | Coordinadora | Revisar acomodo, manteleria, bebidas, mesa principal, regalos y reservados. |
| Indispensable | Montaje - Recepcion de familia y articulos | Montaje | interna | Apoyo | Recibir pastel, regalos, centros, dulces, recuerdos y articulos del cliente. |
| Recomendada | Montaje - Recepcion de proveedores | Montaje | interna | Coordinadora | Recibir proveedores externos e indicar zonas permitidas. |
| Indispensable | Entrada - Seguridad de areas infantiles | Entrada | interna | Coordinadora | Revisar cama elastica, tirolesa, calcetas, deslindes e instrucciones. |
| Indispensable | Cierre - Bajar pertenencias de anfitriones | Cierre | interna | Apoyo | Ayudar a bajar pertenencias, regalos, dulces y articulos de la familia. |
| Indispensable | Cierre - Retirar charolas y loza | Cierre | interna | Cocina | Retirar charolas y separar material reutilizable. |
| Indispensable | Cierre - Separar residuos | Cierre | interna | Limpieza | Separar organico e inorganico y retirar bolsas. |
| Indispensable | Cierre - Doblar y resguardar manteleria | Cierre | interna | Apoyo | Doblar hojas o manteles y separar piezas manchadas. |
| Indispensable | Cierre - Limpieza final de areas | Cierre | interna | Limpieza | Revisar banos, cocina, pista, mesas, area infantil y accesos. |
| Recomendada | Cierre - Resguardo y reporte final | Cierre | interna | Coordinadora | Confirmar salida, objetos olvidados y pendientes. |

## Reglas activas sembradas

Estas respuestas generan tareas desde `questionnaire_task_rules`.

| Seccion | Campo | Condicion | Tareas generadas | Nota |
| --- | --- | --- | --- | --- |
| Datos generales | `guestCount` | Mayor que 80 | Ajustar montaje por aforo alto | Regla interna para eventos grandes. |
| Pastel | `cake` | Verdadero | Preparar mesa y accesorios de pastel; Protocolo de pastel | Una tarea interna y una publica. |
| Pastel | `cakeSparklers` | Verdadero | Preparar chisperos o bombas de pastel | Seguridad y preparacion. |
| Pastel | `cakeBazookas` | Verdadero | Preparar bazukas de color | Seguridad y limpieza posterior. |
| Pastel | `cakeSouvenirs` | Verdadero | Coordinar souvenirs de pastel | Reparto durante o despues de pastel. |
| Musica | `blockedGenres` | Respondido | Bloquear musica no deseada | Interna para DJ. |
| Musica | `djDanceMusic` | Verdadero | Preparar bloque de baile | Publica porque puede aparecer en itinerario. |
| Musica | `microphoneNeeded` | Verdadero | Preparar microfono para mensajes | Interna de audio. |
| Musica | `projectorNeeded` | Verdadero | Preparar proyector o pantalla | Interna de audio. |
| Presentacion | `presentation` | Verdadero | Presentacion del festejado | Publica. |
| Presentacion | `characterShow` | Verdadero | Preparar aparicion de personaje; Aparicion de personaje | Interna y publica. |
| Presentacion | `photoSession` | Verdadero | Sesion de fotos | Publica. |
| Presentacion | `surpriseGift` | Verdadero | Preparar sorpresa especial | Publica. |
| Pinata | `pinata` | Verdadero | Preparar area de pinata; Pinata | Interna y publica. |
| Pinata | `pinataCellophaneBags` | Verdadero | Preparar bolsitas de celofan | Interna. |
| Mesas | `reservedTables` | Verdadero | Colocar letreros de reservados | Interna. |
| Mesas | `kidsTables` | Verdadero | Montar mesitas infantiles | Interna. |
| Menu salon | `salonMenu` | Verdadero | Coordinar menu contratado con salon | Interna de cocina. |
| Menu salon | `allergies` | Respondido | Alertar restricciones alimentarias | Interna critica. |
| Menu externo | `externalMenu` | Verdadero | Coordinar proveedor o menu externo | Interna. |
| Cafe/dulces | `coffeeServiceTiming` | Respondido | Coordinar servicio de cafe | Interna. |
| Cafe/dulces | `centerpieces` | Verdadero | Colocar centros de mesa | Interna. |
| Cafe/dulces | `candyTable` | Verdadero | Preparar mesa de dulces; Mesa de dulces | Interna y publica. |
| Cafe/dulces | `gelatin` | Verdadero | Coordinar servicio de gelatina | Interna. |
| Servicios | `nannyService` | Verdadero | Coordinar servicio de nanny | Interna. |
| Servicios | `valetCarCount` | Mayor que 0 | Coordinar valet o estacionamiento | Interna. |
| Servicios | `extraWaiters` | Verdadero | Coordinar meseros adicionales | Interna. |
| Decoracion | `externalDecoration` | Verdadero | Recibir proveedor de decoracion | Interna. |
| Decoracion | `clientDecoration` | Verdadero | Coordinar decoracion del cliente | Interna. |
| Decoracion | `staffDecorationSupport` | Verdadero | Apoyar decoracion del cliente | Interna. |
| Varios | `photoCanvas` | Verdadero | Colocar lona decorativa | Interna. |
| Varios | `giantPhotoFrame` | Verdadero | Colocar marco gigante de fotos | Interna. |
| Varios | `candyBags` | Verdadero | Coordinar bolsitas de dulces | Interna. |
| Varios | `souvenirs` | Verdadero | Coordinar recuerditos | Interna. |
| Dinamicas | `danceGames` | Verdadero | Preparar dinamicas seleccionadas | Publica. |
| Dinamicas | `chocolateMedals` | Verdadero | Preparar medallas de chocolate | Interna. |
| Seguridad | `trampolineSocksOption` | Respondido | Confirmar calcetas y seguridad | Interna. |
| Programa | `foodStartTime` | Respondido | Inicio de comida | Usa la hora capturada. |
| Programa | `showTime` | Respondido | Show contratado | Usa la hora capturada. |
| Programa | `chocolateFountainTime` | Respondido | Fuente de chocolate | Usa la hora capturada. |
| Programa | `popsiclesTime` | Respondido | Paletas | Usa la hora capturada. |
| Programa | `iceCreamTime` | Respondido | Helados | Usa la hora capturada. |
| Programa | `tamalesTime` | Respondido | Tamales | Usa la hora capturada. |
| Programa | `celebratoryDanceTime` | Respondido | Baile del festejado | Usa la hora capturada. |
| Programa | `otherActivityTime` | Respondido | Otra actividad programada | Sin hora automatica porque el campo es texto. |

## Campos informativos sin regla inicial

Estos campos no crean una tarea propia porque sirven como contexto de una tarea generadora, datos administrativos o notas para revisar manualmente.

| Grupo | Campos |
| --- | --- |
| Datos de familia | `celebratoryFullName`, `eventDateText`, `motherName`, `fatherName`, `contactPhone`, `arrivalTime` |
| Tema y colores | `decorationTheme`, `mainColors`, `congratulationsSignColors`, `signNameOption` |
| Detalle de pastel | `cakeMentionMother`, `cakeMentionFather`, `cakeMentionSiblings`, `cakeMentionGrandparents`, `cakeMentionGodparents`, `cakeMentionOther`, `cakeSpeechOption`, `cakeSpecificSpeechPerson`, `cakeCallSong`, `cakeDedicatedSong`, `birthdaySongVersion`, `cakeCandlesOption`, `cakeCandlesPlacement` |
| Preferencias musicales | `celebratoryMusic`, `motherMusic`, `fatherMusic`, `grandparentsMusic`, `danceMusicNotes`, `inviteGuestsToDance`, `staffDanceParticipation`, `onlyKidsMusic`, `kidsMusicDuration`, `playlistNotes` |
| Detalle de pinata | `pinataCount`, `pinataDistribution`, `pinataAdultsAllowed`, `pinataLineOrder`, `pinataHitCount`, `pinataCandyProvided`, `pinataStickProvided`, `pinataSafeOpening` |
| Detalle de mesas y comida | `reservedTablesNotes`, `mainTable`, `mainTableLocation`, `beverageService`, `bottlesPerTable`, `flavoredWaterOptions`, `linenOption`, `adultTableCrayons`, `tableSetup`, `adultMenu`, `kidsMenu`, `kidsDrink`, `foodNotes` |
| Proveedores y servicios | `decoratorArrivalTime`, `parkingPlates`, `parkingNotes`, `accessibilityNotes`, `externalAdultMenu`, `externalTaquizaStews`, `externalTacoCount`, `externalKidsMenuDescription` |
| Dinamicas | Campos de participantes y variantes de cada juego, como `reyPideParticipants`, `loboParticipants`, `futbolMode` y similares |
| Notas generales | `specialGuests`, `protocolNotes`, `finalNotes` |

## Reglas candidatas opcionales

No se activan inicialmente para evitar ruido operativo, pero son buenas candidatas si la duena quiere mas granularidad.

| Campo | Regla candidata | Motivo |
| --- | --- | --- |
| `emotionalBox` | Preparar cajita emotiva | Puede manejarse dentro de pastel hasta que sea frecuente. |
| `birthdayBand` | Preparar banda It's my birthday | Es un accesorio pequeno; se puede sumar si requiere control. |
| `cakeCandlesOption` | Confirmar velitas especificas | Actualmente queda en la tarea de pastel. |
| `pinataStaffDynamic` | Preparar dinamica previa de pinata | Puede activarse si se vuelve operacion regular. |
| `welcomeSign` | Colocar letrero de bienvenida | Puede quedar dentro de montaje general. |
| `giftTable` | Preparar mesa de regalos | Puede quedar dentro de montaje general. |
| `reserveCandySamples` | Apartar muestra de dulces | Puede activarse si se necesita control estricto. |
| `barStaffServesTacos` | Asignar barra para tacos | Puede quedar dentro de menu externo. |
| `staffCanEatExternalFood` | Avisar permiso de comida externa | Puede quedar como nota de menu externo. |
| `citeGuestsEarly` | Citar invitados temprano | Es comunicacion previa, no tarea del evento. |
| `shareAdditionalServices` | Compartir servicios adicionales | Es seguimiento comercial, no operativo del evento. |

## Reglas hardcodeadas actuales

`src/lib/rule-engine.ts` conserva una lista historica `questionnaireRules`, pero las rutas actuales de guardado usan `syncReactiveTasks`, que genera tareas desde reglas configurables. La base inicial debe mantenerse desde SQL/admin para que la duena pueda editar sin cambios de codigo.

Clasificacion de esa lista historica:

| Grupo | Reglas hardcodeadas |
| --- | --- |
| Duplicadas por seed configurable | `cake`, `guest_volume`, `pinata`, `character_show`, `blocked_genres`, `dance_games`, `salon_menu`, `external_menu`, `safety_socks`, `activity_program` |
| Cubiertas como detalle de una regla mayor | `cake_addons`, `cake_speeches`, `music_preferences`, `pinata_details`, `pinata_supplies`, `tables_drinks_linen`, `coffee_candy_gelatin`, `support_services`, `decoration_setup`, `misc_deliverables`, `dynamics_program` |
| Utiles como fallback tecnico si no hay reglas configurables | `buildReactiveTasks` y `getReactiveTaskNames`, aunque no se usan en el flujo normal actual |

## Como ajustar desde el admin

- Para cambiar una tarea base, editar la tarea maestra en el catalogo de tareas.
- Para cambiar que respuesta genera que tareas, entrar a reglas del cuestionario y editar la regla.
- Para pausar una regla sin borrarla, desactivarla.
- Para cambiar responsable concreto, asignar staff en la tarea maestra o en la relacion regla-tarea.
- Para evitar ruido, mantener sin regla las preguntas que solo dan contexto.
