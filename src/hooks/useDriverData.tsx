import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface TruckData {
  id: string;
  plate: string;
  model: string;
  assigned_driver_id: string | null;
  status: string;
  capacity_liters: number | null;
}

export interface RouteSheetData {
  id: string;
  name: string;
  truck_id: string;
  driver_id: string;
  date: string;
  status: string;
  total_liters: number | null;
  total_clients: number | null;
}

export interface VisitData {
  id: string;
  route_id: string;
  customer_id: string;
  pickup_point_id: string;
  visit_order: number;
  status: string;
  observations: string | null;
  receiver_name: string | null;
  receiver_dni: string | null;
  photos: string[] | null;
  gps_lat: number | null;
  gps_lng: number | null;
  visited_at: string | null;
  delay_reason: string | null;
  delay_return_time: string | null;
  created_at: string;
  updated_at: string;
  customer_fantasy_name: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  pickup_address: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
}

interface DriverDataState {
  truck: TruckData | null;
  routeSheet: RouteSheetData | null;
  visits: VisitData[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateVisit: (visitId: string, updates: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  finalizeRoute: () => Promise<{ success: boolean; error?: string }>;
}

const DriverDataContext = createContext<DriverDataState>({
  truck: null,
  routeSheet: null,
  visits: [],
  loading: true,
  error: null,
  refreshData: async () => {},
  updateVisit: async () => ({ success: false, error: "Context not initialized" }),
  finalizeRoute: async () => ({ success: false, error: "Context not initialized" }),
});

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export function DriverDataProvider({ children }: { children: ReactNode }) {
  const { driver } = useAuth();
  const [truck, setTruck] = useState<TruckData | null>(null);
  const [routeSheet, setRouteSheet] = useState<RouteSheetData | null>(null);
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!driver) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let truckData: TruckData | null = null;

      if (driver.assigned_truck_id) {
        const { data: tData, error: tErr } = await supabase
          .from("trucks")
          .select("*")
          .eq("id", driver.assigned_truck_id)
          .maybeSingle();

        if (tErr) throw tErr;
        truckData = tData as TruckData | null;
      }
      setTruck(truckData);

      const today = getTodayDate();
      const { data: rsData, error: rsErr } = await supabase
        .from("route_sheets")
        .select("*")
        .eq("driver_id", driver.id)
        .eq("date", today)
        .maybeSingle();

      if (rsErr) throw rsErr;

      if (!rsData) {
        setRouteSheet(null);
        setVisits([]);
        setLoading(false);
        return;
      }

      setRouteSheet(rsData as RouteSheetData);

      const { data: rvData, error: rvErr } = await supabase
        .from("route_visits")
        .select(`
          *,
          customers (fantasy_name, address, phone),
          pickup_points (address, lat, lng)
        `)
        .eq("route_id", rsData.id)
        .order("visit_order", { ascending: true });

      if (rvErr) throw rvErr;

      const mappedVisits: VisitData[] = (rvData || []).map((rv: any) => {
        const customer = rv.customers || {};
        const pp = rv.pickup_points || {};
        return {
          id: rv.id as string,
          route_id: rv.route_id as string,
          customer_id: rv.customer_id as string,
          pickup_point_id: rv.pickup_point_id as string,
          visit_order: rv.visit_order as number,
          status: rv.status as string,
          observations: rv.observations as string | null,
          receiver_name: rv.receiver_name as string | null,
          receiver_dni: rv.receiver_dni as string | null,
          photos: rv.photos as string[] | null,
          gps_lat: rv.gps_lat as number | null,
          gps_lng: rv.gps_lng as number | null,
          visited_at: rv.visited_at as string | null,
          delay_reason: rv.delay_reason as string | null,
          delay_return_time: rv.delay_return_time as string | null,
          created_at: rv.created_at as string,
          updated_at: rv.updated_at as string,
          customer_fantasy_name: customer.fantasy_name as string | null,
          customer_address: customer.address as string | null,
          customer_phone: customer.phone as string | null,
          pickup_address: pp.address as string | null,
          pickup_lat: pp.lat as number | null,
          pickup_lng: pp.lng as number | null,
        };
      });

      setVisits(mappedVisits);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [driver]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const updateVisit = useCallback(
    async (visitId: string, updates: Record<string, unknown>) => {
      try {
        const { error: updErr } = await supabase
          .from("route_visits")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", visitId);

        if (updErr) {
          return { success: false, error: updErr.message };
        }

        setVisits((prev) =>
          prev.map((v) =>
            v.id === visitId ? { ...v, ...(updates as Partial<VisitData>), updated_at: new Date().toISOString() } : v
          )
        );

        return { success: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al actualizar visita";
        return { success: false, error: msg };
      }
    },
    []
  );

  const finalizeRoute = useCallback(async () => {
    if (!routeSheet) {
      return { success: false, error: "No hay hoja de ruta activa" };
    }

    const pendingVisits = visits.filter(
      (v) => v.status === "Pending" || v.status === "In_Progress"
    );

    if (pendingVisits.length > 0) {
      return {
        success: false,
        error: `Quedan ${pendingVisits.length} visita(s) pendiente(s). Finalizá todas las visitas antes de cerrar la jornada.`,
      };
    }

    try {
      const { error: updErr } = await supabase
        .from("route_sheets")
        .update({ status: "Completed", updated_at: new Date().toISOString() })
        .eq("id", routeSheet.id);

      if (updErr) {
        return { success: false, error: updErr.message };
      }

      setRouteSheet((prev) =>
        prev ? { ...prev, status: "Completed" } : null
      );

      return { success: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al finalizar jornada";
      return { success: false, error: msg };
    }
  }, [routeSheet, visits]);

  return (
    <DriverDataContext.Provider
      value={{
        truck,
        routeSheet,
        visits,
        loading,
        error,
        refreshData,
        updateVisit,
        finalizeRoute,
      }}
    >
      {children}
    </DriverDataContext.Provider>
  );
}

export function useDriverData() {
  return useContext(DriverDataContext);
}