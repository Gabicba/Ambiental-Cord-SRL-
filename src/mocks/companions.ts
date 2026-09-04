export interface Companion {
  id: string;
  full_name: string;
  dni: string;
  phone: string | null;
  created_at: string;
}

const STORAGE_KEY = 'logixarg_companions';

function getStoredOrDefault(): Companion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Companion[];
  } catch { /* ignore */ }
  return [
    {
      id: 'CMP-001',
      full_name: 'Jose Luis Fernandez',
      dni: '18.234.567',
      phone: '+54 11 3456-7890',
      created_at: '2025-06-01T10:00:00Z',
    },
    {
      id: 'CMP-002',
      full_name: 'Mariana Castro',
      dni: '21.456.789',
      phone: '+54 11 4567-8901',
      created_at: '2025-08-15T09:00:00Z',
    },
    {
      id: 'CMP-003',
      full_name: 'Ricardo Alvarez',
      dni: '24.678.901',
      phone: null,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'CMP-004',
      full_name: 'Daniela Romero',
      dni: '28.123.456',
      phone: '+54 11 5678-9012',
      created_at: '2026-02-20T11:00:00Z',
    },
    {
      id: 'CMP-005',
      full_name: 'Gustavo Benitez',
      dni: '19.345.678',
      phone: '+54 11 6789-0123',
      created_at: '2026-03-05T07:00:00Z',
    },
  ];
}

export const mockCompanions: Companion[] = getStoredOrDefault();

export function getCompanionById(id: string | null | undefined): Companion | undefined {
  if (!id) return undefined;
  return mockCompanions.find((c) => c.id === id);
}