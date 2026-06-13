# AmbientalCord — App Conductor Demo

Demo funcional de la app del conductor para el sistema de recolección de aceite vegetal usado (AVU).

## Stack

- **Frontend**: React 19 + TypeScript + TailwindCSS + Vite
- **Backend**: Supabase (Auth, Database, Storage)
- **Diseño**: Mobile-first, interfaz táctil optimizada para conductores en ruta

## Pantallas

| # | Pantalla | Ruta | Descripción |
|---|----------|------|-------------|
| 1 | Login | `/login` | Autenticación con Supabase Auth |
| 2 | Resumen | `/resumen` | Dashboard del conductor con ruta del día |
| 3 | Hoja de Ruta | `/hoja-ruta` | Lista de clientes a visitar ordenados |
| 4 | Cliente Detalle | `/cliente/:id` | Datos completos del cliente, mapa y contactos |
| 5 | Registro Visita | `/cliente/:id/visita` | Registro de visita con fotos y datos |
| 6 | Cliente Demorado | `/cliente/:id/demorado` | Marcar cliente como demorado |
| 7 | Pendientes | `/pendientes` | Clientes marcados como demorados |
| 8 | Mapa | `/mapa` | Vista del recorrido con Google Maps |
| 9 | Historial | `/historial` | Cronología de visitas del día |
| 10 | Finalizar | `/finalizar` | Cierre de jornada |

## App Conductor Demo conectada a Supabase

La demo está conectada al Supabase existente del sistema administrador. Usa únicamente las tablas ya creadas en el schema del admin, sin crear ni modificar ninguna estructura.

### Tablas utilizadas (solo lectura)
- `profiles`, `drivers`, `trucks`, `customers`, `pickup_points`, `customer_contacts`, `route_sheets`, `route_visits`

### Tablas actualizadas (escritura)
- `route_visits` — UPDATE de status, observations, receiver_name, receiver_dni, photos, timestamps
- `route_sheets` — UPDATE de status = 'Completed'

## Requisitos

- Node.js 18+
- Proyecto Supabase configurado con las variables `VITE_PUBLIC_SUPABASE_URL` y `VITE_PUBLIC_SUPABASE_ANON_KEY`
- Bucket `visit-evidence` en Supabase Storage (público)

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con las credenciales de Supabase
npm run dev
```

## Documentación

- [Documentación de la demo conductora](docs/mobile-driver-demo.md)
- [CHANGELOG](CHANGELOG.md)

## Licencia

Privado — AmbientalCord