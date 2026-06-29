-- Seed de reglas faltantes derivadas de Documentos/ListaTareas.txt.
-- Ejecutar despues de schema.sql y Documentos/seed-lista-tareas-master-tasks.sql.
-- Este script es idempotente: no borra reglas ni tareas y no duplica relaciones.

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
  p_override_time TIME DEFAULT NULL,
  p_schedule_source_field_key TEXT DEFAULT NULL,
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
    p_override_time,
    p_schedule_source_field_key,
    p_default_role,
    p_visibility,
    p_sort_order
  )
  ON CONFLICT (rule_id, master_task_id) DO UPDATE SET
    override_description = EXCLUDED.override_description,
    override_scheduled_time = EXCLUDED.override_scheduled_time,
    schedule_source_field_key = EXCLUDED.schedule_source_field_key,
    override_role_responsible = EXCLUDED.override_role_responsible,
    override_visibility = EXCLUDED.override_visibility,
    sort_order = EXCLUDED.sort_order;
END;
$$;

-- Pastel
SELECT pg_temp.ensure_questionnaire_rule_task(
  'cake',
  'Habra momento de pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  'true'::jsonb,
  'Pastel - Gestionar sillon rojo',
  'Sacar el sillon rojo, colocarlo frente a la mesa de pastel y regresarlo a oficina despues del momento de pastel.',
  'Pastel',
  'Apoyo',
  'interna',
  NULL,
  'cakeTime',
  3,
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cake',
  'Habra momento de pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  'true'::jsonb,
  'Pastel - Servicio de pastel a invitados',
  'Repartir pastel primero a anfitriones y despues a invitados, apoyando a colocar porciones en platos y coordinando el flujo de servicio.',
  'Pastel',
  'Apoyo',
  'interna',
  NULL,
  'cakeTime',
  4,
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cake',
  'Habra momento de pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  'true'::jsonb,
  'Pastel - Repartir accesorios de celebracion',
  'Tener listos y repartir sombreros, mascaras u otros accesorios autorizados para la actividad de pastel.',
  'Pastel',
  'Animacion',
  'interna',
  NULL,
  'cakeTime',
  5,
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'cakeBatucada',
  'Batukada a la hora del pastel',
  'cake',
  '2. Momento del pastel',
  'is_true',
  'true'::jsonb,
  'Batukada de pastel',
  'Preparar tambores, matracas o cornetas y coordinar la batukada solicitada durante el momento de pastel.',
  'Animacion',
  'Animacion',
  'publica',
  NULL,
  'cakeTime',
  0,
  'pastel',
  'Pastel'
);

-- Cafe. Se crean relaciones por opcion para respetar el horario operativo.
SELECT pg_temp.ensure_questionnaire_rule_task(
  'coffeeServiceTiming',
  'Cuando ofrecer cafe',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'equals',
  '"Con el pastel"'::jsonb,
  'Servicio de cafe - Preparacion y reparto',
  'Subir vasos termicos, preparar azucar, cucharitas, servilletas y cafeteras cuando aplique; repartir cafe en el momento indicado.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'cakeTime',
  1,
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'coffeeServiceTiming',
  'Cuando ofrecer cafe',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'equals',
  '"Al inicio"'::jsonb,
  'Servicio de cafe - Preparacion y reparto',
  'Subir vasos termicos, preparar azucar, cucharitas, servilletas y cafeteras cuando aplique; repartir cafe en el momento indicado.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'arrivalTime',
  1,
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'coffeeServiceTiming',
  'Cuando ofrecer cafe',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'equals',
  '"Durante todo el evento"'::jsonb,
  'Servicio de cafe - Preparacion y reparto',
  'Subir vasos termicos, preparar azucar, cucharitas, servilletas y cafeteras cuando aplique; repartir cafe en el momento indicado.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'arrivalTime',
  1,
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'coffeeServiceTiming',
  'Cuando ofrecer cafe',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'equals',
  '"Despues de comer"'::jsonb,
  'Servicio de cafe - Preparacion y reparto',
  'Subir vasos termicos, preparar azucar, cucharitas, servilletas y cafeteras cuando aplique; repartir cafe en el momento indicado.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'foodEndTime',
  1,
  'cocina-menu',
  'Cocina/menu'
);

-- Pinata y dinamicas asociadas.
SELECT pg_temp.ensure_questionnaire_rule_task(
  'pinata',
  'Traera pinata(s)',
  'pinata',
  '5. Pinata',
  'is_true',
  'true'::jsonb,
  'Pinata - Repartir bolsitas y dulces',
  'Pedir o preparar bolsitas, colocarlas en punto visible, repartirlas al romperse la pinata y apoyar el reparto de dulces al final.',
  'Pinata',
  'Apoyo',
  'interna',
  NULL,
  'pinataTime',
  3,
  'pinata',
  'Pinata'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'pinataStaffDynamic',
  'Dinamica previa con personajes del staff',
  'pinata',
  '5. Pinata',
  'is_true',
  'true'::jsonb,
  'Dinamica de superheroes previa a pinata',
  'Preparar disfraces, convocar a ninos y realizar dinamica de superheroes antes de la pinata cuando la familia la solicite.',
  'Animacion',
  'Animacion',
  'publica',
  NULL,
  'pinataTime',
  0,
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'reyPide',
  'Rey pide / Simon says',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  'true'::jsonb,
  'Juego del Rey Pide',
  'Preparar indicaciones, premios si aplica y conducir la dinamica Rey Pide o Simon Says en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  NULL,
  'reyPideTime',
  0,
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'sillas',
  'Juego de las sillas',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  'true'::jsonb,
  'Juego de las sillas',
  'Preparar sillas, musica, espacio seguro y participantes para la dinamica de sillas en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  NULL,
  'sillasTime',
  0,
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'camiseta',
  'Camiseta',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  'true'::jsonb,
  'Juego de la camiseta',
  'Tener camisetas listas, formar equipos y conducir la dinamica de camiseta en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  NULL,
  'camisetaTime',
  0,
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'loteria',
  'Loteria',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  'true'::jsonb,
  'Juego de loteria',
  'Preparar material, convocar participantes y conducir la dinamica de loteria en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  NULL,
  'loteriaTime',
  0,
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'futbol',
  'Partidos de futbol',
  'dynamics',
  '13. Dinamicas durante el evento',
  'is_true',
  'true'::jsonb,
  'Futbol - Porras arbitraje y premios',
  'Organizar porristas, repartir tambores, designar arbitro, entrenador y narrador, controlar cierre del partido y entregar premios indicados.',
  'Juegos',
  'Animacion',
  'interna',
  NULL,
  'futbolTime',
  2,
  'animacion-dinamicas',
  'Animacion dinamicas'
);

-- Comida y menu.
SELECT pg_temp.ensure_questionnaire_rule_task(
  'adultMenu',
  'Menu elegido para adultos',
  'salon-menu',
  '7. Menu contratado con el salon',
  'answered',
  NULL,
  'Comida adultos - Servicio en mesas y comandas',
  'Asignar mesas al personal de apoyo, repartir comandas, escribir pedidos, llevar comida a mesas y preguntar por faltantes durante el servicio.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'foodStartTime',
  0,
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'adultMenu',
  'Menu elegido para adultos',
  'salon-menu',
  '7. Menu contratado con el salon',
  'contains',
  '"taquiza"'::jsonb,
  'Comida adultos - Taquiza artesanal',
  'Colocar guisados, montaje de barro, tortillas, salsas, platos y cubiertos; servir tacos iniciales y rellenar guisados o tortillas.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'foodStartTime',
  1,
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'kidsMenu',
  'Menu elegido para ninos',
  'salon-menu',
  '7. Menu contratado con el salon',
  'answered',
  NULL,
  'Menu infantil - Servicio y supervision',
  'Colocar menu infantil, servir platitos, hidratar a ninos, vigilar mientras comen y apoyar a ninos pequenos para evitar atragantamientos.',
  'Cocina',
  'Apoyo',
  'interna',
  NULL,
  'foodStartTime',
  0,
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_questionnaire_rule_task(
  'gelatin',
  'Traera gelatina',
  'coffee-candy',
  '9. Cafe, centros de mesa, dulces y gelatina',
  'is_true',
  'true'::jsonb,
  'Gelatina - Preparacion y servicio',
  'Colocar gelatinas en charolas o congeladora, cortar o servir en vasitos y coordinar entrega junto al pastel cuando aplique.',
  'Cocina',
  'Cocina',
  'interna',
  NULL,
  'cakeTime',
  1,
  'cocina-menu',
  'Cocina/menu'
);
