import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface Truck {
  id: string;
  plate: string;
  model: string | null;
  assigned_driver_id: string | null;
  gps_device_id: string | null;
  status: string;
  capacity_liters: number;
  year: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const truckStatuses = {
  activo:            { label: 'Activo',            color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  en_recorrido:      { label: 'En Ruta',            color: 'bg-blue-100 text-blue-700 border-blue-200' },
  fuera_de_servicio: { label: 'Fuera de Servicio',  color: 'bg-gray-100 text-gray-700 border-gray-200' },
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

  const createTruck = useCallback(async (dto: {
    plate: string;
    model?: string;
    year?: number;
    capacityLiters?: number;
    gpsDeviceId?: string;
    assignedDriverId?: string;
    notes?: string;
  }) => {
    const data = await api.post<Truck>('/trucks', dto);
    setTrucks(prev => [data, ...prev]);
    return data;
  }, []);

  const updateTruck = useCallback(async (id: string, dto: {
    plate?: string;
    model?: string;
    year?: number;
    capacityLiters?: number;
    gpsDeviceId?: string;
    assignedDriverId?: string;
    notes?: string;
  }) => {
    const data = await api.patch<Truck>(`/trucks/${id}`, dto);
    setTrucks(prev => prev.map(t => t.id === id ? data : t));
    return data;
  }, []);

  const deleteTruck = useCallback(async (id: string) => {
    await api.delete(`/trucks/${id}`);
    setTrucks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { trucks, loading, error, refetch: fetchTrucks, createTruck, updateTruck, deleteTruck };
}