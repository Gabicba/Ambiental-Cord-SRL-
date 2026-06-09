export const mockCustomers = [
  {
    id: 'CLI-001',
    fantasy_name: 'Parrilla Don Jose',
    cuit: '30-12345678-9',
    address: 'Av. Corrientes 3456, CABA',
    phone: '+54 11 4567-8901',
    location: 'Centro',
    status: 'Active',
    type: 'Client',
    contacts: [
      { name: 'Roberto Diaz', phone: '+54 11 4567-8901', email: 'roberto@donjose.com', role: 'Encargado', visible_to_driver: true },
      { name: 'Laura Sanchez', phone: '+54 11 4567-8902', email: 'laura@donjose.com', role: 'Subgerente', visible_to_driver: false },
    ],
    pickup_points: [
      { address: 'Av. Corrientes 3456', lat: -34.6037, lng: -58.3816, frequency: 'Semanal', schedule: 'Lunes 10:00', container_count: 2, observations: 'Entrar por cochera' },
    ],
    containers: [
      { id: 'CONT-001-1', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-15', location: 'Av. Corrientes 3456' },
      { id: 'CONT-001-2', type: 'Bidon 50L', capacity: 50, status: 'Active', last_cleaned: '2026-04-15', location: 'Av. Corrientes 3456' },
    ],
    history: [
      { date: '2026-05-12', route: 'RT-2026-001', liters: 145, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-05-05', route: 'RT-2026-008', liters: 132, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-04-28', route: 'RT-2026-015', liters: 158, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
      { date: '2026-04-21', route: 'RT-2026-022', liters: 120, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-04-14', route: 'RT-2026-029', liters: 140, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
    ],
    documents: [
      { id: 'DOC-001-1', type: 'Contrato', name: 'Contrato de Servicio 2026', date: '2026-01-15', status: 'Active' },
      { id: 'DOC-001-2', type: 'Manifiesto', name: 'Manifiesto RT-2026-001', date: '2026-05-12', status: 'Completed' },
      { id: 'DOC-001-3', type: 'Manifiesto', name: 'Manifiesto RT-2026-008', date: '2026-05-05', status: 'Completed' },
    ],
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'CLI-002',
    fantasy_name: 'Restaurante La Brasserie',
    cuit: null,
    address: 'Av. del Libertador 5678, Palermo',
    phone: '+54 11 4789-0123',
    location: 'Norte',
    status: 'Active',
    type: 'Client',
    contacts: [
      { name: 'Ana Martinez', phone: '+54 11 4789-0123', email: 'ana@labrasserie.com', role: 'Gerente', visible_to_driver: true },
    ],
    pickup_points: [
      { address: 'Av. del Libertador 5678', lat: -34.5785, lng: -58.4267, frequency: '2x semana', schedule: 'Martes y Viernes 09:00', container_count: 3, observations: '' },
    ],
    containers: [
      { id: 'CONT-002-1', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-03-20', location: 'Av. del Libertador 5678' },
      { id: 'CONT-002-2', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-03-20', location: 'Av. del Libertador 5678' },
      { id: 'CONT-002-3', type: 'Bidon 50L', capacity: 50, status: 'Maintenance', last_cleaned: '2026-02-10', location: 'Av. del Libertador 5678' },
    ],
    history: [
      { date: '2026-05-13', route: 'RT-2026-002', liters: 210, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
      { date: '2026-05-10', route: 'RT-2026-009', liters: 195, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
      { date: '2026-05-06', route: 'RT-2026-016', liters: 225, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-04-29', route: 'RT-2026-023', liters: 180, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
    ],
    documents: [
      { id: 'DOC-002-1', type: 'Contrato', name: 'Contrato de Servicio 2026', date: '2026-02-01', status: 'Active' },
      { id: 'DOC-002-2', type: 'Manifiesto', name: 'Manifiesto RT-2026-002', date: '2026-05-13', status: 'Completed' },
    ],
    created_at: '2025-04-20T11:00:00Z',
  },
  {
    id: 'CLI-003',
    fantasy_name: 'Bar El Faro',
    cuit: '30-87654321-0',
    address: 'Calle Defensa 1234, San Telmo',
    phone: '+54 11 4345-6789',
    location: 'Centro',
    status: 'Active',
    type: 'Client',
    contacts: [
      { name: 'Miguel Angel', phone: '+54 11 4345-6789', email: 'miguel@elfaro.com', role: 'Propietario', visible_to_driver: true },
    ],
    pickup_points: [
      { address: 'Calle Defensa 1234', lat: -34.6191, lng: -58.3712, frequency: 'Semanal', schedule: 'Miercoles 14:00', container_count: 1, observations: 'Llamar antes de llegar' },
    ],
    containers: [
      { id: 'CONT-003-1', type: 'Bidon 100L', capacity: 100, status: 'Active', last_cleaned: '2026-04-01', location: 'Calle Defensa 1234' },
    ],
    history: [
      { date: '2026-05-14', route: 'RT-2026-003', liters: 78, driver: 'Luis Rodriguez', truck: 'AE789GH', status: 'Completed' },
      { date: '2026-05-07', route: 'RT-2026-010', liters: 65, driver: 'Luis Rodriguez', truck: 'AE789GH', status: 'Completed' },
      { date: '2026-04-30', route: 'RT-2026-017', liters: 82, driver: 'Luis Rodriguez', truck: 'AE789GH', status: 'Completed' },
    ],
    documents: [
      { id: 'DOC-003-1', type: 'Contrato', name: 'Contrato de Servicio 2026', date: '2026-01-20', status: 'Active' },
    ],
    created_at: '2025-05-10T09:00:00Z',
  },
  {
    id: 'CLI-004',
    fantasy_name: 'Pizzeria Napoli Express',
    cuit: null,
    address: 'Av. Rivadavia 7890, Flores',
    phone: '+54 11 5678-9012',
    location: 'Oeste',
    status: 'Prospect',
    type: 'Prospect',
    contacts: [
      { name: 'Lucia Fernandez', phone: '+54 11 5678-9012', email: '', role: 'Dueña', visible_to_driver: false },
    ],
    pickup_points: [
      { address: 'Av. Rivadavia 7890', lat: -34.6289, lng: -58.4602, frequency: '', schedule: '', container_count: 0, observations: 'Interesada en servicio' },
    ],
    containers: [],
    history: [],
    documents: [
      { id: 'DOC-004-1', type: 'Propuesta', name: 'Propuesta Comercial Napoli', date: '2026-05-15', status: 'Pending' },
    ],
    created_at: '2026-05-15T14:00:00Z',
  },
  {
    id: 'CLI-005',
    fantasy_name: 'Sushi Bar Tokyo',
    cuit: '30-11112222-3',
    address: 'Calle Armenia 1567, Palermo',
    phone: '+54 11 4567-2345',
    location: 'Norte',
    status: 'Inactive',
    type: 'Client',
    contacts: [
      { name: 'Kenji Tanaka', phone: '+54 11 4567-2345', email: 'kenji@tokyosushi.com', role: 'Chef', visible_to_driver: true },
    ],
    pickup_points: [
      { address: 'Calle Armenia 1567', lat: -34.5891, lng: -58.4321, frequency: 'Semanal', schedule: 'Jueves 11:00', container_count: 1, observations: 'Temporalmente cerrado' },
    ],
    containers: [
      { id: 'CONT-005-1', type: 'Bidon 100L', capacity: 100, status: 'Inactive', last_cleaned: '2026-01-10', location: 'Calle Armenia 1567' },
    ],
    history: [
      { date: '2026-03-20', route: 'RT-2026-045', liters: 45, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-03-13', route: 'RT-2026-052', liters: 38, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
    ],
    documents: [
      { id: 'DOC-005-1', type: 'Contrato', name: 'Contrato de Servicio 2025', date: '2025-01-10', status: 'Inactive' },
    ],
    created_at: '2025-06-01T08:00:00Z',
  },
  {
    id: 'CLI-006',
    fantasy_name: 'Hotel Continental Catering',
    cuit: '30-44445555-6',
    address: 'Av. 9 de Julio 2000, CABA',
    phone: '+54 11 4321-9876',
    location: 'Centro',
    status: 'Active',
    type: 'Client',
    contacts: [
      { name: 'Patricia Lopez', phone: '+54 11 4321-9876', email: 'patricia@continental.com', role: 'Jefa de Cocina', visible_to_driver: true },
      { name: 'Hector Ruiz', phone: '+54 11 4321-9877', email: 'h.ruiz@continental.com', role: 'Mantenimiento', visible_to_driver: false },
      { name: 'Maria Gonzalez', phone: '+54 11 4321-9878', email: 'maria@continental.com', role: 'Administracion', visible_to_driver: true },
    ],
    pickup_points: [
      { address: 'Av. 9 de Julio 2000 - Cocina Principal', lat: -34.6051, lng: -58.3813, frequency: '3x semana', schedule: 'Lun-Mie-Vie 08:00', container_count: 5, observations: 'Acceso por calle lateral' },
      { address: 'Av. 9 de Julio 2000 - Eventos', lat: -34.6053, lng: -58.3815, frequency: 'Bajo demanda', schedule: 'Segun evento', container_count: 2, observations: 'Solo con reserva previa' },
    ],
    containers: [
      { id: 'CONT-006-1', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-10', location: 'Av. 9 de Julio 2000 - Cocina Principal' },
      { id: 'CONT-006-2', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-10', location: 'Av. 9 de Julio 2000 - Cocina Principal' },
      { id: 'CONT-006-3', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-10', location: 'Av. 9 de Julio 2000 - Cocina Principal' },
      { id: 'CONT-006-4', type: 'Bidon 100L', capacity: 100, status: 'Active', last_cleaned: '2026-04-10', location: 'Av. 9 de Julio 2000 - Cocina Principal' },
      { id: 'CONT-006-5', type: 'Bidon 50L', capacity: 50, status: 'Active', last_cleaned: '2026-04-10', location: 'Av. 9 de Julio 2000 - Cocina Principal' },
      { id: 'CONT-006-6', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-03-15', location: 'Av. 9 de Julio 2000 - Eventos' },
      { id: 'CONT-006-7', type: 'Bidon 100L', capacity: 100, status: 'Active', last_cleaned: '2026-03-15', location: 'Av. 9 de Julio 2000 - Eventos' },
    ],
    history: [
      { date: '2026-05-12', route: 'RT-2026-001', liters: 320, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-05-10', route: 'RT-2026-009', liters: 280, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
      { date: '2026-05-08', route: 'RT-2026-011', liters: 150, driver: 'Luis Rodriguez', truck: 'AE789GH', status: 'Completed' },
      { date: '2026-05-05', route: 'RT-2026-016', liters: 310, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-05-03', route: 'RT-2026-018', liters: 95, driver: 'Luis Rodriguez', truck: 'AE789GH', status: 'Completed' },
      { date: '2026-04-28', route: 'RT-2026-024', liters: 290, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
    ],
    documents: [
      { id: 'DOC-006-1', type: 'Contrato', name: 'Contrato de Servicio 2026 - Principal', date: '2026-01-05', status: 'Active' },
      { id: 'DOC-006-2', type: 'Contrato', name: 'Adenda Eventos 2026', date: '2026-02-01', status: 'Active' },
      { id: 'DOC-006-3', type: 'Manifiesto', name: 'Manifiesto RT-2026-001', date: '2026-05-12', status: 'Completed' },
      { id: 'DOC-006-4', type: 'Manifiesto', name: 'Manifiesto RT-2026-009', date: '2026-05-10', status: 'Completed' },
    ],
    created_at: '2025-02-10T07:00:00Z',
  },
  {
    id: 'CLI-007',
    fantasy_name: 'Cerveceria Artesanal Patagonia',
    cuit: null,
    address: 'Calle Gorriti 2345, Palermo',
    phone: '+54 11 4987-6543',
    location: 'Norte',
    status: 'Prospect',
    type: 'Prospect',
    contacts: [
      { name: 'Diego Marchetti', phone: '+54 11 4987-6543', email: 'diego@patagoniabeer.com', role: 'Gerente', visible_to_driver: true },
    ],
    pickup_points: [
      { address: 'Calle Gorriti 2345', lat: -34.5912, lng: -58.4289, frequency: '', schedule: '', container_count: 0, observations: 'Primera visita programada' },
    ],
    containers: [],
    history: [],
    documents: [
      { id: 'DOC-007-1', type: 'Propuesta', name: 'Propuesta Comercial Patagonia', date: '2026-05-18', status: 'Pending' },
    ],
    created_at: '2026-05-18T10:30:00Z',
  },
  {
    id: 'CLI-008',
    fantasy_name: 'Fabrica de Empanadas La Masa',
    cuit: '30-77778888-9',
    address: 'Av. Juan B. Justo 4567, Villa Crespo',
    phone: '+54 11 4876-5432',
    location: 'Oeste',
    status: 'Active',
    type: 'Client',
    contacts: [
      { name: 'Sofia Benitez', phone: '+54 11 4876-5432', email: 'sofia@lamasa.com', role: 'Dueña', visible_to_driver: true },
      { name: 'Martin Benitez', phone: '+54 11 4876-5433', email: 'martin@lamasa.com', role: 'Produccion', visible_to_driver: true },
    ],
    pickup_points: [
      { address: 'Av. Juan B. Justo 4567', lat: -34.6034, lng: -58.4467, frequency: '2x semana', schedule: 'Martes y Jueves 10:00', container_count: 4, observations: 'Gran volumen' },
    ],
    containers: [
      { id: 'CONT-008-1', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-20', location: 'Av. Juan B. Justo 4567' },
      { id: 'CONT-008-2', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-20', location: 'Av. Juan B. Justo 4567' },
      { id: 'CONT-008-3', type: 'Tambor 200L', capacity: 200, status: 'Active', last_cleaned: '2026-04-20', location: 'Av. Juan B. Justo 4567' },
      { id: 'CONT-008-4', type: 'Bidon 100L', capacity: 100, status: 'Maintenance', last_cleaned: '2026-02-15', location: 'Av. Juan B. Justo 4567' },
    ],
    history: [
      { date: '2026-05-13', route: 'RT-2026-002', liters: 380, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
      { date: '2026-05-11', route: 'RT-2026-012', liters: 395, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-05-08', route: 'RT-2026-019', liters: 410, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
      { date: '2026-05-04', route: 'RT-2026-026', liters: 365, driver: 'Carlos Mendez', truck: 'AA123BB', status: 'Completed' },
      { date: '2026-04-27', route: 'RT-2026-033', liters: 420, driver: 'Juan Perez', truck: 'AC456DF', status: 'Completed' },
    ],
    documents: [
      { id: 'DOC-008-1', type: 'Contrato', name: 'Contrato de Servicio 2026', date: '2026-01-15', status: 'Active' },
      { id: 'DOC-008-2', type: 'Manifiesto', name: 'Manifiesto RT-2026-002', date: '2026-05-13', status: 'Completed' },
      { id: 'DOC-008-3', type: 'Manifiesto', name: 'Manifiesto RT-2026-012', date: '2026-05-11', status: 'Completed' },
    ],
    created_at: '2025-07-15T09:00:00Z',
  },
];

export const customerTypes = {
  Client: { label: 'Cliente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Prospect: { label: 'Prospecto', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export const customerStatuses = {
  Active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  Prospect: { label: 'Prospecto', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};