import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LoginPage from "../pages/login/page";
import ResumenPage from "../pages/resumen/page";
import HojaRutaPage from "../pages/hoja-ruta/page";
import ClienteDetallePage from "../pages/cliente-detalle/page";
import RegistroVisitaPage from "../pages/registro-visita/page";
import ClienteDemoradoPage from "../pages/cliente-demorado/page";
import PendientesPage from "../pages/pendientes/page";
import MapaRecorridoPage from "../pages/mapa/page";
import HistorialPage from "../pages/historial/page";
import FinalizarPage from "../pages/finalizar/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/resumen",
    element: <ResumenPage />,
  },
  {
    path: "/hoja-ruta",
    element: <HojaRutaPage />,
  },
  {
    path: "/cliente/:id",
    element: <ClienteDetallePage />,
  },
  {
    path: "/cliente/:id/visita",
    element: <RegistroVisitaPage />,
  },
  {
    path: "/cliente/:id/demorado",
    element: <ClienteDemoradoPage />,
  },
  {
    path: "/pendientes",
    element: <PendientesPage />,
  },
  {
    path: "/mapa",
    element: <MapaRecorridoPage />,
  },
  {
    path: "/historial",
    element: <HistorialPage />,
  },
  {
    path: "/finalizar",
    element: <FinalizarPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;