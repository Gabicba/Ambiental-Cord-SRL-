import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Truck {
  id: string;
  plate: string;
  model: string | null;
  assigned_driver_id: string | null;
  gps_device_id: string | null;
  status: string;
  capacity_liters: number;
  year: number | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  km_total: number;
  km_since_maintenance: number;
  vin: string | null;
  fuel_type: string;
  insurance_expiry: string | null;
  technical_revision_expiry: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const truckStatuses = {
  Active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Maintenance: { label: 'Mantenimiento', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  Stopped: { label: 'Detenido', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  On_Route: { label: 'En Ruta', color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrucks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('trucks')
        .select('*')
        .is('deleted_at', null)
        .order('plate');

      if (err) throw err;
      setTrucks((data as Truck[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar camiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrucks(); }, [fetchTrucks]);

  const createTruck = useCallback(async (truck: Omit<Truck, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    const { data, error: err } = await supabase.from('trucks').insert(truck).select().single();
    if (err) throw err;
    setTrucks(prev => [data as Truck, ...prev]);
    return data as Truck;
  }, []);

  const updateTruck = useCallback(async (id: string, updates: Partial<Truck>) => {
    const { data, error: err } = await supabase.from('trucks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (err) throw err;
    setTrucks(prev => prev.map(t => t.id === id ? (data as Truck) : t));
    return data as Truck;
  }, []);

  const deleteTruck = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('trucks').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (err) throw err;
    setTrucks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { trucks, loading, error, refetch: fetchTrucks, createTruck, updateTruck, deleteTruck };
}