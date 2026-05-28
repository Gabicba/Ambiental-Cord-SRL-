# Ambiental Cord S.R.L. — UCO Logistics Management Platform

## 1. Project Description

**Product Positioning:** Enterprise logistics ERP platform for used cooking oil (UCO) collection operations. Digitizes route planning, GPS tracking, customer management, collection evidence, and compliance documentation.

**Target Users:**
- **Administrators:** Full system access — create routes, manage customers/trucks/drivers, view reports, generate manifests, configure oil prices, manage maintenance alerts, route templates, employee equipment
- **Supervisors:** Monitor operations, view routes, track driver activity, review maintenance schedules
- **Drivers:** Mobile-first interface — execute assigned routes, register collections, take photos, generate receipts, mark delays, receive automatic payment calculations

**Core Value:** Replace Excel-based route planning, paper manifests, and manual phone calls with a centralized digital platform that provides complete traceability from route creation to collection completion, including automatic payment calculation, PDF receipt generation, WhatsApp delivery, and preventive maintenance alerts.

## 2. Page Structure

### Web App (Admin / Supervisor)

| Route | Page | Role |
|-------|------|------|
| `/` | Dashboard (KPIs + Overview + Maintenance Alerts) | Admin, Supervisor |
| `/routes` | Route Sheet List | Admin, Supervisor |
| `/routes/:id` | Route Sheet Detail | Admin, Supervisor |
| `/routes/new` | Create Route Sheet | Admin |
| `/routes/templates` | Route Templates | Admin |
| `/routes/templates/:id` | Route Template Detail | Admin |
| `/routes/templates/new` | Create Route Template | Admin |
| `/customers` | Customer List | Admin, Supervisor |
| `/customers/:id` | Customer Detail (tabs) | Admin, Supervisor |
| `/customers/new` | Create Customer | Admin |
| `/trucks` | Truck/Vehicle List | Admin |
| `/trucks/:id` | Truck Detail | Admin |
| `/trucks/:id/maintenance` | Truck Maintenance History | Admin |
| `/trucks/new` | New Truck | Admin |
| `/drivers` | Driver List | Admin |
| `/drivers/:id` | Driver Detail | Admin |
| `/drivers/:id/equipment` | Driver Equipment / Uniforms | Admin |
| `/drivers/new` | New Driver | Admin |
| `/gps` | GPS Monitoring (Live Map) | Admin, Supervisor |
| `/reports` | Reports & Analytics | Admin, Supervisor |
| `/documents` | Documents & Manifests | Admin, Supervisor |
| `/settings` | System Settings (Oil Price, Contact Visibility) | Admin |
| `/maintenance` | Vehicle Maintenance Dashboard | Admin, Supervisor |
| `/maintenance/alerts` | Maintenance Alerts | Admin |
| `/equipment` | Employee Equipment / Uniforms | Admin |

### Mobile-First Driver App

| Route | Page |
|-------|------|
| `/driver` | Driver Login / Route Overview |
| `/driver/route` | Today's Route |
| `/driver/collect/:id` | Collection Registration |
| `/driver/delay/:id` | Mark Customer as Delayed |
| `/driver/evidence` | Photo Evidence |
| `/driver/receipt` | Receipt Generation + PDF + WhatsApp |
| `/driver/companion` | Companion Registration |

## 3. Core Features

### Phase 1: Dashboard Foundation
- [x] Left sidebar navigation with role-based items
- [x] Dashboard home with KPI cards (total liters, routes completed, clients visited, pending payments)
- [x] Top bar with user info, notifications, search
- [x] Responsive layout (desktop-first, mobile sidebar)
- [x] Mock data for all entities

### Phase 2: Hoja de Ruta (Route Sheet) — Core Module
- [x] Route list with filters (Pending, In Progress, Completed, Canceled)
- [x] Create route: assign truck, driver, customers
- [x] Route detail: sort visits, track status, view progress
- [x] Route status workflow: Pending → In Progress → Completed / Canceled
- [x] Connect client, truck, driver, GPS, collection, manifest

### Phase 3: Customer Module
- [x] Customer list with filters (Active, Inactive, Prospect, Zone)
- [x] Quick prospect creation (fantasy name, address, phone, location)
- [x] Customer detail with tabs: General, Contacts, Pickup Points, Containers, History, Documents
- [x] Customer can exist without CUIT
- [x] Pickup point: address, GPS, frequency, schedule, container count

### Phase 4: Truck & Driver Management
- [x] Truck list: plate, model, assigned driver, GPS device, status
- [x] Truck statuses: Active, Maintenance, Stopped, On Route
- [x] Driver list with assigned truck, contact info
- [x] Driver assignment to trucks and routes

### Phase 5: GPS Monitoring
- [x] Live map with truck markers
- [x] ControlSat API integration (login, devices, history, events)
- [x] Speed, route history, events display
- [x] Driver location tracking

### Phase 6: Reports & Analytics
- [x] KPI dashboard: total liters, routes completed, clients visited
- [x] Driver productivity reports
- [x] Pending payments report
- [x] Collection statistics by zone, period
- [x] Chart visualizations

### Phase 7: Documents & Manifests
- [x] Automatic PDF manifest generation
- [x] Manifest includes: number, client, driver, vehicle, liters, photos, DNI, date
- [x] Document storage and retrieval
- [x] Photo evidence gallery

### Phase 8: Mobile Driver Interface
- [x] Ultra-simplified driver login
- [x] Today's route view
- [x] Customer visit flow: open → photo → liters → receiver DNI/name → payment → products → observations
- [x] Mandatory photos (closed, no oil, completed, proof)
- [x] Collection statuses: Completed, Closed, No Oil, Rejected
- [x] Receipt generation
- [x] Continue to next customer flow

### Phase 9: Delayed Customer + Auto Payment + PDF Receipt + WhatsApp ✅ COMPLETE
- [x] Driver can mark customer as DELAYED with reason and estimated return time
- [x] Delayed customers can be revisited later in the route
- [x] New visit statuses: Delayed, Rescheduled
- [x] Automatic oil payment calculation: Collected Liters × Oil Price
- [x] Oil price configurable by administrator in Settings
- [x] Store: liters, price at moment, total amount, payment method, payment completed flag
- [x] Generate automatic payment receipt
- [x] Generate PDF receipt after collection
- [x] Send PDF receipt directly through WhatsApp (file, not link)
- [x] Share PDF and Send WhatsApp PDF buttons

### Phase 10: Route Templates
- [x] Route template list page
- [x] Create template with name, customer list, order, notes
- [x] Template detail: view saved customers and order
- [x] Create route from template
- [x] Before saving from template: change driver, change truck, add/remove customers, change order
- [x] Avoid rebuilding recurring routes

### Phase 11: Customer Contracts / Municipal Agreements ✅ COMPLETE
- [x] Contracts/Agreements tab inside customer profile
- [x] Fields: agreement name, municipality, PDF attachment, start date, expiration date, notes
- [x] Alert types: Expiring, Expired, Renewed
- [x] Alert indicator on customer list and detail

### Phase 12: Vehicle Maintenance Alerts ✅ COMPLETE
- [x] Preventive maintenance module
- [x] Register: oil changes, batteries, tire rotation, brakes, ITV, insurance
- [x] Reminder intervals configurable (e.g., battery after 6 months)
- [x] Notification types: Upcoming, Expired
- [x] Dashboard alert widget
- [x] Maintenance history per truck
- [x] Maintenance summary page at /trucks/maintenance
- [x] Sidebar navigation link
- [x] Alert summary cards (Expired, Due, Upcoming, Total)
- [x] Urgent alerts banner
- [x] Filterable maintenance table by category and status
- [x] Per-truck maintenance summary cards
- [x] Mark as completed action

### Phase 13: Driver Contact Visibility + Driver Companion ✅ COMPLETE
- [x] Per-contact flag: Visible to driver YES/NO
- [x] Only authorized contacts appear in mobile app
- [x] Companion registration: full name, DNI, optional phone
- [x] Assign companion to route
- [x] Track: Driver + Companion + Truck + Route

### Phase 14: Employee Uniforms / Equipment
- [x] Employee equipment tracking module
- [x] Items: shoes, jackets, gloves, shirts, pants
- [x] Store: quantity, size, delivery date, replacement date, notes
- [x] Delivery history per employee
- [x] Reminders for replacement
- [x] Equipment page listing all assignments

## 4. Data Model Design

### Table: customers
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| fantasy_name | text | Business name (required) |
| cuit | text | Tax ID (optional) |
| address | text | Main address |
| phone | text | Contact phone |
| location | text | City/Zone |
| status | enum | Active, Inactive, Prospect |
| type | enum | Client, Prospect |
| tax_info | jsonb | Optional tax details |
| created_at | timestamp | |
| updated_at | timestamp | |

### Table: customer_contacts
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| customer_id | uuid | FK to customers |
| name | text | Contact name |
| phone | text | Contact phone |
| email | text | Contact email |
| role | text | Role/position |
| visible_to_driver | boolean | Show in mobile app |

### Table: pickup_points
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| customer_id | uuid | FK to customers |
| address | text | Pickup address |
| lat | float | GPS latitude |
| lng | float | GPS longitude |
| frequency | text | Visit frequency |
| schedule | text | Visit schedule |
| container_count | int | Number of containers |
| observations | text | Notes |

### Table: trucks
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| plate | text | License plate |
| model | text | Vehicle model |
| assigned_driver_id | uuid | FK to drivers |
| gps_device_id | text | ControlSat device ID |
| status | enum | Active, Maintenance, Stopped, On_Route |
| capacity_liters | int | Tank capacity |
| created_at | timestamp | |

### Table: truck_maintenance
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| truck_id | uuid | FK to trucks |
| type | enum | Oil_Change, Battery, Tires, Brakes, ITV, Insurance, Other |
| description | text | Detail |
| last_done_date | date | Last maintenance date |
| next_due_date | date | Next due date |
| interval_months | int | Reminder interval |
| status | enum | Upcoming, Expired, Done |
| notes | text | Notes |
| created_at | timestamp | |

### Table: drivers
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Full name |
| phone | text | Contact phone |
| dni | text | National ID |
| license_type | text | License category |
| status | enum | Active, Inactive, On_Route |
| assigned_truck_id | uuid | FK to trucks |
| created_at | timestamp | |

### Table: route_sheets
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Route name |
| truck_id | uuid | FK to trucks |
| driver_id | uuid | FK to drivers |
| companion_id | uuid | FK to companions (optional) |
| date | date | Route date |
| status | enum | Pending, In_Progress, Completed, Canceled |
| total_liters | int | Total collected |
| total_clients | int | Number of clients |
| created_by | uuid | Admin who created |
| created_at | timestamp | |

### Table: route_visits
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| route_id | uuid | FK to route_sheets |
| customer_id | uuid | FK to customers |
| pickup_point_id | uuid | FK to pickup_points |
| visit_order | int | Sequence in route |
| status | enum | Pending, Visited, Skipped, No_Oil, Closed, Delayed, Rescheduled |
| liters_collected | int | Amount collected |
| oil_price_at_collection | decimal | Oil price at that moment |
| total_payment | decimal | Auto-calculated payment |
| payment_method | text | Cash, Transfer, Pending |
| payment_completed | boolean | YES/NO |
| receiver_name | text | Who received |
| receiver_dni | text | Receiver ID |
| products_delivered | text | Products left |
| observations | text | Notes |
| delay_reason | text | Why delayed |
| delay_return_time | text | Estimated return |
| photos | jsonb | Array of photo URLs |
| gps_lat | float | Visit latitude |
| gps_lng | float | Visit longitude |
| visited_at | timestamp | |

### Table: route_templates
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Template name |
| customer_ids | uuid[] | Array of customer IDs |
| visit_order | jsonb | Customer order mapping |
| notes | text | Notes |
| created_by | uuid | Admin who created |
| created_at | timestamp | |

### Table: customer_contracts
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| customer_id | uuid | FK to customers |
| agreement_name | text | Name of agreement |
| municipality | text | Municipality name |
| pdf_url | text | PDF attachment URL |
| start_date | date | Agreement start |
| expiration_date | date | Agreement expiration |
| status | enum | Active, Expiring, Expired, Renewed |
| notes | text | Notes |
| created_at | timestamp | |

### Table: companions
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| full_name | text | Companion name |
| dni | text | National ID |
| phone | text | Optional phone |
| created_at | timestamp | |

### Table: employee_equipment
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| employee_id | uuid | FK to drivers |
| item_type | enum | Shoes, Jacket, Gloves, Shirt, Pants, Other |
| quantity | int | Quantity |
| size | text | Size |
| delivery_date | date | When delivered |
| replacement_date | date | When to replace |
| notes | text | Notes |
| created_at | timestamp | |

### Table: manifests
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| manifest_number | text | Unique manifest number |
| route_visit_id | uuid | FK to route_visits |
| client_name | text | Client name |
| driver_name | text | Driver name |
| vehicle_plate | text | Truck plate |
| liters | int | Collected liters |
| photos | jsonb | Photo URLs |
| receiver_dni | text | |
| date | timestamp | |
| pdf_url | text | Generated PDF |

### Table: settings
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| oil_price_per_liter | decimal | Current oil price |
| updated_at | timestamp | |
| updated_by | uuid | Admin who updated |

## 5. Backend / Third-party Integration Plan

- **Supabase:** Authentication, database, storage for photos and documents (future connection)
- **ControlSat API:** GPS device integration — endpoints: POST login, GET devices, GET history, GET events
- **Google Maps:** Embed iframe for route visualization and GPS tracking
- **PDF Generation:** Client-side PDF generation for receipts and manifests (jsPDF or similar)
- **WhatsApp Sharing:** Web Share API + WhatsApp Web link for PDF file sharing
- **Cloud Storage:** Supabase Storage for photos and documents (future)

## 6. Development Phase Plan

### Phase 1: Dashboard Foundation + KPI Overview
**Goal:** Establish the visual shell and navigation. Build the dashboard home with KPI cards and mock data.
**Deliverable:**
- Sidebar navigation with all module links
- Top bar with notifications and user info
- Dashboard home with 6+ KPI cards
- Chart widgets for collections over time
- Recent routes table
- Mock data files for dashboard, routes, customers, trucks, drivers
- Routing setup for all modules

### Phase 2: Hoja de Ruta (Route Sheet) — Core Module
**Goal:** Build the route planning and execution module.
**Deliverable:**
- Route list page with filters and status badges
- Route creation form (assign truck, driver, customers)
- Route detail page with visit list and status tracking
- Route status workflow buttons

### Phase 3: Customer Module
**Goal:** Complete customer management with full detail view.
**Deliverable:**
- Customer list with search and filters
- Quick prospect creation (minimal data)
- Customer detail with tabbed interface (General, Contacts, Pickup Points, Containers, History, Documents)
- Customer edit form

### Phase 4: Truck & Driver Management
**Goal:** Manage fleet and personnel.
**Deliverable:**
- Truck list with status indicators
- Truck detail and assignment
- Driver list with contact info
- Driver detail and assignment to trucks

### Phase 5: GPS Monitoring
**Goal:** Visualize fleet location on map.
**Deliverable:**
- GPS monitoring page with embedded Google Map
- Truck markers with live status
- ControlSat API integration structure
- Speed and event display panel

### Phase 6: Reports & Analytics
**Goal:** Provide operational insights.
**Deliverable:**
- Reports dashboard with KPIs
- Collection charts by period
- Driver productivity table
- Pending payments report
- Export functionality structure

### Phase 7: Documents & Manifests
**Goal:** Handle compliance documentation.
**Deliverable:**
- Document list and gallery
- Manifest generation UI
- Photo evidence viewer
- PDF preview for manifests

### Phase 8: Mobile Driver Interface
**Goal:** Ultra-simple mobile-first driver app.
**Deliverable:**
- Driver login page
- Route overview for today
- Customer visit registration flow
- Photo capture interface (simulated)
- Receipt generation screen
- Collection status selection
- Continue to next customer flow

### Phase 9: Delayed Customer + Auto Payment + PDF Receipt + WhatsApp
**Goal:** Extend driver app with delayed customer handling, automatic oil payment calculation, PDF receipt generation, and WhatsApp sharing.
**Deliverable:**
- Delay customer screen with reason and return time
- Update visit statuses: Delayed, Rescheduled
- Allow revisiting delayed customers later in route
- Oil price setting in admin Settings page
- Auto-calculate payment: liters × price
- Store payment details (price at moment, total, method, completed flag)
- PDF receipt generation with jsPDF
- Share PDF via Web Share API
- WhatsApp PDF sharing simulation

### Phase 10: Route Templates ✅ COMPLETE
**Goal:** Allow administrators to create reusable route templates to avoid rebuilding recurring routes.
**Deliverable:**
- [x] Route template list page
- [x] Create template form (name, customer list, order, notes)
- [x] Template detail page
- [x] Create route from template with prefill
- [x] Before saving from template: change driver, change truck, add/remove customers, change order

### Phase 11: Customer Contracts / Municipal Agreements
**Goal:** Track municipality agreements inside customer profiles with expiration alerts.
**Deliverable:**
- Contracts/Agreements tab in customer detail
- Contract form with all fields
- Alert system: Expiring, Expired, Renewed
- Contract status indicator in customer list

### Phase 12: Vehicle Maintenance Alerts
**Goal:** Add preventive maintenance tracking with upcoming and expired notifications.
**Deliverable:**
- Maintenance dashboard page
- Add maintenance record form per truck
- Maintenance types: oil changes, batteries, tire rotation, brakes, ITV, insurance
- Configurable reminder intervals
- Dashboard alert widget
- Notification badges: Upcoming, Expired

### Phase 13: Driver Contact Visibility + Driver Companion
**Goal:** Control which contacts drivers see, and track route companions.
**Deliverable:**
- Per-contact "visible_to_driver" toggle in customer contacts
- Filter contacts in mobile app based on visibility
- Companion model and form
- Assign companion to route
- Display companion in route detail

### Phase 14: Employee Uniforms / Equipment
**Goal:** Track employee equipment delivery and replacement reminders.
**Deliverable:**
- Equipment page listing all assignments
- Assign equipment to employee form
- Item types: shoes, jackets, gloves, shirts, pants
- Delivery history per employee
- Replacement reminder logic
- Equipment tab in driver detail