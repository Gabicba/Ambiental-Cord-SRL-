# CHANGELOG

## v0.2.0 - App Conductor Demo conectada a Supabase (2026-06-13)

### Conectado a Supabase
- Login real con Supabase Auth (email/contraseña)
- Búsqueda del conductor en tabla `drivers` por email
- Datos reales de `drivers`, `trucks`, `route_sheets`, `route_visits`, `customers`, `pickup_points`, `customer_contacts`
- UPDATE real de `route_visits` (status, observations, receiver, photos, timestamps)
- UPDATE real de `route_sheets` (finalizar jornada)
- Subida de fotos a Supabase Storage (bucket `visit-evidence`)

### Eliminado
- Mock data: `driverMock`, `daySummaryMock`, `routeClientsMock`
- Login falso con timeout

### Agregado
- Cliente Supabase singleton (`src/lib/supabase.ts`)
- Contexto de autenticación (`src/hooks/useAuth.tsx`)
- Contexto de datos de ruta (`src/hooks/useDriverData.tsx`)
- `.env.example`
- Documentación (`docs/mobile-driver-demo.md`)

### Sin cambios
- Schema de base de datos (cero migraciones)
- RLS / Policies
- Diseño visual
- Navegación y rutas

---

## v0.1.0 - Demo inicial con mock data
- 10 pantallas del flujo conductor
- Mock data completa
- Navegación funcional
- Diseño mobile-first