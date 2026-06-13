import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData, type VisitData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const statusPin: Record<string, { color: string; label: string }> = {
  pendiente: { color: "#6b7280", label: "Pendiente" },
  completado: { color: "#16a34a", label: "Completado" },
  demorado: { color: "#d97706", label: "Demorado" },
  cerrado: { color: "#dc2626", label: "Cerrado" },
  reprogramado: { color: "#dc2626", label: "Fallido" },
};

type FilterLayer = "todas" | "pendientes" | "completadas" | "en_ruta";

export default function MapaRecorridoPage() {
  const navigate = useNavigate();
  const { visits } = useDriverData();
  const { state } = useRouteState();
  const [activeLayer, setActiveLayer] = useState<FilterLayer>("todas");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState<"collapsed" | "half" | "full">("collapsed");

  const mergedVisits = useMemo(() => {
    return visits
      .map((v) => ({
        ...v,
        status: state.clientStatuses[v.id] || v.status,
      }))
      .sort((a, b) => a.visit_order - b.visit_order);
  }, [visits, state.clientStatuses]);

  const filteredVisits = useMemo(() => {
    switch (activeLayer) {
      case "pendientes":
        return mergedVisits.filter((v) => v.status === "pendiente" || v.status === "demorado");
      case "completadas":
        return mergedVisits.filter((v) => v.status === "completado" || v.status === "cerrado" || v.status === "reprogramado");
      case "en_ruta":
        return mergedVisits.filter((v) => v.status === "pendiente");
      default:
        return mergedVisits;
    }
  }, [activeLayer, mergedVisits]);

  const activeForRoute = mergedVisits.filter((v) => v.status !== "cerrado" && v.status !== "reprogramado");

  const routeSegments = useMemo(() => {
    const segments: { from: VisitData; to: VisitData; distanceKm: number; etaMin: number }[] = [];
    for (let i = 0; i < activeForRoute.length - 1; i++) {
      const lat1 = activeForRoute[i].pickup_lat;
      const lng1 = activeForRoute[i].pickup_lng;
      const lat2 = activeForRoute[i + 1].pickup_lat;
      const lng2 = activeForRoute[i + 1].pickup_lng;
      if (lat1 != null && lng1 != null && lat2 != null && lng2 != null) {
        const dist = haversineDistance(lat1, lng1, lat2, lng2);
        segments.push({
          from: activeForRoute[i],
          to: activeForRoute[i + 1],
          distanceKm: dist,
          etaMin: Math.round((dist / 35) * 60),
        });
      }
    }
    return segments;
  }, [activeForRoute]);

  const centerLat = useMemo(() => {
    const withCoords = filteredVisits.filter((v) => v.pickup_lat != null);
    if (withCoords.length === 0) return -34.6037;
    return withCoords.reduce((sum, v) => sum + (v.pickup_lat || 0), 0) / withCoords.length;
  }, [filteredVisits]);

  const centerLng = useMemo(() => {
    const withCoords = filteredVisits.filter((v) => v.pickup_lng != null);
    if (withCoords.length === 0) return -58.3816;
    return withCoords.reduce((sum, v) => sum + (v.pickup_lng || 0), 0) / withCoords.length;
  }, [filteredVisits]);

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyA_A-validation-only&q=${centerLat},${centerLng}&zoom=13`;

  const selectedVisit = selectedVisitId
    ? mergedVisits.find((v) => v.id === selectedVisitId)
    : null;

  const totalDistance = routeSegments.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalEta = routeSegments.reduce((sum, s) => sum + s.etaMin, 0);

  const counts = {
    pendientes: mergedVisits.filter((v) => v.status === "pendiente").length,
    completados: mergedVisits.filter((v) => v.status === "completado" || v.status === "cerrado" || v.status === "reprogramado").length,
    enRuta: mergedVisits.filter((v) => v.status === "pendiente" || v.status === "demorado").length,
  };

  const handleTogglePanel = () => {
    if (panelHeight === "collapsed") setPanelHeight("half");
    else if (panelHeight === "half") setPanelHeight("full");
    else setPanelHeight("collapsed");
  };

  const nextStop = mergedVisits.find(
    (v) => v.status === "pendiente"
  ) || null;

  const layerTabs: { value: FilterLayer; label: string; count: number }[] = [
    { value: "todas", label: "Todas", count: mergedVisits.length },
    { value: "pendientes", label: "Pendientes", count: counts.pendientes + counts.enRuta },
    { value: "completadas", label: "Completados", count: counts.completados },
    { value: "en_ruta", label: "En ruta", count: counts.pendientes },
  ];

  return (
    <MobileContainer>
      <div className="flex flex-col h-screen bg-background-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-20 px-5 pt-12 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate("/hoja-ruta")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/95 backdrop-blur-sm border border-background-200 hover:bg-background-100 transition-colors cursor-pointer shrink-0"
            >
              <i className="ri-arrow-left-line text-foreground-700 text-lg"></i>
            </button>
            <h1 className="text-lg font-heading font-bold text-foreground-900">
              Mapa del Recorrido
            </h1>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {layerTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveLayer(tab.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeLayer === tab.value
                    ? "bg-primary-500 text-background-50"
                    : "bg-background-50/95 backdrop-blur-sm border border-background-200 text-foreground-600 hover:border-background-300"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative">
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa del recorrido"
            className="w-full h-full"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background-50 via-transparent to-transparent"></div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30">
          <div className="w-full max-w-[430px]">
            {selectedVisit && (
              <div className="mx-5 mb-2 bg-background-50 rounded-2xl border border-background-200 p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${statusPin[selectedVisit.status]?.color || "#6b7280"}15` }}
                  >
                    <div className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusPin[selectedVisit.status]?.color || "#6b7280" }}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground-900 truncate">
                      {selectedVisit.customer_fantasy_name || "Cliente"}
                    </h4>
                    <p className="text-xs text-foreground-500 mt-0.5 truncate">
                      {selectedVisit.pickup_address || selectedVisit.customer_address || ""}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${statusPin[selectedVisit.status]?.color || "#6b7280"}15`,
                          color: statusPin[selectedVisit.status]?.color || "#6b7280",
                        }}
                      >
                        {statusPin[selectedVisit.status]?.label || "Pendiente"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        navigate(`/cliente/${selectedVisit.id}`);
                        setSelectedVisitId(null);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-500 text-background-50 hover:bg-primary-600 transition-colors cursor-pointer"
                    >
                      <i className="ri-arrow-right-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => setSelectedVisitId(null)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary-100 text-foreground-500 hover:bg-secondary-200 transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`mx-5 bg-background-50 border border-background-200 transition-all duration-300 overflow-hidden ${
                panelHeight === "full" ? "rounded-t-2xl max-h-[60vh]" :
                panelHeight === "half" ? "rounded-t-2xl max-h-[40vh]" :
                "rounded-2xl max-h-[180px]"
              }`}
              style={{ marginBottom: panelHeight === "collapsed" ? "24px" : "0" }}
            >
              <div onClick={handleTogglePanel} className="flex items-center justify-between px-4 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1.5 rounded-full bg-background-300"></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-foreground-400">{totalDistance.toFixed(1)} km total</span>
                  <span className="text-xs text-foreground-400">~{totalEta} min</span>
                </div>
              </div>

              {nextStop && (
                <div className="px-4 pb-3">
                  <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-navigation-line text-primary-500 text-sm"></i>
                      </div>
                      <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                        Próxima parada
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-heading font-bold text-foreground-900">
                          {nextStop.customer_fantasy_name || "Cliente"}
                        </h3>
                        <p className="text-xs text-foreground-500 mt-0.5">
                          {nextStop.pickup_address || nextStop.customer_address || ""}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const destLat = nextStop.pickup_lat;
                          const destLng = nextStop.pickup_lng;
                          const destAddr = nextStop.pickup_address || nextStop.customer_address;
                          if (destLat && destLng) {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`, "_blank");
                          } else if (destAddr) {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destAddr)}`, "_blank");
                          }
                        }}
                        className="shrink-0 px-4 py-2.5 bg-primary-500 text-background-50 text-xs font-semibold rounded-xl hover:bg-primary-600 active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <i className="ri-navigation-line text-sm"></i>
                        Navegar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {panelHeight !== "collapsed" && (
                <div className="border-t border-background-100 overflow-y-auto" style={{ maxHeight: panelHeight === "full" ? "calc(60vh - 180px)" : "calc(40vh - 180px)" }}>
                  {filteredVisits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mb-3">
                        <i className="ri-map-pin-line text-2xl text-foreground-400"></i>
                      </div>
                      <p className="text-sm text-foreground-500">No hay clientes para mostrar</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredVisits.map((visit) => {
                        const pin = statusPin[visit.status] || statusPin.pendiente;
                        const isActive = visit.visited_at !== null && visit.status === "pendiente";
                        const isSelected = selectedVisitId === visit.id;
                        return (
                          <button
                            key={visit.id}
                            onClick={() => setSelectedVisitId(isSelected ? null : visit.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                              isSelected ? "bg-primary-50" : isActive ? "bg-primary-50/50" : "hover:bg-secondary-50"
                            }`}
                          >
                            <div className="relative flex items-center justify-center shrink-0">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pin.color }}></div>
                              {isActive && (
                                <div className="absolute w-5 h-5 rounded-full animate-ping opacity-30" style={{ backgroundColor: pin.color }}></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground-400 w-5 shrink-0">{visit.visit_order}</span>
                                <h4 className="text-sm font-medium text-foreground-800 truncate">
                                  {visit.customer_fantasy_name || "Cliente"}
                                </h4>
                                {isActive && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-600 text-[10px] font-bold">AHORA</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 ml-7">
                                <span className="text-xs text-foreground-500 truncate">
                                  {visit.pickup_address || visit.customer_address || ""}
                                </span>
                              </div>
                            </div>
                            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                              <i className={`text-base ${isSelected ? "ri-arrow-up-s-line text-primary-500" : "ri-arrow-right-s-line text-foreground-300"}`}></i>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {panelHeight !== "collapsed" && (
              <button
                onClick={() => setPanelHeight("collapsed")}
                className="mx-5 mb-6 w-[calc(100%-40px)] py-3 bg-secondary-100 text-foreground-600 font-medium text-sm rounded-xl hover:bg-secondary-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-down-s-line mr-1"></i>
                Ocultar lista
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}