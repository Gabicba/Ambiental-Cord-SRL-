import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { RouteStateProvider } from "@/hooks/useRouteState";
import { AuthProvider } from "@/hooks/useAuth";
import { DriverDataProvider } from "@/hooks/useDriverData";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <DriverDataProvider>
          <RouteStateProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <AppRoutes />
            </BrowserRouter>
          </RouteStateProvider>
        </DriverDataProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;