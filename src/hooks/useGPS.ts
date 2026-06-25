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
  facingRight: boolean;
  transitionDuration: number;
}

interface RawGPSTruck {
  deviceId: number;
  lat: number;
  lng: number;
  speed: number;
  status: 'online' | 'ack' | 'offline';
  name: string;
  time?: string;
  course: number;
}

interface TruckTracking {
  lat: number;
  lng: number;
  changedAt: number;
  facingRight: boolean;
}

const MIN_DURATION_MS = 5000;
const MAX_DURATION_MS = 130000;
const MOVEMENT_THRESHOLD = 0.00002; // ~2 metros, evita ruido de GPS cuando está detenido
const COURSE_RELIABLE_SPEED_KMH = 3; // por debajo de esto, "course" no es confiable
const FACING_SIN_THRESHOLD = 0.15; // evita parpadeo cuando el camión va casi derecho norte-sur

function computeFacingRight(course: number, fallback: boolean): boolean {
  const rad = (course * Math.PI) / 180;
  const eastComponent = Math.sin(rad);
  if (eastComponent > FACING_SIN_THRESHOLD) return true;
  if (eastComponent < -FACING_SIN_THRESHOLD) return false;
  return fallback;
}

export function useGPS() {
  const [trucks, setTrucks] = useState<GPSTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const trackingRef = useRef<Map<number, TruckTracking>>(new Map());

  const fetchTrucks = useCallback(async () => {
    try {
      const now = Date.now();
      const data = await api.get<RawGPSTruck[]>('/gps/trucks');

      setTrucks(data.map(truck => {
        const tracking = trackingRef.current.get(truck.deviceId);
        const reliableCourse = truck.speed > COURSE_RELIABLE_SPEED_KMH;

        if (!tracking) {
          const facingRight = reliableCourse ? computeFacingRight(truck.course, true) : true;
          trackingRef.current.set(truck.deviceId, {
            lat: truck.lat,
            lng: truck.lng,
            changedAt: now,
            facingRight,
          });
          return {
            ...truck,
            prevLat: truck.lat,
            prevLng: truck.lng,
            facingRight,
            transitionDuration: 0,
          };
        }

        const facingRight = reliableCourse
          ? computeFacingRight(truck.course, tracking.facingRight)
          : tracking.facingRight;

        const movedLat = Math.abs(truck.lat - tracking.lat);
        const movedLng = Math.abs(truck.lng - tracking.lng);
        const hasRealMovement = movedLat > MOVEMENT_THRESHOLD || movedLng > MOVEMENT_THRESHOLD;

        if (!hasRealMovement) {
          return {
            ...truck,
            lat: tracking.lat,
            lng: tracking.lng,
            prevLat: tracking.lat,
            prevLng: tracking.lng,
            facingRight,
            transitionDuration: 0,
          };
        }

        const elapsed = now - tracking.changedAt;
        const transitionDuration = Math.min(Math.max(elapsed, MIN_DURATION_MS), MAX_DURATION_MS);
        const prevLat = tracking.lat;
        const prevLng = tracking.lng;

        trackingRef.current.set(truck.deviceId, {
          lat: truck.lat,
          lng: truck.lng,
          changedAt: now,
          facingRight,
        });

        return {
          ...truck,
          prevLat,
          prevLng,
          facingRight,
          transitionDuration,
        };
      }));

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
