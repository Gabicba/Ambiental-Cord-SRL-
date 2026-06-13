import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useDriverData } from "@/hooks/useDriverData";
import { useRouteState } from "@/hooks/useRouteState";

export default function ClienteDemoradoPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { visits, updateVisit } = useDriverData();
  const { dispatch } = useRouteState();
  const [marked, setMarked] = useState(false);
  const [saving, setSaving] = useState(false);

  const visit = visits.find((v) => v.id === id);
  const displayName = visit?.customer_fantasy_name || "Cliente";
  const displayAddress = visit?.pickup_address || visit?.customer_address || "Sin dirección";

  if (!visit) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background-50">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-user-unfollow-line text-4xl text-foreground-400"></i>
          </div>
          <p className="text-lg font-semibold text-foreground-700 mb-1">Cliente no encontrado</p>
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

  const now = new Date();

  const handleMarkDelayed = async () => {
    setSaving(true);

    const result = await updateVisit(visit.id, {
      status: "Delayed",
      delay_reason: "Cliente solicita volver más tarde",
      delay_return_time: null,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (!result.success) return;

    dispatch({ type: "SET_CLIENT_STATUS", clientId: visit.id, status: "Delayed" });

    dispatch({
      type: "ADD_DELAYED",
      client: {
        clientId: visit.id,
        clientName: displayName,
        delayedAt: now,
      },
    });

    setMarked(true);

    setTimeout(() => {
      navigate("/hoja-ruta");
    }, 2000);
  };

  if (marked) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background-50">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <i className="ri-timer-line text-amber-600 text-5xl"></i>
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground-900 mb-2">Cliente demorado</h2>
          <p className="text-sm text-foreground-500 text-center mb-1">
            {displayName} se retiró temporalmente del recorrido
          </p>
          <p className="text-sm text-foreground-500 text-center mb-2">
            Se agregó a la lista de pendientes para volver
          </p>
          <p className="text-xs text-foreground-400">Redirigiendo a la hoja de ruta...</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-background-50">
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/cliente/${visit.id}/visita`)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-100 hover:bg-background-200 transition-colors cursor-pointer shrink-0"
          >
            <i className="ri-arrow-left-line text-foreground-700 text-lg"></i>
          </button>
          <h1 className="text-lg font-heading font-bold text-foreground-900 truncate">
            Cliente Demorado
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-28 h-28 bg-amber-100 rounded-full flex items-center justify-center mb-8">
            <i className="ri-timer-flash-line text-amber-600 text-6xl"></i>
          </div>

          <h2 className="text-xl font-heading font-bold text-foreground-900 text-center mb-2">
            {displayName}
          </h2>
          <p className="text-sm text-foreground-500 text-center mb-8">
            El cliente solicita que vuelvas más tarde
          </p>

          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-information-line text-amber-600"></i>
              </div>
              ¿Qué sucede al marcar como demorado?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-arrow-right-circle-line text-amber-500 text-sm"></i>
                </div>
                <span className="text-sm text-amber-700">
                  Se retira temporalmente de tu recorrido principal
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-arrow-right-circle-line text-amber-500 text-sm"></i>
                </div>
                <span className="text-sm text-amber-700">
                  Se agrega automáticamente a la lista de pendientes para volver
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-arrow-right-circle-line text-amber-500 text-sm"></i>
                </div>
                <span className="text-sm text-amber-700">
                  Podés continuar trabajando con normalidad
                </span>
              </li>
            </ul>
          </div>

          <div className="w-full bg-secondary-50 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-500">Dirección</span>
              <span className="text-xs font-semibold text-foreground-700 truncate ml-4 text-right">{displayAddress}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-foreground-500">Hora del registro</span>
              <span className="text-xs font-semibold text-foreground-700">
                {now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-background-50 via-background-50 to-transparent pointer-events-auto">
            <button
              onClick={handleMarkDelayed}
              disabled={saving}
              className="w-full py-4 bg-amber-500 text-white font-semibold text-base rounded-2xl hover:bg-amber-600 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="ri-timer-line text-xl"></i>
                  MARCAR COMO DEMORADO
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}