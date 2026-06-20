-- Seed inicial depurado para reglas configurables del cuestionario.
-- Ejecutar despues de aplicar schema.sql y Documentos/seed-operational-master-tasks.sql.
-- Las preguntas sin regla activa quedan como informacion para la duena o como detalle dentro de otra tarea.

CREATE OR REPLACE FUNCTION pg_temp.ensure_task_group(
  p_assignment_group_key TEXT,
  p_assignment_group_label TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  current_group_id UUID;
BEGIN
  IF p_assignment_group_key IS NULL OR p_assignment_group_key = '' THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.task_groups (
    key,
    name
  )
  VALUES (
    p_assignment_group_key,
    COALESCE(NULLIF(p_assignment_group_label, ''), p_assignment_group_key)
  )
  ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW()
  RETURNING id INTO current_group_id;

  RETURN current_group_id;
END;
$$;

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
  p_sort_order INTEGER DEFAULT 0,
  p_assignment_group_key TEXT DEFAULT NULL,
  p_assignment_group_label TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_rule_id UUID;
  current_task_id UUID;
  current_group_id UUID;
BEGIN
  current_group_id := pg_temp.ensure_task_group(p_assignment_group_key, p_assignment_group_label);

  INSERT INTO public.master_tasks (
    name,
    base_description,
    visibility,
    area,
    default_role,
    assignment_group_id,
    assignment_group_key,
    assignment_group_label
  )
  VALUES (
    p_task_name,
    p_task_description,
    p_visibility,
    p_area,
    p_default_role,
    current_group_id,
    p_assignment_group_key,
    p_assignment_group_label
  )
  ON CONFLICT (name) DO UPDATE SET
    base_description = EXCLUDED.base_description,
    visibility = EXCLUDED.visibility,
    area = EXCLUDED.area,
    default_role = EXCLUDED.default_role,
    assignment_group_id = EXCLUDED.assignment_group_id,
    assignment_group_key = EXCLUDED.assignment_group_key,
    assignment_group_label = EXCLUDED.assignment_group_label;

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
    schedule_source_field_key,
    override_role_responsible,
    override_visibility,
    sort_order
  )
  VALUES (
    current_rule_id,
    current_task_id,
    p_task_description,
    p_time,
    NULL,
    p_default_role,
    p_visibility,
    p_sort_order
  )
  ON CONFLICT (rule_id, master_task_id) DO UPDATE SET
    override_description = EXCLUDED.override_description,
    override_scheduled_time = EXCLUDED.override_scheduled_time,
    schedule_source_field_key = COALESCE(public.questionnaire_task_rule_tasks.schedule_source_field_key, EXCLUDED.schedule_source_field_key),
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
  NULL,
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
  NULL,
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
  'interna',
  '16:30'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'reyPide',
  'Rey pide / Simon says',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Rey pide',
  'Activar Rey pide / Simon says con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'lobo',
  'Lobo, estas ahi',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Lobo',
  'Activar Lobo, estas ahi con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'camiseta',
  'Camiseta',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Camiseta',
  'Activar dinamica de camiseta con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'gatoGigante',
  'Gato gigante',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Gato gigante',
  'Activar Gato gigante con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'sillas',
  'Juego de las sillas',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Juego de las sillas',
  'Activar juego de las sillas con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'loteria',
  'Loteria',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Loteria',
  'Activar loteria con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'futbol',
  'Partidos de futbol',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Futbol',
  'Activar partidos de futbol con modalidad, duracion y participantes indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'tetrix',
  'Tetrix gigante',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  NULL,
  'Dinamica Tetrix gigante',
  'Activar Tetrix gigante con participantes y limites indicados por la familia.',
  'Animacion',
  'Animacion',
  'publica',
  NULL
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
UPDATE public.questionnaire_task_rules old_rule
SET
  field_key = 'otherActivityName',
  field_label = 'Otra actividad',
  updated_at = NOW()
WHERE old_rule.field_key = 'otherActivityTime'
  AND old_rule.section_id = 'program'
  AND NOT EXISTS (
    SELECT 1
    FROM public.questionnaire_task_rules existing_rule
    WHERE existing_rule.field_key = 'otherActivityName'
      AND existing_rule.operator = old_rule.operator
      AND COALESCE(existing_rule.expected_value::text, 'null') = COALESCE(old_rule.expected_value::text, 'null')
  );

UPDATE public.questionnaire_task_rules old_rule
SET
  is_active = FALSE,
  updated_at = NOW()
WHERE old_rule.field_key = 'otherActivityTime'
  AND old_rule.section_id = 'program';

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
  'otherActivityName',
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

-- Fuentes de horario capturadas en campos relacionados.
WITH schedule_sources(rule_field_key, task_name, source_field_key) AS (
  VALUES
    ('presentation', 'Presentacion del festejado', 'presentationTime'),
    ('photoSession', 'Sesion de fotos', 'photoSessionTime'),
    ('externalDecoration', 'Recibir proveedor de decoracion', 'decoratorArrivalTime'),
    ('cake', 'Protocolo de pastel', 'cakeTime'),
    ('pinata', 'Pinata', 'pinataTime'),
    ('candyTable', 'Mesa de dulces', 'candyTableTime'),
    ('otherActivityName', 'Otra actividad programada', 'otherActivityTime'),
    ('reyPide', 'Dinamica Rey pide', 'reyPideTime'),
    ('lobo', 'Dinamica Lobo', 'loboTime'),
    ('camiseta', 'Dinamica Camiseta', 'camisetaTime'),
    ('gatoGigante', 'Dinamica Gato gigante', 'gatoGiganteTime'),
    ('sillas', 'Dinamica Juego de las sillas', 'sillasTime'),
    ('loteria', 'Dinamica Loteria', 'loteriaTime'),
    ('futbol', 'Dinamica Futbol', 'futbolTime'),
    ('tetrix', 'Dinamica Tetrix gigante', 'tetrixTime')
)
UPDATE public.questionnaire_task_rule_tasks rule_task
SET schedule_source_field_key = schedule_sources.source_field_key
FROM schedule_sources
JOIN public.questionnaire_task_rules rule ON rule.field_key = schedule_sources.rule_field_key
JOIN public.master_tasks task ON task.name = schedule_sources.task_name
WHERE rule_task.rule_id = rule.id
  AND rule_task.master_task_id = task.id
  AND rule.field_key = schedule_sources.rule_field_key;

-- Agrupaciones de asignacion iniciales.
-- Las tareas no listadas quedan sin grupo para conservar asignacion individual.
WITH grouped(task_name, assignment_group_key, assignment_group_label) AS (
  VALUES
    ('Preparar mesa y accesorios de pastel', 'pastel', 'Pastel'),
    ('Protocolo de pastel', 'pastel', 'Pastel'),
    ('Preparar chisperos o bombas de pastel', 'pastel', 'Pastel'),
    ('Preparar bazukas de color', 'pastel', 'Pastel'),
    ('Coordinar souvenirs de pastel', 'pastel', 'Pastel'),
    ('Bloquear musica no deseada', 'audio-dj', 'Audio/DJ'),
    ('Preparar bloque de baile', 'audio-dj', 'Audio/DJ'),
    ('Preparar microfono para mensajes', 'audio-dj', 'Audio/DJ'),
    ('Preparar proyector o pantalla', 'audio-dj', 'Audio/DJ'),
    ('Preparar aparicion de personaje', 'animacion-personaje', 'Animacion personaje'),
    ('Aparicion de personaje', 'animacion-personaje', 'Animacion personaje'),
    ('Preparar dinamicas seleccionadas', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Rey pide', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Lobo', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Camiseta', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Gato gigante', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Juego de las sillas', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Loteria', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Futbol', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Dinamica Tetrix gigante', 'animacion-dinamicas', 'Animacion dinamicas'),
    ('Preparar area de pinata', 'pinata', 'Pinata'),
    ('Pinata', 'pinata', 'Pinata'),
    ('Preparar bolsitas de celofan', 'pinata', 'Pinata'),
    ('Colocar letreros de reservados', 'montaje', 'Montaje'),
    ('Montar mesitas infantiles', 'montaje', 'Montaje'),
    ('Colocar centros de mesa', 'montaje', 'Montaje'),
    ('Colocar lona decorativa', 'montaje', 'Montaje'),
    ('Colocar marco gigante de fotos', 'montaje', 'Montaje'),
    ('Coordinar menu contratado con salon', 'cocina-menu', 'Cocina/menu'),
    ('Alertar restricciones alimentarias', 'cocina-menu', 'Cocina/menu'),
    ('Coordinar servicio de cafe', 'cocina-menu', 'Cocina/menu'),
    ('Coordinar servicio de gelatina', 'cocina-menu', 'Cocina/menu'),
    ('Preparar mesa de dulces', 'dulces', 'Dulces'),
    ('Mesa de dulces', 'dulces', 'Dulces'),
    ('Coordinar bolsitas de dulces', 'dulces', 'Dulces'),
    ('Coordinar recuerditos', 'dulces', 'Dulces'),
    ('Recibir proveedor de decoracion', 'decoracion', 'Decoracion'),
    ('Coordinar decoracion del cliente', 'decoracion', 'Decoracion'),
    ('Apoyar decoracion del cliente', 'decoracion', 'Decoracion'),
    ('Inicio de comida', 'programa-cocina', 'Programa cocina'),
    ('Fuente de chocolate', 'programa-cocina', 'Programa cocina'),
    ('Paletas', 'programa-cocina', 'Programa cocina'),
    ('Helados', 'programa-cocina', 'Programa cocina'),
    ('Tamales', 'programa-cocina', 'Programa cocina')
),
ensured_groups AS (
  INSERT INTO public.task_groups (key, name)
  SELECT DISTINCT assignment_group_key, assignment_group_label
  FROM grouped
  ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW()
  RETURNING id, key
)
UPDATE public.master_tasks
SET assignment_group_id = ensured_groups.id,
    assignment_group_key = grouped.assignment_group_key,
    assignment_group_label = grouped.assignment_group_label
FROM grouped
JOIN ensured_groups ON ensured_groups.key = grouped.assignment_group_key
WHERE public.master_tasks.name = grouped.task_name;
