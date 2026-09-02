import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardKPI {
  id: string;
  label: string;
  value: string;
  unit: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

interface RecentRoute {
  id: string;
  name: string;
  driver: string;
  truck: string;
  date: string;
  status: string;
  clients: number;
  visited: number;
  liters: number;
}

interface TopDriver {
  name: string;
  routes: number;
  liters: number;
  efficiency: number;
}

interface WeeklyCollection {
  day: string;
  liters: number;
}

interface ZoneDistribution {
  zone: string;
  liters: number;
  percentage: number;
}

interface MaintenanceAlert {
  id: string;
  truck_plate: string;
  truck_model: string;
  category: string;
  status: string;
  next_due_date: string;
  truck_id: string;
}

interface DashboardData {
  kpis: DashboardKPI[];
  weeklyCollections: WeeklyCollection[];
  zoneDistribution: ZoneDistribution[];
  recentRoutes: RecentRoute[];
  topDrivers: TopDriver[];
  maintenanceAlerts: MaintenanceAlert[];
  maintSummary: { expired: number; due: number; upcoming: number; total: number };
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [weeklyCollections, setWeeklyCollections] = useState<WeeklyCollection[]>([]);
  const [zoneDistribution, setZoneDistribution] = useState<ZoneDistribution[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([]);
  const [topDrivers, setTopDrivers] = useState<TopDriver[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [maintSummary, setMaintSummary] = useState({ expired: 0, due: 0, upcoming: 0, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        { data: completedRoutes, error: errCompleted },
        { data: activeRoutes, error: errActive },
        { data: customers, error: errCustomers },
        { data: trucksOnRoute, error: errTrucks },
        { data: recentRoutesData, error: errRecent },
        { data: driversData, error: errDrivers },
        { data: maintData, error: errMaint },
      ] = await Promise.all([
        supabase.from('route_sheets').select('id, total_liters, total_clients').eq('status', 'Completed'),
        supabase.from('route_sheets').select('id').eq('status', 'In_Progress'),
        supabase.from('customers').select('id').eq('status', 'Active').is('deleted_at', null),
        supabase.from('trucks').select('id').eq('status', 'On_Route').is('deleted_at', null),
        supabase.from('route_sheets').select('id, name, date, status, total_liters, total_clients, driver:driver_id(name), truck:truck_id(plate)').order('date', { ascending: false }).limit(8),
        supabase.from('drivers').select('id, name').eq('status', 'Active').is('deleted_at', null),
        supabase.from('truck_maintenance').select('id, truck_id, category, status, next_due_date, truck:truck_id(plate, model)').neq('status', 'Completed'),
      ]);

      if (errCompleted || errActive || errCustomers || errTrucks || errRecent || errDrivers || errMaint) {
        setError('Error al cargar datos del dashboard');
        setLoading(false);
        return;
      }

      const totalLiters = (completedRoutes || []).reduce((sum, r) => sum + (r.total_liters || 0), 0);
      const totalClientsVisited = (completedRoutes || []).reduce((sum, r) => sum + (r.total_clients || 0), 0);
      const activeCustomerCount = (customers || []).length;
      const trucksOnRouteCount = (trucksOnRoute || []).length;
      const activeDriverCount = (driversData || []).length;

      setKpis([
        {
          id: 'liters', label: 'Litros Colectados', value: totalLiters.toLocaleString(), unit: 'L',
          change: `${(completedRoutes || []).length} rutas`, changeType: 'neutral',
          icon: 'ri-oil-line', color: 'bg-brand-green/10 text-brand-green',
        },
        {
          id: 'routes', label: 'Rutas Completadas', value: String((completedRoutes || []).length), unit: '',
          change: `${(activeRoutes || []).length} activas`, changeType: 'neutral',
          icon: 'ri-route-line', color: 'bg-brand-primary/10 text-brand-primary',
        },
        {
          id: 'clients', label: 'Clientes Activos', value: activeCustomerCount.toLocaleString(), unit: '',
          change: `${totalClientsVisited} visitados`, changeType: 'positive',
          icon: 'ri-building-line', color: 'bg-amber-500/10 text-amber-600',
        },
        {
          id: 'drivers', label: 'Conductores Activos', value: String(activeDriverCount), unit: '',
          change: 'Disponibles', changeType: 'neutral',
          icon: 'ri-user-line', color: 'bg-blue-500/10 text-blue-600',
        },
        {
          id: 'trucks', label: 'Camiones en Ruta', value: String(trucksOnRouteCount), unit: '',
          change: 'Activos', changeType: 'neutral',
          icon: 'ri-truck-line', color: 'bg-cyan-500/10 text-cyan-600',
        },
        {
          id: 'pending', label: 'Mantenimientos', value: String((maintData || []).length), unit: 'pendientes',
          change: 'Requieren atencion', changeType: 'negative',
          icon: 'ri-tools-line', color: 'bg-red-500/10 text-red-600',
        },
      ]);

      const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const today = new Date();
      const weekData: WeeklyCollection[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        weekData.push({ day: dayNames[d.getDay()], liters: 0 });
      }

      if (completedRoutes && completedRoutes.length > 0) {
        (completedRoutes as Array<{ date?: string; total_liters?: number }>).forEach((r) => {
          if (r.date) {
            const d = new Date(r.date + 'T12:00:00');
            const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff < 7) {
              weekData[6 - diff].liters += (r.total_liters || 0);
            }
          }
        });
      }
      setWeeklyCollections(weekData);

      const zoneMap: Record<string, number> = {};
      if (completedRoutes && completedRoutes.length > 0) {
        setZoneDistribution([
          { zone: 'Total recolectado', liters: totalLiters, percentage: 100 },
        ]);
      } else {
        setZoneDistribution([]);
      }

      const mappedRoutes: RecentRoute[] = (recentRoutesData || []).map((r: Record<string, unknown>) => {
        const driver = r.driver as Record<string, string> | null;
        const truck = r.truck as Record<string, string> | null;
        return {
          id: r.id as string,
          name: r.name as string,
          driver: driver?.name || 'Sin asignar',
          truck: truck?.plate || '',
          date: (r.date as string) || '',
          status: r.status as string,
          clients: (r.total_clients as number) || 0,
          visited: 0,
          liters: (r.total_liters as number) || 0,
        };
      });
      setRecentRoutes(mappedRoutes);

      const driverRouteMap: Record<string, { routes: number; liters: number }> = {};
      (completedRoutes || []).forEach((r: Record<string, unknown>) => {
        const driver = r.driver as Record<string, string> | null;
        const name = driver?.name || 'Sin asignar';
        if (!driverRouteMap[name]) driverRouteMap[name] = { routes: 0, liters: 0 };
        driverRouteMap[name].routes++;
        driverRouteMap[name].liters += (r.total_liters as number) || 0;
      });
      const driverList = Object.entries(driverRouteMap)
        .map(([name, data]) => ({ name, routes: data.routes, liters: data.liters, efficiency: 100 }))
        .sort((a, b) => b.liters - a.liters)
        .slice(0, 5);
      setTopDrivers(driverList);

      const mappedAlerts: MaintenanceAlert[] = (maintData || []).map((a: Record<string, unknown>) => {
        const truck = a.truck as Record<string, string> | null;
        return {
          id: a.id as string,
          truck_id: a.truck_id as string,
          truck_plate: truck?.plate || '',
          truck_model: truck?.model || '',
          category: a.category as string,
          status: a.status as string,
          next_due_date: a.next_due_date as string,
        };
      });
      setMaintenanceAlerts(mappedAlerts);

      const expired = mappedAlerts.filter((a) => a.status === 'Expired').length;
      const due = mappedAlerts.filter((a) => a.status === 'Due').length;
      const upcoming = mappedAlerts.filter((a) => a.status === 'Upcoming').length;
      setMaintSummary({ expired, due, upcoming, total: mappedAlerts.length });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    kpis,
    weeklyCollections,
    zoneDistribution,
    recentRoutes,
    topDrivers,
    maintenanceAlerts,
    maintSummary,
    loading,
    error,
  };
}