# App Conductores – MVP 1

## 1. Descripción del Proyecto
Aplicación móvil para conductores de empresas de logística, distribución y servicios de campo. Experiencia guiada paso a paso que permite registrar evidencia de cada visita sin que el conductor administre información — solo ejecuta tareas asignadas. Diseño Mobile First optimizado para trabajo en calle.

## 2. Estructura de Páginas
- `/` – Redirige al login si no hay sesión, o al resumen del día
- `/login` – Pantalla 1: Login del conductor (Supabase Auth)
- `/resumen` – Pantalla 2: Resumen del día (datos reales)
- `/hoja-ruta` – Pantalla 3: Listado de clientes asignados (hoja de ruta)
- `/cliente/:id` – Pantalla 4: Detalle del cliente
- `/cliente/:id/visita` – Pantalla 5: Registro de visita (UPDATE route_visits)
- `/cliente/:id/demorado` – Pantalla 6: Cliente demorado (marcar)
- `/pendientes` – Pantalla 7: Pendientes para volver
- `/mapa` – Pantalla 8: Mapa del recorrido
- `/historial` – Pantalla 9: Historial del día
- `/finalizar` – Pantalla 10: Finalizar jornada (UPDATE route_sheets)

## 3. Funcionalidades Principales
- [x] Login con Supabase Auth (email/contraseña) + búsqueda en tabla drivers
- [x] Resumen diario con indicadores (pendientes, completados, demorados)
- [x] Hoja de ruta con tarjetas de clientes por estado
- [x] Detalle del cliente con mapa, navegación GPS y llamada
- [x] Registro de visita con estados, observaciones, evidencia fotográfica
- [x] Marcado de clientes demorados con reasignación a pendientes
- [x] Lista de pendientes para volver con tiempos
- [x] Mapa del recorrido con posición actual y clientes
- [x] Historial cronológico del día con evidencias
- [x] Finalización de jornada con resumen

## 4. Modelo de Datos (Supabase — Schema del Admin)

### Tablas utilizadas (solo lectura):
- `profiles` — avatar_url del conductor (match por email con Auth)
- `drivers` — nombre, email, assigned_truck_id, licencia, estado
- `trucks` — plate, model, status
- `customers` — fantasy_name, address, phone
- `pickup_points` — address, lat, lng
- `customer_contacts` — name, phone, role (visible_to_driver = true)

### Tablas con escritura limitada:
- `route_visits` — UPDATE de: status, observations, receiver_name, receiver_dni, photos, visited_at, delay_reason, delay_return_time, updated_at
- `route_sheets` — UPDATE de: status = 'Completed'

### Tablas NO tocadas:
- `route_templates`, `customer_contracts`, `truck_maintenance`, `employee_equipment`, `manifests`, `settings`, `containers`, `companions`

## 5. Integraciones
- [x] Supabase Auth: Login de conductores
- [x] Supabase Database: Datos de ruta y visitas
- [x] Supabase Storage: Evidencia fotográfica (bucket `visit-evidence`)
- [ ] ControlSat: Integración con GPS (futuro)

## 6. Historial de Versiones
- **v0.1.0** — Demo inicial con mock data, 10 pantallas funcionales
- **v0.2.0** — Conexión real a Supabase, eliminación de mocks, login real, UPDATE de visitas