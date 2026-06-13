import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

export interface GPSTruck {
  deviceId: number;
  lat: number;
  lng: number;
  prevLat?: number;
  prevLng?: number;
  speed: number;
  status: 'online' | 'ack' | 'offline';
  name: string;
  time?: string;
}

export function useGPS() {
  const [trucks, setTrucks] = useState<GPSTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevTrucksRef = useRef<Map<number, { lat: number; lng: number }>>(new Map());

  const fetchTrucks = useCallback(async () => {
    try {
      const data = await api.get<GPSTruck[]>('/gps/trucks');
      setTrucks(data.map(truck => {
        const prev = prevTrucksRef.current.get(truck.deviceId);
        return {
          ...truck,
          prevLat: prev?.lat ?? truck.lat,
          prevLng: prev?.lng ?? truck.lng,
        };
      }));
      prevTrucksRef.current = new Map(data.map(t => [t.deviceId, { lat: t.lat, lng: t.lng }]));
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos GPS');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrucks();
    const interval = setInterval(fetchTrucks, 10000);
    return () => clearInterval(interval);
  }, [fetchTrucks]);

  return { trucks, loading, error, lastUpdated, refresh: fetchTrucks };
}