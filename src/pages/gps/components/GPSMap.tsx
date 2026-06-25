import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GPSTruck } from '@/hooks/useGPS';

interface GPSMapProps {
  trucks: GPSTruck[];
  selectedTruckId: number | null;
}

function useInterpolatedTrucks(trucks: GPSTruck[]) {
  const [interpolated, setInterpolated] = useState<GPSTruck[]>(trucks);
  const animStateRef = useRef<Map<number, {
    fromLat: number; fromLng: number;
    toLat: number; toLng: number;
    startTime: number; duration: number;
  }>>(new Map());
  const truckDataRef = useRef<Map<number, GPSTruck>>(new Map());
  const rafRef = useRef<number | null>(null);

  const ease = (p: number) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  useEffect(() => {
    const now = performance.now();

    trucks.forEach(truck => {
      truckDataRef.current.set(truck.deviceId, truck);
      const existing = animStateRef.current.get(truck.deviceId);

      if (!existing) {
        animStateRef.current.set(truck.deviceId, {
          fromLat: truck.lat, fromLng: truck.lng,
          toLat: truck.lat, toLng: truck.lng,
          startTime: now, duration: 0,
        });
        return;
      }

      const targetChanged = existing.toLat !== truck.lat || existing.toLng !== truck.lng;
      if (!targetChanged) return;

      const elapsed = now - existing.startTime;
      const progress = existing.duration > 0 ? Math.min(elapsed / existing.duration, 1) : 1;
      const currentLat = existing.fromLat + (existing.toLat - existing.fromLat) * ease(progress);
      const currentLng = existing.fromLng + (existing.toLng - existing.fromLng) * ease(progress);

      animStateRef.current.set(truck.deviceId, {
        fromLat: currentLat, fromLng: currentLng,
        toLat: truck.lat, toLng: truck.lng,
        startTime: now,
        duration: truck.transitionDuration || 0,
      });
    });
  }, [trucks]);

  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      const result: GPSTruck[] = [];

      truckDataRef.current.forEach((truckData, deviceId) => {
        const anim = animStateRef.current.get(deviceId);
        if (!anim) { result.push(truckData); return; }

        const elapsed = now - anim.startTime;
        const progress = anim.duration > 0 ? Math.min(elapsed / anim.duration, 1) : 1;
        const eased = ease(progress);

        result.push({
          ...truckData,
          lat: anim.fromLat + (anim.toLat - anim.fromLat) * eased,
          lng: anim.fromLng + (anim.toLng - anim.fromLng) * eased,
        });
      });

      setInterpolated(result);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return interpolated;
}

const getMarkerIcon = (status: string, isSelected: boolean, facingRight: boolean) => {
  const color = status === 'online' ? '#10b981'
              : status === 'ack'    ? '#f59e0b'
              :                      '#ef4444';

  const pulse = status === 'online' ? `
    <div style="
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid ${color};
      opacity: 0.4;
      animation: gps-pulse 2s ease-out infinite;
    "></div>` : '';

  const ring = isSelected ? `
    <div style="
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid ${color};
      opacity: 0.8;
    "></div>` : '';

  return L.divIcon({
    className: '',
    html: `
      <style>
        @keyframes gps-pulse {
          0%   { transform: scale(1); opacity: 0.4; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
      <div style="position: relative; width: 36px; height: 36px;">
        ${pulse}
        ${ring}
        <div style="
          position: absolute;
          inset: 0;
          background-color: ${color};
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scaleX(${facingRight ? 1 : -1});
          transition: transform 0.4s ease;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.35-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zm9.78 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

function MapUpdater({ trucks, selectedTruckId }: { trucks: GPSTruck[]; selectedTruckId: number | null }) {
  const map = useMap();
  const flownToRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedTruckId === null) {
      flownToRef.current = null;
      return;
    }

    const truck = trucks.find(t => t.deviceId === selectedTruckId);
    if (!truck) return;

    const latlng: [number, number] = [truck.lat, truck.lng];

    if (flownToRef.current !== selectedTruckId) {
      map.flyTo(latlng, 15, { duration: 1.2 });
      flownToRef.current = selectedTruckId;
      return;
    }

    if (!map.getBounds().contains(latlng)) {
      map.panTo(latlng, { animate: true, duration: 0.8 });
    }
  }, [trucks, selectedTruckId, map]);

  return null;
}

export default function GPSMap({ trucks, selectedTruckId }: GPSMapProps) {
  const interpolatedTrucks = useInterpolatedTrucks(trucks);

  return (
    <MapContainer
      center={[-31.4167, -64.1833]}
      zoom={12}
      className="w-full"
      style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {interpolatedTrucks.map(truck => (
        <Marker
          key={truck.deviceId}
          position={[truck.lat, truck.lng]}
          icon={getMarkerIcon(truck.status, truck.deviceId === selectedTruckId, truck.facingRight)}
        >
          <Popup className="gps-popup">
            <div style={{ fontFamily: 'inherit', minWidth: '160px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: truck.status === 'online' ? '#10b981' : truck.status === 'ack' ? '#f59e0b' : '#ef4444',
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{truck.name}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Estado</span>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>
                    {truck.status === 'online' ? 'En ruta' : truck.status === 'ack' ? 'Detenido' : 'Sin señal'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Velocidad</span>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>{truck.speed} km/h</span>
                </div>
                {truck.time && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Última señal</span>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{truck.time}</span>
                  </div>
                )}
                <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#94a3b8' }}>
                  {truck.lat.toFixed(5)}, {truck.lng.toFixed(5)}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapUpdater trucks={interpolatedTrucks} selectedTruckId={selectedTruckId} />
    </MapContainer>
  );
}