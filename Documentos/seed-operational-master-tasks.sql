-- Seed inicial de tareas maestras operativas.
-- Ejecutar despues de aplicar schema.sql.
-- Estas tareas son base para todos los eventos y se pueden editar desde el admin.

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

SELECT pg_temp.ensure_master_task(
  'Entrada - Revision inicial del salon',
  'Abrir salon, revisar limpieza general, banos, cocina, pista, area infantil y que las zonas de montaje esten disponibles.',
  'Entrada',
  'Coordinadora',
  'interna',
  NULL,
  NULL
);

SELECT pg_temp.ensure_master_task(
  'Entrada - Encendido y prueba tecnica',
  'Encender luces, sonido, microfono, pantalla o proyector si aplica, y confirmar musica base antes de recibir invitados.',
  'Entrada',
  'DJ',
  'interna',
  'audio-dj',
  'Audio/DJ'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Mesas y flujo de invitados',
  'Revisar acomodo de mesas, manteleria, bebidas, mesa principal, mesa de regalos y senaletica de bienvenida o reservados.',
  'Montaje',
  'Coordinadora',
  'interna',
  'montaje',
  'Montaje'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Recepcion de familia y articulos',
  'Recibir a la familia, ubicar pastel, regalos, recuerdos, centros de mesa, letreros, dulces u otros articulos del cliente.',
  'Montaje',
  'Apoyo',
  'interna',
  'montaje',
  'Montaje'
);

SELECT pg_temp.ensure_master_task(
  'Montaje - Recepcion de proveedores',
  'Recibir proveedores externos, validar horarios de llegada, indicar zonas permitidas y confirmar restricciones de montaje.',
  'Montaje',
  'Coordinadora',
  'interna',
  NULL,
  NULL
);

SELECT pg_temp.ensure_master_task(
  'Entrada - Seguridad de areas infantiles',
  'Revisar cama elastica, tirolesa, accesos, calcetas o deslindes, y dejar instrucciones listas para el equipo de apoyo.',
  'Entrada',
  'Coordinadora',
  'interna',
  NULL,
  NULL
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Bajar pertenencias de anfitriones',
  'Ayudar a bajar o concentrar pertenencias, regalos, decoracion ligera, dulces y articulos de la familia antes del cierre.',
  'Cierre',
  'Apoyo',
  'interna',
  'cierre-apoyo',
  'Cierre apoyo'
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Retirar charolas y loza',
  'Desalojar charolas, platos, vasos y utensilios, separando material reutilizable y evitando mezclar basura con loza.',
  'Cierre',
  'Cocina',
  'interna',
  NULL,
  NULL
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Separar residuos',
  'Separar residuos organicos e inorganicos, retirar bolsas llenas y dejar el area lista para limpieza final.',
  'Cierre',
  'Limpieza',
  'interna',
  'cierre-limpieza',
  'Cierre limpieza'
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Doblar y resguardar manteleria',
  'Doblar hojas de papel o manteles reutilizables, separar piezas manchadas y guardar manteleria en su lugar.',
  'Cierre',
  'Apoyo',
  'interna',
  'cierre-apoyo',
  'Cierre apoyo'
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Limpieza final de areas',
  'Revisar banos, cocina, pista, mesas, area infantil y accesos. Reportar danos, faltantes u objetos olvidados.',
  'Cierre',
  'Limpieza',
  'interna',
  'cierre-limpieza',
  'Cierre limpieza'
);

SELECT pg_temp.ensure_master_task(
  'Cierre - Resguardo y reporte final',
  'Confirmar salida de invitados, resguardar objetos olvidados y registrar pendientes para la duena del sistema.',
  'Cierre',
  'Coordinadora',
  'interna',
  NULL,
  NULL
);
