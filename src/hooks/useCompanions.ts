import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Companion {
  id: string;
  full_name: string;
  dni: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useCompanions() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('companions')
        .select('*')
        .is('deleted_at', null)
        .order('full_name');

      if (err) throw err;
      setCompanions((data as Companion[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar acompañantes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanions(); }, [fetchCompanions]);

  const createCompanion = useCallback(async (companion: Omit<Companion, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    const { data, error: err } = await supabase.from('companions').insert(companion).select().single();
    if (err) throw err;
    setCompanions(prev => [data as Companion, ...prev]);
    return data as Companion;
  }, []);

  const updateCompanion = useCallback(async (id: string, updates: Partial<Companion>) => {
    const { data, error: err } = await supabase.from('companions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (err) throw err;
    setCompanions(prev => prev.map(c => c.id === id ? (data as Companion) : c));
    return data as Companion;
  }, []);

  const deleteCompanion = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('companions').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (err) throw err;
    setCompanions(prev => prev.filter(c => c.id !== id));
  }, []);

  return { companions, loading, error, refetch: fetchCompanions, createCompanion, updateCompanion, deleteCompanion };
}