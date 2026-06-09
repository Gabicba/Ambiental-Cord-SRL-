import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface MaintenanceRecord {
  id: string;
  truck_id: string;
  truck_plate: string;
  truck_model: string;
  category: string;
  last_done_date: string;
  next_due_date: string;
  interval_months: number;
  current_km: number;
  status: string;
  notes: string | null;
  provider: string | null;
  cost: number | null;
  created_at: string;
}

export function useMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('truck_maintenance')
        .select('*, trucks!inner(plate, model)')
        .order('next_due_date', { ascending: true });

      if (err) throw err;
      const mapped: MaintenanceRecord[] = (data || []).map((r: Record<string, unknown>) => {
        const truck = r.trucks as Record<string, unknown> || {};
        return {
          id: r.id as string,
          truck_id: r.truck_id as string,
          truck_plate: truck.plate as string || '—',
          truck_model: truck.model as string || '—',
          category: r.category as string,
          last_done_date: r.last_done_date as string,
          next_due_date: r.next_due_date as string,
          interval_months: r.interval_months as number || 3,
          current_km: (r.current_km as number) || 0,
          status: (r.status as string) || 'Upcoming',
          notes: r.notes as string || null,
          provider: r.provider as string || null,
          cost: r.cost as number || null,
          created_at: r.created_at as string,
        };
      });
      setRecords(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar mantenimiento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const addRecord = useCallback(async (rec: Omit<MaintenanceRecord, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase.from('truck_maintenance').insert(rec).select('*, trucks!inner(plate, model)').single();
    if (err) throw err;
    const truck = (data as Record<string, unknown>).trucks as Record<string, unknown> || {};
    const newRec: MaintenanceRecord = { ...(data as MaintenanceRecord), truck_plate: truck.plate as string, truck_model: truck.model as string };
    setRecords((prev) => [newRec, ...prev]);
    return newRec;
  }, []);

  const updateRecord = useCallback(async (id: string, updates: Partial<MaintenanceRecord>) => {
    const { error: err } = await supabase.from('truck_maintenance').update(updates).eq('id', id);
    if (err) throw err;
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('truck_maintenance').delete().eq('id', id);
    if (err) throw err;
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getSummary = useCallback(() => {
    const active = records.filter((r) => r.status !== 'Completed');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let expired = 0; let due = 0; let upcoming = 0;
    active.forEach((r) => {
      const d = new Date(r.next_due_date); d.setHours(0, 0, 0, 0);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < -7) expired++;
      else if (diff <= 0) due++;
      else upcoming++;
    });
    return { expired, due, upcoming, total: active.length };
  }, [records]);

  return { records, loading, error, fetchRecords, addRecord, updateRecord, deleteRecord, getSummary };
}