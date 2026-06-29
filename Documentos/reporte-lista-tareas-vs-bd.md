# Reporte ListaTareas vs BD actual

Fecha de revision: 2026-06-26.

Fuente revisada: `Documentos/ListaTareas.txt`.

BD consultada en modo solo lectura:

- `master_tasks`: 78 registros.
- `questionnaire_task_rules`: 53 registros.
- `questionnaire_task_rule_tasks`: 65 relaciones.
- Actividades en `ListaTareas.txt`: 355.

## Criterio de revision

- Se ignoraron las etiquetas visibles como `[Aplica]`, `[No aplica]`, `[Pendiente]` y variantes.
- No se dio de alta una tarea nueva cuando la actividad ya esta cubierta por una tarea maestra existente con otra redaccion.
- No se convirtio cada paso atomico en tarea independiente cuando pertenece a un bloque operativo claro.
- Las reglas nuevas usan solo campos existentes del cuestionario.
- Las actividades sin campo estructurado confiable quedaron como candidatas para consultar con la duena antes de modelarlas.
- Los scripts creados no se ejecutaron contra la BD; quedan listos para revision y ejecucion cuando se autorice.

## Scripts creados

- `Documentos/seed-lista-tareas-master-tasks.sql`
- `Documentos/seed-lista-tareas-questionnaire-rules.sql`

## Tareas dadas de alta

### Tareas base de evento

Estas tareas se siembran como `master_tasks`. Por iniciar con `Entrada -`, `Montaje -` o `Cierre -`, el motor actual las toma como tareas base para eventos nuevos.

| Origen ListaTareas | Tarea maestra | Regla aplicada | Motivo |
| --- | --- | --- | --- |
| 6, 8-12 | Entrada - Atencion a anfitriones e informes | Tarea base | Atencion inicial, bienvenida, recorrido y presentacion del equipo. |
| 1, 5 | Montaje - Sillon rojo y mobiliario especial | Tarea base | Preparacion y resguardo base del sillon rojo. |
| 25, 42-63 | Montaje - Estacion de bebidas y jarras | Tarea base | Estacion, jarras, vitroleros, bebidas, hieleras y servicio de mesa. |
| 64-69 | Montaje - Abastecimiento de vasos hielo y refrescos | Tarea base | Abasto previo de garrafones, hielo, vasos, jarras y refrescos. |
| 70-82 | Montaje - Desechables saleros y servilleteros | Tarea base | Servilletas, saleros, platos, vasos y desechables por servicio. |
| 38, 83-112 | Montaje - Limpieza continua y orden de salon | Tarea base | Limpieza de mesas, sillas, banos, estaciones, pisos, basura y orden durante evento. |
| 113-127 | Montaje - Manteleria y decoracion base | Tarea base | Manteles, cortina de luces, tapete y decoracion base autorizada. |
| 135-145 | Montaje - Fruta frituras y botanas | Tarea base | Preparacion de fruta, frituras, condimentos y botanas. |
| 39-40, 146-164 | Montaje - Areas de juego y equipo recreativo | Tarea base | Juegos de mesa, fomies, futbolito, billar, hockey, pelotas, colchones y globos. |
| 41, 152, 163 | Cierre - Resguardar juegos y mobiliario recreativo | Tarea base | Guardado de juegos, tapas, colchones y equipo recreativo al cierre. |

### Tareas generadas por reglas

Estas tareas se siembran como `master_tasks` y el segundo script agrega la regla o relacion regla-tarea correspondiente.

| Origen ListaTareas | Tarea maestra | Regla aplicada | Hora desde |
| --- | --- | --- | --- |
| 2-4 | Pastel - Gestionar sillon rojo | `cake is_true true` | `cakeTime` |
| 315, 317-319 | Pastel - Servicio de pastel a invitados | `cake is_true true` | `cakeTime` |
| 132 | Pastel - Repartir accesorios de celebracion | `cake is_true true` | `cakeTime` |
| 15, 225 | Batukada de pastel | `cakeBatucada is_true true` | `cakeTime` |
| 325-335 | Servicio de cafe - Preparacion y reparto | `coffeeServiceTiming equals ...` | `cakeTime`, `arrivalTime` o `foodEndTime` segun opcion |
| 179-190 | Pinata - Repartir bolsitas y dulces | `pinata is_true true` | `pinataTime` |
| 191-193 | Dinamica de superheroes previa a pinata | `pinataStaffDynamic is_true true` | `pinataTime` |
| 197 | Juego del Rey Pide | `reyPide is_true true` | `reyPideTime` |
| 196 | Juego de las sillas | `sillas is_true true` | `sillasTime` |
| 207-209 | Juego de la camiseta | `camiseta is_true true` | `camisetaTime` |
| 210 | Juego de loteria | `loteria is_true true` | `loteriaTime` |
| 216-224 | Futbol - Porras arbitraje y premios | `futbol is_true true` | `futbolTime` |
| 232, 250-252, 263-265, 338 | Comida adultos - Servicio en mesas y comandas | `adultMenu answered` | `foodStartTime` |
| 240-249 | Comida adultos - Taquiza artesanal | `adultMenu contains "taquiza"` | `foodStartTime` |
| 266-279, 337 | Menu infantil - Servicio y supervision | `kidsMenu answered` | `foodStartTime` |
| 320-324 | Gelatina - Preparacion y servicio | `gelatin is_true true` | `cakeTime` |

## Tareas ignoradas y motivo

| Origen ListaTareas | Motivo de omision | Cubierta por / nota |
| --- | --- | --- |
| 7 | Cubierta por tarea existente | `Montaje - Recepcion de familia y articulos` cubre apoyo con cosas de anfitriones. |
| 13-14 | Cubierta por tarea existente | `Presentacion del festejado` ya genera la actividad y preparacion. |
| 16-24, 26-29, 34 | Cubierta por tarea existente | `Montaje - Mesas y flujo de invitados`; detalles de acomodo no se duplican como tareas atomicas. |
| 30-32, 282-286 | Cubierta por tarea existente | `Preparar mesa de dulces` y `Mesa de dulces`. |
| 33, 35, 37 | Detalle de tarea mas amplia | Quedan dentro de montaje general o menu; no tienen disparador propio necesario. |
| 36, 304, 340 | Candidata sin campo confiable | Pintacaritas requiere confirmar con la duena si sera servicio estructurado, actividad programada o detalle operativo. |
| 47-48, 62, 69 | Detalle de tarea mas amplia | Quedan dentro de `Montaje - Estacion de bebidas y jarras` o `Montaje - Abastecimiento de vasos hielo y refrescos`. |
| 73-74 | No accionable como tarea independiente | Pedir/vender servilletas es contingencia; queda dentro de desechables. |
| 88-91 | Detalle de tarea mas amplia | Quedan dentro de `Montaje - Limpieza continua y orden de salon`. |
| 115-116, 121-122 | Detalle de tarea mas amplia | Quedan dentro de manteleria/decoracion base o mesitas infantiles existentes. |
| 128-131 | Cubierta por tareas existentes | `Colocar lona decorativa`, `Colocar marco gigante de fotos` y montaje base. |
| 133-134 | Cubierta por tareas existentes | `Coordinar souvenirs de pastel` o `Coordinar recuerditos`. |
| 165 | Cubierta por tarea existente | `Montar mesitas infantiles`. |
| 166-178, 182-185 | Cubierta por tareas existentes | `Preparar area de pinata`, `Pinata` y `Preparar pinata configurable`. |
| 172-174, 183, 186 | Detalle de regla existente | Son variantes de configuracion de pinata; no se duplican como tareas independientes. |
| 194-195 | Requiere decision operativa | No hay campo propio para "Spiderman carga al festejado" o disfraces de pastel; podria agregarse en futuro. |
| 198-206 | Cubierta por tareas existentes | `Juego Gato Gigante`, `Preparar Juego Gato Gigante`, `Juego de Tetris` y `Preparar Juego Tetris`. |
| 211 | Cubierta por tarea existente | `Juego de Lobo` y `Preparar Juego del Lobo`. |
| 212 | Candidata sin campo confiable | "Juego de Basta" no existe como campo estructurado actual. |
| 213-215, 219 | Cubierta por tareas existentes | `Partido de Futbol` y `Preparar campo de futbol`; los detalles nuevos se agregaron en `Futbol - Porras arbitraje y premios`. |
| 226-227, 230-231 | Candidata sin campo confiable | Coreografia, animacion general, desfile o canto previo no tienen campo propio confiable. |
| 229, 355 | Cubierta por tarea existente | `Preparar bloque de baile` y `Bloque de Baile`. |
| 233-239, 253-262 | Cubierta por reglas generales de menu | `Coordinar menu contratado con salon`, `Coordinar proveedor o menu externo` y nuevas tareas de comida cubren el flujo sin duplicar cada platillo. |
| 254-258 | Detalle de menu | Son variantes de comida que se capturan en `adultMenu` o menu externo; no se siembran reglas por platillo salvo taquiza. |
| 259 | Cubierta por tarea existente | `Coordinar proveedor o menu externo`. |
| 260-262 | Detalle de tarea mas amplia | Quedan dentro de servicio adulto o menu externo. |
| 280-281 | Detalle de menu infantil | Quedan dentro de `Menu infantil - Servicio y supervision` o menu externo si aplica. |
| 287-289 | Cubierta por tarea existente | `Fuente de chocolate`. |
| 290-291 | Candidata sin campo confiable | Brochetas/banderillas no tienen campo estructurado; requieren opcion futura o captura en otra actividad. |
| 292-295, 347 | Candidata sin campo confiable | Elotes/esquites requiere confirmar si se capturara como servicio estructurado o actividad especial. |
| 296-300, 350 | Cubierta por tareas existentes | `Paletas` y `Helados`; no se duplican pasos de congeladora o reparto. |
| 301, 351 | Candidata sin campo confiable | Servicio de nieves requiere campo o decision operativa futura. |
| 302, 349 | Candidata sin campo confiable | Servicio de bolis requiere campo o decision operativa futura. |
| 303, 348 | Candidata sin campo confiable | Servicio de postres requiere campo o decision operativa futura. |
| 305-306, 346 | Cubierta por tarea existente | `Tamales`. |
| 307-310, 353 | Cubierta por tarea existente | `Show contratado`. |
| 311 | Cubierta por tarea existente | `Coordinar servicio de nanny`. |
| 312-314 | Candidata sin campo confiable | Servicio de espiropapas requiere campo o decision operativa futura. |
| 316 | Candidata sin campo confiable | Cargar al festejado en pastel requiere confirmacion/campo especifico por seguridad. |
| 336 | Candidata sin campo confiable | Desayuno requiere confirmar con la duena si se manejara como servicio estructurado o actividad especial. |
| 339 | Candidata sin campo confiable | Celebracion liturgica no tiene campo estructurado actual. |
| 341 | Cubierta por tarea existente y regla nueva | `Partido de Futbol` y `Futbol - Porras arbitraje y premios`. |
| 342 | Cubierta por tarea existente | `Pinata` usa `pinataTime`. |
| 343 | Cubierta por tarea existente | `Pastel` y tareas nuevas usan `cakeTime`. |
| 344 | Candidata sin campo confiable | Mariachi requiere confirmar si se manejara como servicio estructurado o actividad especial. |
| 345 | Candidata sin campo confiable | Concursos por anfitriones no tienen campo estructurado actual. |
| 352 | Candidata sin campo confiable | Karaoke requiere confirmar si se manejara como servicio estructurado o actividad especial. |
| 354 | Cubierta por tarea existente | `Preparar dinamicas seleccionadas` cubre animacion general cuando hay dinamicas. |

## Actividades candidatas para campos nuevos

Estas actividades no se sembraron como reglas automaticas porque hoy no existe un campo especifico o la deteccion por texto libre seria fragil:

- Spiderman carga al festejado antes de pinata.
- Disfraces en actividad del pastel.
- Juego de Basta.
- Coreografia de chicas fantasia.
- Animacion general como servicio separado.
- Desfile de disfraces.
- Canto del festejado antes de pinata.
- Desayuno.
- Pintacaritas.
- Brochetas con fruta y banderillas.
- Elotes/esquites.
- Nieves.
- Bolis.
- Postres.
- Espiropapas.
- Karaoke.
- Mariachi.
- Cargar al festejado a la hora del pastel.
- Celebracion liturgica.
- Concursos por parte de anfitriones.

## Resumen de altas

- Tareas maestras nuevas en seed: 26.
- Relaciones regla-tarea nuevas o actualizadas en seed: 19.
- Scripts idempotentes: si se reejecutan, usan `ON CONFLICT` por nombre de tarea y por relacion `(rule_id, master_task_id)`.
- Los seeds no ejecutan `DELETE`, no borran reglas y no recalculan eventos existentes.
