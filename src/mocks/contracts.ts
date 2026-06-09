export interface CustomerContract {
  id: string;
  customer_id: string;
  agreement_name: string;
  municipality: string;
  pdf_url: string;
  file_name: string;
  start_date: string;
  expiration_date: string;
  renewal_date: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Renewed';
  notes: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'uco_contracts_v1';

export const defaultContracts: CustomerContract[] = [
  {
    id: 'CTR-001',
    customer_id: 'CLI-001',
    agreement_name: 'Convenio Municipal Recoleccion UCO 2026',
    municipality: 'Municipalidad de Buenos Aires',
    pdf_url: '',
    file_name: 'CONVENIO_MUNI_BA_2026.pdf',
    start_date: '2026-01-01',
    expiration_date: '2026-12-31',
    renewal_date: '2026-11-01',
    status: 'Active',
    notes: 'Renovacion automatica anual. Clusula de exclusividad zona Centro.',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'CTR-002',
    customer_id: 'CLI-006',
    agreement_name: 'Contrato de Locacion de Servicios Hotel Continental',
    municipality: 'Municipalidad de Buenos Aires',
    pdf_url: '',
    file_name: 'CONTRATO_LOCACION_HOTEL_CONT_2026.pdf',
    start_date: '2026-01-05',
    expiration_date: '2026-06-30',
    renewal_date: '2026-05-15',
    status: 'Expiring',
    notes: 'Servicio especial para eventos. Incluye recoleccion ad-hoc bajo demanda.',
    created_at: '2026-01-05T08:00:00Z',
    updated_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'CTR-003',
    customer_id: 'CLI-002',
    agreement_name: 'Acuerdo Marco Restaurantes Palermo',
    municipality: 'Municipalidad de Palermo',
    pdf_url: '',
    file_name: 'ACUERDO_MARCO_PALERMO_2025.pdf',
    start_date: '2025-03-01',
    expiration_date: '2025-12-31',
    renewal_date: '2025-11-01',
    status: 'Expired',
    notes: 'Vencido. En negociacion para renovacion 2026 con tarifa actualizada.',
    created_at: '2025-03-01T09:00:00Z',
    updated_at: '2026-01-15T14:00:00Z',
  },
  {
    id: 'CTR-004',
    customer_id: 'CLI-008',
    agreement_name: 'Convenio Fabricas de Alimentos Villa Crespo',
    municipality: 'Municipalidad de Villa Crespo',
    pdf_url: '',
    file_name: 'CONVENIO_FABRICAS_VC_2026.pdf',
    start_date: '2026-01-15',
    expiration_date: '2026-12-31',
    renewal_date: '2026-10-15',
    status: 'Active',
    notes: 'Gran volumen. Recoleccion 2x semana obligatoria por normativa municipal.',
    created_at: '2026-01-15T11:00:00Z',
    updated_at: '2026-01-15T11:00:00Z',
  },
  {
    id: 'CTR-005',
    customer_id: 'CLI-005',
    agreement_name: 'Contrato de Servicio Sushi Bar Tokyo 2025',
    municipality: 'Municipalidad de Buenos Aires',
    pdf_url: '',
    file_name: 'CONTRATO_TOKYO_2025.pdf',
    start_date: '2025-01-10',
    expiration_date: '2025-12-31',
    renewal_date: '2025-11-15',
    status: 'Renewed',
    notes: 'Renovado a nuevo contrato 2026 con condiciones mejoradas. Cliente inactivo temporalmente.',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2026-01-20T09:00:00Z',
  },
  {
    id: 'CTR-006',
    customer_id: 'CLI-003',
    agreement_name: 'Convenio Bares y Restaurantes San Telmo',
    municipality: 'Municipalidad de San Telmo',
    pdf_url: '',
    file_name: 'CONVENIO_BARES_SAN_TELMO_2026.pdf',
    start_date: '2026-01-20',
    expiration_date: '2027-01-20',
    renewal_date: '2026-12-01',
    status: 'Active',
    notes: 'Programa municipal de gestion de aceites. Participacion voluntaria con incentivos fiscales.',
    created_at: '2026-01-20T09:00:00Z',
    updated_at: '2026-01-20T09:00:00Z',
  },
];

function loadContracts(): CustomerContract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // migrate: add renewal_date if missing
      return parsed.map((c: CustomerContract) => ({
        ...c,
        renewal_date: c.renewal_date || c.expiration_date,
      }));
    }
  } catch {
    // ignore
  }
  return [...defaultContracts];
}

function saveContracts(list: CustomerContract[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getContracts(): CustomerContract[] {
  return loadContracts();
}

export function getContractsByCustomer(customerId: string): CustomerContract[] {
  return loadContracts().filter((c) => c.customer_id === customerId);
}

export function addContract(contract: Omit<CustomerContract, 'id' | 'created_at' | 'updated_at'>): CustomerContract {
  const list = loadContracts();
  const now = new Date().toISOString();
  const newContract: CustomerContract = {
    ...contract,
    id: `CTR-${String(list.length + 1).padStart(3, '0')}`,
    created_at: now,
    updated_at: now,
  };
  list.push(newContract);
  saveContracts(list);
  return newContract;
}

export function updateContract(id: string, updates: Partial<CustomerContract>): CustomerContract | null {
  const list = loadContracts();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  saveContracts(list);
  return list[idx];
}

export function deleteContract(id: string): boolean {
  const list = loadContracts();
  const filtered = list.filter((c) => c.id !== id);
  if (filtered.length === list.length) return false;
  saveContracts(filtered);
  return true;
}

export function computeContractStatus(expirationDate: string): CustomerContract['status'] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expirationDate);
  exp.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring';
  return 'Active';
}

export function isRenewalDue(renewalDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rd = new Date(renewalDate);
  rd.setHours(0, 0, 0, 0);
  return today.getTime() >= rd.getTime();
}

export function refreshContractStatuses(): void {
  const list = loadContracts();
  let changed = false;
  const updated = list.map((c) => {
    if (c.status === 'Renewed') return c;
    const computed = computeContractStatus(c.expiration_date);
    if (computed !== c.status) {
      changed = true;
      return { ...c, status: computed };
    }
    return c;
  });
  if (changed) saveContracts(updated);
}

export function getContractStats(): { total: number; active: number; expiring: number; expired: number; renewed: number; renewalDue: number } {
  const list = loadContracts();
  return {
    total: list.length,
    active: list.filter((c) => c.status === 'Active').length,
    expiring: list.filter((c) => c.status === 'Expiring').length,
    expired: list.filter((c) => c.status === 'Expired').length,
    renewed: list.filter((c) => c.status === 'Renewed').length,
    renewalDue: list.filter((c) => c.status !== 'Renewed' && isRenewalDue(c.renewal_date)).length,
  };
}

export function getUrgentContracts(): CustomerContract[] {
  return loadContracts().filter((c) => c.status === 'Expiring' || c.status === 'Expired');
}

export function getRenewalDueContracts(): CustomerContract[] {
  return loadContracts().filter((c) => c.status !== 'Renewed' && isRenewalDue(c.renewal_date));
}