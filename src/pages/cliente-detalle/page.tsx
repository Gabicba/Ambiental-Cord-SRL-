import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";
import { supabase } from "@/lib/supabase";

export default function ClienteDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { visits } = useDriverData();
  const { state, dispatch } = useRouteState();
  const [showFullMap, setShowFullMap] = useState(false);
  const [contacts, setContacts] = useState<{ name: string; phone: string; role: string }[]>([]);

  const visit = useMemo(() => visits.find((v) => v.id === id), [visits, id]);

  const currentStatus = visit ? (state.clientStatuses[visit.id] || visit.status) : "";

  const displayName = visit?.customer_fantasy_name || "Cliente";
  const displayAddress = visit?.pickup_address || visit?.customer_address || "Sin dirección";
  const displayPhone = visit?.customer_phone || null;
  const lat = visit?.pickup_lat ?? null;
  const lng = visit?.pickup_lng ?? null;

  useEffect(() => {
    if (visit?.customer_id) {
      supabase
        .from("customer_contacts")
        .select("name, phone, role")
        .eq("customer_id", visit.customer_id)
        .then(({ data }) => {
          if (data) {
            setContacts(data as { name: string; phone: string; role: string }[]);
          }
        })
        .catch(() => {});
    }
  }, [visit?.customer_id]);

  if (!visit) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background-50">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-user-unfollow-line text-4xl text-foreground-400"></i>
          </div>
          <p className="text-lg font-semibold text-foreground-700 mb-1">Cliente no encontrado</p>
          <p className="text-sm text-foreground-500 mb-6">Este cliente no existe en la hoja de ruta</p>
          <button
            onClick={() => navigate("/hoja-ruta")}
            className="px-6 py-3 bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Volver a Hoja de Ruta
          </button>
        </div>
      </MobileContainer>
    );
  }

  const mapSrc =
    lat && lng
      ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyA_A-validation-only&q=${lat},${lng}&zoom=15`
      : "";

  const handleOpenGPS = () => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else if (displayAddress) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(displayAddress)}`, "_blank");
    }
  };

  const handleCall = () => {
    if (displayPhone) {
      window.open(`tel:${displayPhone.replace(/\s/g, "")}`, "_blank");
    }
  };

  const handleIniciarVisita = () => {
    dispatch({ type: "SET_CLIENT_STATUS", clientId: visit.id, status: "In_Progress" });
    navigate(`/cliente/${visit.id}/visita`);
  };

  const isActionDisabled = currentStatus === "Completed" || currentStatus === "Closed" || currentStatus === "Failed";

  const statusLabelMap: Record<string, string> = {
    Pending: "Pendiente",
    In_Progress: "En proceso",
    Completed: "Completado",
    Delayed: "Demorado",
    Closed: "Cerrado",
    Failed: "Fallido",
  };

  const statusColorMap: Record<string, string> = {
    Pending: "text-foreground-600",
    In_Progress: "text-primary-600",
    Completed: "text-accent-600",
    Delayed: "text-amber-600",
    Closed: "text-red-600",
    Failed: "text-red-600",
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-12 flex items-center gap-3">
            <button
              onClick={() => navigate("/hoja-ruta")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/90 backdrop-blur-sm hover:bg-background-50 transition-colors cursor-pointer shrink-0"
            >
              <i className="ri-arrow-left-line text-foreground-800 text-lg"></i>
            </button>
            <h1 className="text-base font-heading font-bold text-background-50 drop-shadow-sm truncate">
              {displayName}
            </h1>
          </div>

          {lat && lng ? (
            <div
              className="relative w-full h-[220px] bg-secondary-200 cursor-pointer overflow-hidden"
              onClick={() => setShowFullMap(!showFullMap)}
            >
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Ubicación de ${displayName}`}
                className="w-full h-full"
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 right-3 bg-background-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-fullscreen-line text-foreground-600 text-xs"></i>
                </div>
                <span className="text-xs font-medium text-foreground-600">Ampliar</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-[140px] bg-secondary-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <i className="ri-map-pin-line text-foreground-400 text-2xl"></i>
                </div>
                <p className="text-xs text-foreground-500">{displayAddress}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 px-5 pt-5 pb-24">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
              <i className="ri-store-2-line text-primary-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-heading font-semibold text-foreground-900 truncate">
                {displayName}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                  <i className="ri-map-pin-line text-foreground-400 text-xs"></i>
                </div>
                <p className="text-xs text-foreground-500 truncate">{displayAddress}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            <button
              onClick={handleOpenGPS}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 text-background-50 font-semibold text-sm rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-navigation-line text-sm"></i>
              </div>
              Navegar
            </button>
            {displayPhone && (
              <button
                onClick={handleCall}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-500 text-background-50 font-semibold text-sm rounded-xl hover:bg-accent-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-phone-line text-sm"></i>
                </div>
                Llamar
              </button>
            )}
          </div>

          <div className="bg-secondary-50 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-information-line text-foreground-500"></i>
              </div>
              <h3 className="text-sm font-semibold text-foreground-800">Información</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Dirección</span>
                <span className="text-sm font-semibold text-foreground-800 truncate ml-4 text-right max-w-[180px]">{displayAddress}</span>
              </div>
              {displayPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-500">Teléfono</span>
                  <span className="text-sm font-semibold text-foreground-800">{displayPhone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Orden en ruta</span>
                <span className="text-sm font-semibold text-foreground-800">#{visit.visit_order}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Estado</span>
                <span className={`text-sm font-semibold ${statusColorMap[currentStatus] || "text-foreground-600"}`}>
                  {statusLabelMap[currentStatus] || currentStatus}
                </span>
              </div>
            </div>
          </div>

          {contacts.length > 0 && (
            <div className="bg-secondary-50 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-contacts-line text-foreground-500"></i>
                </div>
                <h3 className="text-sm font-semibold text-foreground-800">Contactos</h3>
              </div>
              <div className="space-y-2">
                {contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs text-foreground-700 font-medium">{contact.name}</span>
                    <div className="flex items-center gap-2">
                      {contact.role && <span className="text-xs text-foreground-400">{contact.role}</span>}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(/\s/g, "")}`}
                          className="text-xs text-primary-500 font-medium cursor-pointer hover:text-primary-600"
                        >
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visit.observations && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-chat-quote-line text-amber-600"></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-1">Observaciones</h3>
                  <p className="text-sm text-amber-700">{visit.observations}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
            {isActionDisabled ? (
              <div className="w-full py-4 bg-background-200 text-foreground-400 font-semibold text-base rounded-2xl cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-3">
                <i className="ri-check-double-line text-xl"></i>
                VISITA FINALIZADA
              </div>
            ) : (
              <button
                onClick={handleIniciarVisita}
                className="w-full py-4 bg-primary-500 text-background-50 font-semibold text-base rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center justify-center gap-3"
              >
                <i className="ri-play-circle-line text-xl"></i>
                INICIAR VISITA
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}