# Modelo de Base de Datos — Ambiental Cord S.R.L.

Base de datos PostgreSQL gestionada via Supabase. 15 tablas con Row Level Security (RLS).

---

## Diagrama Entidad-Relación

```
┌──────────────────┐       ┌─────────────────────┐
│    profiles      │       │     settings         │
│──────────────────│       │─────────────────────│
│ id (PK)          │       │ id (PK)              │
│ full_name        │       │ key                  │
│ role             │       │ value                │
│ avatar_url       │       │ updated_by (FK→prof) │
│ created_at       │       │ updated_at           │
│ updated_at       │       └─────────────────────┘
└──────┬───────────┘
       │ (created_by, updated_by)
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │  customers   │    │     drivers      │    │   companions     │   │
│  │──────────────│    │──────────────────│    │──────────────────│   │
│  │ id (PK)      │    │ id (PK)          │    │ id (PK)          │   │
│  │ fantasy_name │    │ name             │    │ full_name        │   │
│  │ cuit         │    │ phone            │    │ dni              │   │
│  │ address      │    │ dni              │    │ phone            │   │
│  │ phone        │    │ license_type     │    │ created_at       │   │
│  │ location     │    │ license_number   │    │ updated_at       │   │
│  │ status       │    │ license_expiry   │    │ deleted_at       │   │
│  │ type         │    │ license_issue_dt │    └──────────────────┘   │
│  │ tax_info     │    │ status           │                           │
│  │ created_at   │    │ assigned_truck   │──────┐                    │
│  │ updated_at   │    │ email            │      │                    │
│  │ deleted_at   │    │ joined_at        │      │                    │
│  └──┬───┬───┬───┘    │ birth_date       │      │                    │
│     │   │   │        │ address          │      │                    │
│     │   │   │        │ emergency_contact│      │                    │
│     │   │   │        │ notes            │      │                    │
│     │   │   │        │ created_at       │      │                    │
│     │   │   │        │ updated_at       │      │                    │
│     │   │   │        │ deleted_at       │      │                    │
│     │   │   │        └──────────────────┘      │                    │
│     │   │   │                                  │                    │
│     │   │   │        ┌──────────────────┐      │                    │
│     │   │   │        │     trucks       │◄─────┘                    │
│     │   │   │        │──────────────────│                           │
│     │   │   │        │ id (PK)          │                           │
│     │   │   │        │ plate            │                           │
│     │   │   │        │ model            │                           │
│     │   │   │        │ assigned_driver  │──┐                        │
│     │   │   │        │ gps_device_id    │  │                        │
│     │   │   │        │ status           │  │                        │
│     │   │   │        │ capacity_liters  │  │                        │
│     │   │   │        │ year             │  │                        │
│     │   │   │        │ last_maintenance │  │                        │
│     │   │   │        │ next_maintenance │  │                        │
│     │   │   │        │ km_total         │  │                        │
│     │   │   │        │ km_since_maint   │  │                        │
│     │   │   │        │ vin              │  │                        │
│     │   │   │        │ fuel_type        │  │                        │
│     │   │   │        │ insurance_expiry │  │                        │
│     │   │   │        │ tech_rev_expiry  │  │                        │
│     │   │   │        │ notes            │  │  ┌──────────────────┐  │
│     │   │   │        │ created_at       │  │  │truck_maintenance │  │
│     │   │   │        │ updated_at       │  │  │──────────────────│  │
│     │   │   │        │ deleted_at       │  │  │ id (PK)          │  │
│     │   │   │        └────────┬─────────┘  │  │ truck_id (FK)◄───┘  │
│     │   │   │                 │            │  │ category         │  │
│     │   │   │      ┌──────────┘            │  │ last_done_date   │  │
│     │   │   │      │                       │  │ next_due_date    │  │
│     │   │   │      │   ┌──────────────────┐│  │ interval_months  │  │
│     │   │   │      │   │  route_sheets    ││  │ interval_km      │  │
│     │   │   │      │   │──────────────────││  │ current_km       │  │
│     │   │   │      │   │ id (PK)          ││  │ status           │  │
│     │   │   │      │   │ name             ││  │ notes            │  │
│     │   │   │      ├───│ truck_id (FK)    ││  │ provider         │  │
│     │   │   │      │   │ driver_id (FK)───┼──│ cost             │  │
│     │   │   │      │   │ companion_id(FK)─│──│ created_at       │  │
│     │   │   │      │   │ date             ││  │ updated_at       │  │
│     │   │   │      │   │ status           ││  └──────────────────┘  │
│     │   │   │      │   │ total_liters     ││                        │
│     │   │   │      │   │ total_clients    ││                        │
│     │   │   │      │   │ created_by (FK)  ││                        │
│     │   │   │      │   │ created_at       ││                        │
│     │   │   │      │   │ updated_at       ││                        │
│     │   │   │      │   └────────┬─────────┘│                        │
│     │   │   │      │            │          │                        │
│     │   │   │      │   ┌────────▼──────────┐│  ┌──────────────────┐ │
│     │   │   │      │   │   route_visits    ││  │ route_templates  │ │
│     │   │   │      │   │───────────────────││  │──────────────────│ │
│     │   │   │      │   │ id (PK)           ││  │ id (PK)          │ │
│     │   │   │      │   │ route_id (FK)     ││  │ name             │ │
│     │   ├───┼──────┼───│ customer_id (FK)  ││  │ description      │ │
│     │   │   │      │   │ pickup_point(FK)  ││  │ customer_ids[]   │ │
│     │   │   │      │   │ visit_order       ││  │ visit_order(json)│ │
│  ┌──┘   │   │      │   │ status            ││  │ notes            │ │
│  │      │   │      │   │ liters_collected  ││  │ created_by (FK)  │ │
│  │      │   │      │   │ oil_price         ││  │ created_at       │ │
│  │      │   │      │   │ total_payment     ││  │ updated_at       │ │
│  │      │   │      │   │ payment_method    ││  │ deleted_at       │ │
│  │      │   │      │   │ payment_completed ││  └──────────────────┘ │
│  │      │   │      │   │ receiver_name     ││                       │
│  │      │   │      │   │ receiver_dni      ││                       │
│  │      │   │      │   │ products_delivered││                       │
│  │      │   │      │   │ observations      ││                       │
│  │      │   │      │   │ delay_reason      ││                       │
│  │      │   │      │   │ delay_return_time ││                       │
│  │      │   │      │   │ photos (jsonb)    ││                       │
│  │      │   │      │   │ gps_lat           ││                       │
│  │      │   │      │   │ gps_lng           ││                       │
│  │      │   │      │   │ visited_at        ││                       │
│  │      │   │      │   │ created_at        ││                       │
│  │      │   │      │   │ updated_at        ││                       │
│  │      │   │      │   └───────────────────┘│                       │
│  │      │   │      │                        │                       │
│  │  ┌───┘   │      │   ┌──────────────────┐ │                       │
│  │  │       │      │   │    manifests     │ │                       │
│  │  │       │      │   │──────────────────│ │                       │
│  │  │       │      └───│ route_visit(FK)  │ │                       │
│  │  │       │          │ manifest_number  │ │                       │
│  │  │       │          │ client_name      │ │                       │
│  │  │       │          │ driver_name      │ │                       │
│  │  │       │          │ vehicle_plate    │ │                       │
│  │  │       │          │ liters           │ │                       │
│  │  │       │          │ photos (jsonb)   │ │                       │
│  │  │       │          │ receiver_dni     │ │                       │
│  │  │       │          │ date             │ │                       │
│  │  │       │          │ pdf_url          │ │                       │
│  │  │       │          │ created_at       │ │                       │
│  │  │       │          └──────────────────┘ │                       │
│  │  │       │                               │                       │
│  │  │  ┌────┘    ┌──────────────────────┐   │                       │
│  │  │  │         │   customer_contacts  │   │                       │
│  │  │  │         │──────────────────────│   │                       │
│  │  │  │         │ id (PK)              │   │                       │
│  │  └──┼─────────│ customer_id (FK)     │   │                       │
│  │     │         │ name                 │   │                       │
│  │     │         │ phone                │   │                       │
│  │     │         │ email                │   │                       │
│  │     │         │ role                 │   │                       │
│  │     │         │ visible_to_driver    │   │                       │
│  │     │         │ created_at           │   │                       │
│  │     │         └──────────────────────┘   │                       │
│  │     │                                    │                       │
│  │     │    ┌──────────────────────┐         │                       │
│  │     │    │  customer_contracts  │         │                       │
│  │     │    │──────────────────────│         │                       │
│  │     └────│ customer_id (FK)     │         │                       │
│  │          │ agreement_name       │         │                       │
│  │          │ municipality         │         │                       │
│  │          │ pdf_url              │         │                       │
│  │          │ file_name            │         │                       │
│  │          │ start_date           │         │                       │
│  │          │ expiration_date      │         │                       │
│  │          │ renewal_date         │         │                       │
│  │          │ status               │         │                       │
│  │          │ notes                │         │                       │
│  │          │ created_at           │         │                       │
│  │          │ updated_at           │         │                       │
│  │          └──────────────────────┘         │                       │
│  │                                          │                       │
│  │    ┌──────────────────────┐               │                       │
│  │    │    pickup_points     │               │                       │
│  │    │──────────────────────│               │                       │
│  └────│ customer_id (FK)     │               │                       │
│       │ address              │               │                       │
│       │ lat                  │               │                       │
│       │ lng                  │               │                       │
│       │ frequency            │               │                       │
│       │ schedule             │               │                       │
│       │ container_count      │               │                       │
│       │ observations         │               │                       │
│       │ created_at           │               │                       │
│       └──────────────────────┘               │                       │
│                                              │                       │
│       ┌──────────────────────┐               │                       │
│       │     containers       │               │                       │
│       │──────────────────────│               │                       │
│       │ customer_id (FK)─────┘               │                       │
│       │ type                                 │                       │
│       │ capacity                             │                       │
│       │ status                               │                       │
│       │ last_cleaned                         │                       │
│       │ location                             │                       │
│       │ created_at                           │                       │
│       └──────────────────────┘               │                       │
│                                              │                       │
│       ┌──────────────────────┐               │                       │
│       │  employee_equipment  │               │                       │
│       │──────────────────────│               │                       │
│       │ employee_id          │               │                       │
│       │ employee_name        │               │                       │
│       │ employee_type        │               │                       │
│       │ item_type            │               │                       │
│       │ quantity             │               │                       │
│       │ size                 │               │                       │
│       │ delivery_date        │               │                       │
│       │ replacement_date     │               │                       │
│       │ notes                │               │                       │
│       │ created_at           │               │                       │
│       │ updated_at           │               │                       │
│       └──────────────────────┘               │                       │
│                                              │                       │
└──────────────────────────────────────────────┘                       │
```

---

## Diccionario de Tablas

### 1. profiles — Perfiles de Usuario

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | — | PK, heredado de `auth.users` |
| `full_name` | `text` | NULL | Nombre completo |
| `role` | `text` | `'supervisor'` | `admin` o `supervisor` |
| `avatar_url` | `text` | NULL | URL del avatar |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

---

### 2. customers — Clientes

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `fantasy_name` | `text` | — | Nombre de fantasía (obligatorio) |
| `cuit` | `text` | NULL | CUIT (opcional) |
| `address` | `text` | NULL | Dirección principal |
| `phone` | `text` | NULL | Teléfono |
| `location` | `text` | NULL | Localidad / Zona |
| `status` | `text` | `'Active'` | Active, Inactive, Prospect |
| `type` | `text` | `'Client'` | Client, Prospect |
| `tax_info` | `jsonb` | NULL | Datos impositivos flexibles |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

---

### 3. customer_contacts — Contactos de Cliente

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `customer_id` | `uuid` | — | FK → customers |
| `name` | `text` | — | Nombre del contacto |
| `phone` | `text` | NULL | Teléfono |
| `email` | `text` | NULL | Email |
| `role` | `text` | NULL | Cargo / Rol |
| `visible_to_driver` | `boolean` | `false` | Visible en app mobile |
| `created_at` | `timestamptz` | `now()` | — |

---

### 4. pickup_points — Puntos de Retiro

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `customer_id` | `uuid` | — | FK → customers |
| `address` | `text` | — | Dirección del punto |
| `lat` | `double precision` | `0` | Latitud GPS |
| `lng` | `double precision` | `0` | Longitud GPS |
| `frequency` | `text` | NULL | Frecuencia de visita |
| `schedule` | `text` | NULL | Horario |
| `container_count` | `integer` | `0` | Cantidad de contenedores |
| `observations` | `text` | NULL | Notas |
| `created_at` | `timestamptz` | `now()` | — |

---

### 5. containers — Contenedores

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `customer_id` | `uuid` | — | FK → customers |
| `type` | `text` | — | Tipo de contenedor |
| `capacity` | `integer` | `200` | Capacidad en litros |
| `status` | `text` | `'Active'` | Active, Inactive, Damaged |
| `last_cleaned` | `date` | NULL | Última limpieza |
| `location` | `text` | NULL | Ubicación específica |
| `created_at` | `timestamptz` | `now()` | — |

---

### 6. customer_contracts — Contratos / Convenios

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `customer_id` | `uuid` | — | FK → customers |
| `agreement_name` | `text` | — | Nombre del acuerdo |
| `municipality` | `text` | NULL | Municipio |
| `pdf_url` | `text` | NULL | URL del PDF |
| `file_name` | `text` | NULL | Nombre del archivo |
| `start_date` | `date` | — | Fecha de inicio |
| `expiration_date` | `date` | — | Fecha de vencimiento |
| `renewal_date` | `date` | NULL | Fecha de renovación |
| `status` | `text` | `'Active'` | Active, Expiring, Expired, Renewed |
| `notes` | `text` | NULL | Notas |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

---

### 7. drivers — Conductores

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `name` | `text` | — | Nombre completo |
| `phone` | `text` | NULL | Teléfono |
| `dni` | `text` | NULL | DNI |
| `license_type` | `text` | NULL | Categoría de licencia |
| `license_number` | `text` | NULL | Número de licencia |
| `license_expiry` | `date` | NULL | Vencimiento licencia |
| `license_issue_date` | `date` | NULL | Fecha emisión licencia |
| `status` | `text` | `'Active'` | Active, Inactive, On_Route |
| `assigned_truck_id` | `uuid` | NULL | FK → trucks |
| `email` | `text` | NULL | Email |
| `joined_at` | `date` | NULL | Fecha de ingreso |
| `birth_date` | `date` | NULL | Fecha de nacimiento |
| `address` | `text` | NULL | Dirección |
| `emergency_contact` | `jsonb` | NULL | Contacto de emergencia |
| `notes` | `text` | NULL | Notas |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

---

### 8. companions — Acompañantes

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `full_name` | `text` | — | Nombre completo |
| `dni` | `text` | NULL | DNI |
| `phone` | `text` | NULL | Teléfono (opcional) |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

---

### 9. trucks — Camiones

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `plate` | `text` | — | Patente (obligatorio) |
| `model` | `text` | NULL | Modelo |
| `assigned_driver_id` | `uuid` | NULL | FK → drivers |
| `gps_device_id` | `text` | NULL | ID dispositivo ControlSat |
| `status` | `text` | `'Active'` | Active, Maintenance, Stopped, On_Route |
| `capacity_liters` | `integer` | `5000` | Capacidad del tanque |
| `year` | `integer` | NULL | Año |
| `last_maintenance` | `date` | NULL | Último mantenimiento |
| `next_maintenance` | `date` | NULL | Próximo mantenimiento |
| `km_total` | `integer` | `0` | Kilometraje total |
| `km_since_maintenance` | `integer` | `0` | KM desde último mantenimiento |
| `vin` | `text` | NULL | Número de chasis |
| `fuel_type` | `text` | `'Diesel'` | Tipo de combustible |
| `insurance_expiry` | `date` | NULL | Vencimiento seguro |
| `technical_revision_expiry` | `date` | NULL | Vencimiento RTO |
| `notes` | `text` | NULL | Notas |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

---

### 10. truck_maintenance — Mantenimiento de Camiones

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `truck_id` | `uuid` | — | FK → trucks |
| `category` | `text` | — | Oil_Change, Battery, Tires, Brakes, ITV, Insurance, Other |
| `last_done_date` | `date` | — | Fecha del último servicio |
| `next_due_date` | `date` | — | Fecha del próximo servicio |
| `interval_months` | `integer` | `3` | Intervalo en meses |
| `interval_km` | `integer` | NULL | Intervalo en kilómetros |
| `current_km` | `integer` | `0` | Kilometraje actual |
| `status` | `text` | `'Upcoming'` | Upcoming, Due, Expired, Completed |
| `notes` | `text` | NULL | Notas |
| `provider` | `text` | NULL | Proveedor del servicio |
| `cost` | `numeric` | NULL | Costo del servicio |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

---

### 11. route_sheets — Hojas de Ruta

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `name` | `text` | — | Nombre de la ruta |
| `truck_id` | `uuid` | NULL | FK → trucks |
| `driver_id` | `uuid` | NULL | FK → drivers |
| `companion_id` | `uuid` | NULL | FK → companions |
| `date` | `date` | — | Fecha de la ruta |
| `status` | `text` | `'Pending'` | Pending, In_Progress, Completed, Canceled |
| `total_liters` | `integer` | `0` | Litros totales recolectados |
| `total_clients` | `integer` | `0` | Total de clientes en ruta |
| `created_by` | `uuid` | NULL | FK → profiles |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

---

### 12. route_visits — Visitas de Ruta

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `route_id` | `uuid` | — | FK → route_sheets |
| `customer_id` | `uuid` | NULL | FK → customers |
| `pickup_point_id` | `uuid` | NULL | FK → pickup_points |
| `visit_order` | `integer` | `0` | Orden en la ruta |
| `status` | `text` | `'Pending'` | Pending, Visited, Skipped, No_Oil, Closed, Delayed, Rescheduled |
| `liters_collected` | `integer` | `0` | Litros recolectados |
| `oil_price_at_collection` | `numeric` | NULL | Precio del aceite al momento |
| `total_payment` | `numeric` | NULL | Pago calculado (litros × precio) |
| `payment_method` | `text` | NULL | Cash, Transfer, Pending |
| `payment_completed` | `boolean` | `false` | ¿Pago completado? |
| `receiver_name` | `text` | NULL | Nombre de quien recibe |
| `receiver_dni` | `text` | NULL | DNI de quien recibe |
| `products_delivered` | `text` | NULL | Productos entregados |
| `observations` | `text` | NULL | Observaciones |
| `delay_reason` | `text` | NULL | Motivo de demora |
| `delay_return_time` | `text` | NULL | Hora estimada de retorno |
| `photos` | `jsonb` | `'[]'` | Array de URLs de fotos |
| `gps_lat` | `double precision` | NULL | Latitud de la visita |
| `gps_lng` | `double precision` | NULL | Longitud de la visita |
| `visited_at` | `timestamptz` | NULL | Fecha/hora de visita |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

---

### 13. route_templates — Plantillas de Ruta

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `name` | `text` | — | Nombre de la plantilla |
| `description` | `text` | NULL | Descripción |
| `customer_ids` | `uuid[]` | NULL | Array de IDs de clientes |
| `visit_order` | `jsonb` | NULL | Orden de visita mapeado |
| `notes` | `text` | NULL | Notas |
| `created_by` | `uuid` | NULL | FK → profiles |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |
| `deleted_at` | `timestamptz` | NULL | Soft delete |

---

### 14. employee_equipment — Equipamiento de Empleados

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `employee_id` | `text` | — | ID del empleado |
| `employee_name` | `text` | — | Nombre del empleado |
| `employee_type` | `text` | — | Driver, Companion |
| `item_type` | `text` | — | Shoes, Jacket, Gloves, Shirt, Pants, Other |
| `quantity` | `integer` | `1` | Cantidad |
| `size` | `text` | NULL | Talle |
| `delivery_date` | `date` | — | Fecha de entrega |
| `replacement_date` | `date` | NULL | Fecha de reposición |
| `notes` | `text` | NULL | Notas |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

---

### 15. manifests — Manifiestos

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `manifest_number` | `text` | — | Número único de manifiesto |
| `route_visit_id` | `uuid` | NULL | FK → route_visits |
| `client_name` | `text` | NULL | Nombre del cliente |
| `driver_name` | `text` | NULL | Nombre del conductor |
| `vehicle_plate` | `text` | NULL | Patente del vehículo |
| `liters` | `integer` | `0` | Litros recolectados |
| `photos` | `jsonb` | NULL | Fotos |
| `receiver_dni` | `text` | NULL | DNI del receptor |
| `date` | `timestamptz` | `now()` | Fecha |
| `pdf_url` | `text` | NULL | URL del PDF generado |
| `created_at` | `timestamptz` | `now()` | — |

---

### 16. settings — Configuración del Sistema

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `key` | `text` | — | Clave de configuración (ej: `oil_price_per_liter`) |
| `value` | `text` | — | Valor |
| `updated_by` | `uuid` | NULL | FK → profiles |
| `updated_at` | `timestamptz` | `now()` | — |

---

## Políticas RLS

Todas las tablas siguen el mismo patrón de seguridad:

| Política | Target | Comando | Condición |
|----------|--------|---------|-----------|
| **Admin full access** | Admin | ALL | `profiles.role = 'admin'` |
| **Auth users read** | Autenticados | SELECT | `auth.role() = 'authenticated'` |

Excepciones en `profiles`:
| Política | Target | Comando | Condición |
|----------|--------|---------|-----------|
| Users can view own profile | Propio | SELECT | `auth.uid() = id` |
| Users can update own profile | Propio | UPDATE | `auth.uid() = id` |
| Admins can view all profiles | Admin | SELECT | `is_admin()` |
| Admins can update any profile | Admin | UPDATE | `is_admin()` |

---

## Convenciones de Soft Delete

Las siguientes tablas usan soft delete (baja lógica) vía columna `deleted_at`:
- `customers`
- `drivers`
- `trucks`
- `companions`
- `route_templates`

Las queries del frontend siempre filtran `IS NULL` en `deleted_at`.