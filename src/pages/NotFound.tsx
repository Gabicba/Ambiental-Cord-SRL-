import { useLocation, useNavigate } from "react-router-dom";
import MobileContainer from "@/components/base/MobileContainer";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-background-50">
        <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mb-6">
          <i className="ri-map-pin-user-line text-5xl text-foreground-400"></i>
        </div>
        <h1 className="text-6xl font-heading font-extrabold text-foreground-200 mb-2">
          404
        </h1>
        <p className="text-lg font-semibold text-foreground-700 mb-1">
          Página no encontrada
        </p>
        <p className="text-sm text-foreground-500 mb-8">
          La ruta <span className="font-mono text-foreground-400">{location.pathname}</span> no existe
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap"
        >
          Volver al inicio
        </button>
      </div>
    </MobileContainer>
  );
}