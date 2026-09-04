import type { RouteObject } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/login/page";
import AuthGuard from "@/components/auth/AuthGuard";
import Dashboard from "@/pages/dashboard/page";
import MessagesPage from "@/pages/messages/page";
import RoutesPage from "@/pages/routes/page";
import RouteNewPage from "@/pages/routes/new/page";
import RouteDetailPage from "@/pages/routes/[id]/page";
import RouteTemplatesPage from "@/pages/routes/templates/page";
import RouteTemplateNewPage from "@/pages/routes/templates/new/page";
import RouteTemplateDetailPage from "@/pages/routes/templates/[id]/page";
import CustomersPage from "@/pages/customers/page";
import TruckNewPage from "@/pages/trucks/new/page";
import TrucksPage from "@/pages/trucks/page";
import TruckDetailPage from "@/pages/trucks/[id]/page";
import TruckMaintenancePage from "@/pages/trucks/maintenance/page";
import DriversPage from "@/pages/drivers/page";
import DriverNewPage from "@/pages/drivers/new/page";
import DriverDetailPage from "@/pages/drivers/[id]/page";
import CompanionsPage from "@/pages/companions/page";
import EquipmentPage from "@/pages/equipment/page";
import GPSPage from "@/pages/gps/page";
import ReportsPage from "@/pages/reports/page";
import DocumentsPage from "@/pages/documents/page";
import SettingsPage from "@/pages/settings/page";
import DriverPage from "@/pages/driver/page";
import CustomerDetailPage from "@/pages/customers/[id]/page";
import CustomerNewPage from "@/pages/customers/new/page";
import FuelPage from "@/pages/fuel/page";

const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  {
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/messages", element: <MessagesPage /> },
      { path: "/routes", element: <RoutesPage /> },
      { path: "/routes/new", element: <RouteNewPage /> },
      { path: "/routes/templates", element: <RouteTemplatesPage /> },
      { path: "/routes/templates/new", element: <RouteTemplateNewPage /> },
      { path: "/routes/templates/:id", element: <RouteTemplateDetailPage /> },
      { path: "/routes/:id", element: <RouteDetailPage /> },
      { path: "/customers", element: <CustomersPage /> },
      { path: "/customers/new", element: <CustomerNewPage /> },
      { path: "/customers/:id", element: <CustomerDetailPage /> },
      { path: "/trucks", element: <TrucksPage /> },
      { path: "/trucks/new", element: <TruckNewPage /> },
      { path: "/trucks/:id", element: <TruckDetailPage /> },
      { path: "/trucks/maintenance", element: <TruckMaintenancePage /> },
      { path: "/fuel", element: <FuelPage /> },
      { path: "/drivers", element: <DriversPage /> },
      { path: "/drivers/new", element: <DriverNewPage /> },
      { path: "/drivers/:id", element: <DriverDetailPage /> },
      { path: "/companions", element: <CompanionsPage /> },
      { path: "/equipment", element: <EquipmentPage /> },
      { path: "/gps", element: <GPSPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/documents", element: <DocumentsPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  { path: "/driver", element: <DriverPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;