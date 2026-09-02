import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
  Active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  On_Route: { label: 'En Ruta', color: 'bg-blue-100 text-blue-700 border-blue-200' },
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

  const createDriver = useCallback(async (driver: Omit<Driver, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    const { data, error: err } = await supabase.from('drivers').insert(driver).select().single();
    if (err) throw err;
    setDrivers(prev => [data as Driver, ...prev]);
    return data as Driver;
  }, []);

  const updateDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
    const { data, error: err } = await supabase.from('drivers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (err) throw err;
    setDrivers(prev => prev.map(d => d.id === id ? (data as Driver) : d));
    return data as Driver;
  }, []);

  const deleteDriver = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('drivers').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (err) throw err;
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, []);

  return { drivers, loading, error, refetch: fetchDrivers, createDriver, updateDriver, deleteDriver };
}