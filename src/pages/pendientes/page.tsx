import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";

function getElapsedTime(delayedAt: Date): string {
  const diffMs = Date.now() - new Date(delayedAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `${diffMin} min`;

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours === 1) return `1 h ${mins} min`;
  return `${hours} h ${mins} min`;
}

export default function PendientesPage() {
  const navigate = useNavigate();
  const { visits } = useDriverData();
  const { state, dispatch } = useRouteState();
  const [elapsedMap, setElapsedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateElapsed = () => {
      const map: Record<string, string> = {};
      state.delayedClients.forEach((d) => {
        map[d.clientId] = getElapsedTime(d.delayedAt);
      });
      setElapsedMap(map);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [state.delayedClients]);

  const handleRevisit = (clientId: string) => {
    dispatch({ type: "SET_CLIENT_STATUS", clientId, status: "In_Progress" });
    dispatch({ type: "REMOVE_DELAYED", clientId });
    navigate(`/cliente/${clientId}`);
  };

  const delayedClientsWithData = state.delayedClients.map((d) => {
    const visit = visits.find((v) => v.id === d.clientId);
    return {
      ...d,
      address: visit?.pickup_address || visit?.customer_address || "",
      displayName: visit?.customer_fantasy_name || d.clientName,
      phone: visit?.customer_phone || "",
    };
  });

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/hoja-ruta")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-100 hover:bg-background-200 transition-colors cursor-pointer shrink-0"
          >
            <i className="ri-arrow-left-line text-foreground-700 text-lg"></i>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-bold text-foreground-900 truncate">
              Pendientes para volver
            </h1>
            <p className="text-xs text-foreground-500">
              Clientes que solicitaron volver más tarde
            </p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-timer-line text-xs"></i>
            </div>
            <span className="text-sm font-bold">{state.delayedClients.length}</span>
          </div>
        </div>

        <div className="flex-1 px-5 pb-6 overflow-y-auto">
          {state.delayedClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-check-double-line text-accent-600 text-5xl"></i>
              </div>
              <h2 className="text-lg font-heading font-bold text-foreground-900 mb-2">Todo al día</h2>
              <p className="text-sm text-foreground-500 text-center mb-8 max-w-[280px]">
                No tenés clientes pendientes para volver. Seguí con tu recorrido normalmente.
              </p>
              <button
                onClick={() => navigate("/hoja-ruta")}
                className="px-8 py-3 bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                Volver a Hoja de Ruta
              </button>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {delayedClientsWithData.map((d) => (
                <div
                  key={d.clientId}
                  className="bg-background-50 border border-amber-200 rounded-2xl p-4 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                      <i className="ri-timer-line text-amber-600 text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-heading font-semibold text-foreground-900 truncate">
                        {d.displayName}
                      </h3>
                      <p className="text-xs text-foreground-500 mt-0.5 truncate">{d.address}</p>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 flex items-center justify-center">
                            <i className="ri-time-line text-foreground-400 text-xs"></i>
                          </div>
                          <span className="text-xs text-foreground-600">
                            Demorado a las{" "}
                            {new Date(d.delayedAt).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <i className="ri-hourglass-line text-amber-500 text-xs"></i>
                        </div>
                        <span className="text-xs font-semibold text-amber-600">
                          Tiempo transcurrido: {elapsedMap[d.clientId] || "Calculando..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-background-100">
                    <button
                      onClick={() => navigate(`/cliente/${d.clientId}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary-100 text-foreground-700 font-medium text-xs rounded-xl hover:bg-secondary-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-eye-line text-xs"></i>
                      </div>
                      Ver detalle
                    </button>
                    <button
                      onClick={() => handleRevisit(d.clientId)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-500 text-background-50 font-semibold text-xs rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-play-circle-line text-xs"></i>
                      </div>
                      Volver a visitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}