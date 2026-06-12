import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface RouteSheet {
  id: string;
  name: string;
  truck_id: string | null;
  driver_id: string | null;
  companion_id: string | null;
  date: string;
  status: string;
  total_liters: number;
  total_clients: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  driver_name?: string;
  truck_plate?: string;
  companion_name?: string;
}

export const routeStatuses = {
  pendiente:  { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  en_curso:   { label: 'En Progreso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  finalizada: { label: 'Finalizada',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelada:  { label: 'Cancelada',   color: 'bg-red-100 text-red-700 border-red-200' },
};

export function useRouteSheets() {
  const [routes, setRoutes] = useState<RouteSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('route_sheets')
        .select('*, driver:driver_id(name), truck:truck_id(plate), companion:companion_id(full_name)')
        .order('date', { ascending: false });

      if (err) throw err;

      const mapped: RouteSheet[] = (data || []).map((r: Record<string, unknown>) => {
        const driver = r.driver as Record<string, string> | null;
        const truck = r.truck as Record<string, string> | null;
        const companion = r.companion as Record<string, string> | null;
        return {
          id: r.id as string,
          name: r.name as string,
          truck_id: r.truck_id as string | null,
          driver_id: r.driver_id as string | null,
          companion_id: r.companion_id as string | null,
          date: r.date as string,
          status: r.status as string,
          total_liters: r.total_liters as number,
          total_clients: r.total_clients as number,
          created_by: r.created_by as string | null,
          created_at: r.created_at as string,
          updated_at: r.updated_at as string,
          driver_name: driver?.name || 'Sin asignar',
          truck_plate: truck?.plate || 'Sin asignar',
          companion_name: companion?.full_name || null,
        };
      });

      setRoutes(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar rutas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const createRoute = useCallback(async (route: {
    name: string;
    date: string;
    truckId: string;
    driverId: string;
    companionId?: string;
  }) => {
    const data = await api.post<RouteSheet>('/route-sheets', route);
    setRoutes(prev => [data, ...prev]);
    return data;
  }, []);

  const startRoute = useCallback(async (id: string) => {
    await api.patch(`/route-sheets/${id}/start`);
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, status: 'en_curso' } : r));
  }, []);

  const cancelRoute = useCallback(async (id: string) => {
    await api.patch(`/route-sheets/${id}/cancel`);
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelada' } : r));
  }, []);

  const forceCloseRoute = useCallback(async (id: string) => {
    const data = await api.patch<RouteSheet>(`/route-sheets/${id}/force-close`);
    setRoutes(prev => prev.map(r => r.id === id ? data : r));
  }, []);

  return { routes, loading, error, refetch: fetchRoutes, createRoute, startRoute, cancelRoute, forceCloseRoute };
}