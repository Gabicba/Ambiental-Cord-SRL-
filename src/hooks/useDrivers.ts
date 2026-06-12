import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  dni: string | null;
  license_type: string | null;
  license_number: string | null;
  license_expiry: string | null;
  license_issue_date: string | null;
  status: string;
  assigned_truck_id: string | null;
  email: string | null;
  joined_at: string | null;
  birth_date: string | null;
  address: string | null;
  emergency_contact: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const driverStatuses = {
  activo:   { label: 'Activo',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactivo: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('drivers')
        .select('*')
        .is('deleted_at', null)
        .order('name');
      if (err) throw err;
      setDrivers((data as Driver[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar conductores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const createDriver = useCallback(async (dto: {
    name: string;
    phone?: string;
    dni?: string;
    licenseType?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    email?: string;
    joinedAt?: string;
    birthDate?: string;
    address?: string;
    emergencyContact?: Record<string, unknown>;
    assignedTruckId?: string;
    notes?: string;
  }) => {
    const data = await api.post<Driver>('/drivers', dto);
    setDrivers(prev => [data, ...prev]);
    return data;
  }, []);

  const updateDriver = useCallback(async (id: string, dto: {
    name?: string;
    phone?: string;
    dni?: string;
    email?: string;
    address?: string;
    assignedTruckId?: string;
    notes?: string;
  }) => {
    const data = await api.patch<Driver>(`/drivers/${id}`, dto);
    setDrivers(prev => prev.map(d => d.id === id ? data : d));
    return data;
  }, []);

  const deleteDriver = useCallback(async (id: string) => {
    await api.delete(`/drivers/${id}`);
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, []);

  return { drivers, loading, error, refetch: fetchDrivers, createDriver, updateDriver, deleteDriver };
}