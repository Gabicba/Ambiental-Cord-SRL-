export default function GPSPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">GPS Tracking</h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitoreo en tiempo real de la flota via ControlSat
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Trucks Status Panel */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { plate: 'AB 123 CD', driver: 'Carlos Mendez', status: 'En ruta', speed: 45, lat: -34.6037, lng: -58.3816 },
            { plate: 'AC 456 EF', driver: 'Juan Rodriguez', status: 'En base', speed: 0, lat: -34.5785, lng: -58.4267 },
            { plate: 'AD 789 GH', driver: 'Maria Gonzalez', status: 'En ruta', speed: 52, lat: -34.5891, lng: -58.4289 },
            { plate: 'AE 012 IJ', driver: 'Pedro Sanchez', status: 'En base', speed: 0, lat: -34.6191, lng: -58.3712 },
          ].map((truck) => (
            <div
              key={truck.plate}
              className="bg-white rounded-xl p-4 border border-brand-border/60 hover:border-brand-green/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <i className="ri-truck-line text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{truck.plate}</p>
                    <p className="text-xs text-text-muted">{truck.driver}</p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${truck.status === 'En ruta' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <i className="ri-speed-line" />
                  {truck.speed} km/h
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-line" />
                  {truck.lat.toFixed(4)}, {truck.lng.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-brand-border/60 overflow-hidden">
          <div className="p-4 border-b border-brand-border/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Mapa en Vivo</h3>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                En ruta
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Detenido
              </span>
            </div>
          </div>
          <div className="h-[500px] w-full">
            <iframe
              title="GPS Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210146.68100188583!2d-58.5733832!3d-34.6157432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90b07%3A0x948c7b6a0bfc6!2sBuenos%20Aires%2C%20CABA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}