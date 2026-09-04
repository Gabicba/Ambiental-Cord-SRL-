import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Customer } from '@/hooks/useCustomers';

export interface RouteTemplate {
  id: string;
  name: string;
  description: string | null;
  customer_ids: string[];
  visit_order: Record<string, number> | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer_details?: Customer[];
}

export function useRouteTemplates() {
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('route_templates')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const templatesData = (data || []) as RouteTemplate[];

      const allCustomerIds = [...new Set(templatesData.flatMap(t => t.customer_ids || []))];
      let customerMap: Record<string, Customer> = {};
      if (allCustomerIds.length > 0) {
        const { data: custData } = await supabase.from('customers').select('id, fantasy_name').in('id', allCustomerIds);
        if (custData) {
          (custData as Customer[]).forEach(c => { customerMap[c.id] = c; });
        }
      }

      setTemplates(templatesData.map(t => ({
        ...t,
        customer_details: (t.customer_ids || []).map(id => customerMap[id]).filter(Boolean) as Customer[],
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}