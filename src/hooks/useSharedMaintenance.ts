import { useState, useCallback, useEffect } from 'react';
import {
  maintenanceRecords as initialRecords,
  maintenanceCategories,
} from '@/mocks/maintenance';
import { mockTrucks } from '@/mocks/trucks';
import type { MaintenanceRecord, MaintenanceCategory } from '@/mocks/maintenance';

const STORAGE_KEY = 'uco_maintenance_alerts_v1';
const TRUCKS_STORAGE_KEY = 'uco_trucks_data_v1';

function formatDateInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonthsToDateStr(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() + months);
  return formatDateInput(d);
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T12:00:00');
  return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function computeStatus(nextDueDate: string): MaintenanceRecord['status'] {
  const days = getDaysUntil(nextDueDate);
  if (days < -7) return 'Expired';
  if (days <= 0) return 'Due';
  return 'Upcoming';
}

function loadAlerts(): MaintenanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MaintenanceRecord[];
      // Recompute statuses on load since dates change
      return parsed.map((rec) => ({
        ...rec,
        status: computeStatus(rec.next_due_date),
      }));
    }
  } catch {
    // ignore
  }
  return initialRecords.map((rec) => ({
    ...rec,
    status: computeStatus(rec.next_due_date),
  }));
}

function saveAlerts(records: MaintenanceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export interface TruckMaintenanceEntry {
  id: string;
  date: string;
  type: string;
  km: number;
  cost: number;
  description: string;
  provider: string;
  status: string;
  category?: string;
  next_due_date?: string;
  interval_months?: number;
}

export interface UseSharedMaintenanceReturn {
  alerts: MaintenanceRecord[];
  addAlert: (alert: Omit<MaintenanceRecord, 'id' | 'status'>) => void;
  completeAlert: (
    alertId: string,
    completionData: {
      completedDate: string;
      km: number;
      cost: number;
      provider: string;
      notes: string;
    }
  ) => void;
  deleteAlert: (alertId: string) => void;
  getSummary: () => { expired: number; due: number; upcoming: number; total: number };
  getUrgentAlerts: () => MaintenanceRecord[];
  getAlertsByTruck: (truckId: string) => MaintenanceRecord[];
  reload: () => void;
}

export function useSharedMaintenance(): UseSharedMaintenanceReturn {
  const [alerts, setAlerts] = useState<MaintenanceRecord[]>(loadAlerts);

  // Persist on change
  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  const reload = useCallback(() => {
    setAlerts(loadAlerts());
  }, []);

  const addAlert = useCallback(
    (alert: Omit<MaintenanceRecord, 'id' | 'status'>) => {
      const newAlert: MaintenanceRecord = {
        ...alert,
        id: `MNT-SCH-${Date.now()}`,
        status: computeStatus(alert.next_due_date),
      };
      setAlerts((prev) => {
        // Remove any existing alert for same truck + category that is not completed
        const filtered = prev.filter(
          (r) =>
            !(
              r.truck_id === newAlert.truck_id &&
              r.category === newAlert.category &&
              r.status !== 'Completed'
            )
        );
        const next = [newAlert, ...filtered];
        saveAlerts(next);
        return next;
      });
    },
    []
  );

  const completeAlert = useCallback(
    (
      alertId: string,
      completionData: {
        completedDate: string;
        km: number;
        cost: number;
        provider: string;
        notes: string;
      }
    ) => {
      setAlerts((prev) => {
        const alert = prev.find((a) => a.id === alertId);
        if (!alert) return prev;

        // Mark current alert as completed
        const updated = prev.map((a) =>
          a.id === alertId
            ? { ...a, status: 'Completed' as const, last_done_date: completionData.completedDate }
            : a
        );

        // Add to truck history in localStorage
        try {
          const existingRaw = localStorage.getItem(TRUCKS_STORAGE_KEY);
          const trucksData = existingRaw
            ? (JSON.parse(existingRaw) as Record<string, { maintenance_history: TruckMaintenanceEntry[] }>)
            : {};

          const truckData = trucksData[alert.truck_id] || { maintenance_history: [] };
          const catLabel =
            maintenanceCategories[alert.category]?.label || alert.category;

          const newHistoryEntry: TruckMaintenanceEntry = {
            id: `MNT-${Date.now()}`,
            date: completionData.completedDate,
            type: 'Mantenimiento Preventivo',
            km: completionData.km,
            cost: completionData.cost,
            description: `${catLabel}: ${completionData.notes}`,
            provider: completionData.provider || alert.provider || 'Sin proveedor',
            status: 'Completed',
            category: alert.category,
            next_due_date: addMonthsToDateStr(completionData.completedDate, alert.interval_months),
            interval_months: alert.interval_months,
          };

          truckData.maintenance_history = [newHistoryEntry, ...truckData.maintenance_history];
          trucksData[alert.truck_id] = truckData;
          localStorage.setItem(TRUCKS_STORAGE_KEY, JSON.stringify(trucksData));
        } catch {
          // ignore
        }

        // Create next recurring alert
        const nextDue = addMonthsToDateStr(
          completionData.completedDate,
          alert.interval_months
        );
        const nextAlert: MaintenanceRecord = {
          id: `MNT-SCH-${Date.now() + 1}`,
          truck_id: alert.truck_id,
          truck_plate: alert.truck_plate,
          truck_model: alert.truck_model,
          category: alert.category,
          last_done_date: completionData.completedDate,
          next_due_date: nextDue,
          interval_months: alert.interval_months,
          current_km: completionData.km,
          status: computeStatus(nextDue),
          notes: `Generado automaticamente tras completar ${maintenanceCategories[alert.category]?.label || alert.category}`,
          provider: alert.provider,
          cost: alert.cost,
        };

        const next = [...updated, nextAlert];
        saveAlerts(next);
        return next;
      });
    },
    []
  );

  const deleteAlert = useCallback((alertId: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== alertId);
      saveAlerts(next);
      return next;
    });
  }, []);

  const getSummary = useCallback(() => {
    let expired = 0;
    let due = 0;
    let upcoming = 0;
    alerts.forEach((rec) => {
      if (rec.status === 'Expired') expired++;
      else if (rec.status === 'Due') due++;
      else if (rec.status === 'Upcoming') upcoming++;
    });
    return { expired, due, upcoming, total: alerts.filter((a) => a.status !== 'Completed').length };
  }, [alerts]);

  const getUrgentAlerts = useCallback(() => {
    return alerts.filter((rec) => rec.status === 'Due' || rec.status === 'Expired');
  }, [alerts]);

  const getAlertsByTruck = useCallback(
    (truckId: string) => {
      return alerts.filter((a) => a.truck_id === truckId && a.status !== 'Completed');
    },
    [alerts]
  );

  return {
    alerts,
    addAlert,
    completeAlert,
    deleteAlert,
    getSummary,
    getUrgentAlerts,
    getAlertsByTruck,
    reload,
  };
}

// Helper to get merged truck data (mock + localStorage overrides)
export function getMergedTruckData(truckId: string) {
  const base = mockTrucks.find((t) => t.id === truckId);
  if (!base) return null;

  try {
    const raw = localStorage.getItem(TRUCKS_STORAGE_KEY);
    if (raw) {
      const trucksData = JSON.parse(raw) as Record<string, { maintenance_history: TruckMaintenanceEntry[] }>;
      const override = trucksData[truckId];
      if (override?.maintenance_history?.length) {
        return {
          ...base,
          maintenance_history: [...override.maintenance_history, ...base.maintenance_history],
        };
      }
    }
  } catch {
    // ignore
  }
  return base;
}