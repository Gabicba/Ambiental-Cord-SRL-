import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData, type VisitData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";

const statusConfig: Record<string, { label: string; icon: string; bg: string; text: string; dot: string }> = {
  Pending: {
    label: "Pendiente",
    icon: "ri-time-line",
    bg: "bg-secondary-100",
    text: "text-foreground-600",
    dot: "bg-secondary-400",
  },
  In_Progress: {
    label: "En proceso",
    icon: "ri-truck-line",
    bg: "bg-primary-100",
    text: "text-primary-600",
    dot: "bg-primary-500",
  },
  Completed: {
    label: "Completado",
    icon: "ri-check-double-line",
    bg: "bg-accent-100",
    text: "text-accent-600",
    dot: "bg-accent-500",
  },
  Delayed: {
    label: "Demorado",
    icon: "ri-alarm-warning-line",
    bg: "bg-amber-100",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  Closed: {
    label: "Cerrado",
    icon: "ri-close-circle-line",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  Failed: {
    label: "Fallido",
    icon: "ri-error-warning-line",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

type FilterStatus = "todas" | "Pending" | "In_Progress" | "Completed" | "Delayed" | "Closed" | "Failed";

const filterTabs: { value: FilterStatus; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "Pending", label: "Pendientes" },
  { value: "In_Progress", label: "En proceso" },
  { value: "Completed", label: "Completadas" },
  { value: "Delayed", label: "Demoradas" },
];

export default function HojaRutaPage() {
  const navigate = useNavigate();
  const { state } = useRouteState();
  const { visits, loading } = useDriverData();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("todas");

  const mergedVisits = useMemo(() => {
    return visits.map((v) => ({
      ...v,
      status: state.clientStatuses[v.id] || v.status,
    }));
  }, [visits, state.clientStatuses]);

  const filteredVisits = useMemo(() => {
    if (activeFilter === "todas") return mergedVisits;
    return mergedVisits.filter((v) => v.status === activeFilter);
  }, [activeFilter, mergedVisits]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: mergedVisits.length };
    mergedVisits.forEach((v) => {
      c[v.status] = (c[v.status] || 0) + 1;
    });
    return c;
  }, [mergedVisits]);

  const completedCount = (counts.Completed || 0) + (counts.Closed || 0) + (counts.Failed || 0);
  const remainingCount = mergedVisits.length - completedCount;
  const delayedCount = counts.Delayed || 0;
  const totalDelayedInList = state.delayedClients.length;

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-screen bg-background-50">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="bg-primary-500 px-5 pt-12 pb-5 rounded-b-[24px]">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/resumen")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/15 hover:bg-background-50/25 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-background-50 text-lg"></i>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-heading font-bold text-background-50">
                Hoja de Ruta
              </h1>
              <p className="text-xs text-primary-200">
                {remainingCount} de {mergedVisits.length} pendientes
              </p>
            </div>
            <button
              onClick={() => navigate("/mapa")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/15 hover:bg-background-50/25 transition-colors cursor-pointer shrink-0"
              title="Ver mapa del recorrido"
            >
              <i className="ri-map-pin-line text-background-50 text-lg"></i>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === tab.value
                    ? "bg-background-50 text-primary-600"
                    : "bg-background-50/15 text-background-50/80 hover:bg-background-50/25"
                }`}
              >
                {tab.label}
                {tab.value !== "todas" && counts[tab.value] ? (
                  <span className="ml-1.5 opacity-70">({counts[tab.value]})</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-5 pt-5 pb-24">
          {filteredVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-inbox-line text-3xl text-foreground-400"></i>
              </div>
              <p className="text-sm text-foreground-500">No hay clientes en este estado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisits.map((visit) => {
                const status = statusConfig[visit.status] || statusConfig.Pending;
                const displayName = visit.customer_fantasy_name || "Cliente sin nombre";
                const displayAddress = visit.pickup_address || visit.customer_address || "Sin dirección";
                const displayPhone = visit.customer_phone || null;

                return (
                  <button
                    key={visit.id}
                    onClick={() => navigate(`/cliente/${visit.id}`)}
                    className="w-full bg-background-50 border border-secondary-200 rounded-2xl p-4 text-left hover:border-primary-300 active:scale-[0.99] transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-heading font-bold text-foreground-500">
                          {visit.visit_order}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground-900 truncate">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-4 h-4 flex items-center justify-center shrink-0">
                            <i className="ri-map-pin-line text-foreground-400 text-xs"></i>
                          </div>
                          <p className="text-xs text-foreground-500 truncate">
                            {displayAddress}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {displayPhone && (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <i className="ri-phone-line text-foreground-400 text-xs"></i>
                              </div>
                              <span className="text-xs text-foreground-500">{displayPhone}</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${status.bg}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                            <span className={`text-xs font-medium ${status.text}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                        {visit.observations && (
                          <p className="text-xs text-foreground-400 mt-1.5 truncate italic">
                            {visit.observations}
                          </p>
                        )}
                      </div>

                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <i className="ri-arrow-right-s-line text-foreground-300 text-lg"></i>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
            <div className="flex items-center gap-2 bg-background-50 border border-secondary-200 rounded-2xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground-500">Progreso del día</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full transition-all duration-500"
                      style={{ width: `${mergedVisits.length > 0 ? (completedCount / mergedVisits.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-foreground-700">
                    {completedCount}/{mergedVisits.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/pendientes")}
                className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  totalDelayedInList > 0 || delayedCount > 0
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-secondary-100 text-foreground-500"
                }`}
                title="Clientes pendientes para volver"
              >
                <i className="ri-alarm-warning-line text-lg"></i>
              </button>
              <button
                onClick={() => navigate("/historial")}
                className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-secondary-100 text-foreground-500 hover:bg-secondary-200 transition-colors cursor-pointer"
                title="Historial del día"
              >
                <i className="ri-history-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}