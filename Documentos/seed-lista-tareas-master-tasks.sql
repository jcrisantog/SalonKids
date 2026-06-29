-- Seed de tareas maestras faltantes derivadas de Documentos/ListaTareas.txt.
-- Ejecutar despues de schema.sql.
-- Este script es idempotente: no borra datos y conserva una sola tarea por nombre.

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

CREATE OR REPLACE FUNCTION pg_temp.ensure_master_task(
  p_task_name TEXT,
  p_task_description TEXT,
  p_area TEXT,
  p_default_role TEXT,
  p_visibility TEXT,
  p_assignment_group_key TEXT DEFAULT NULL,
  p_assignment_group_label TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
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
END;
$$;

-- Tareas base: se generan para eventos nuevos por el motor actual al iniciar con
-- Entrada -, Montaje - o Cierre -.

SELECT pg_temp.ensure_master_task(
  'Entrada - Atencion a anfitriones e informes',
  'Recibir a anfitriones desde la entrada, dar bienvenida, mostrar areas del salon, reunir al equipo para presentarse y ofrecer agua, fruta o frituras cuando aplique.',
  'Entrada',
  'Coordinadora',
  'interna',
  'entrada-atencion',
  'Entrada atencion'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Sillon rojo y mobiliario especial',
  'Colocar el sillon rojo en oficina, validar que este disponible para pastel si aplica y dejar identificado su resguardo al cierre.',
  'Montaje',
  'Apoyo',
  'interna',
  'montaje',
  'Montaje'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Estacion de bebidas y jarras',
  'Colocar estacion de bebidas, vitroleros o jarras de agua natural y de sabor, servilletas, hieleras y vasos segun montaje del evento.',
  'Montaje',
  'Apoyo',
  'interna',
  'montaje-bebidas',
  'Montaje bebidas'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Abastecimiento de vasos hielo y refrescos',
  'Subir vasos y jarras de bodega, preparar bolsas de hielo, colocar refrescos, garrafones y material de bebidas en cocina o estacion.',
  'Montaje',
  'Apoyo',
  'interna',
  'montaje-bebidas',
  'Montaje bebidas'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Desechables saleros y servilleteros',
  'Rellenar saleros y servilleteros, colocar desechables para adultos, ninos, fruta, cafe y frituras segun el servicio contratado.',
  'Montaje',
  'Apoyo',
  'interna',
  'montaje-servicio',
  'Montaje servicio'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Limpieza continua y orden de salon',
  'Limpiar mesas, sillas, estacion de bebidas, resbaladilla, fomies y banos; mantener mesas limpias, retirar platos y trapear cuando sea necesario.',
  'Limpieza',
  'Limpieza',
  'interna',
  'limpieza-orden',
  'Limpieza y orden'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Manteleria y decoracion base',
  'Colocar manteles en mesas, mesa de regalos, estacion de bebidas o cafe; conectar cortina de luces y colocar tapete o decoracion base autorizada.',
  'Montaje',
  'Apoyo',
  'interna',
  'montaje',
  'Montaje'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Fruta frituras y botanas',
  'Preparar bolsitas o charolas de fruta y frituras, agregar condimentos, colocar tenedores y tener botanas listas para anfitriones o invitados.',
  'Cocina',
  'Cocina',
  'interna',
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Areas de juego y equipo recreativo',
  'Preparar juegos de mesa, fomies, futbolito, billar, basketball, football, hockey, colchones, globos y tapas de mesas de juego.',
  'Juegos',
  'Apoyo',
  'interna',
  'montaje-juegos',
  'Montaje juegos'
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Resguardar juegos y mobiliario recreativo',
  'Recoger juegos de mesa, volver a colocar tapas de mesas de juego, bajar colchones y resguardar pelotas, tacos, manerales y piezas recreativas.',
  'Cierre',
  'Apoyo',
  'interna',
  'cierre-apoyo',
  'Cierre apoyo'
);

-- Tareas que se usaran desde reglas de cuestionario.

SELECT pg_temp.ensure_master_task(
  'Pastel - Gestionar sillon rojo',
  'Sacar el sillon rojo, colocarlo frente a la mesa de pastel y regresarlo a oficina despues del momento de pastel.',
  'Pastel',
  'Apoyo',
  'interna',
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_master_task(
  'Pastel - Servicio de pastel a invitados',
  'Repartir pastel primero a anfitriones y despues a invitados, apoyando a colocar porciones en platos y coordinando el flujo de servicio.',
  'Pastel',
  'Apoyo',
  'interna',
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_master_task(
  'Pastel - Repartir accesorios de celebracion',
  'Tener listos y repartir sombreros, mascaras u otros accesorios autorizados para la actividad de pastel.',
  'Pastel',
  'Animacion',
  'interna',
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_master_task(
  'Servicio de cafe - Preparacion y reparto',
  'Subir vasos termicos, preparar azucar, cucharitas, servilletas y cafeteras cuando aplique; repartir cafe en el momento indicado.',
  'Cocina',
  'Cocina',
  'interna',
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_master_task(
  'Batukada de pastel',
  'Preparar tambores, matracas o cornetas y coordinar la batukada solicitada durante el momento de pastel.',
  'Animacion',
  'Animacion',
  'publica',
  'pastel',
  'Pastel'
);

SELECT pg_temp.ensure_master_task(
  'Pinata - Repartir bolsitas y dulces',
  'Pedir o preparar bolsitas, colocarlas en punto visible, repartirlas al romperse la pinata y apoyar el reparto de dulces al final.',
  'Pinata',
  'Apoyo',
  'interna',
  'pinata',
  'Pinata'
);

SELECT pg_temp.ensure_master_task(
  'Dinamica de superheroes previa a pinata',
  'Preparar disfraces, convocar a ninos y realizar dinamica de superheroes antes de la pinata cuando la familia la solicite.',
  'Animacion',
  'Animacion',
  'publica',
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_master_task(
  'Juego del Rey Pide',
  'Preparar indicaciones, premios si aplica y conducir la dinamica Rey Pide o Simon Says en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_master_task(
  'Juego de las sillas',
  'Preparar sillas, musica, espacio seguro y participantes para la dinamica de sillas en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_master_task(
  'Juego de la camiseta',
  'Tener camisetas listas, formar equipos y conducir la dinamica de camiseta en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_master_task(
  'Juego de loteria',
  'Preparar material, convocar participantes y conducir la dinamica de loteria en el horario indicado.',
  'Juegos',
  'Animacion',
  'publica',
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_master_task(
  'Futbol - Porras arbitraje y premios',
  'Organizar porristas, repartir tambores, designar arbitro, entrenador y narrador, controlar cierre del partido y entregar premios indicados.',
  'Juegos',
  'Animacion',
  'interna',
  'animacion-dinamicas',
  'Animacion dinamicas'
);

SELECT pg_temp.ensure_master_task(
  'Comida adultos - Servicio en mesas y comandas',
  'Asignar mesas al personal de apoyo, repartir comandas, escribir pedidos, llevar comida a mesas y preguntar por faltantes durante el servicio.',
  'Cocina',
  'Cocina',
  'interna',
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_master_task(
  'Comida adultos - Taquiza artesanal',
  'Colocar guisados, montaje de barro, tortillas, salsas, platos y cubiertos; servir tacos iniciales y rellenar guisados o tortillas.',
  'Cocina',
  'Cocina',
  'interna',
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_master_task(
  'Menu infantil - Servicio y supervision',
  'Colocar menu infantil, servir platitos, hidratar a ninos, vigilar mientras comen y apoyar a ninos pequenos para evitar atragantamientos.',
  'Cocina',
  'Apoyo',
  'interna',
  'cocina-menu',
  'Cocina/menu'
);

SELECT pg_temp.ensure_master_task(
  'Gelatina - Preparacion y servicio',
  'Colocar gelatinas en charolas o congeladora, cortar o servir en vasitos y coordinar entrega junto al pastel cuando aplique.',
  'Cocina',
  'Cocina',
  'interna',
  'cocina-menu',
  'Cocina/menu'
);
