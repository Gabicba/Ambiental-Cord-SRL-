# Documentación de Arquitectura — Ambiental Cord S.R.L.

---

## 1. Visión General

Ambiental Cord es una **Single Page Application (SPA)** construida con React 19 + TypeScript, utilizando **Supabase** como backend (PostgreSQL + Auth + Edge Functions). La aplicación sigue un patrón de arquitectura cliente-servidor delegando toda la lógica de negocio del lado del servidor a la base de datos PostgreSQL vía Supabase.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  React   │  │  Hooks   │  │  Pages   │  │  Router  │   │
│  │   SPA    │  │ (Custom) │  │ (Views)  │  │ (React   │   │
│  │          │  │          │  │          │  │  Router) │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                 │
│                   Supabase Client SDK                        │
│                   (@supabase/supabase-js)                    │
└────────────────────────────┬────────────────────────────────┘
                             │  HTTPS (PostgREST + Auth)
┌────────────────────────────┼────────────────────────────────┐
│                    SUPABASE                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │   Auth   │  │PostgREST │  │   Edge Functions          │  │
│  │ (GoTrue) │  │  (API)   │  │   (Deno Runtime)          │  │
│  └────┬─────┘  └────┬─────┘  └───────────┬──────────────┘  │
│       │             │                     │                  │
│       └─────────────┴──────────┬──────────┘                  │
│                                │                             │
│                     PostgreSQL Database                      │
│                    (RLS Policies + Triggers)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Componentes

### 2.1 Árbol de Componentes Principal

```
<App>
  <AuthProvider>
    <BrowserRouter basename={__BASE_PATH__}>
      <Routes>
        ├── /login → <LoginPage />
        ├── /* (protegido) → <AuthGuard>
        │   └── <DashboardLayout>
        │       ├── <Sidebar />        # Navegación principal
        │       ├── <TopBar />         # Barra superior con perfil
        │       └── <Outlet />         # Contenido de la página
        │           ├── <Dashboard />
        │           ├── <RoutesPage />
        │           ├── <CustomersPage />
        │           ├── <TrucksPage />
        │           └── ...
        ├── /driver → <DriverPage />   # App mobile conductor
        └── * → <NotFound />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
</App>
```

### 2.2 Jerarquía de Componentes por Capa

```
src/components/
├── auth/
│   └── AuthGuard.tsx          # Protege rutas: verifica sesión → redirige a /login
├── layout/
│   ├── DashboardLayout.tsx    # Shell del admin: sidebar + topbar + contenido
│   ├── Sidebar.tsx            # Navegación colapsable con filtro por rol
│   └── TopBar.tsx             # Búsqueda, notificaciones, avatar, logout
├── base/                      # Componentes UI atómicos (botones, inputs, cards, modals)
└── feature/                   # Componentes compuestos reusables (tablas, formularios, filtros)
```

---

## 3. Manejo de Estado y Datos

### 3.1 Patrón de Hooks Personalizados

Cada entidad del dominio sigue el mismo patrón de hook personalizado:

```
use[Entity]() → {
  data[], loading, error,
  refetch(), create[Entity](), update[Entity](), delete[Entity]()
}
```

**Ejemplo — `useCustomers()`:**

```
useCustomers() {
  Estado local: customers[], loading, error

  fetchCustomers() → supabase.from('customers').select().is('deleted_at', null)
  createCustomer() → supabase.from('customers').insert().select().single()
  updateCustomer() → supabase.from('customers').update().eq('id', id)
  deleteCustomer() → soft-delete: update deleted_at = now()
}
```

### 3.2 Flujo de Datos

```
Usuario interactúa con UI
        │
        ▼
Page Component → invoca hook (useCustomers, useRouteSheets, etc.)
        │
        ▼
Hook → llama a Supabase Client SDK
        │
        ▼
Supabase SDK → HTTP POST → PostgREST → PostgreSQL (con RLS)
        │
        ▼
Respuesta → Hook actualiza estado local → React re-renderiza → UI actualizada
```

### 3.3 Autenticación (useAuth)

La autenticación se maneja a través de un **React Context** global (`AuthProvider`):

```
AuthProvider
├── Estado: user, profile, session, loading
├── Al montar: getSession() → carga sesión + perfil desde profiles
├── onAuthStateChange: sincroniza cambios de sesión en tiempo real
├── signIn(email, password) → supabase.auth.signInWithPassword()
├── signOut() → supabase.auth.signOut()
└── Roles: profile.role ∈ {'admin', 'supervisor'}
```

---

## 4. Enrutamiento

### 4.1 Configuración

El enrutamiento usa **React Router DOM 7** con `BrowserRouter` y un `basename` dinámico inyectado por Vite (`__BASE_PATH__`).

**Archivos clave:**
- `src/router/index.ts` — Configura `BrowserRouter` + `AppRoutes`
- `src/router/config.tsx` — Define `RouteObject[]` con todas las rutas

### 4.2 Jerarquía de Rutas

```
/login                          # Público
/* (protegido)                  # Requiere AuthGuard
  ├── /                        # Dashboard
  ├── /routes/*                # Hojas de ruta + plantillas
  ├── /customers/*             # Clientes
  ├── /trucks/*                # Camiones + mantenimiento
  ├── /drivers/*               # Conductores
  ├── /companions              # Acompañantes
  ├── /equipment               # Equipamiento
  ├── /gps                     # GPS Tracking
  ├── /reports                 # Reportes
  ├── /documents               # Documentos
  └── /settings                # Configuración
/driver                         # App Mobile Conductor (layout separado)
*                               # 404
```

---

## 5. Seguridad

### 5.1 Row Level Security (RLS)

Cada tabla en PostgreSQL tiene políticas RLS que controlan el acceso:

| Rol | Permisos |
|-----|----------|
| **Admin** (`profiles.role = 'admin'`) | SELECT / INSERT / UPDATE / DELETE en todas las tablas |
| **Usuario autenticado** | SELECT en todas las tablas (solo lectura) |
| **Usuario propio** | SELECT + UPDATE en su registro de `profiles` |

### 5.2 Flujo de Autorización

```
1. Usuario hace login → Supabase Auth devuelve JWT + refresh token
2. JWT se envía en cada request al PostgREST
3. PostgreSQL evalúa las políticas RLS contra auth.uid() y profiles.role
4. Si no pasa RLS → error 401/403 → UI muestra estado de error
```

---

## 6. Integraciones Externas

### 6.1 Supabase
- **Auth**: Login/registro con email/contraseña, manejo de sesiones
- **Database**: PostgreSQL con PostgREST API. 15 tablas con RLS
- **Edge Functions**: Funciones Deno deployadas para lógica server-side

### 6.2 ControlSat API (GPS)
- Endpoints: `POST /login`, `GET /devices`, `GET /history`, `GET /events`
- Usado en la página `/gps` para monitoreo en tiempo real

### 6.3 Google Maps
- Embed via iframe en página GPS para visualización de rutas

### 6.4 PDF Generation (jsPDF)
- Generación de recibos de recolección y manifiestos en el cliente
- Los PDFs se generan en el navegador del conductor y se comparten por WhatsApp

---

## 7. Estilos y Diseño

### 7.1 Sistema de Diseño

- **Framework**: TailwindCSS 3.4 con configuración personalizada
- **CSS Variables**: Sistema de tokens OKLCH para temas claro/oscuro
- **Fuentes**: Inter (body) + Playfair Display (headings)
- **Íconos**: Remix Icon (linear) + Font Awesome 6.4

### 7.2 Responsive Design

La aplicación sigue un enfoque **desktop-first** con breakpoints:
- `md:` (768px) — Sidebar colapsa, navegación se adapta
- `lg:` (1024px) — Layouts multi-columna
- `sm:` (640px) — Formularios y cards se apilan verticalmente

---

## 8. Scripts y Build

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción → /out
npm run preview      # Preview del build
npm run lint         # ESLint con reglas estrictas
npm run type-check   # Verificación de tipos TypeScript
```

### Configuración de Vite

- **Alias**: `@/` → `src/`
- **Auto-import**: React y react-router-dom se importan automáticamente
- **Variables globales**: `__BASE_PATH__`, `__IS_PREVIEW__`, `__READDY_PROJECT_ID__`
- **Source maps**: Habilitados en build

---

## 9. Convenciones de Código

### 9.1 Nomenclatura
- **Archivos**: kebab-case (`use-customers.ts`, `route-sheets/page.tsx`)
- **Componentes**: PascalCase (`DashboardLayout`, `AuthGuard`)
- **Hooks**: camelCase con prefijo `use` (`useCustomers`, `useDashboardData`)
- **Interfaces**: PascalCase, sin prefijo `I` (`Customer`, `RouteSheet`)

### 9.2 Estructura de Páginas
Cada página sigue la estructura:
```
src/pages/[module]/
├── page.tsx                    # Componente principal de la página
└── components/                 # Componentes específicos de la página
    ├── [Module]List.tsx
    ├── [Module]Form.tsx
    └── ...
```

### 9.3 Patrones
- **Singleton Supabase**: Una única instancia del cliente en `src/lib/supabase.ts`
- **Custom Hooks**: Cada entidad tiene su hook con estado, loading, error y CRUD
- **Soft Delete**: Clientes, conductores y camiones usan `deleted_at` en lugar de DELETE físico
- **Datos mock**: Solo se usan en la app mobile (`/driver`). Todo el admin web está conectado a Supabase