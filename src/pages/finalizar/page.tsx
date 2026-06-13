import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";
import { useAuth } from "@/hooks/useAuth";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function FinalizarPage() {
  const navigate = useNavigate();
  const { visits, routeSheet, truck, finalizeRoute } = useDriverData();
  const { state } = useRouteState();
  const { driver } = useAuth();
  const [confirmando, setConfirmando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergedVisits = useMemo(() => {
    return visits.map((v) => ({
      ...v,
      status: state.clientStatuses[v.id] || v.status,
    }));
  }, [visits, state.clientStatuses]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    mergedVisits.forEach((v) => {
      c[v.status] = (c[v.status] || 0) + 1;
    });
    return c;
  }, [mergedVisits]);

  const totalCompletados = (counts.Completed || 0) + (counts.Closed || 0) + (counts.Failed || 0);
  const totalPendientes = (counts.Pending || 0) + (counts.Delayed || 0) + (counts.In_Progress || 0);
  const totalFotos = mergedVisits.reduce((sum, v) => sum + (v.photos?.length || 0), 0);

  const distanciaTotal = useMemo(() => {
    const withCoords = mergedVisits
      .filter((v) => v.status !== "Closed" && v.status !== "Failed" && v.pickup_lat != null && v.pickup_lng != null)
      .sort((a, b) => a.visit_order - b.visit_order);

    if (withCoords.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < withCoords.length - 1; i++) {
      total += haversineDistance(
        withCoords[i].pickup_lat!, withCoords[i].pickup_lng!,
        withCoords[i + 1].pickup_lat!, withCoords[i + 1].pickup_lng!
      );
    }
    return total;
  }, [mergedVisits]);

  const duracionEstimada = useMemo(() => {
    const h = distanciaTotal / 35;
    const horas = Math.floor(h);
    const minutos = Math.round((h - horas) * 60);
    if (horas === 0) return `${minutos} min`;
    return `${horas}h ${minutos}min`;
  }, [distanciaTotal]);

  const now = new Date();
  const observacionesCount = mergedVisits.filter((v) => v.observations && v.observations.trim().length > 0).length;
  const clientesConIncidencia = mergedVisits.filter(
    (v) => v.status === "Delayed" || v.status === "Failed" || v.status === "Closed"
  ).length;

  const handleFinalizar = async () => {
    setFinalizando(true);
    setError(null);

    const result = await finalizeRoute();

    if (result.success) {
      setFinalizado(true);
    } else {
      setError(result.error || "Error al finalizar la jornada");
      setConfirmando(false);
    }

    setFinalizando(false);
  };

  if (finalizado) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background-50">
          <div className="w-28 h-28 bg-accent-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <i className="ri-check-double-line text-accent-600 text-[56px]"></i>
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground-900 mb-2 text-center">
            Jornada finalizada
          </h2>
          <p className="text-sm text-foreground-500 text-center mb-2">
            Toda la información fue registrada exitosamente
          </p>
          <p className="text-xs text-foreground-400 mb-8">
            Reporte enviado a administración
          </p>

          <div className="w-full bg-secondary-50 rounded-2xl p-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Conductor</span>
                <span className="text-sm font-semibold text-foreground-800">{driver?.name || "Conductor"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Vehículo</span>
                <span className="text-sm font-semibold text-foreground-800">{truck?.plate || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Clientes visitados</span>
                <span className="text-sm font-semibold text-foreground-800">{totalCompletados}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Evidencias</span>
                <span className="text-sm font-semibold text-foreground-800">{totalFotos} fotos</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.href = "/resumen";
            }}
            className="w-full py-4 bg-primary-500 text-background-50 font-semibold text-base rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Volver al inicio
          </button>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="bg-primary-500 px-5 pt-12 pb-6 rounded-b-[24px]">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/historial")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/15 hover:bg-background-50/25 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-background-50 text-lg"></i>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-heading font-bold text-background-50">
                Finalizar Jornada
              </h1>
              <p className="text-xs text-primary-200">
                Revisá el resumen antes de cerrar
              </p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-50/15">
              <i className="ri-flag-line text-background-50 text-lg"></i>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-background-50/15 backdrop-blur-sm rounded-2xl px-4 py-3">
            <div className="w-12 h-12 rounded-full bg-background-50/20 flex items-center justify-center">
              <i className="ri-user-line text-background-50 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-background-50">{driver?.name || "Conductor"}</p>
              <p className="text-xs text-primary-200">{truck?.model || "Sin vehículo"}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 pt-5 pb-28 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-error-warning-line text-red-600 text-sm"></i>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background-50 border border-secondary-200 rounded-2xl p-4">
              <div className="w-9 h-9 flex items-center justify-center mb-2">
                <i className="ri-user-star-line text-primary-500 text-xl"></i>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground-900">
                {totalCompletados}
              </p>
              <p className="text-xs text-foreground-500 mt-0.5">Clientes visitados</p>
            </div>
            <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4">
              <div className="w-9 h-9 flex items-center justify-center mb-2">
                <i className="ri-check-double-line text-accent-500 text-xl"></i>
              </div>
              <p className="text-2xl font-heading font-bold text-accent-700">
                {totalCompletados}
              </p>
              <p className="text-xs text-foreground-500 mt-0.5">Completados</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="w-9 h-9 flex items-center justify-center mb-2">
                <i className="ri-alarm-warning-line text-amber-500 text-xl"></i>
              </div>
              <p className="text-2xl font-heading font-bold text-amber-700">
                {totalPendientes}
              </p>
              <p className="text-xs text-foreground-500 mt-0.5">Pendientes</p>
            </div>
            <div className="bg-background-50 border border-secondary-200 rounded-2xl p-4">
              <div className="w-9 h-9 flex items-center justify-center mb-2">
                <i className="ri-camera-line text-foreground-600 text-xl"></i>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground-900">
                {totalFotos}
              </p>
              <p className="text-xs text-foreground-500 mt-0.5">Fotos de evidencia</p>
            </div>
          </div>

          <div className="bg-background-50 border border-secondary-200 rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-foreground-800 mb-3 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-information-line text-primary-500"></i>
              </div>
              Datos de la jornada
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Fecha</span>
                <span className="text-xs font-semibold text-foreground-700">
                  {new Intl.DateTimeFormat("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(now)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Hora de cierre</span>
                <span className="text-xs font-semibold text-foreground-700">
                  {now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Distancia estimada</span>
                <span className="text-xs font-semibold text-foreground-700">{distanciaTotal.toFixed(1)} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Duración estimada</span>
                <span className="text-xs font-semibold text-foreground-700">{duracionEstimada}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Clientes totales</span>
                <span className="text-xs font-semibold text-foreground-700">{visits.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-background-50 border border-secondary-200 rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-foreground-800 mb-3 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-file-list-3-line text-primary-500"></i>
              </div>
              Registro de incidencias
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Visitas con observaciones</span>
                <span className="text-xs font-semibold text-foreground-700">{observacionesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Clientes con incidencia</span>
                <span className="text-xs font-semibold text-amber-700">{clientesConIncidencia}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-500">Total procesados</span>
                <span className="text-xs font-semibold text-foreground-700">
                  {totalCompletados + totalPendientes} de {visits.length}
                </span>
              </div>
            </div>
          </div>

          {totalPendientes > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-error-warning-line text-amber-500 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Quedan clientes pendientes
                  </p>
                  <p className="text-xs text-amber-700">
                    Hay {totalPendientes} cliente{totalPendientes !== 1 ? "s" : ""} que no {totalPendientes !== 1 ? "fueron" : "fue"} visitado{totalPendientes !== 1 ? "s" : ""}. Al finalizar, se reportará{totalPendientes !== 1 ? "n" : ""} como pendiente{totalPendientes !== 1 ? "s" : ""} a administración.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-secondary-50 rounded-2xl p-4 mb-2">
            <p className="text-xs text-foreground-500 text-center">
              Al confirmar, se generará un reporte con toda la evidencia del día y se notificará a administración. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
            {confirmando ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground-700 text-center">
                  ¿Confirmás la finalización de la jornada?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmando(false)}
                    className="flex-1 py-3.5 bg-secondary-100 text-foreground-700 font-semibold text-sm rounded-2xl hover:bg-secondary-200 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFinalizar}
                    disabled={finalizando}
                    className="flex-1 py-3.5 bg-accent-500 text-background-50 font-semibold text-sm rounded-2xl hover:bg-accent-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {finalizando ? (
                      <div className="w-4 h-4 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin"></div>
                    ) : (
                      <i className="ri-check-double-line"></i>
                    )}
                    Sí, finalizar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmando(true)}
                className="w-full py-4 bg-primary-500 text-background-50 font-semibold text-base rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-flag-line text-xl"></i>
                FINALIZAR JORNADA
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}