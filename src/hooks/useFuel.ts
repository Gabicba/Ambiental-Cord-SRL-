import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface FuelRecord {
  id: string;
  truck_id: string;
  truck_plate: string;
  truck_model: string;
  fuel_type: string;
  date: string;
  liters: number;
  cost: number | null;
  unit_price: number | null;
  km_at_refuel: number;
  km_since_last_refuel: number | null;
  consumption_km_per_liter: number | null;
  consumption_l_per_100km: number | null;
  cost_per_km: number | null;
  station: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface FuelSummary {
  totalLiters: number;
  totalCost: number;
  avgUnitPrice: number;
  avgConsumptionL100: number;
  avgCostPerKm: number;
  recordCount: number;
  byTruck: {
    truck_id: string;
    plate: string;
    model: string;
    liters: number;
    cost: number;
    count: number;
    avgConsumptionL100: number;
    avgCostPerKm: number;
  }[];
  monthly: { month: string; liters: number; cost: number; km: number; count: number }[];
  alerts: { type: 'high_consumption' | 'low_km' | 'price_spike' | 'missing_km'; message: string; truck_id: string; truck_plate: string; record_id: string }[];
}

export interface FuelSeriesPoint {
  key: string;
  label: string;
  totalLiters: number;
  totalCost: number;
  byFuel: Record<string, { liters: number; cost: number }>;
}

export interface FuelChartData {
  monthly: FuelSeriesPoint[];
  weekly: FuelSeriesPoint[];
  yearly: FuelSeriesPoint[];
  fuelTypes: string[];
  byFuelTotal: { fuel: string; liters: number; cost: number }[];
}

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getISOWeek(dateStr: string): { year: number; week: number } {
  const d = new Date(dateStr + 'T00:00:00');
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

export function useFuel() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('fuel_records')
        .select('*, truck:trucks(id, plate, model, fuel_type)')
        .order('date', { ascending: false })
        .limit(500);

      if (err) throw err;

      const enriched = (data || []).map((r: Record<string, unknown>) => {
        const truck = (r.truck as Record<string, unknown> | undefined) || null;
        const liters = parseFloat(r.liters as string) || 0;
        const cost = r.cost ? parseFloat(r.cost as string) : null;
        const kmSince = r.km_since_last_refuel as number | null;
        const consumptionKml = r.consumption_km_per_liter ? parseFloat(r.consumption_km_per_liter as string) : null;
        const unitPrice = r.unit_price ? parseFloat(r.unit_price as string) : (cost && liters ? parseFloat((cost / liters).toFixed(2)) : null);

        const lPer100km = consumptionKml && consumptionKml > 0 ? parseFloat((100 / consumptionKml).toFixed(2)) : null;
        const costPerKm = cost && kmSince && kmSince > 0 ? parseFloat((cost / kmSince).toFixed(2)) : null;

        return {
          id: r.id as string,
          truck_id: r.truck_id as string,
          truck_plate: (truck?.plate as string) || '—',
          truck_model: (truck?.model as string) || '',
          fuel_type: (truck?.fuel_type as string) || 'Otro',
          date: r.date as string,
          liters,
          cost,
          unit_price: unitPrice,
          km_at_refuel: r.km_at_refuel as number,
          km_since_last_refuel: kmSince,
          consumption_km_per_liter: consumptionKml,
          consumption_l_per_100km: lPer100km,
          cost_per_km: costPerKm,
          station: r.station as string | null,
          notes: r.notes as string | null,
          photo_url: r.photo_url as string | null,
          created_at: r.created_at as string,
        };
      }) as FuelRecord[];

      setRecords(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar registros de combustible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getLastRefuel = useCallback(async (truckId: string, beforeDate: string) => {
    const { data } = await supabase
      .from('fuel_records')
      .select('km_at_refuel, liters, date')
      .eq('truck_id', truckId)
      .lt('date', beforeDate)
      .order('date', { ascending: false })
      .limit(1);
    return (data || [])[0] as { km_at_refuel: number; liters: number; date: string } | undefined;
  }, []);

  const createFuelRecord = useCallback(async (payload: {
    truck_id: string;
    truck_plate?: string;
    truck_model?: string;
    date: string;
    liters: number;
    cost?: number | null;
    unit_price?: number | null;
    km_at_refuel: number;
    station?: string | null;
    notes?: string | null;
    photo_url?: string | null;
  }) => {
    const last = await getLastRefuel(payload.truck_id, payload.date);

    let kmSince = null;
    let consumptionKml = null;
    if (last) {
      kmSince = payload.km_at_refuel - last.km_at_refuel;
      if (kmSince > 0 && payload.liters > 0) {
        consumptionKml = parseFloat((kmSince / payload.liters).toFixed(2));
      }
    }

    const { data, error: err } = await supabase
      .from('fuel_records')
      .insert({
        ...payload,
        km_since_last_refuel: kmSince,
        consumption_km_per_liter: consumptionKml,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select('*, truck:trucks(id, plate, model, fuel_type)')
      .single();

    if (err) throw err;

    const r = data as Record<string, unknown>;
    const truck = (r.truck as Record<string, unknown> | undefined) || null;
    const liters = parseFloat(r.liters as string) || 0;
    const cost = r.cost ? parseFloat(r.cost as string) : null;
    const kmS = r.km_since_last_refuel as number | null;
    const consKml = r.consumption_km_per_liter ? parseFloat(r.consumption_km_per_liter as string) : null;
    const up = r.unit_price ? parseFloat(r.unit_price as string) : (cost && liters ? parseFloat((cost / liters).toFixed(2)) : null);

    const newRecord: FuelRecord = {
      id: r.id as string,
      truck_id: r.truck_id as string,
      truck_plate: (truck?.plate as string) || payload.truck_plate || '—',
      truck_model: (truck?.model as string) || payload.truck_model || '',
      fuel_type: (truck?.fuel_type as string) || 'Otro',
      date: r.date as string,
      liters,
      cost,
      unit_price: up,
      km_at_refuel: r.km_at_refuel as number,
      km_since_last_refuel: kmS,
      consumption_km_per_liter: consKml,
      consumption_l_per_100km: consKml && consKml > 0 ? parseFloat((100 / consKml).toFixed(2)) : null,
      cost_per_km: cost && kmS && kmS > 0 ? parseFloat((cost / kmS).toFixed(2)) : null,
      station: r.station as string | null,
      notes: r.notes as string | null,
      photo_url: r.photo_url as string | null,
      created_at: r.created_at as string,
    };

    setRecords(prev => [newRecord, ...prev]);
    return data;
  }, [getLastRefuel]);

  const deleteFuelRecord = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('fuel_records').delete().eq('id', id);
    if (err) throw err;
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const summary = useMemo<FuelSummary>(() => {
    const totalLiters = records.reduce((s, r) => s + r.liters, 0);
    const totalCost = records.reduce((s, r) => s + (r.cost || 0), 0);
    const withUnitPrice = records.filter(r => r.unit_price);
    const avgUnitPrice = withUnitPrice.length > 0 ? withUnitPrice.reduce((s, r) => s + (r.unit_price || 0), 0) / withUnitPrice.length : 0;
    const withL100 = records.filter(r => r.consumption_l_per_100km);
    const avgConsumptionL100 = withL100.length > 0 ? withL100.reduce((s, r) => s + (r.consumption_l_per_100km || 0), 0) / withL100.length : 0;
    const withCostKm = records.filter(r => r.cost_per_km);
    const avgCostPerKm = withCostKm.length > 0 ? withCostKm.reduce((s, r) => s + (r.cost_per_km || 0), 0) / withCostKm.length : 0;

    const byTruckMap = new Map<string, { truck_id: string; plate: string; model: string; liters: number; cost: number; count: number; l100vals: number[]; costKmVals: number[] }>();
    records.forEach(r => {
      const key = r.truck_id;
      const existing = byTruckMap.get(key);
      if (existing) {
        existing.liters += r.liters;
        existing.cost += (r.cost || 0);
        existing.count += 1;
        if (r.consumption_l_per_100km) existing.l100vals.push(r.consumption_l_per_100km);
        if (r.cost_per_km) existing.costKmVals.push(r.cost_per_km);
      } else {
        byTruckMap.set(key, {
          truck_id: r.truck_id,
          plate: r.truck_plate,
          model: r.truck_model,
          liters: r.liters,
          cost: r.cost || 0,
          count: 1,
          l100vals: r.consumption_l_per_100km ? [r.consumption_l_per_100km] : [],
          costKmVals: r.cost_per_km ? [r.cost_per_km] : [],
        });
      }
    });

    const byTruck = Array.from(byTruckMap.values()).map(t => ({
      ...t,
      avgConsumptionL100: t.l100vals.length ? t.l100vals.reduce((a, b) => a + b, 0) / t.l100vals.length : 0,
      avgCostPerKm: t.costKmVals.length ? t.costKmVals.reduce((a, b) => a + b, 0) / t.costKmVals.length : 0,
    })).sort((a, b) => b.liters - a.liters);

    const monthlyMap = new Map<string, { month: string; liters: number; cost: number; km: number; count: number }>();
    records.forEach(r => {
      const m = r.date.slice(0, 7);
      const existing = monthlyMap.get(m);
      if (existing) {
        existing.liters += r.liters;
        existing.cost += (r.cost || 0);
        existing.km += (r.km_since_last_refuel || 0);
        existing.count += 1;
      } else {
        monthlyMap.set(m, { month: m, liters: r.liters, cost: r.cost || 0, km: r.km_since_last_refuel || 0, count: 1 });
      }
    });
    const monthly = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

    // Alertas simples
    const alerts: FuelSummary['alerts'] = [];
    const truckRecords = new Map<string, FuelRecord[]>();
    records.forEach(r => {
      const arr = truckRecords.get(r.truck_id) || [];
      arr.push(r);
      truckRecords.set(r.truck_id, arr);
    });

    truckRecords.forEach((arr, tid) => {
      const plate = arr[0]?.truck_plate || '—';
      const sorted = arr.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const withL100 = sorted.filter(r => r.consumption_l_per_100km != null);
      if (withL100.length >= 3) {
        const avg = withL100.slice(1).reduce((s, r) => s + (r.consumption_l_per_100km || 0), 0) / (withL100.length - 1);
        const last = withL100[0];
        if (last.consumption_l_per_100km && avg > 0 && last.consumption_l_per_100km > avg * 1.2) {
          alerts.push({ type: 'high_consumption', message: `Consumo atipico: ${last.consumption_l_per_100km.toFixed(1)} L/100km (promedio ${avg.toFixed(1)})`, truck_id: tid, truck_plate: plate, record_id: last.id });
        }
      }
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].km_since_last_refuel === null || sorted[i].km_since_last_refuel === 0) {
          alerts.push({ type: 'missing_km', message: 'Carga sin kilometraje recorrido registrado', truck_id: tid, truck_plate: plate, record_id: sorted[i].id });
          break;
        }
      }
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].km_at_refuel < sorted[i + 1].km_at_refuel) {
          alerts.push({ type: 'low_km', message: `Odometro ${sorted[i].km_at_refuel} km menor a carga anterior (${sorted[i + 1].km_at_refuel} km)`, truck_id: tid, truck_plate: plate, record_id: sorted[i].id });
          break;
        }
      }
    });

    return {
      totalLiters,
      totalCost,
      avgUnitPrice: parseFloat(avgUnitPrice.toFixed(2)),
      avgConsumptionL100: parseFloat(avgConsumptionL100.toFixed(2)),
      avgCostPerKm: parseFloat(avgCostPerKm.toFixed(2)),
      recordCount: records.length,
      byTruck,
      monthly,
      alerts,
    };
  }, [records]);

  const chartData = useMemo<FuelChartData>(() => {
    const monthlyMap = new Map<string, FuelSeriesPoint>();
    const weeklyMap = new Map<string, FuelSeriesPoint>();
    const yearlyMap = new Map<string, FuelSeriesPoint>();
    const byFuelTotalMap = new Map<string, { fuel: string; liters: number; cost: number }>();

    records.forEach((r) => {
      const fuel = r.fuel_type || 'Otro';
      const d = new Date(r.date + 'T00:00:00');
      const monthKey = r.date.slice(0, 7);
      const yearKey = r.date.slice(0, 4);
      const { year, week } = getISOWeek(r.date);
      const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
      const monthLabel = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      const weekLabel = `Sem ${week}`;

      const addPoint = (map: Map<string, FuelSeriesPoint>, key: string, label: string) => {
        let p = map.get(key);
        if (!p) {
          p = { key, label, totalLiters: 0, totalCost: 0, byFuel: {} };
          map.set(key, p);
        }
        p.totalLiters += r.liters;
        p.totalCost += r.cost || 0;
        const bf = p.byFuel[fuel] || { liters: 0, cost: 0 };
        bf.liters += r.liters;
        bf.cost += r.cost || 0;
        p.byFuel[fuel] = bf;
      };

      addPoint(monthlyMap, monthKey, monthLabel);
      addPoint(weeklyMap, weekKey, weekLabel);
      addPoint(yearlyMap, yearKey, yearKey);

      const bt = byFuelTotalMap.get(fuel) || { fuel, liters: 0, cost: 0 };
      bt.liters += r.liters;
      bt.cost += r.cost || 0;
      byFuelTotalMap.set(fuel, bt);
    });

    const sortByKey = (a: FuelSeriesPoint, b: FuelSeriesPoint) => a.key.localeCompare(b.key);
    const monthly = Array.from(monthlyMap.values()).sort(sortByKey).slice(-12);
    const weekly = Array.from(weeklyMap.values()).sort(sortByKey).slice(-12);
    const yearly = Array.from(yearlyMap.values()).sort(sortByKey);
    const fuelTypes = Array.from(byFuelTotalMap.keys());
    const byFuelTotal = Array.from(byFuelTotalMap.values()).sort((a, b) => b.liters - a.liters);

    return { monthly, weekly, yearly, fuelTypes, byFuelTotal };
  }, [records]);

  return { records, loading, error, refetch: fetchAll, createFuelRecord, deleteFuelRecord, summary, chartData };
}