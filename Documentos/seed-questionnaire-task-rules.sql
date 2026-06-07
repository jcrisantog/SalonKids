-- Seed inicial depurado para reglas configurables del cuestionario.
-- Ejecutar despues de aplicar schema.sql y Documentos/seed-operational-master-tasks.sql.
-- Las preguntas sin regla activa quedan como informacion para la duena o como detalle dentro de otra tarea.

CREATE OR REPLACE FUNCTION pg_temp.ensure_questionnaire_rule_task(
  p_field_key TEXT,
  p_field_label TEXT,
  p_section_id TEXT,
  p_section_title TEXT,
  p_operator TEXT,
  p_expected_value JSONB,
  p_task_name TEXT,
  p_task_description TEXT,
  p_area TEXT,
  p_default_role TEXT,
  p_visibility TEXT,
  p_time TIME DEFAULT NULL,
  p_sort_order INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_rule_id UUID;
  current_task_id UUID;
BEGIN
  INSERT INTO public.master_tasks (name, base_description, visibility, area, default_role)
  VALUES (p_task_name, p_task_description, p_visibility, p_area, p_default_role)
  ON CONFLICT (name) DO UPDATE SET
    base_description = EXCLUDED.base_description,
    visibility = EXCLUDED.visibility,
    area = EXCLUDED.area,
    default_role = EXCLUDED.default_role;

  SELECT id INTO current_task_id
  FROM public.master_tasks
  WHERE name = p_task_name;

  SELECT id INTO current_rule_id
  FROM public.questionnaire_task_rules
  WHERE field_key = p_field_key
    AND operator = p_operator
    AND COALESCE(expected_value::text, 'null') = COALESCE(p_expected_value::text, 'null')
  LIMIT 1;

  IF current_rule_id IS NULL THEN
    INSERT INTO public.questionnaire_task_rules (
      field_key,
      field_label,
      section_id,
      section_title,
      operator,
      expected_value,
      is_active
    )
    VALUES (
      p_field_key,
      p_field_label,
      p_section_id,
      p_section_title,
      p_operator,
      p_expected_value,
      TRUE
    )
    RETURNING id INTO current_rule_id;
  ELSE
    UPDATE public.questionnaire_task_rules
    SET
      field_label = p_field_label,
      section_id = p_section_id,
      section_title = p_section_title,
      updated_at = NOW()
    WHERE id = current_rule_id;
  END IF;

  INSERT INTO public.questionnaire_task_rule_tasks (
    rule_id,
    master_task_id,
    override_description,
    override_scheduled_time,
    override_role_responsible,
    override_visibility,
    sort_order
  )
  VALUES (
    current_rule_id,
    current_task_id,
    p_task_description,
    p_time,
    p_default_role,
    p_visibility,
    p_sort_order
  )
  ON CONFLICT (rule_id, master_task_id) DO UPDATE SET
    override_description = EXCLUDED.override_description,
    override_scheduled_time = EXCLUDED.override_scheduled_time,
    override_role_responsible = EXCLUDED.override_role_responsible,
    override_visibility = EXCLUDED.override_visibility,
    sort_order = EXCLUDED.sort_order;
END;
$$;

-- Datos generales
SELECT pg_temp.ensure_questionnaire_rule_task(
  'guestCount',
  'Invitados aproximados',
  'general',
  '1. Datos generales',
  'greater_than',
  '80'::jsonb,
  'Ajustar montaje por aforo alto',
  'Revisar circulacion, mesas, filas de servicio y apoyo extra para eventos con aforo alto.',
  'Montaje',
  'Coordinadora',
  'interna',
  '13:15'
);

-- Pastel
SELECT pg_temp.ensure_questionnaire_rule_task(
  'cake',
  'Habra momento de pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  NULL,
  'Preparar mesa y accesorios de pastel',
  'Preparar mesa, cuchillo, velitas, encendedor, servilletas, souvenirs si aplica y nombres a convocar.',
  'Pastel',
  'Apoyo',
  'interna',
  '17:40',
  0
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cake',
  'Habra momento de pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  NULL,
  'Protocolo de pastel',
  'Conducir el momento de pastel, coordinar audio, luces, menciones, mananitas y convocatoria de familiares.',
  'Pastel',
  'Coordinadora',
  'publica',
  '18:00',
  1
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cakeSparklers',
  'Le interesan chisperos o bombas de humo',
  'cake',
  '2. Momento del pastel',
  'is_true',
  NULL,
  'Preparar chisperos o bombas de pastel',
  'Confirmar tipo, cantidad, ubicacion, seguridad y momento de uso de chisperos o bombas de humo.',
  'Pastel',
  'Coordinadora',
  'interna',
  '17:35'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cakeBazookas',
  'Bazukas de color ($200 c/u)',
  'cake',
  '2. Momento del pastel',
  'is_true',
  NULL,
  'Preparar bazukas de color',
  'Confirmar cantidad de bazukas, responsables de disparo, ubicacion y limpieza posterior.',
  'Pastel',
  'Apoyo',
  'interna',
  '17:35'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cakeSouvenirs',
  'Traera souvenirs para repartir en pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  NULL,
  'Coordinar souvenirs de pastel',
  'Ubicar souvenirs del cliente y coordinar reparto durante o despues del momento de pastel.',
  'Pastel',
  'Apoyo',
  'interna',
  '17:50'
);

-- Musica y ambiente
SELECT pg_temp.ensure_questionnaire_rule_task(
  'blockedGenres',
  'Genero musical que NO desea incluir',
  'music',
  '3. Musica y ambiente',
  'answered',
  NULL,
  'Bloquear musica no deseada',
  'Bloquear generos o canciones indicadas por la familia y avisar al DJ sustituto si aplica.',
  'DJ',
  'DJ',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'djDanceMusic',
  'Desean musica para bailar',
  'music',
  '3. Musica y ambiente',
  'is_true',
  NULL,
  'Preparar bloque de baile',
  'Preparar musica para baile, participacion del staff si aplica y transiciones hacia pastel, pinata o dinamicas.',
  'DJ',
  'DJ',
  'publica',
  '16:45'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'microphoneNeeded',
  'Microfono para mensajes',
  'music',
  '3. Musica y ambiente',
  'is_true',
  NULL,
  'Preparar microfono para mensajes',
  'Probar microfono, pila, volumen y ubicacion para mensajes o protocolo.',
  'Audio',
  'DJ',
  'interna',
  '13:10'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'projectorNeeded',
  'Proyector o pantalla',
  'music',
  '3. Musica y ambiente',
  'is_true',
  NULL,
  'Preparar proyector o pantalla',
  'Probar conexion, energia, visibilidad y contenido que se proyectara durante el evento.',
  'Audio',
  'DJ',
  'interna',
  '13:10'
);

-- Presentacion, personaje, fotos y sorpresas
SELECT pg_temp.ensure_questionnaire_rule_task(
  'presentation',
  'Desea presentacion del festejado(a)',
  'presentation',
  '4. Presentacion del festejado(a)',
  'is_true',
  NULL,
  'Presentacion del festejado',
  'Preparar y realizar presentacion del festejado(a), respetando enfoque, menciones autorizadas y relato indicado.',
  'Protocolo',
  'Coordinadora',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'characterShow',
  'Aparicion de personaje',
  'presentation',
  '4. Presentacion del festejado(a)',
  'is_true',
  NULL,
  'Preparar aparicion de personaje',
  'Tener listo vestuario, entrada, ventilacion, ruta de salida y apoyo para el personaje solicitado.',
  'Animacion',
  'Animacion',
  'interna',
  '17:30',
  0
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'characterShow',
  'Aparicion de personaje',
  'presentation',
  '4. Presentacion del festejado(a)',
  'is_true',
  NULL,
  'Aparicion de personaje',
  'Coordinar entrada del personaje para fotos y dinamica breve con invitados.',
  'Animacion',
  'Animacion',
  'publica',
  '17:45',
  1
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'photoSession',
  'Sesion de fotos',
  'presentation',
  '4. Presentacion del festejado(a)',
  'is_true',
  NULL,
  'Sesion de fotos',
  'Reservar espacio y apoyar a la familia o fotografo durante la sesion de fotos.',
  'Coordinacion',
  'Coordinadora',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'surpriseGift',
  'Sorpresa especial',
  'presentation',
  '4. Presentacion del festejado(a)',
  'is_true',
  NULL,
  'Preparar sorpresa especial',
  'Coordinar momento sorpresa con anfitriones antes de anunciarlo y cuidar que el festejado(a) no lo vea antes de tiempo.',
  'Coordinacion',
  'Coordinadora',
  'publica',
  '18:45'
);

-- Pinata
SELECT pg_temp.ensure_questionnaire_rule_task(
  'pinata',
  'Traera pinata(s)',
  'pinata',
  '5. Pinata',
  'is_true',
  NULL,
  'Preparar area de pinata',
  'Liberar area, revisar cuerda o soporte, palo, bolsitas, dulces, fila de ninos y distancia de seguridad.',
  'Pinata',
  'Apoyo',
  'interna',
  '18:10',
  0
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'pinata',
  'Traera pinata(s)',
  'pinata',
  '5. Pinata',
  'is_true',
  NULL,
  'Pinata',
  'Dirigir la dinamica de pinata con musica, orden de turnos, participacion de adultos si aplica y cierre seguro.',
  'Pinata',
  'Animacion',
  'publica',
  '18:30',
  1
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'pinataCellophaneBags',
  'Requiere bolsitas de celofan ($45)',
  'pinata',
  '5. Pinata',
  'is_true',
  NULL,
  'Preparar bolsitas de celofan',
  'Tener listas bolsitas de celofan para dulces y confirmar forma de entrega al finalizar la pinata.',
  'Pinata',
  'Apoyo',
  'interna',
  '18:00'
);

-- Mesas, menu y comida
SELECT pg_temp.ensure_questionnaire_rule_task(
  'reservedTables',
  'Desea letreros para reservar mesas',
  'tables',
  '6. Mesas, bebidas y manteleria',
  'is_true',
  NULL,
  'Colocar letreros de reservados',
  'Preparar y colocar letreros de reservados segun indicaciones de la familia.',
  'Montaje',
  'Coordinadora',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'kidsTables',
  'Requiere mesitas para ninos de 2 a 8 anos',
  'tables',
  '6. Mesas, bebidas y manteleria',
  'is_true',
  NULL,
  'Montar mesitas infantiles',
  'Preparar mesitas infantiles, sillas, hojas, crayolas o manteleria indicada para ninos.',
  'Montaje',
  'Apoyo',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'salonMenu',
  'Contrato menu con el salon',
  'salon-menu',
  '7. Menu contratado con el salon',
  'is_true',
  NULL,
  'Coordinar menu contratado con salon',
  'Confirmar menu, cantidades, ubicacion de alimentos, servicio infantil, articulos requeridos y notas de cocina.',
  'Cocina',
  'Cocina',
  'interna',
  '15:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'allergies',
  'Alergias o restricciones',
  'salon-menu',
  '7. Menu contratado con el salon',
  'answered',
  NULL,
  'Alertar restricciones alimentarias',
  'Informar a cocina, coordinacion y servicio sobre alergias o restricciones indicadas por la familia.',
  'Cocina',
  'Cocina',
  'interna',
  '13:20'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'externalMenu',
  'Traera servicio externo o alimentos',
  'external-menu',
  '8. Menu externo o alimentos del cliente',
  'is_true',
  NULL,
  'Coordinar proveedor o menu externo',
  'Coordinar ingreso, restricciones, horarios, permisos, servicio infantil y limpieza de alimentos externos.',
  'Coordinacion',
  'Coordinadora',
  'interna',
  '15:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'coffeeServiceTiming',
  'Cuando ofrecer cafe',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'answered',
  NULL,
  'Coordinar servicio de cafe',
  'Preparar y ofrecer cafe en el momento indicado por la familia.',
  'Cocina',
  'Cocina',
  'interna',
  '15:20'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'centerpieces',
  'Traera centros de mesa',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'is_true',
  NULL,
  'Colocar centros de mesa',
  'Recibir, contar y colocar centros de mesa segun cantidad por mesa e indicaciones del cliente.',
  'Montaje',
  'Apoyo',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'candyTable',
  'Ofrecera mesa de dulces',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'is_true',
  NULL,
  'Preparar mesa de dulces',
  'Montar mesa de dulces, cinta curly si aplica, muestras reservadas e indicaciones de inauguracion.',
  'Dulces',
  'Coordinadora',
  'interna',
  '15:30',
  0
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'candyTable',
  'Ofrecera mesa de dulces',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'is_true',
  NULL,
  'Mesa de dulces',
  'Activar o inaugurar mesa de dulces en el horario indicado.',
  'Dulces',
  'Coordinadora',
  'publica',
  NULL,
  1
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'gelatin',
  'Traera gelatina',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'is_true',
  NULL,
  'Coordinar servicio de gelatina',
  'Recibir gelatina, confirmar forma de servicio y coordinar entrega en vasitos o envases.',
  'Cocina',
  'Cocina',
  'interna',
  '15:30'
);

-- Servicios, decoracion y entregables
SELECT pg_temp.ensure_questionnaire_rule_task(
  'nannyService',
  'Requiere servicio The Nanny ($400)',
  'support-services',
  '10. Servicios de apoyo',
  'is_true',
  NULL,
  'Coordinar servicio de nanny',
  'Confirmar horario, espacio, condiciones y responsable del servicio de nanny.',
  'Servicios',
  'Coordinadora',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'valetCarCount',
  'Autos aproximados para valet',
  'support-services',
  '10. Servicios de apoyo',
  'greater_than',
  '0'::jsonb,
  'Coordinar valet o estacionamiento',
  'Compartir numero aproximado de autos, placas registradas y notas de estacionamiento con el responsable.',
  'Servicios',
  'Coordinadora',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'extraWaiters',
  'Requiere meseros adicionales ($400 c/u)',
  'support-services',
  '10. Servicios de apoyo',
  'is_true',
  NULL,
  'Coordinar meseros adicionales',
  'Confirmar cantidad de meseros adicionales, horario, area de apoyo y tareas esperadas.',
  'Servicios',
  'Coordinadora',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'externalDecoration',
  'Contrato servicio externo de decoracion',
  'decoration',
  '11. Decoracion con globos y montaje',
  'is_true',
  NULL,
  'Recibir proveedor de decoracion',
  'Recibir proveedor externo, indicar zonas permitidas, confirmar horario de montaje y restricciones.',
  'Decoracion',
  'Coordinadora',
  'interna',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'clientDecoration',
  'Decorara el salon por su cuenta',
  'decoration',
  '11. Decoracion con globos y montaje',
  'is_true',
  NULL,
  'Coordinar decoracion del cliente',
  'Orientar a la familia sobre ubicaciones permitidas, tiempos de montaje y retiro de decoracion.',
  'Decoracion',
  'Coordinadora',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'staffDecorationSupport',
  'Requiere apoyo del personal para decorar',
  'decoration',
  '11. Decoracion con globos y montaje',
  'is_true',
  NULL,
  'Apoyar decoracion del cliente',
  'Asignar apoyo para colocar decoracion ligera del cliente sin afectar montaje operativo.',
  'Decoracion',
  'Apoyo',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'photoCanvas',
  'Traera lona decorativa',
  'misc',
  '12. Varios y letrero de felicidades',
  'is_true',
  NULL,
  'Colocar lona decorativa',
  'Recibir y colocar lona decorativa en zona autorizada, cuidando fijacion y visibilidad.',
  'Montaje',
  'Apoyo',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'giantPhotoFrame',
  'Traera marco gigante para fotos',
  'misc',
  '12. Varios y letrero de felicidades',
  'is_true',
  NULL,
  'Colocar marco gigante de fotos',
  'Ubicar marco gigante en zona segura para fotos y retirarlo al cierre.',
  'Montaje',
  'Apoyo',
  'interna',
  '13:00'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'candyBags',
  'Traera bolsitas de dulces',
  'misc',
  '12. Varios y letrero de felicidades',
  'is_true',
  NULL,
  'Coordinar bolsitas de dulces',
  'Recibir bolsitas, confirmar momento de entrega y responsable de reparto.',
  'Dulces',
  'Apoyo',
  'interna',
  '17:30'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'souvenirs',
  'Traera recuerditos',
  'misc',
  '12. Varios y letrero de felicidades',
  'is_true',
  NULL,
  'Coordinar recuerditos',
  'Recibir recuerditos, confirmar momento de entrega y quien los repartira.',
  'Coordinacion',
  'Apoyo',
  'interna',
  '17:30'
);

-- Dinamicas y seguridad
SELECT pg_temp.ensure_questionnaire_rule_task(
  'danceGames',
  'Desea dinamicas durante el evento',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Preparar dinamicas seleccionadas',
  'Preparar juegos, participantes, limites, premios, musica y staff requerido para dinamicas.',
  'Animacion',
  'Animacion',
  'publica',
  '16:30'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'chocolateMedals',
  'Medallas de chocolate ($10 c/u)',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Preparar medallas de chocolate',
  'Confirmar cantidad de medallas, costo y momento de entrega durante dinamicas.',
  'Animacion',
  'Animacion',
  'interna',
  '16:20'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'trampolineSocksOption',
  'Opcion para calcetas antiderrapantes',
  'safety',
  '14. Cama elastica y seguridad',
  'answered',
  NULL,
  'Confirmar calcetas y seguridad',
  'Validar opcion de calcetas antiderrapantes o deslinde antes de usar cama elastica, tirolesa u otras atracciones.',
  'Seguridad',
  'Coordinadora',
  'interna',
  '13:00'
);

-- Programa publico
SELECT pg_temp.ensure_questionnaire_rule_task(
  'foodStartTime',
  'Inicio de comida',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Inicio de comida',
  'Iniciar servicio de alimentos segun horario confirmado en el cuestionario.',
  'Cronograma',
  'Cocina',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'showTime',
  'Show contratado',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Show contratado',
  'Coordinar entrada, espacio, audio y apoyo para show contratado.',
  'Cronograma',
  'Coordinadora',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'chocolateFountainTime',
  'Fuente de chocolate',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Fuente de chocolate',
  'Activar fuente de chocolate en horario indicado y coordinar apoyo de servicio.',
  'Cronograma',
  'Cocina',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'popsiclesTime',
  'Paletas',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Paletas',
  'Coordinar servicio de paletas en horario indicado.',
  'Cronograma',
  'Cocina',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'iceCreamTime',
  'Helados',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Helados',
  'Coordinar servicio de helados en horario indicado.',
  'Cronograma',
  'Cocina',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'tamalesTime',
  'Tamales',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Tamales',
  'Coordinar servicio de tamales en horario indicado.',
  'Cronograma',
  'Cocina',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'celebratoryDanceTime',
  'Baile del festejado(a)',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Baile del festejado',
  'Coordinar audio, espacio y convocatoria para baile del festejado(a).',
  'Cronograma',
  'DJ',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'otherActivityTime',
  'Otra actividad',
  'program',
  '15. Programa de actividades',
  'answered',
  NULL,
  'Otra actividad programada',
  'Coordinar actividad adicional indicada por la familia.',
  'Cronograma',
  'Coordinadora',
  'publica',
  NULL
);
