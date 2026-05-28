import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDrivers } from '@/mocks/drivers';
import { driverStatuses } from '@/mocks/drivers';

export default function DriverNewPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Información personal
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [joinedAt] = useState(new Date().toISOString().split('T')[0]);

  // Licencia
  const [licenseType, setLicenseType] = useState('D2');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseIssueDate, setLicenseIssueDate] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  // Asignación
  const [status, setStatus] = useState('Active');
  const [assignedTruckId, setAssignedTruckId] = useState('');

  // Contacto de emergencia
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Observaciones
  const [notes, setNotes] = useState('');

  // Opciones disponibles
  const licenseTypes = [
    { value: 'D1', label: 'D1 - Transporte de pasajeros (hasta 16 pasajeros)' },
    { value: 'D2', label: 'D2 - Transporte de pasajeros y carga (vehiculos pesados)' },
    { value: 'D3', label: 'D3 - Transporte de carga especializada' },
  ];

  const statusOptions = Object.entries(driverStatuses).map(([key, config]) => ({
    value: key,
    label: config.label,
  }));

  // Simulamos camiones disponibles (sin camiones mock reutilizables, usamos array inline)
  const availableTrucks = [
    { id: 'TRK-001', plate: 'AB 123 CD', model: 'Mercedes-Benz Atego 1726' },
    { id: 'TRK-002', plate: 'AC 456 EF', model: 'Volkswagen Delivery 11.180' },
    { id: 'TRK-003', plate: 'AD 789 GH', model: 'Ford Cargo 1723' },
    { id: 'TRK-004', plate: 'AE 012 IJ', model: 'Mercedes-Benz Accelo 1016' },
    { id: 'TRK-005', plate: 'AF 345 KL', model: 'Volkswagen Constellation 17.280' },
    { id: 'TRK-006', plate: 'AG 678 MN', model: 'Iveco Daily 70C16' },
  ];

  // Camiones ya asignados a otros conductores activos
  const assignedTruckIds = new Set(
    mockDrivers.filter((d) => d.status !== 'Inactive' && d.id !== 'NEW').map((d) => d.assigned_truck_id).filter(Boolean)
  );

  const freeTrucks = availableTrucks.filter((t) => !assignedTruckIds.has(t.id));

  const handleSave = () => {
    if (!isValid) return;
    setSaving(true);
    setTimeout(() => {
      navigate('/drivers');
    }, 800);
  };

  const isValid =
    fullName &&
    dni &&
    phone &&
    licenseType &&
    licenseNumber &&
    licenseIssueDate &&
    licenseExpiry;

  const relationOptions = [
    'Esposa',
    'Esposo',
    'Padre',
    'Madre',
    'Hermano',
    'Hermana',
    'Hijo',
    'Hija',
    'Pareja',
    'Amigo',
    'Otro',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Conductor</h1>
        <p className="text-sm text-text-secondary mt-1">
          Registrar un nuevo conductor en el sistema de recoleccion
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-border/60 p-6 space-y-6">
        {/* Informacion Personal */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <i className="ri-user-line text-brand-primary" />
            Informacion Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Carlos Mendez"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                DNI *
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej: 25.456.789"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Telefono *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +54 11 6789-0123"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: conductor@ambcord.com"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Direccion
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. Corrientes 3456, CABA"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
        </div>

        {/* Licencia */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <i className="ri-steering-line text-brand-primary" />
            Licencia de Conducir
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Tipo de licencia *
              </label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
              >
                {licenseTypes.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Numero de licencia *
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                placeholder="Ej: D2-25.456.789-A"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Fecha de emision *
              </label>
              <input
                type="date"
                value={licenseIssueDate}
                onChange={(e) => setLicenseIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
        </div>

        {/* Asignacion */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <i className="ri-settings-3-line text-brand-primary" />
            Asignacion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Estado inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Camion asignado
              </label>
              <select
                value={assignedTruckId}
                onChange={(e) => setAssignedTruckId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
              >
                <option value="">Sin asignar</option>
                {freeTrucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.plate} — {t.model}
                  </option>
                ))}
              </select>
              {assignedTruckIds.size > 0 && freeTrucks.length === 0 && (
                <p className="text-xs text-amber-600 mt-1.5">
                  <i className="ri-information-line mr-1" />
                  Todos los camiones activos estan asignados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <i className="ri-heart-pulse-line text-brand-primary" />
            Contacto de Emergencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Ej: Laura Mendez"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Telefono
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Ej: +54 11 5678-9012"
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase block mb-1.5">
                Relacion
              </label>
              <select
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green/30 appearance-none cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                {relationOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="border-t border-brand-border/40 pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <i className="ri-sticky-note-line text-brand-primary" />
            Observaciones
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales sobre el conductor..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-light border border-brand-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{notes.length}/500</p>
        </div>

        {/* Resumen */}
        {isValid && (
          <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-brand-green mb-2">Resumen</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-text-muted">Nombre</p>
                <p className="font-medium text-text-primary">{fullName}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">DNI</p>
                <p className="font-medium text-text-primary">{dni}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Licencia</p>
                <p className="font-medium text-text-primary">
                  {licenseType} — {licenseNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Vencimiento</p>
                <p className="font-medium text-text-primary">{licenseExpiry || '—'}</p>
              </div>
            </div>
            {(emergencyName || assignedTruckId) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2 pt-2 border-t border-brand-green/10">
                {assignedTruckId && (
                  <div>
                    <p className="text-xs text-text-muted">Camion</p>
                    <p className="font-medium text-text-primary">
                      {availableTrucks.find((t) => t.id === assignedTruckId)?.plate || assignedTruckId}
                    </p>
                  </div>
                )}
                {emergencyName && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-text-muted">Contacto emergencia</p>
                    <p className="font-medium text-text-primary">
                      {emergencyName}
                      {emergencyRelation ? ` (${emergencyRelation})` : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => navigate('/drivers')}
            type="button"
            className="px-5 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-text-secondary hover:bg-brand-light transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            type="button"
            className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ${
              isValid && !saving
                ? 'bg-brand-green hover:bg-brand-green/90'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="ri-check-line" />
                Crear Conductor
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}