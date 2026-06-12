-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfiles de usuario administrativo
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Catálogo de Personal (Staff)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  primary_role TEXT NOT NULL, -- DJ, Coordinadora, Apoyo, Limpieza, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Catálogo de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Eventos
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  celebratory_name TEXT NOT NULL,
  age INTEGER,
  parents_names TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  token_unico TEXT UNIQUE NOT NULL DEFAULT md5(random()::text),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'guardado', 'validado', 'finalizado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Respuestas del Cuestionario (JSONB)
CREATE TABLE IF NOT EXISTS public.questionnaire_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tareas Maestras (Plantillas)
CREATE TABLE IF NOT EXISTS public.master_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  base_description TEXT,
  visibility TEXT DEFAULT 'interna' CHECK (visibility IN ('interna', 'publica')),
  area TEXT, -- Comensales, Cocina, etc.
  default_role TEXT, -- Rol de staff por defecto
  default_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  required_responsible_count INTEGER DEFAULT 1 CHECK (required_responsible_count > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.master_tasks
  ADD COLUMN IF NOT EXISTS default_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS required_responsible_count INTEGER DEFAULT 1 CHECK (required_responsible_count > 0);

CREATE UNIQUE INDEX IF NOT EXISTS master_tasks_name_unique ON public.master_tasks(name);

CREATE TABLE IF NOT EXISTS public.master_task_default_staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  master_task_id UUID REFERENCES public.master_tasks(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS master_task_default_staff_unique
  ON public.master_task_default_staff(master_task_id, staff_id);

INSERT INTO public.master_task_default_staff (master_task_id, staff_id, sort_order)
SELECT id, default_staff_id, 0
FROM public.master_tasks
WHERE default_staff_id IS NOT NULL
ON CONFLICT (master_task_id, staff_id) DO NOTHING;

-- 7. Backlog de Tareas del Evento (Event Tasks)
CREATE TABLE IF NOT EXISTS public.event_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  scheduled_time TIME,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  role_responsible TEXT, -- Para cuando aún no se asigna un staff concreto
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completada')),
  visibility TEXT DEFAULT 'interna' CHECK (visibility IN ('interna', 'publica')),
  is_manual_override BOOLEAN DEFAULT FALSE, -- Para proteger cambios de la dueña
  source_rule_task_id UUID,
  source_master_task_id UUID REFERENCES public.master_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_tasks
  ADD COLUMN IF NOT EXISTS source_rule_task_id UUID,
  ADD COLUMN IF NOT EXISTS source_master_task_id UUID REFERENCES public.master_tasks(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.event_task_staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_task_id UUID REFERENCES public.event_tasks(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS event_task_staff_unique
  ON public.event_task_staff(event_task_id, staff_id);

INSERT INTO public.event_task_staff (event_task_id, staff_id, sort_order)
SELECT id, staff_id, 0
FROM public.event_tasks
WHERE staff_id IS NOT NULL
ON CONFLICT (event_task_id, staff_id) DO NOTHING;

-- 8. Documentos de Clientes
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  doc_type TEXT, -- Contrato, ID, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Configuracion administrativa global
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reglas configurables del cuestionario
CREATE TABLE IF NOT EXISTS public.questionnaire_task_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_key TEXT NOT NULL,
  field_label TEXT NOT NULL,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (
    operator IN ('answered', 'equals', 'not_equals', 'is_true', 'is_false', 'greater_than', 'contains')
  ),
  expected_value JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS questionnaire_task_rules_unique
  ON public.questionnaire_task_rules(field_key, operator, COALESCE(expected_value::text, 'null'));

-- 11. Tareas maestras generadas por cada regla del cuestionario
CREATE TABLE IF NOT EXISTS public.questionnaire_task_rule_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_id UUID REFERENCES public.questionnaire_task_rules(id) ON DELETE CASCADE NOT NULL,
  master_task_id UUID REFERENCES public.master_tasks(id) ON DELETE CASCADE NOT NULL,
  override_description TEXT,
  override_scheduled_time TIME,
  override_role_responsible TEXT,
  override_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  override_visibility TEXT CHECK (override_visibility IN ('interna', 'publica')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questionnaire_task_rule_tasks
  ADD COLUMN IF NOT EXISTS override_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS questionnaire_task_rule_tasks_unique
  ON public.questionnaire_task_rule_tasks(rule_id, master_task_id);

CREATE TABLE IF NOT EXISTS public.questionnaire_task_rule_task_staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_task_id UUID REFERENCES public.questionnaire_task_rule_tasks(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS questionnaire_task_rule_task_staff_unique
  ON public.questionnaire_task_rule_task_staff(rule_task_id, staff_id);

INSERT INTO public.questionnaire_task_rule_task_staff (rule_task_id, staff_id, sort_order)
SELECT id, override_staff_id, 0
FROM public.questionnaire_task_rule_tasks
WHERE override_staff_id IS NOT NULL
ON CONFLICT (rule_task_id, staff_id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_tasks_source_rule_task_id_fkey'
  ) THEN
    ALTER TABLE public.event_tasks
      ADD CONSTRAINT event_tasks_source_rule_task_id_fkey
      FOREIGN KEY (source_rule_task_id)
      REFERENCES public.questionnaire_task_rule_tasks(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Configurar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_task_default_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_task_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_task_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_task_rule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_task_rule_task_staff ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Dueña tiene acceso total)
-- Nota: En un entorno real, esto se ajustaría según auth.uid() y roles.
CREATE POLICY "Admin full access" ON public.profiles FOR ALL USING (auth.uid() = id);
-- Para propósitos de este setup inicial, permitiremos acceso total al rol admin.
-- (Se expandirá durante la Fase 2)
