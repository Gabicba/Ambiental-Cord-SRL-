import { mockCustomers } from '@/mocks/customers';
import { getContactVisibilityFromStorage } from '@/hooks/useContactVisibility';
import type { RouteVisit } from '@/mocks/driverApp';

interface DetailScreenProps {
  visit: RouteVisit;
  onBack: () => void;
  onStartVisit: () => void;
}

export default function DetailScreen({ visit, onBack, onStartVisit }: DetailScreenProps) {
  const isPending = visit.status === 'Pending';

  const customer = mockCustomers.find((c) => c.fantasy_name === visit.customer_name);
  const visibleContacts = customer?.contacts.filter((_, idx) => {
    if (!customer) return true;
    return getContactVisibilityFromStorage(customer.id, idx);
  }) ?? [];

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${visit.lat},${visit.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-6">
      <div className="bg-brand-primary text-white p-4">
        <button onClick={onBack} type="button" className="flex items-center gap-1 text-white/70 hover:text-white mb-2 transition-colors">
          <i className="ri-arrow-left-line" /> Volver
        </button>
        <h1 className="text-lg font-bold">{visit.customer_name}</h1>
        <p className="text-xs opacity-80">{visit.address}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-xl p-4 border border-brand-border space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-map-pin-line text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Dirección</p>
              <p className="text-xs text-text-muted">{visit.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-time-line text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Horario</p>
              <p className="text-xs text-text-muted">{visit.schedule}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-sticky-note-line text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Observación</p>
              <p className="text-xs text-text-muted">{visit.note || 'Sin observaciones'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-archive-line text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Tachos</p>
              <p className="text-xs text-text-muted">{visit.containers}</p>
            </div>
          </div>
        </div>

        {/* Visible Contacts */}
        {visibleContacts.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-brand-border">
            <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <i className="ri-contacts-line text-brand-green" />
              Contactos
            </p>
            <div className="space-y-3">
              {visibleContacts.map((contact, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-line text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{contact.name}</p>
                    <p className="text-xs text-text-secondary">{contact.role}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="text-xs text-brand-primary flex items-center gap-1">
                        <i className="ri-phone-line" />
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openMaps}
            type="button"
            className="py-3 bg-white border border-brand-border rounded-xl text-sm font-semibold text-text-primary hover:bg-brand-light transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-map-pin-line text-brand-primary" />
            Abrir en Maps
          </button>
          <a
            href={`tel:${visit.phone.replace(/\D/g, '')}`}
            className="py-3 bg-white border border-brand-border rounded-xl text-sm font-semibold text-text-primary hover:bg-brand-light transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-phone-line text-emerald-600" />
            Llamar
          </a>
        </div>

        {isPending && (
          <button
            onClick={onStartVisit}
            type="button"
            className="w-full py-4 bg-brand-green text-white rounded-xl text-base font-bold hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-play-circle-line text-xl" />
            Iniciar visita
          </button>
        )}

        {!isPending && (
          <div className="bg-white rounded-xl p-4 border border-brand-border">
            <p className="text-sm font-semibold text-text-primary mb-2">Estado de la visita</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                visit.status === 'Visited' ? 'bg-emerald-100 text-emerald-700' :
                visit.status === 'Closed' ? 'bg-red-100 text-red-700' :
                visit.status === 'No_Oil' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  visit.status === 'Visited' ? 'bg-emerald-500' :
                  visit.status === 'Closed' ? 'bg-red-500' :
                  visit.status === 'No_Oil' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`} />
                {visit.status === 'Visited' ? 'Completado' :
                 visit.status === 'Closed' ? 'Cerrado' :
                 visit.status === 'No_Oil' ? 'Sin aceite' : visit.status}
              </span>
              {visit.liters_collected > 0 && (
                <span className="text-xs font-medium text-brand-primary">{visit.liters_collected}L recolectados</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}