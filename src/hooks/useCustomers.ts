import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  fantasy_name: string;
  cuit: string | null;
  address: string | null;
  phone: string | null;
  location: string | null;
  status: string;
  type: string;
  tax_info: unknown;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('fantasy_name');

      if (err) throw err;
      setCustomers((data as Customer[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    const { data, error: err } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (err) throw err;
    setCustomers(prev => [data as Customer, ...prev]);
    return data as Customer;
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    const { data, error: err } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;
    setCustomers(prev => prev.map(c => c.id === id ? (data as Customer) : c));
    return data as Customer;
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (err) throw err;
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  return { customers, loading, error, refetch: fetchCustomers, createCustomer, updateCustomer, deleteCustomer };
}

export const customerStatuses = {
  Active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  Prospect: { label: 'Prospecto', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export const customerTypes = {
  Client: { label: 'Cliente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Prospect: { label: 'Prospecto', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};