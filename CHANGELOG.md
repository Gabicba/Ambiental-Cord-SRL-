# Changelog

Historial de cambios del sistema Ambiental Cord S.R.L. — UCO Logistics Management Platform.

---

## [v2.0.0] — 2026-06-09 — Migración Completa a Supabase

### Cambios
- **Migración total de datos mock a Supabase** para todos los módulos de administración web:
  - Clientes: lista, creación, edición, detalle, baja lógica (soft delete)
  - Conductores: lista, creación, edición, detalle, baja lógica
  - Camiones: lista, creación, edición, detalle, baja lógica
  - Hojas de Ruta: lista, creación con visitas, detalle, cambio de estado
  - Plantillas de Ruta: lista, creación, edición, crear ruta desde plantilla
  - Mantenimiento: creación, edición, completado, recurrencia automática, eliminación
  - Contratos: creación, edición, eliminación dentro del detalle del cliente
  - Dashboard: KPIs reales, gráficos de litros semanales reales, top drivers reales desde route_sheets
- Eliminación de dependencias de `localStorage` para almacenamiento de datos
- Eliminación de imports de mocks en todos los hooks y páginas de administración web
- **Mocks eliminados:** customers, drivers, trucks, routes, route_templates, route_visits, contracts, maintenance, companions

### Datos mock que persisten (solo en app mobile)
- `mocks/driverApp.ts` — app del conductor
- `mocks/equipment.ts` — usado por la app mobile
- `mocks/dashboard.ts` — posiblemente sin uso, pendiente limpieza

---

## [v1.14.0] — 2026-06 — Equipamiento de Empleados (Fase 14)

### Agregado
- Módulo de equipamiento para empleados
- Registro de entrega: calzado, camperas, guantes, camisas, pantalones
- Cantidad, talle, fecha de entrega, fecha de reposición
- Historial de entrega por empleado
- Recordatorios de reposición

---

## [v1.13.0] — 2026-06 — Visibilidad de Contactos + Acompañantes (Fase 13)

### Agregado
- Flag `visible_to_driver` por contacto de cliente
- Solo contactos autorizados visibles en app mobile del conductor
- Registro de acompañantes: nombre completo, DNI, teléfono opcional
- Asignación de acompañante a hoja de ruta
- Tracking: Conductor + Acompañante + Camión + Ruta

---

## [v1.12.0] — 2026-06 — Mantenimiento Preventivo (Fase 12)

### Agregado
- Dashboard de mantenimiento con resumen por estado
- Registro por categoría: aceite, batería, cubiertas, frenos, ITV, seguro, otros
- Intervalos configurables en meses y kilómetros
- Alertas: Próximo, Vencido, Vence Hoy
- Widget de alertas en dashboard principal
- Historial de mantenimiento por camión
- Marcar como completado con actualización automática de próxima fecha

---

## [v1.11.0] — 2026-06 — Contratos de Clientes (Fase 11)

### Agregado
- Tab "Contratos/Convenios" en detalle de cliente
- Campos: nombre del acuerdo, municipio, archivo PDF, fechas, estado
- Estados: Activo, Por Vencer, Vencido, Renovado
- Indicador de alerta en lista de clientes y detalle

---

## [v1.10.0] — 2026-06 — Plantillas de Ruta (Fase 10)

### Agregado
- Listado de plantillas de ruta
- Creación con nombre, lista de clientes, orden y notas
- Detalle de plantilla con clientes guardados
- Crear ruta desde plantilla con posibilidad de modificar conductor, camión, clientes

---

## [v1.9.0] — 2026-06 — Cliente Demorado + Pago Automático + Recibo PDF + WhatsApp (Fase 9)

### Agregado
- Conductor puede marcar cliente como DEMORADO con motivo y hora estimada de retorno
- Nuevos estados de visita: Demorada, Reprogramada
- Cálculo automático de pago: Litros Recolectados × Precio del Aceite
- Precio del aceite configurable por administrador
- Almacenamiento de litros, precio, monto total, método de pago, flag completado
- Generación de recibo PDF automático post-recolección
- Envío de recibo PDF por WhatsApp (archivo, no link)

---

## [v1.8.0] — 2026-06 — App Mobile Conductor (Fase 8)

### Agregado
- Login simplificado para conductor
- Vista de ruta del día
- Flujo de visita: abrir → foto → litros → DNI receptor → pago → productos → observaciones
- Fotos obligatorias (cerrado, sin aceite, completado, comprobante)
- Estados de recolección: Completada, Cerrada, Sin Aceite, Rechazada
- Generación de recibo
- Flujo continuar al siguiente cliente

---

## [v1.7.0] — 2026-06 — Documentos y Manifiestos (Fase 7)

### Agregado
- Generación automática de PDF de manifiesto
- Campos: número, cliente, conductor, vehículo, litros, fotos, DNI, fecha
- Almacenamiento y consulta de documentos
- Galería de evidencia fotográfica

---

## [v1.6.0] — 2026-06 — Reportes y Analytics (Fase 6)

### Agregado
- Dashboard de KPIs: litros totales, rutas completadas, clientes visitados
- Reporte de productividad de conductores
- Reporte de pagos pendientes
- Estadísticas de recolección por zona y período
- Visualizaciones con gráficos (Recharts)

---

## [v1.5.0] — 2026-06 — GPS Monitoring (Fase 5)

### Agregado
- Mapa en vivo con marcadores de camiones
- Estructura de integración con API ControlSat
- Panel de velocidad, historial de ruta y eventos

---

## [v1.4.0] — 2026-06 — Gestión de Camiones y Conductores (Fase 4)

### Agregado
- Listado de camiones: patente, modelo, conductor asignado, GPS, estado
- Estados: Activo, Mantenimiento, Detenido, En Ruta
- Listado de conductores con camión asignado e info de contacto
- Asignación de conductores a camiones y rutas

---

## [v1.3.0] — 2026-06 — Módulo de Clientes (Fase 3)

### Agregado
- Listado de clientes con filtros (Activo, Inactivo, Prospecto, Zona)
- Creación rápida de prospecto (nombre fantasía, dirección, teléfono, localidad)
- Detalle de cliente con tabs: General, Contactos, Puntos de Retiro, Contenedores, Historial, Documentos
- Cliente puede existir sin CUIT
- Punto de retiro: dirección, GPS, frecuencia, horario, cantidad de contenedores

---

## [v1.2.0] — 2026-06 — Hoja de Ruta (Fase 2)

### Agregado
- Listado de rutas con filtros (Pendiente, En Progreso, Completada, Cancelada)
- Creación de ruta: asignar camión, conductor, clientes
- Detalle de ruta: ordenar visitas, trackear estado, ver progreso
- Ciclo de vida: Pendiente → En Progreso → Completada / Cancelada
- Conexión con cliente, camión, conductor, GPS, recolección, manifiesto

---

## [v1.1.0] — 2026-06 — Fundación del Dashboard (Fase 1)

### Agregado
- Sidebar izquierdo con navegación basada en roles
- Dashboard con tarjetas KPI (litros totales, rutas completadas, clientes visitados, pagos pendientes)
- Barra superior con info de usuario, notificaciones, búsqueda
- Layout responsive (desktop-first)
- Datos mock para todas las entidades
- Configuración de rutas para todos los módulos

---

## [v1.0.0] — 2026-06 — Lanzamiento Inicial

### Agregado
- Scaffolding del proyecto con React + TypeScript + TailwindCSS + Vite
- Integración con Supabase (base de datos + autenticación)
- Estructura base de componentes, hooks, páginas y routing