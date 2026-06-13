import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";
import { useAuth } from "@/hooks/useAuth";
import { useDriverData } from "@/hooks/useDriverData";

export default function ResumenPage() {
  const navigate = useNavigate();
  const { driver, user } = useAuth();
  const { truck, routeSheet, visits, loading } = useDriverData();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      Pending: 0,
      In_Progress: 0,
      Completed: 0,
      Delayed: 0,
      Closed: 0,
      Failed: 0,
    };
    visits.forEach((v) => {
      c[v.status] = (c[v.status] || 0) + 1;
    });
    return c;
  }, [visits]);

  const totalVisits = visits.length;
  const pendingCount = counts.Pending || 0;
  const completedCount = (counts.Completed || 0) + (counts.Closed || 0);
  const delayedCount = counts.Delayed || 0;
  const failedCount = counts.Failed || 0;
  const profilePhoto = (user?.user_metadata?.avatar_url as string) || null;

  const stats = [
    {
      label: "Pendientes",
      value: pendingCount,
      icon: "ri-time-line",
      color: "text-foreground-600",
      bg: "bg-secondary-100",
    },
    {
      label: "Completados",
      value: completedCount,
      icon: "ri-check-double-line",
      color: "text-accent-600",
      bg: "bg-accent-100",
    },
    {
      label: "Demorados",
      value: delayedCount,
      icon: "ri-alarm-warning-line",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Fallidos",
      value: failedCount,
      icon: "ri-close-circle-line",
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

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
        <div className="bg-primary-500 px-5 pt-12 pb-8 rounded-b-[28px]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-background-50/20 flex items-center justify-center border-[3px] border-background-50/30 overflow-hidden shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={driver?.name || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="ri-user-line text-background-50 text-2xl"></i>
              )}
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-background-50">
                {driver?.name || "Conductor"}
              </h1>
              <p className="text-sm text-primary-200 mt-0.5">
                {truck?.model || "Sin vehículo asignado"}
              </p>
              <p className="text-xs text-primary-300 mt-0.5">
                {truck?.plate ? `Patente: ${truck.plate}` : ""}
              </p>
            </div>
          </div>

          <div className="bg-background-50/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center">
                <i className="ri-calendar-line text-background-50 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-primary-200">Fecha</p>
                <p className="text-sm font-semibold text-background-50 capitalize">
                  {routeSheet ? formatDate(routeSheet.date) : "Sin ruta asignada"}
                </p>
              </div>
            </div>
            <div className="w-px h-10 bg-background-50/20"></div>
            <div className="text-right">
              <p className="text-xs text-primary-200">Clientes asignados</p>
              <p className="text-2xl font-heading font-bold text-background-50">
                {totalVisits}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 -mt-4">
          <div className="bg-background-50 rounded-2xl p-5">
            <h2 className="text-base font-heading font-semibold text-foreground-800 mb-4">
              Estado del día
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} rounded-xl p-4 flex flex-col gap-2`}
                >
                  <div className="w-9 h-9 flex items-center justify-center">
                    <i className={`${stat.icon} ${stat.color} text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-500">{stat.label}</p>
                    <p className={`text-2xl font-heading font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-secondary-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground-500">Total de visitas</p>
                <p className="text-xl font-heading font-bold text-foreground-900">
                  {totalVisits}
                </p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center">
                <i className="ri-map-pin-line text-primary-500 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4">
          <button
            onClick={() => navigate("/hoja-ruta")}
            disabled={!routeSheet}
            className={`w-full py-4 font-semibold text-base rounded-2xl active:scale-[0.98] transition-all duration-150 whitespace-nowrap flex items-center justify-center gap-3 ${
              routeSheet
                ? "bg-primary-500 text-background-50 hover:bg-primary-600 cursor-pointer"
                : "bg-background-200 text-foreground-400 cursor-not-allowed"
            }`}
          >
            <i className="ri-play-circle-line text-xl"></i>
            {routeSheet ? "INICIAR RECORRIDO" : "SIN RUTA ASIGNADA"}
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}