# App Conductor Demo — Documentación de integración Supabase

## Objetivo de la demo

Demo funcional de la app del conductor conectada al Supabase existente del sistema admin. El conductor puede iniciar sesión, ver su hoja de ruta asignada, registrar visitas con evidencia fotográfica, marcar clientes demorados, y finalizar su jornada. Todo usando **únicamente las tablas ya existentes** en la base de datos del admin, sin crear ni modificar nada en el schema.

## Alcance actual

### Pantallas conectadas a Supabase

| # | Pantalla | Ruta | Datos desde Supabase | Operación |
|---|----------|------|---------------------|-----------|
| 1 | Login | `/login` | `profiles` (Auth) + `drivers` | READ (Auth) |
| 2 | Resumen del día | `/resumen` | `drivers` + `trucks` + `route_sheets` + `route_visits` | READ |
| 3 | Hoja de Ruta | `/hoja-ruta` | `route_visits` + `customers` + `pickup_points` | READ |
| 4 | Cliente Detalle | `/cliente/:id` | `route_visits` + `customers` + `pickup_points` + `customer_contacts` | READ |
| 5 | Registro de Visita | `/cliente/:id/visita` | `route_visits` | UPDATE |
| 6 | Cliente Demorado | `/cliente/:id/demorado` | `route_visits` | UPDATE |
| 7 | Pendientes | `/pendientes` | `route_visits` (en memoria) | READ |
| 8 | Mapa del Recorrido | `/mapa` | `route_visits` + `pickup_points` | READ |
| 9 | Historial del Día | `/historial` | `route_visits` | READ |
| 10 | Finalizar Jornada | `/finalizar` | `route_sheets` | UPDATE |

### Tablas utilizadas (solo lectura)

- `profiles` — avatar del conductor (vía email match)
- `drivers` — datos del conductor, vehículo asignado
- `trucks` — patente, modelo
- `customers` — nombre fantasía, dirección, teléfono
- `pickup_points` — dirección de recolección, coordenadas
- `customer_contacts` — contactos visibles al conductor

### Tablas actualizadas (escritura limitada)

- `route_visits` — UPDATE de: `status`, `observations`, `receiver_name`, `receiver_dni`, `photos`, `visited_at`, `delay_reason`, `delay_return_time`, `updated_at`
- `route_sheets` — UPDATE de: `status = 'Completed'`

### Tablas NO tocadas

- `route_templates`
- `customer_contracts`
- `truck_maintenance`
- `employee_equipment`
- `manifests`
- `settings`
- `containers`
- `companions`

## Flujo del conductor

1. **Login**: Ingresa email y contraseña → Supabase Auth lo autentica → se busca su registro en `drivers` por email → si existe, ingresa a Resumen
2. **Resumen**: Ve su nombre, vehículo, patente, ruta del día, y conteo de visitas por estado
3. **Hoja de Ruta**: Lista de clientes ordenados por `visit_order`, con filtros por estado
4. **Cliente Detalle**: Datos completos del cliente, mapa, contactos, botón Navegar (Google Maps externo) y Llamar
5. **Registro de Visita**: Confirma llegada (`status = In_Progress`, `visited_at = NOW()`), registra estado, observaciones, fotos, datos de quién recibe, y finaliza
6. **Cliente Demorado**: Marca `status = Delayed`, se agrega a lista de pendientes
7. **Pendientes**: Lista de clientes demorados, con tiempo transcurrido, opción de volver a visitar
8. **Mapa**: Vista del recorrido con Google Maps embebido, filtros por estado
9. **Historial**: Cronología de visitas del día con fotos, observaciones, datos de recepción
10. **Finalizar**: Resumen de jornada, validación de pendientes, cierre (`route_sheets.status = 'Completed'`)

## Usuario demo

Para probar la app, crear un usuario en Supabase Auth con email que coincida con un registro en la tabla `drivers` (campo `email`).

## Limitaciones actuales

- **GPS real**: No se captura lat/lng del dispositivo. Los campos `gps_lat`/`gps_lng` en `route_visits` quedan sin actualizar.
- **Storage de fotos**: Las fotos se intentan subir a Supabase Storage bucket `visit-evidence`. Si el bucket no existe o falla, se usa URL local (blob) como fallback. Se recomienda crear el bucket `visit-evidence` con política pública de lectura.
- **Sin modo offline**: La app requiere conexión a internet para funcionar.
- **Sin notificaciones push**: No se notifica al conductor de cambios en la ruta.

## Pendientes futuros

- [ ] Captura de GPS real del dispositivo (`navigator.geolocation`)
- [ ] Modo offline con sincronización diferida
- [ ] Notificaciones push para cambios de ruta
- [ ] Integración con ControlSat (GPS de flota)
- [ ] Firma digital del receptor
- [ ] Chat con administración
- [ ] Descarga de reporte PDF de la jornada

## Archivos modificados

- `src/App.tsx` — Agregados AuthProvider y DriverDataProvider
- `src/lib/supabase.ts` — Nuevo: cliente singleton Supabase
- `src/hooks/useAuth.tsx` — Nuevo: contexto de autenticación
- `src/hooks/useDriverData.tsx` — Nuevo: contexto de datos de ruta
- `src/pages/home/page.tsx` — Redirección basada en auth
- `src/pages/login/page.tsx` — Login real con Supabase Auth
- `src/pages/resumen/page.tsx` — Datos reales de drivers/trucks/route_sheets/route_visits
- `src/pages/hoja-ruta/page.tsx` — Datos reales de route_visits con joins
- `src/pages/cliente-detalle/page.tsx` — Datos reales + customer_contacts
- `src/pages/registro-visita/page.tsx` — UPDATE real a route_visits + upload a Storage
- `src/pages/cliente-demorado/page.tsx` — UPDATE real a route_visits
- `src/pages/pendientes/page.tsx` — Datos reales de route_visits
- `src/pages/mapa/page.tsx` — Datos reales de route_visits + pickup_points
- `src/pages/historial/page.tsx` — Datos reales de route_visits
- `src/pages/finalizar/page.tsx` — UPDATE real a route_sheets
- `.env.example` — Nuevo: template de variables de entorno

## Mocks eliminados

- `src/mocks/driver.ts` — Ya no se usa, reemplazado por queries reales
- `src/mocks/clients.ts` — Ya no se usa, reemplazado por queries reales