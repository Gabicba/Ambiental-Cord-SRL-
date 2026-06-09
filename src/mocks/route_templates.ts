export interface RouteTemplate {
  id: string;
  name: string;
  description: string;
  customer_ids: string[];
  visit_order: Record<string, number>;
  notes: string;
  created_by: string;
  created_at: string;
}

export const mockRouteTemplates: RouteTemplate[] = [
  {
    id: 'TMP-001',
    name: 'Ruta Norte - Lunes',
    description: 'Recorrido habitual por zona norte - restaurantes y hoteles',
    customer_ids: ['CLI-002', 'CLI-006', 'CLI-008', 'CLI-007'],
    visit_order: { 'CLI-002': 1, 'CLI-006': 2, 'CLI-008': 3, 'CLI-007': 4 },
    notes: 'Hotel Continental tiene acceso por lateral. Llamar antes de llegar a La Brasserie.',
    created_by: 'Admin',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'TMP-002',
    name: 'Ruta Centro - Miercoles',
    description: 'Recorrido zona centro CABA y San Telmo',
    customer_ids: ['CLI-001', 'CLI-003', 'CLI-006'],
    visit_order: { 'CLI-001': 1, 'CLI-006': 2, 'CLI-003': 3 },
    notes: 'Entrar por cochera en Don Jose. Faro: llamar antes de llegar.',
    created_by: 'Admin',
    created_at: '2026-02-05T14:30:00Z',
  },
  {
    id: 'TMP-003',
    name: 'Ruta Industrial - Viernes',
    description: 'Fabricas y produccion de gran volumen',
    customer_ids: ['CLI-008', 'CLI-006', 'CLI-001'],
    visit_order: { 'CLI-008': 1, 'CLI-006': 2, 'CLI-001': 3 },
    notes: 'La Masa siempre tiene gran volumen. Preparar bidones limpios extra.',
    created_by: 'Admin',
    created_at: '2026-03-12T09:15:00Z',
  },
  {
    id: 'TMP-004',
    name: 'Ruta Palermo - Martes',
    description: 'Zona Palermo y Nunez - restaurantes medianos',
    customer_ids: ['CLI-002', 'CLI-005', 'CLI-007'],
    visit_order: { 'CLI-002': 1, 'CLI-005': 2, 'CLI-007': 3 },
    notes: 'Tokyo esta cerrado temporalmente - verificar antes de salir.',
    created_by: 'Admin',
    created_at: '2026-04-18T11:00:00Z',
  },
];

export const templateUsageHistory = [
  { template_id: 'TMP-001', date: '2026-05-19', route_id: 'RT-2026-007', driver: 'Luis Rodriguez', truck: 'AE789GH' },
  { template_id: 'TMP-001', date: '2026-05-12', route_id: 'RT-2026-014', driver: 'Juan Perez', truck: 'AC456DF' },
  { template_id: 'TMP-002', date: '2026-05-14', route_id: 'RT-2026-003', driver: 'Carlos Mendez', truck: 'AA123BB' },
  { template_id: 'TMP-003', date: '2026-05-06', route_id: 'RT-2026-016', driver: 'Carlos Mendez', truck: 'AA123BB' },
];