# Matriz operativa de tareas y reglas

Esta matriz resume la base inicial que se entrega para que la duena del sistema pueda empezar a operar, editar y depurar desde el admin. Las tareas y reglas se basan en el cuestionario actual, el motor configurable y los documentos operativos de sabado 2026.

## Como aplicar la base inicial

1. Aplicar `schema.sql`.
2. Ejecutar `Documentos/seed-operational-master-tasks.sql`.
3. Ejecutar `Documentos/seed-questionnaire-task-rules.sql`.
4. Entrar al admin para ajustar nombres, responsables, horarios, visibilidad y reglas.

Los seeds son idempotentes: se pueden reejecutar sin crear tareas maestras duplicadas ni duplicar la misma tarea dentro de una regla.

## Agrupacion de asignacion

La columna "Grupo asignacion" indica que todas las tareas asociadas al mismo grupo del catalogo `task_groups` deben asignarse como bloque a la misma persona o lista de personas durante la autoasignacion. Las tareas marcadas como "Sin grupo" conservan asignacion individual.

El nombre visible y la clave operativa del grupo se administran desde el catalogo de grupos de tareas. Las tareas maestras deben seleccionar un grupo existente desde el combo del admin; las columnas heredadas `assignment_group_key` y `assignment_group_label` se mantienen como compatibilidad de migracion y fallback tecnico.

El grupo `Arenero` queda soportado creando primero el grupo en el catalogo y seleccionandolo en las tareas creadas manualmente o futuras tareas sembradas de esa area; la base inicial actual no contiene tareas de Arenero.

## Tareas base de entrada y cierre

Estas tareas aplican a todos los eventos. Se siembran como `master_tasks` y el sistema las usa como plantillas base al crear o sincronizar el evento.

| Categoria | Tarea | Area | Visibilidad | Rol sugerido | Grupo asignacion | Motivo |
| --- | --- | --- | --- | --- | --- | --- |
| Indispensable | Entrada - Revision inicial del salon | Entrada | interna | Coordinadora | Sin grupo | Abrir salon y validar limpieza, banos, cocina, pista y area infantil. |
| Indispensable | Entrada - Encendido y prueba tecnica | Entrada | interna | DJ | Audio/DJ | Probar sonido, microfono, luces, pantalla o proyector. |
| Indispensable | Montaje - Mesas y flujo de invitados | Montaje | interna | Coordinadora | Montaje | Revisar acomodo, manteleria, bebidas, mesa principal, regalos y reservados. |
| Indispensable | Montaje - Recepcion de familia y articulos | Montaje | interna | Apoyo | Montaje | Recibir pastel, regalos, centros, dulces, recuerdos y articulos del cliente. |
| Recomendada | Montaje - Recepcion de proveedores | Montaje | interna | Coordinadora | Sin grupo | Recibir proveedores externos e indicar zonas permitidas. |
| Indispensable | Entrada - Seguridad de areas infantiles | Entrada | interna | Coordinadora | Sin grupo | Revisar cama elastica, tirolesa, calcetas, deslindes e instrucciones. |
| Indispensable | Cierre - Bajar pertenencias de anfitriones | Cierre | interna | Apoyo | Cierre apoyo | Ayudar a bajar pertenencias, regalos, dulces y articulos de la familia. |
| Indispensable | Cierre - Retirar charolas y loza | Cierre | interna | Cocina | Sin grupo | Retirar charolas y separar material reutilizable. |
| Indispensable | Cierre - Separar residuos | Cierre | interna | Limpieza | Cierre limpieza | Separar organico e inorganico y retirar bolsas. |
| Indispensable | Cierre - Doblar y resguardar manteleria | Cierre | interna | Apoyo | Cierre apoyo | Doblar hojas o manteles y separar piezas manchadas. |
| Indispensable | Cierre - Limpieza final de areas | Cierre | interna | Limpieza | Cierre limpieza | Revisar banos, cocina, pista, mesas, area infantil y accesos. |
| Recomendada | Cierre - Resguardo y reporte final | Cierre | interna | Coordinadora | Sin grupo | Confirmar salida, objetos olvidados y pendientes. |

## Reglas activas sembradas

Estas respuestas generan tareas desde `questionnaire_task_rules`.

| Seccion | Campo | Condicion | Tareas generadas | Grupo asignacion | Nota |
| --- | --- | --- | --- | --- | --- |
| Datos generales | `guestCount` | Mayor que 80 | Ajustar montaje por aforo alto | Sin grupo | Regla interna para eventos grandes. |
| Pastel | `cake` | Verdadero | Preparar mesa y accesorios de pastel; Protocolo de pastel | Pastel | Una tarea interna y una publica; la publica usa `cakeTime` si existe. |
| Pastel | `cakeSparklers` | Verdadero | Preparar chisperos o bombas de pastel | Pastel | Seguridad y preparacion. |
| Pastel | `cakeBazookas` | Verdadero | Preparar bazukas de color | Pastel | Seguridad y limpieza posterior. |
| Pastel | `cakeSouvenirs` | Verdadero | Coordinar souvenirs de pastel | Pastel | Reparto durante o despues de pastel. |
| Musica | `blockedGenres` | Respondido | Bloquear musica no deseada | Audio/DJ | Interna para DJ. |
| Musica | `djDanceMusic` | Verdadero | Preparar bloque de baile | Audio/DJ | Publica porque puede aparecer en itinerario. |
| Musica | `microphoneNeeded` | Verdadero | Preparar microfono para mensajes | Audio/DJ | Interna de audio. |
| Musica | `projectorNeeded` | Verdadero | Preparar proyector o pantalla | Audio/DJ | Interna de audio. |
| Presentacion | `presentation` | Verdadero | Presentacion del festejado | Sin grupo | Publica; usa `presentationTime` si existe. |
| Presentacion | `characterShow` | Verdadero | Preparar aparicion de personaje; Aparicion de personaje | Animacion personaje | Interna y publica. |
| Presentacion | `photoSession` | Verdadero | Sesion de fotos | Sin grupo | Publica. |
| Presentacion | `surpriseGift` | Verdadero | Preparar sorpresa especial | Sin grupo | Publica. |
| Pinata | `pinata` | Verdadero | Preparar area de pinata; Pinata | Pinata | Interna y publica; la publica usa `pinataTime` si existe. |
| Pinata | `pinataCellophaneBags` | Verdadero | Preparar bolsitas de celofan | Pinata | Interna. |
| Mesas | `reservedTables` | Verdadero | Colocar letreros de reservados | Montaje | Interna. |
| Mesas | `kidsTables` | Verdadero | Montar mesitas infantiles | Montaje | Interna. |
| Menu salon | `salonMenu` | Verdadero | Coordinar menu contratado con salon | Cocina/menu | Interna de cocina. |
| Menu salon | `allergies` | Respondido | Alertar restricciones alimentarias | Cocina/menu | Interna critica. |
| Menu externo | `externalMenu` | Verdadero | Coordinar proveedor o menu externo | Sin grupo | Interna. |
| Cafe/dulces | `coffeeServiceTiming` | Respondido | Coordinar servicio de cafe | Cocina/menu | Interna. |
| Cafe/dulces | `centerpieces` | Verdadero | Colocar centros de mesa | Montaje | Interna. |
| Cafe/dulces | `candyTable` | Verdadero | Preparar mesa de dulces; Mesa de dulces | Dulces | Interna y publica; la tarea publica usa `candyTableTime` si existe. |
| Cafe/dulces | `gelatin` | Verdadero | Coordinar servicio de gelatina | Cocina/menu | Interna. |
| Servicios | `nannyService` | Verdadero | Coordinar servicio de nanny | Sin grupo | Interna. |
| Servicios | `valetCarCount` | Mayor que 0 | Coordinar valet o estacionamiento | Sin grupo | Interna. |
| Servicios | `extraWaiters` | Verdadero | Coordinar meseros adicionales | Sin grupo | Interna. |
| Decoracion | `externalDecoration` | Verdadero | Recibir proveedor de decoracion | Decoracion | Interna. |
| Decoracion | `clientDecoration` | Verdadero | Coordinar decoracion del cliente | Decoracion | Interna. |
| Decoracion | `staffDecorationSupport` | Verdadero | Apoyar decoracion del cliente | Decoracion | Interna. |
| Varios | `photoCanvas` | Verdadero | Colocar lona decorativa | Montaje | Interna. |
| Varios | `giantPhotoFrame` | Verdadero | Colocar marco gigante de fotos | Montaje | Interna. |
| Varios | `candyBags` | Verdadero | Coordinar bolsitas de dulces | Dulces | Interna. |
| Varios | `souvenirs` | Verdadero | Coordinar recuerditos | Dulces | Interna. |
| Dinamicas | `danceGames` | Verdadero | Preparar dinamicas seleccionadas | Animacion dinamicas | Interna para preparar juegos, limites, premios, musica y staff. |
| Dinamicas | `reyPide` | Verdadero | Dinamica Rey pide | Animacion dinamicas | Publica; usa `reyPideTime` si existe. |
| Dinamicas | `lobo` | Verdadero | Dinamica Lobo | Animacion dinamicas | Publica; usa `loboTime` si existe. |
| Dinamicas | `camiseta` | Verdadero | Dinamica Camiseta | Animacion dinamicas | Publica; usa `camisetaTime` si existe. |
| Dinamicas | `gatoGigante` | Verdadero | Dinamica Gato gigante | Animacion dinamicas | Publica; usa `gatoGiganteTime` si existe. |
| Dinamicas | `sillas` | Verdadero | Dinamica Juego de las sillas | Animacion dinamicas | Publica; usa `sillasTime` si existe. |
| Dinamicas | `loteria` | Verdadero | Dinamica Loteria | Animacion dinamicas | Publica; usa `loteriaTime` si existe. |
| Dinamicas | `futbol` | Verdadero | Dinamica Futbol | Animacion dinamicas | Publica; usa `futbolTime` si existe. |
| Dinamicas | `tetrix` | Verdadero | Dinamica Tetrix gigante | Animacion dinamicas | Publica; usa `tetrixTime` si existe. |
| Dinamicas | `chocolateMedals` | Verdadero | Preparar medallas de chocolate | Sin grupo | Interna. |
| Seguridad | `trampolineSocksOption` | Respondido | Confirmar calcetas y seguridad | Sin grupo | Interna. |
| Programa | `foodStartTime` | Respondido | Inicio de comida | Programa cocina | Usa la hora capturada. |
| Programa | `showTime` | Respondido | Show contratado | Sin grupo | Usa la hora capturada. |
| Programa | `chocolateFountainTime` | Respondido | Fuente de chocolate | Programa cocina | Usa la hora capturada. |
| Programa | `popsiclesTime` | Respondido | Paletas | Programa cocina | Usa la hora capturada. |
| Programa | `iceCreamTime` | Respondido | Helados | Programa cocina | Usa la hora capturada. |
| Programa | `tamalesTime` | Respondido | Tamales | Programa cocina | Usa la hora capturada. |
| Programa | `celebratoryDanceTime` | Respondido | Baile del festejado | Sin grupo | Usa la hora capturada. |
| Programa | `otherActivityName` | Respondido | Otra actividad programada | Sin grupo | Usa `otherActivityTime` como horario capturado. |

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
| Horarios relacionados | `cakeTime`, `pinataTime`, `reyPideTime`, `loboTime`, `camisetaTime`, `gatoGiganteTime`, `sillasTime`, `loteriaTime`, `futbolTime`, `tetrixTime` |
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
- Para crear, desactivar u ordenar grupos de asignacion, usar el catalogo de grupos de tareas.
- Para evitar ruido, mantener sin regla las preguntas que solo dan contexto.
