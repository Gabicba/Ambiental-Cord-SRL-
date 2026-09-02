import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface EmployeeEquipment {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_type: 'driver' | 'companion';
  item_type: 'Shoes' | 'Jacket' | 'Gloves' | 'Shirt' | 'Pants' | 'Other';
  quantity: number;
  size: string | null;
  delivery_date: string;
  replacement_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const equipmentLabels: Record<EmployeeEquipment['item_type'], string> = {
  Shoes: 'Zapatos', Jacket: 'Campera', Gloves: 'Guantes', Shirt: 'Camiseta', Pants: 'Pantalon', Other: 'Otro',
};

export const equipmentIcons: Record<EmployeeEquipment['item_type'], string> = {
  Shoes: 'ri-footprint-line', Jacket: 'ri-t-shirt-line', Gloves: 'ri-hand-coin-line', Shirt: 'ri-t-shirt-2-line', Pants: 'ri-user-3-line', Other: 'ri-box-3-line',
};

export function getEquipmentStatus(replacementDate: string | null) {
  if (!replacementDate) return { status: 'ok' as const, label: 'Vigente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', daysLeft: 999 };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const rd = new Date(replacementDate + 'T12:00:00'); rd.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((rd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { status: 'expired' as const, label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', daysLeft };
  if (daysLeft <= 30) return { status: 'near' as const, label: `Reemplazar en ${daysLeft} dias`, color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', daysLeft };
  return { status: 'ok' as const, label: 'Vigente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', daysLeft };
}

export function useEquipment() {
  const [equipment, setEquipment] = useState<EmployeeEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('employee_equipment')
        .select('*')
        .order('delivery_date', { ascending: false });

      if (err) throw err;
      setEquipment((data as EmployeeEquipment[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar equipamiento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const addEquipment = useCallback(async (item: Omit<EmployeeEquipment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error: err } = await supabase.from('employee_equipment').insert(item).select().single();
    if (err) throw err;
    setEquipment(prev => [data as EmployeeEquipment, ...prev]);
    return data as EmployeeEquipment;
  }, []);

  const updateEquipment = useCallback(async (id: string, updates: Partial<EmployeeEquipment>) => {
    const { data, error: err } = await supabase.from('employee_equipment').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (err) throw err;
    setEquipment(prev => prev.map(e => e.id === id ? (data as EmployeeEquipment) : e));
    return data as EmployeeEquipment;
  }, []);

  const deleteEquipment = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('employee_equipment').delete().eq('id', id);
    if (err) throw err;
    setEquipment(prev => prev.filter(e => e.id !== id));
  }, []);

  return { equipment, loading, error, refetch: fetchEquipment, addEquipment, updateEquipment, deleteEquipment };
}