export interface EmployeeEquipment {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_type: 'driver' | 'companion';
  item_type: 'Shoes' | 'Jacket' | 'Gloves' | 'Shirt' | 'Pants' | 'Other';
  quantity: number;
  size: string;
  delivery_date: string;
  replacement_date: string;
  notes: string | null;
  created_at: string;
}

export const equipmentLabels: Record<EmployeeEquipment['item_type'], string> = {
  Shoes: 'Zapatos',
  Jacket: 'Campera',
  Gloves: 'Guantes',
  Shirt: 'Camiseta',
  Pants: 'Pantalón',
  Other: 'Otro',
};

export const equipmentIcons: Record<EmployeeEquipment['item_type'], string> = {
  Shoes: 'ri-footprint-line',
  Jacket: 'ri-t-shirt-line',
  Gloves: 'ri-hand-coin-line',
  Shirt: 'ri-t-shirt-2-line',
  Pants: 'ri-user-3-line',
  Other: 'ri-box-3-line',
};

export function getEquipmentStatus(replacementDate: string): {
  status: 'ok' | 'near' | 'expired';
  label: string;
  color: string;
  dot: string;
  daysLeft: number;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const rd = new Date(replacementDate);
  rd.setHours(0, 0, 0, 0);
  const diff = rd.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'expired', label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', daysLeft };
  }
  if (daysLeft <= 30) {
    return { status: 'near', label: `Reemplazar en ${daysLeft} días`, color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', daysLeft };
  }
  return { status: 'ok', label: 'Vigente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', daysLeft };
}

const STORAGE_KEY = 'logixarg_equipment';

export function loadEquipment(): EmployeeEquipment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EmployeeEquipment[];
  } catch { /* ignore */ }
  return [...mockEquipment];
}

export function saveEquipment(list: EmployeeEquipment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  mockEquipment.length = 0;
  mockEquipment.push(...list);
}

export const mockEquipment: EmployeeEquipment[] = [
  {
    id: 'EQP-001',
    employee_id: 'DRV-001',
    employee_name: 'Carlos Méndez',
    employee_type: 'driver',
    item_type: 'Shoes',
    quantity: 1,
    size: '42',
    delivery_date: '2025-03-10',
    replacement_date: '2026-06-15',
    notes: 'Zapatos de seguridad antideslizantes',
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'EQP-002',
    employee_id: 'DRV-001',
    employee_name: 'Carlos Méndez',
    employee_type: 'driver',
    item_type: 'Jacket',
    quantity: 1,
    size: 'L',
    delivery_date: '2025-03-10',
    replacement_date: '2027-03-10',
    notes: 'Campera impermeable reflectiva',
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'EQP-003',
    employee_id: 'DRV-001',
    employee_name: 'Carlos Méndez',
    employee_type: 'driver',
    item_type: 'Gloves',
    quantity: 2,
    size: 'M',
    delivery_date: '2025-03-10',
    replacement_date: '2026-09-10',
    notes: 'Guantes de nitrilo resistentes',
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'EQP-004',
    employee_id: 'DRV-002',
    employee_name: 'Juan Rodríguez',
    employee_type: 'driver',
    item_type: 'Shoes',
    quantity: 1,
    size: '43',
    delivery_date: '2025-06-20',
    replacement_date: '2026-06-20',
    notes: null,
    created_at: '2025-06-20T10:00:00Z',
  },
  {
    id: 'EQP-005',
    employee_id: 'DRV-002',
    employee_name: 'Juan Rodríguez',
    employee_type: 'driver',
    item_type: 'Shirt',
    quantity: 3,
    size: 'XL',
    delivery_date: '2025-06-20',
    replacement_date: '2026-12-20',
    notes: 'Camisetas manga corta corporativas',
    created_at: '2025-06-20T10:00:00Z',
  },
  {
    id: 'EQP-006',
    employee_id: 'DRV-003',
    employee_name: 'María González',
    employee_type: 'driver',
    item_type: 'Pants',
    quantity: 2,
    size: 'M',
    delivery_date: '2024-11-05',
    replacement_date: '2026-11-05',
    notes: 'Pantalón de trabajo reforzado',
    created_at: '2024-11-05T10:00:00Z',
  },
  {
    id: 'EQP-007',
    employee_id: 'DRV-003',
    employee_name: 'María González',
    employee_type: 'driver',
    item_type: 'Jacket',
    quantity: 1,
    size: 'M',
    delivery_date: '2024-11-05',
    replacement_date: '2026-05-25',
    notes: 'Campera térmica de invierno',
    created_at: '2024-11-05T10:00:00Z',
  },
  {
    id: 'EQP-008',
    employee_id: 'DRV-004',
    employee_name: 'Pedro Sánchez',
    employee_type: 'driver',
    item_type: 'Shoes',
    quantity: 1,
    size: '41',
    delivery_date: '2025-01-10',
    replacement_date: '2026-01-10',
    notes: null,
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'EQP-009',
    employee_id: 'DRV-004',
    employee_name: 'Pedro Sánchez',
    employee_type: 'driver',
    item_type: 'Gloves',
    quantity: 3,
    size: 'L',
    delivery_date: '2025-01-10',
    replacement_date: '2026-07-10',
    notes: 'Guantes de cuero para manipulación',
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'EQP-010',
    employee_id: 'DRV-005',
    employee_name: 'Luis Torres',
    employee_type: 'driver',
    item_type: 'Shirt',
    quantity: 4,
    size: 'L',
    delivery_date: '2025-07-22',
    replacement_date: '2027-07-22',
    notes: 'Pack completo de camisetas corporativas',
    created_at: '2025-07-22T10:00:00Z',
  },
  {
    id: 'EQP-011',
    employee_id: 'DRV-006',
    employee_name: 'Ana Pereira',
    employee_type: 'driver',
    item_type: 'Shoes',
    quantity: 1,
    size: '38',
    delivery_date: '2025-05-15',
    replacement_date: '2026-05-15',
    notes: null,
    created_at: '2025-05-15T10:00:00Z',
  },
  {
    id: 'EQP-012',
    employee_id: 'DRV-006',
    employee_name: 'Ana Pereira',
    employee_type: 'driver',
    item_type: 'Jacket',
    quantity: 1,
    size: 'S',
    delivery_date: '2025-05-15',
    replacement_date: '2027-05-15',
    notes: 'Campera reflectiva ligera',
    created_at: '2025-05-15T10:00:00Z',
  },
  {
    id: 'EQP-013',
    employee_id: 'DRV-007',
    employee_name: 'Roberto Díaz',
    employee_type: 'driver',
    item_type: 'Pants',
    quantity: 2,
    size: 'XL',
    delivery_date: '2024-08-01',
    replacement_date: '2026-08-01',
    notes: 'Pantalón cargo con refuerzos',
    created_at: '2024-08-01T10:00:00Z',
  },
  {
    id: 'EQP-014',
    employee_id: 'DRV-008',
    employee_name: 'Laura Jiménez',
    employee_type: 'driver',
    item_type: 'Gloves',
    quantity: 2,
    size: 'S',
    delivery_date: '2025-09-01',
    replacement_date: '2026-09-01',
    notes: null,
    created_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'EQP-015',
    employee_id: 'DRV-008',
    employee_name: 'Laura Jiménez',
    employee_type: 'driver',
    item_type: 'Shirt',
    quantity: 2,
    size: 'M',
    delivery_date: '2025-09-01',
    replacement_date: '2027-03-01',
    notes: 'Camisetas manga larga',
    created_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'EQP-016',
    employee_id: 'CMP-001',
    employee_name: 'Jose Luis Fernandez',
    employee_type: 'companion',
    item_type: 'Shoes',
    quantity: 1,
    size: '43',
    delivery_date: '2025-08-01',
    replacement_date: '2026-08-01',
    notes: 'Zapatos de seguridad',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'EQP-017',
    employee_id: 'CMP-001',
    employee_name: 'Jose Luis Fernandez',
    employee_type: 'companion',
    item_type: 'Shirt',
    quantity: 2,
    size: 'XL',
    delivery_date: '2025-08-01',
    replacement_date: '2026-08-01',
    notes: 'Camisetas corporativas manga corta',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'EQP-018',
    employee_id: 'CMP-002',
    employee_name: 'Mariana Castro',
    employee_type: 'companion',
    item_type: 'Jacket',
    quantity: 1,
    size: 'M',
    delivery_date: '2025-09-15',
    replacement_date: '2027-09-15',
    notes: 'Campera impermeable reflectiva',
    created_at: '2025-09-15T10:00:00Z',
  },
  {
    id: 'EQP-019',
    employee_id: 'CMP-003',
    employee_name: 'Ricardo Alvarez',
    employee_type: 'companion',
    item_type: 'Gloves',
    quantity: 2,
    size: 'L',
    delivery_date: '2026-01-15',
    replacement_date: '2026-07-15',
    notes: 'Guantes de cuero resistentes',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'EQP-020',
    employee_id: 'CMP-004',
    employee_name: 'Daniela Romero',
    employee_type: 'companion',
    item_type: 'Pants',
    quantity: 2,
    size: 'S',
    delivery_date: '2026-02-25',
    replacement_date: '2027-02-25',
    notes: 'Pantalón de trabajo reforzado',
    created_at: '2026-02-25T10:00:00Z',
  },
];