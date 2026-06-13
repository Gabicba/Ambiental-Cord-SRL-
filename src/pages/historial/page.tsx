import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData, type VisitData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";
import { useAuth } from "@/hooks/useAuth";

const visitLabelMap: Record<string, { label: string; icon: string; bg: string; text: string; dot: string }> = {
  Completed: {
    label: "Completada",
    icon: "ri-checkbox-circle-line",
    bg: "bg-accent-100",
    text: "text-accent-700",
    dot: "bg-accent-500",
  },
  Closed: {
    label: "Cerrado",
    icon: "ri-door-lock-line",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  Delayed: {
    label: "Demorado",
    icon: "ri-timer-line",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Failed: {
    label: "Fallido",
    icon: "ri-close-circle-line",
    bg: "bg-secondary-200",
    text: "text-secondary-700",
    dot: "bg-secondary-500",
  },
  In_Progress: {
    label: "En proceso",
    icon: "ri-truck-line",
    bg: "bg-primary-100",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
  Pending: {
    label: "Pendiente",
    icon: "ri-time-line",
    bg: "bg-secondary-100",
    text: "text-secondary-700",
    dot: "bg-secondary-500",
  },
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialPage() {
  const navigate = useNavigate();
  const { visits } = useDriverData();
  const { state } = useRouteState();
  const { driver } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const processedVisits = useMemo(() => {
    return visits
      .filter((v) => v.visited_at !== null)
      .sort((a, b) => {
        const dateA = a.visited_at ? new Date(a.visited_at).getTime() : 0;
        const dateB = b.visited_at ? new Date(b.visited_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [visits]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const visitStatus = (visit: VisitData) => {
    return visitLabelMap[visit.status] || visitLabelMap.Pending;
  };

  const totalPhotos = processedVisits.reduce((sum, v) => sum + (v.photos?.length || 0), 0);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="bg-primary-500 px-5 pt-12 pb-6 rounded-b-[24px]">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/hoja-ruta")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/15 hover:bg-background-50/25 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-background-50 text-lg"></i>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-heading font-bold text-background-50">
                Historial del Día
              </h1>
              <p className="text-xs text-primary-200">
                {processedVisits.length} visita{processedVisits.length !== 1 ? "s" : ""} registrada{processedVisits.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/15">
              <i className="ri-history-line text-background-50 text-lg"></i>
            </div>
          </div>

          {processedVisits.length > 0 && (
            <div className="flex items-center gap-3 bg-background-50/15 backdrop-blur-sm rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center">
                  <i className="ri-user-line text-background-50 text-xl"></i>
                </div>
                <div>
                  <p className="text-xs text-primary-200">Conductor</p>
                  <p className="text-sm font-semibold text-background-50">{driver?.name || "Conductor"}</p>
                </div>
              </div>
              <div className="w-px h-10 bg-background-50/20"></div>
              <div className="text-right flex-1">
                <p className="text-xs text-primary-200">Evidencias</p>
                <p className="text-2xl font-heading font-bold text-background-50">
                  {totalPhotos}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 px-5 pt-5 pb-28">
          {processedVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mb-5">
                <i className="ri-history-line text-4xl text-foreground-400"></i>
              </div>
              <h3 className="text-base font-heading font-semibold text-foreground-700 mb-2">
                Sin visitas registradas
              </h3>
              <p className="text-sm text-foreground-500 text-center max-w-[260px] mb-6">
                A medida que visites clientes, se irá armando el historial cronológico del día con todas las evidencias.
              </p>
              <button
                onClick={() => navigate("/hoja-ruta")}
                className="px-6 py-3 bg-primary-500 text-background-50 font-semibold text-sm rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                Ir a Hoja de Ruta
              </button>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-secondary-200 rounded-full"></div>

              <div className="space-y-0">
                {processedVisits.map((visit, idx) => {
                  const status = visitStatus(visit);
                  const isExpanded = expandedId === visit.id;
                  const displayName = visit.customer_fantasy_name || "Cliente";
                  const displayAddress = visit.pickup_address || visit.customer_address || "";
                  const timeLabel = visit.visited_at || visit.updated_at;

                  return (
                    <div key={visit.id} className="relative pb-5 last:pb-0">
                      <div className="absolute left-[-19px] top-3 w-4 h-4 rounded-full border-[3px] border-background-50 z-10 shadow-sm"
                        style={{
                          backgroundColor:
                            status.dot.includes("accent") ? "#22c55e" :
                            status.dot.includes("amber") ? "#f59e0b" :
                            status.dot.includes("red") ? "#ef4444" :
                            status.dot.includes("primary") ? "#3b82f6" : "#9ca3af"
                        }}
                      />

                      <button
                        onClick={() => toggleExpand(visit.id)}
                        className="w-full text-left bg-background-50 border border-secondary-200 rounded-2xl p-4 hover:border-primary-300 active:scale-[0.99] transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-foreground-400">
                                {timeLabel ? formatTime(timeLabel) : "--:--"}
                              </span>
                              <div className={`px-2 py-0.5 rounded-full ${status.bg} text-[10px] font-semibold ${status.text} whitespace-nowrap`}>
                                {status.label}
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground-900 truncate">
                              {displayName}
                            </h3>
                            {displayAddress && (
                              <p className="text-xs text-foreground-500 truncate mt-0.5">{displayAddress}</p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {visit.photos && visit.photos.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-foreground-400">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <i className="ri-camera-line text-sm"></i>
                                </div>
                                <span>{visit.photos.length}</span>
                              </div>
                            )}
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-foreground-300`}></i>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-secondary-100 space-y-2.5">
                            {visit.photos && visit.photos.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-foreground-600 mb-2 flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-camera-line text-xs"></i>
                                  </div>
                                  Evidencia ({visit.photos.length})
                                </p>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                  {visit.photos.map((photo, pi) => (
                                    <img
                                      key={pi}
                                      src={photo}
                                      alt={`Foto ${pi + 1}`}
                                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-secondary-200"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {visit.observations && (
                              <div>
                                <p className="text-xs font-semibold text-foreground-600 mb-1 flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-message-2-line text-xs"></i>
                                  </div>
                                  Observaciones
                                </p>
                                <p className="text-xs text-foreground-500 bg-secondary-50 rounded-lg p-2.5">
                                  {visit.observations}
                                </p>
                              </div>
                            )}

                            {(visit.receiver_name || visit.receiver_dni) && (
                              <div>
                                <p className="text-xs font-semibold text-foreground-600 mb-1 flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-user-received-line text-xs"></i>
                                  </div>
                                  Recibió
                                </p>
                                <p className="text-xs text-foreground-500 bg-secondary-50 rounded-lg p-2.5">
                                  {visit.receiver_name}
                                  {visit.receiver_name && visit.receiver_dni ? " — " : ""}
                                  {visit.receiver_dni}
                                </p>
                              </div>
                            )}

                            {visit.delay_reason && (
                              <div>
                                <p className="text-xs font-semibold text-foreground-600 mb-1 flex items-center gap-1">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <i className="ri-timer-line text-xs"></i>
                                  </div>
                                  Motivo demora
                                </p>
                                <p className="text-xs text-foreground-500 bg-secondary-50 rounded-lg p-2.5">
                                  {visit.delay_reason}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-foreground-400 flex items-center gap-1">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <i className="ri-time-line"></i>
                                </div>
                                {timeLabel ? formatDateTime(timeLabel) : "--"}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
            <button
              onClick={() => navigate("/finalizar")}
              className={`w-full py-4 font-semibold text-base rounded-2xl transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${
                processedVisits.length === 0
                  ? "bg-background-200 text-foreground-400 cursor-not-allowed"
                  : "bg-primary-500 text-background-50 hover:bg-primary-600 active:scale-[0.98] cursor-pointer"
              }`}
              disabled={processedVisits.length === 0}
            >
              <i className="ri-flag-line text-xl"></i>
              FINALIZAR JORNADA
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}