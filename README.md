# Ambiental Cord S.R.L. — UCO Logistics Management Platform

ERP logístico empresarial para operaciones de recolección de aceite vegetal usado (UCO). Digitaliza la planificación de rutas, seguimiento GPS, gestión de clientes, evidencia de recolección y documentación de cumplimiento.

---

## Resumen del Proyecto

Ambiental Cord es una plataforma web + mobile que reemplaza planillas Excel, manifiestos en papel y llamadas telefónicas con un sistema digital centralizado. Proporciona trazabilidad completa desde la creación de la ruta hasta la finalización de la recolección, incluyendo cálculo automático de pagos, generación de recibos PDF, envío por WhatsApp y alertas de mantenimiento preventivo.

### Usuarios objetivo

| Rol | Acceso |
|-----|--------|
| **Administrador** | Acceso total — crear rutas, gestionar clientes/camiones/conductores, ver reportes, generar manifiestos, configurar precios, gestionar alertas de mantenimiento, plantillas de ruta, equipamiento de empleados |
| **Supervisor** | Monitorear operaciones, ver rutas, seguir actividad de conductores, revisar cronogramas de mantenimiento |
| **Conductor** | App mobile-first — ejecutar rutas asignadas, registrar recolecciones, tomar fotos, generar recibos, marcar demoras, recibir cálculos automáticos de pago |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + TailwindCSS 3.4 |
| **Build** | Vite 8 |
| **Enrutamiento** | React Router DOM 7 |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **Gráficos** | Recharts 3.2 |
| **PDF** | jsPDF 3.0 |
| **Mapas** | Google Maps Embed (iframe) |
| **Iconos** | Remix Icon 4.5 + Font Awesome 6.4 |
| **Fuentes** | Inter + Playfair Display (Google Fonts) |
| **i18n** | i18next + react-i18next |

---

## Estructura del Proyecto

```
ambiental-cord/
├── index.html                          # Entry point HTML
├── package.json                        # Dependencias y scripts
├── vite.config.ts                      # Configuración Vite
├── tailwind.config.ts                  # Configuración TailwindCSS
├── tsconfig.json                       # Configuración TypeScript
├── project_plan.md                     # Plan de proyecto completo
├── supabase/
│   └── functions/                      # Edge Functions
│       └── create-admin/               # Creación de usuario admin
├── src/
│   ├── main.tsx                        # Entry point React
│   ├── App.tsx                         # App root con router
│   ├── index.css                       # Estilos globales + CSS variables
│   ├── lib/
│   │   └── supabase.ts                 # Cliente Supabase (singleton)
│   ├── router/
│   │   ├── index.ts                    # Configuración BrowserRouter
│   │   └── config.tsx                  # Definición de rutas
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx           # Guard de autenticación
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx     # Layout principal admin
│   │   │   ├── Sidebar.tsx             # Barra lateral navegable
│   │   │   └── TopBar.tsx              # Barra superior
│   │   ├── base/                       # Componentes base reusables
│   │   └── feature/                    # Componentes funcionales compartidos
│   ├── hooks/
│   │   ├── useAuth.tsx                 # Auth context + provider
│   │   ├── useCustomers.ts            # CRUD clientes
│   │   ├── useDrivers.ts              # CRUD conductores
│   │   ├── useCompanions.ts           # CRUD acompañantes
│   │   ├── useTrucks.ts               # CRUD camiones
│   │   ├── useMaintenance.ts          # CRUD mantenimiento
│   │   ├── useRouteSheets.ts          # CRUD hojas de ruta
│   │   ├── useRouteTemplates.ts       # CRUD plantillas de ruta
│   │   ├── useDashboardData.ts        # Datos del dashboard
│   │   ├── useEquipment.ts            # CRUD equipamiento
│   │   └── useContactVisibility.ts    # Visibilidad de contactos
│   ├── pages/
│   │   ├── dashboard/                  # Dashboard KPIs + gráficos
│   │   ├── routes/                     # Hojas de ruta + plantillas
│   │   ├── customers/                  # Clientes (lista, detalle, nuevo)
│   │   ├── trucks/                     # Camiones + mantenimiento
│   │   ├── drivers/                    # Conductores
│   │   ├── companions/                 # Acompañantes
│   │   ├── equipment/                  # Equipamiento empleados
│   │   ├── gps/                        # Monitoreo GPS
│   │   ├── reports/                    # Reportes
│   │   ├── documents/                  # Documentos / Manifiestos
│   │   ├── settings/                   # Configuración
│   │   ├── login/                      # Login
│   │   ├── driver/                     # App mobile conductor
│   │   └── NotFound.tsx               # 404
│   ├── mocks/                          # Datos mock (legacy, la mayoría ya no se usan)
│   ├── i18n/
│   │   ├── index.ts
│   │   └── local/                      # Archivos de traducción
│   └── router/
│       ├── index.ts
│       └── config.tsx
```

---

## Rutas del Sistema

### Web App (Admin / Supervisor)

| Ruta | Página | Rol |
|------|--------|-----|
| `/` | Dashboard (KPIs + gráficos + alertas) | Admin, Supervisor |
| `/routes` | Listado de Hojas de Ruta | Admin, Supervisor |
| `/routes/new` | Nueva Hoja de Ruta | Admin |
| `/routes/:id` | Detalle de Hoja de Ruta | Admin, Supervisor |
| `/routes/templates` | Plantillas de Ruta | Admin |
| `/routes/templates/new` | Nueva Plantilla | Admin |
| `/routes/templates/:id` | Detalle de Plantilla | Admin |
| `/customers` | Listado de Clientes | Admin, Supervisor |
| `/customers/new` | Nuevo Cliente | Admin |
| `/customers/:id` | Detalle de Cliente (tabs) | Admin, Supervisor |
| `/trucks` | Listado de Camiones | Admin |
| `/trucks/new` | Nuevo Camión | Admin |
| `/trucks/:id` | Detalle de Camión | Admin |
| `/trucks/maintenance` | Dashboard de Mantenimiento | Admin, Supervisor |
| `/drivers` | Listado de Conductores | Admin |
| `/drivers/new` | Nuevo Conductor | Admin |
| `/drivers/:id` | Detalle de Conductor | Admin |
| `/companions` | Acompañantes | Admin |
| `/equipment` | Equipamiento de Empleados | Admin, Supervisor |
| `/gps` | Monitoreo GPS en Mapa | Admin, Supervisor |
| `/reports` | Reportes y Analytics | Admin, Supervisor |
| `/documents` | Documentos y Manifiestos | Admin, Supervisor |
| `/settings` | Configuración del Sistema | Admin |

### App Mobile Conductor

| Ruta | Pantalla |
|------|----------|
| `/driver` | Login + Resumen de Ruta |
| `/driver/route` | Ruta del día |
| `/driver/collect/:id` | Registro de Recolección |
| `/driver/delay/:id` | Marcar Cliente como Demorado |
| `/driver/evidence` | Evidencia Fotográfica |
| `/driver/receipt` | Generación de Recibo PDF + WhatsApp |

---

## Funcionalidades Principales

### Dashboard
- 6 tarjetas KPI con datos en tiempo real desde Supabase
- Gráfico de litros recolectados por día (semanal)
- Top 5 conductores ordenados por litros recolectados
- Últimas 8 rutas con estado y progreso
- Alertas de mantenimiento agrupadas por urgencia

### Hojas de Ruta
- CRUD completo con asignación de camión, conductor y acompañante
- Ciclo de vida: Pendiente → En Progreso → Completada / Cancelada
- Visitas a clientes con orden secuencial (drag & sort)
- Registro de litros recolectados, fotos, receptor, pago
- Creación desde plantilla reusable

### Clientes
- CRUD completo con baja lógica (soft delete)
- Detalle con 8 tabs: General, Contactos, Puntos de Retiro, Contenedores, Contratos, Historial de Visitas, Documentos, Observaciones
- Contactos con visibilidad configurable para conductor mobile
- Puntos de retiro con coordenadas GPS y frecuencia de visita

### Camiones
- CRUD completo con baja lógica
- Asignación de conductor, dispositivo GPS, capacidad
- Estados: Activo, Mantenimiento, Detenido, En Ruta
- Datos técnicos: VIN, año, tipo de combustible, kilometraje, seguros

### Mantenimiento Preventivo
- Registro por categoría: Cambio de Aceite, Batería, Cubiertas, Frenos, ITV, Seguro, Otro
- Intervalos configurables en meses y kilómetros
- Estados: Próximo, Vencido, Vence Hoy, Completado
- Alertas en dashboard con resumen numérico
- Registro de costo y proveedor

### Conductores
- CRUD completo con baja lógica
- Datos de licencia (tipo, número, vencimiento)
- Asignación a camión
- Contacto de emergencia (JSON)
- Historial de equipamiento entregado

### GPS Tracking
- Mapa embebido de Google Maps con marcadores de camiones
- Visualización de posición en tiempo real (vía ControlSat API)

### App Mobile Conductor
- Login simplificado
- Ruta del día con visitas pendientes
- Flujo de recolección: abrir → foto → litros → DNI receptor → pago → productos → observaciones
- Estados de visita: Completada, Cerrada, Sin Aceite, Rechazada, Demorada, Reprogramada
- Cálculo automático de pago: Litros × Precio del aceite
- Generación de recibo PDF con jsPDF
- Envío de recibo por WhatsApp (Web Share API)

---

## Configuración para Desarrollo

### Requisitos
- Node.js 18+
- npm o yarn
- Proyecto Supabase configurado

### Variables de Entorno (.env)
```
VITE_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Instalación
```bash
npm install
npm run dev        # Inicia en http://localhost:3000
npm run build      # Build de producción
npm run preview    # Preview de build
```

### Usuario Admin por Defecto
- Email: `ambientalcord@gmail.com`
- Contraseña: `123456`
- Rol: `admin`

---

## Base de Datos

La plataforma utiliza 15 tablas en Supabase PostgreSQL con Row Level Security (RLS) completo:

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario (rol: admin/supervisor) |
| `customers` | Clientes (soft delete) |
| `customer_contacts` | Contactos por cliente |
| `customer_contracts` | Contratos / Convenios municipales |
| `pickup_points` | Puntos de retiro con GPS |
| `containers` | Contenedores por cliente |
| `drivers` | Conductores |
| `companions` | Acompañantes de ruta |
| `trucks` | Camiones (soft delete) |
| `truck_maintenance` | Registros de mantenimiento |
| `route_sheets` | Hojas de ruta |
| `route_visits` | Visitas dentro de una ruta |
| `route_templates` | Plantillas de ruta |
| `employee_equipment` | Equipamiento entregado a empleados |
| `manifests` | Manifiestos generados |
| `settings` | Configuración del sistema (precio aceite, etc.) |

Ver [docs/database-model.md](docs/database-model.md) para el modelo completo.

---

## Arquitectura de Seguridad

### Row Level Security (RLS)
- **Admin**: CRUD completo en todas las tablas operativas
- **Usuarios autenticados**: Lectura en todas las tablas
- **Perfiles**: Cada usuario ve y edita solo su propio perfil; admin ve todos

### Autenticación
- Supabase Auth con email/contraseña
- Persistencia de sesión en localStorage
- Refresh automático de token
- AuthGuard protege rutas privadas con redirección a `/login`

---

## Licencia

Software propietario — Ambiental Cord S.R.L. Todos los derechos reservados.