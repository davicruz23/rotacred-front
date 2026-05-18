import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute, RoleRoute } from "./routes/PrivateRoute"; // Importe o RoleRoute também
import HomePageLayout from "./components/layout/HomePageLayout";
import AudiencePage from "./pages/AudiencePage";
import InnerLayoutStyle2 from "./components/layout/InnerLayoutStyle2";
import InnerLayoutStyle1 from "./components/layout/InnerLayoutStyle1";
import InnerLayoutStyle3 from "./components/layout/InnerLayoutStyle3";
import InnerLayoutStyle4 from "./components/layout/InnerLayoutStyle4";
import InnerLayoutStyle5 from "./components/layout/InnerLayoutStyle5";
import InnerLayoutStyle6 from "./components/layout/InnerLayoutStyle6";
import { useAppSelector } from "./redux/hooks";
import AddNewProductPage from "./pages/AddNewProductPage";
import AllProductPage from "./pages/AllProductPage";
import LoginPage from "./pages/LoginPage";
import LoginStatusPage from "./pages/LoginStatusPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import ErrorLayout from "./components/layout/ErrorLayout";
import Error400Page from "./pages/Error400Page";
import Error403Page from "./pages/Error403Page";
import Error404Page from "./pages/Error404Page";
import Error408Page from "./pages/Error408Page";
import Error500Page from "./pages/Error500Page";
import Error503Page from "./pages/Error503Page";
import Error504Page from "./pages/Error504Page";
import SaasPage from "./pages/SaasPage";
import UpdateProductPage from "./pages/UpdateProductPage";
import CommissionCollectorrPage from "./pages/CommissionCollectorrPage";
import CommissionSellerPage from "./pages/CommissionSellerPage";
import ReportClientsPage from "./pages/ReportClientsPage";
import ReportCharginsPage from "./pages/ReportCharginsPage";
import AddCitiesByCollectorPage from "./pages/AddCitiesByCollectorPage";
import ListCollectorSalesPage from "./pages/ListCollectorSalesPage";
import GuestRoute from "./routes/GuestRoute"; // Importe o GuestRoute
import ViewProfilePage from "./pages/ViewProfilePage";
import CreateUsersPage from "./pages/CreateUsersPage";
import NewChargingPage from "./pages/NewChargingPage";
import ReportProductsPage from "./pages/ReportProducts";
import ListReturnSalesStatus from "./pages/ListReturnSalesStatus";
import CreateSaleReturn from "./pages/CreateSaleReturn";
import UpdateSaleReturn from "./pages/UpdateSaleReturn";
import CommissionHistory from "./pages/CommissionHistoryPage";
import DirectSalePage from "./pages/DirectSalePage";
import SalesListPage from "./pages/SalesList";

function App() {
  const activeLayout = useAppSelector((state) => state.layout.isLayout);

  return (
    <Router>
      <Routes>

        {/* Redireciona direto para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ROTAS PÚBLICAS (apenas para usuários NÃO logados) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-status" element={<LoginStatusPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
        </Route>

        {/* ROTAS PRIVADAS (requer token) */}
        <Route element={<PrivateRoute />}>
          <Route element={<HomePageLayout />}>
            <Route
              element={
                activeLayout === "style-1" ? <InnerLayoutStyle1 /> :
                  activeLayout === "style-2" ? <InnerLayoutStyle2 /> :
                    activeLayout === "style-3" ? <InnerLayoutStyle3 /> :
                      activeLayout === "style-4" ? <InnerLayoutStyle4 /> :
                        activeLayout === "style-5" ? <InnerLayoutStyle5 /> :
                          activeLayout === "style-6" ? <InnerLayoutStyle6 /> :
                            <></>
              }
            >

              {/* ROTAS LIVRES PARA QUALQUER USUÁRIO AUTENTICADO */}
              <Route path="/inicio" element={<SaasPage />} />
              <Route path="/audience" element={<AudiencePage />} />

              {/* ROTAS SOMENTE PARA ROLE_SUPERADMIN */}
              <Route element={<RoleRoute roles={["ROLE_SUPERADMIN"]} />}>
                <Route path="/view-users" element={<ViewProfilePage />} />
                <Route path="/create-user" element={<CreateUsersPage />} />
                <Route path="/add-product" element={<AddNewProductPage />} />
                <Route path="/update-product/:id" element={<UpdateProductPage />} />
                <Route path="/commision-collector" element={<CommissionCollectorrPage />} />
                <Route path="/commission-seller" element={<CommissionSellerPage />} />
                <Route path="/new-charging" element={<NewChargingPage />} />
                <Route path="/commission-history" element={<CommissionHistory/>} />
              </Route>

              {/* ROTAS PARA SUPERADMIN + FUNCIONÁRIO */}
              <Route element={<RoleRoute roles={["ROLE_SUPERADMIN", "ROLE_FUNCIONARIO"]} />}>
                <Route path="/all-product" element={<AllProductPage />} />
                <Route path="/report-clients" element={<ReportClientsPage />} />
                <Route path="/report-chargings" element={<ReportCharginsPage />} />
                <Route path="/report-products" element={<ReportProductsPage />} />
                <Route path="/collector-cities" element={<AddCitiesByCollectorPage />} />
                <Route path="/collector-sales" element={<ListCollectorSalesPage />} />
                <Route path="/list-sales-return" element={<ListReturnSalesStatus />} />
                <Route path="/create-sale-return" element={<CreateSaleReturn/>} />
                <Route path="/update-sale-status" element={<UpdateSaleReturn/>} />
                <Route path="/create-sale" element={<DirectSalePage/>} />
                <Route path="/sales-list" element={<SalesListPage/>} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* ERROS (acessíveis a todos) */}
        <Route element={<ErrorLayout />}>
          <Route path="/error-400" element={<Error400Page />} />
          <Route path="/error-403" element={<Error403Page />} />
          <Route path="/error-404" element={<Error404Page />} />
          <Route path="/error-408" element={<Error408Page />} />
          <Route path="/error-500" element={<Error500Page />} />
          <Route path="/error-503" element={<Error503Page />} />
          <Route path="/error-504" element={<Error504Page />} />
        </Route>

        <Route path="*" element={<Error404Page />} />
      </Routes>
    </Router>
  );
}

export default App;