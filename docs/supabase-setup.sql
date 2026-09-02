-- =============================================================================
-- Ambiental Cord S.R.L. — Supabase Database Setup Script
-- =============================================================================
-- Este script crea todas las tablas, índices, políticas RLS, funciones
-- y triggers necesarios para la plataforma Ambiental Cord.
--
-- IMPORTANTE: Ejecutar en el SQL Editor de Supabase como超级管理员.
-- Este script asume que auth.users y las extensiones estándar ya existen.
-- =============================================================================

-- =============================================================================
-- EXTENSIONES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- FUNCIONES AUXILIARES
-- =============================================================================

-- Función para verificar si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- 1. profiles — Perfiles de Usuario
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  role        text NOT NULL DEFAULT 'supervisor' CHECK (role IN ('admin', 'supervisor')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'supervisor');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (is_admin());


-- =============================================================================
-- 2. customers — Clientes
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_name  text NOT NULL,
  cuit          text,
  address       text,
  phone         text,
  location      text,
  status        text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Prospect')),
  type          text NOT NULL DEFAULT 'Client' CHECK (type IN ('Client', 'Prospect')),
  tax_info      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read customers" ON public.customers;
CREATE POLICY "Auth users can read customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can insert customers" ON public.customers;
CREATE POLICY "Admin can insert customers" ON public.customers
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update customers" ON public.customers;
CREATE POLICY "Admin can update customers" ON public.customers
  FOR UPDATE USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON public.customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_fantasy_name ON public.customers(fantasy_name);


-- =============================================================================
-- 3. customer_contacts — Contactos de Cliente
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name              text NOT NULL,
  phone             text,
  email             text,
  role              text,
  visible_to_driver boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read contacts" ON public.customer_contacts;
CREATE POLICY "Auth users can read contacts" ON public.customer_contacts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage contacts" ON public.customer_contacts;
CREATE POLICY "Admin can manage contacts" ON public.customer_contacts
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_contacts_customer ON public.customer_contacts(customer_id);


-- =============================================================================
-- 4. pickup_points — Puntos de Retiro
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pickup_points (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  address         text NOT NULL,
  lat             double precision NOT NULL DEFAULT 0,
  lng             double precision NOT NULL DEFAULT 0,
  frequency       text,
  schedule        text,
  container_count integer NOT NULL DEFAULT 0,
  observations    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read pickup_points" ON public.pickup_points;
CREATE POLICY "Auth users can read pickup_points" ON public.pickup_points
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage pickup_points" ON public.pickup_points;
CREATE POLICY "Admin can manage pickup_points" ON public.pickup_points
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_pickup_customer ON public.pickup_points(customer_id);


-- =============================================================================
-- 5. containers — Contenedores
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.containers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type          text NOT NULL,
  capacity      integer NOT NULL DEFAULT 200,
  status        text NOT NULL DEFAULT 'Active',
  last_cleaned  date,
  location      text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read containers" ON public.containers;
CREATE POLICY "Auth users can read containers" ON public.containers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage containers" ON public.containers;
CREATE POLICY "Admin can manage containers" ON public.containers
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_containers_customer ON public.containers(customer_id);


-- =============================================================================
-- 6. customer_contracts — Contratos / Convenios Municipales
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customer_contracts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  agreement_name  text NOT NULL,
  municipality    text,
  pdf_url         text,
  file_name       text,
  start_date      date NOT NULL,
  expiration_date date NOT NULL,
  renewal_date    date,
  status          text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expiring', 'Expired', 'Renewed')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.customer_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.customer_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read contracts" ON public.customer_contracts;
CREATE POLICY "Auth users can read contracts" ON public.customer_contracts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage contracts" ON public.customer_contracts;
CREATE POLICY "Admin can manage contracts" ON public.customer_contracts
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_contracts_customer ON public.customer_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.customer_contracts(status);


-- =============================================================================
-- 7. drivers — Conductores
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  phone               text,
  dni                 text,
  license_type        text,
  license_number      text,
  license_expiry      date,
  license_issue_date  date,
  status              text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On_Route')),
  assigned_truck_id   uuid REFERENCES public.trucks(id) ON DELETE SET NULL,
  email               text,
  joined_at           date,
  birth_date          date,
  address             text,
  emergency_contact   jsonb,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read drivers" ON public.drivers;
CREATE POLICY "Auth users can read drivers" ON public.drivers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage drivers" ON public.drivers;
CREATE POLICY "Admin can manage drivers" ON public.drivers
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_drivers_truck ON public.drivers(assigned_truck_id);


-- =============================================================================
-- 8. companions — Acompañantes
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.companions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text NOT NULL,
  dni         text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TRIGGER update_companions_updated_at
  BEFORE UPDATE ON public.companions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read companions" ON public.companions;
CREATE POLICY "Auth users can read companions" ON public.companions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage companions" ON public.companions;
CREATE POLICY "Admin can manage companions" ON public.companions
  FOR ALL USING (is_admin());


-- =============================================================================
-- 9. trucks — Camiones
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.trucks (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate                    text NOT NULL,
  model                    text,
  assigned_driver_id       uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  gps_device_id            text,
  status                   text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Stopped', 'On_Route')),
  capacity_liters          integer NOT NULL DEFAULT 5000,
  year                     integer,
  last_maintenance         date,
  next_maintenance         date,
  km_total                 integer DEFAULT 0,
  km_since_maintenance     integer DEFAULT 0,
  vin                      text,
  fuel_type                text DEFAULT 'Diesel',
  insurance_expiry         date,
  technical_revision_expiry date,
  notes                    text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read trucks" ON public.trucks;
CREATE POLICY "Auth users can read trucks" ON public.trucks
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage trucks" ON public.trucks;
CREATE POLICY "Admin can manage trucks" ON public.trucks
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_trucks_status ON public.trucks(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trucks_plate ON public.trucks(plate);


-- =============================================================================
-- 10. truck_maintenance — Mantenimiento de Camiones
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.truck_maintenance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id        uuid NOT NULL REFERENCES public.trucks(id) ON DELETE CASCADE,
  category        text NOT NULL CHECK (category IN ('Oil_Change', 'Battery', 'Tires', 'Brakes', 'ITV', 'Insurance', 'Other')),
  last_done_date  date NOT NULL,
  next_due_date   date NOT NULL,
  interval_months integer NOT NULL DEFAULT 3,
  interval_km     integer,
  current_km      integer DEFAULT 0,
  status          text NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Due', 'Expired', 'Completed')),
  notes           text,
  provider        text,
  cost            numeric(12,2),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_maintenance_updated_at
  BEFORE UPDATE ON public.truck_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.truck_maintenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read maintenance" ON public.truck_maintenance;
CREATE POLICY "Auth users can read maintenance" ON public.truck_maintenance
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage maintenance" ON public.truck_maintenance;
CREATE POLICY "Admin can manage maintenance" ON public.truck_maintenance
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_maintenance_truck ON public.truck_maintenance(truck_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.truck_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_due_date ON public.truck_maintenance(next_due_date);


-- =============================================================================
-- 11. route_sheets — Hojas de Ruta
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.route_sheets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  truck_id      uuid REFERENCES public.trucks(id) ON DELETE SET NULL,
  driver_id     uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  companion_id  uuid REFERENCES public.companions(id) ON DELETE SET NULL,
  date          date NOT NULL,
  status        text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In_Progress', 'Completed', 'Canceled')),
  total_liters  integer NOT NULL DEFAULT 0,
  total_clients integer NOT NULL DEFAULT 0,
  created_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_routesheets_updated_at
  BEFORE UPDATE ON public.route_sheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.route_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read route_sheets" ON public.route_sheets;
CREATE POLICY "Auth users can read route_sheets" ON public.route_sheets
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage route_sheets" ON public.route_sheets;
CREATE POLICY "Admin can manage route_sheets" ON public.route_sheets
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_routes_date ON public.route_sheets(date);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.route_sheets(status);
CREATE INDEX IF NOT EXISTS idx_routes_driver ON public.route_sheets(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_truck ON public.route_sheets(truck_id);


-- =============================================================================
-- 12. route_visits — Visitas de Ruta
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.route_visits (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id                uuid NOT NULL REFERENCES public.route_sheets(id) ON DELETE CASCADE,
  customer_id             uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  pickup_point_id         uuid REFERENCES public.pickup_points(id) ON DELETE SET NULL,
  visit_order             integer NOT NULL DEFAULT 0,
  status                  text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Visited', 'Skipped', 'No_Oil', 'Closed', 'Delayed', 'Rescheduled')),
  liters_collected        integer NOT NULL DEFAULT 0,
  oil_price_at_collection numeric(12,2),
  total_payment           numeric(12,2),
  payment_method          text,
  payment_completed       boolean NOT NULL DEFAULT false,
  receiver_name           text,
  receiver_dni            text,
  products_delivered      text,
  observations            text,
  delay_reason            text,
  delay_return_time       text,
  photos                  jsonb DEFAULT '[]'::jsonb,
  gps_lat                 double precision,
  gps_lng                 double precision,
  visited_at              timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.route_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.route_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read route_visits" ON public.route_visits;
CREATE POLICY "Auth users can read route_visits" ON public.route_visits
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage route_visits" ON public.route_visits;
CREATE POLICY "Admin can manage route_visits" ON public.route_visits
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_visits_route ON public.route_visits(route_id);
CREATE INDEX IF NOT EXISTS idx_visits_customer ON public.route_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.route_visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_order ON public.route_visits(route_id, visit_order);


-- =============================================================================
-- 13. route_templates — Plantillas de Ruta
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.route_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text,
  customer_ids  uuid[],
  visit_order   jsonb,
  notes         text,
  created_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.route_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.route_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read templates" ON public.route_templates;
CREATE POLICY "Auth users can read templates" ON public.route_templates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage templates" ON public.route_templates;
CREATE POLICY "Admin can manage templates" ON public.route_templates
  FOR ALL USING (is_admin());


-- =============================================================================
-- 14. employee_equipment — Equipamiento de Empleados
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.employee_equipment (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      text NOT NULL,
  employee_name    text NOT NULL,
  employee_type    text NOT NULL CHECK (employee_type IN ('Driver', 'Companion')),
  item_type        text NOT NULL CHECK (item_type IN ('Shoes', 'Jacket', 'Gloves', 'Shirt', 'Pants', 'Other')),
  quantity         integer NOT NULL DEFAULT 1,
  size             text,
  delivery_date    date NOT NULL,
  replacement_date date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.employee_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.employee_equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read equipment" ON public.employee_equipment;
CREATE POLICY "Auth users can read equipment" ON public.employee_equipment
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage equipment" ON public.employee_equipment;
CREATE POLICY "Admin can manage equipment" ON public.employee_equipment
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_equipment_employee ON public.employee_equipment(employee_id);


-- =============================================================================
-- 15. manifests — Manifiestos
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.manifests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_number text NOT NULL,
  route_visit_id  uuid REFERENCES public.route_visits(id) ON DELETE SET NULL,
  client_name     text,
  driver_name     text,
  vehicle_plate   text,
  liters          integer NOT NULL DEFAULT 0,
  photos          jsonb,
  receiver_dni    text,
  date            timestamptz NOT NULL DEFAULT now(),
  pdf_url         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.manifests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read manifests" ON public.manifests;
CREATE POLICY "Auth users can read manifests" ON public.manifests
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage manifests" ON public.manifests;
CREATE POLICY "Admin can manage manifests" ON public.manifests
  FOR ALL USING (is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS idx_manifests_number ON public.manifests(manifest_number);
CREATE INDEX IF NOT EXISTS idx_manifests_visit ON public.manifests(route_visit_id);


-- =============================================================================
-- 16. settings — Configuración del Sistema
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  value       text NOT NULL,
  updated_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users can read settings" ON public.settings;
CREATE POLICY "Auth users can read settings" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage settings" ON public.settings;
CREATE POLICY "Admin can manage settings" ON public.settings
  FOR ALL USING (is_admin());


-- =============================================================================
-- SEED DATA — Datos iniciales
-- =============================================================================

-- Configuración por defecto
INSERT INTO public.settings (key, value) VALUES
  ('oil_price_per_liter', '180.00')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- RESUMEN FINAL
-- =============================================================================
-- Tablas creadas: 16
-- Políticas RLS: ~34
-- Funciones: 3 (is_admin, update_updated_at, handle_new_user)
-- Triggers: 10
-- Índices: ~20
-- =============================================================================