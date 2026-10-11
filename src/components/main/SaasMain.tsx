import { useAppSelector } from "../../redux/hooks";
import CampaignCard from "../cards/CampaignCard";
import CustomerCard from "../cards/CustomerCard";
import RecentCustomerCard from "../cards/RecentCustomerCard";
import SessionsByDeviceCard from "../cards/SessionsByDeviceCard";
import SessionsCard from "../cards/SessionsCard";
import TotalOrderCard4 from "../cards/TotalOrderCard4";
import TotalSaleCard2 from "../cards/TotalSaleCard2";
import SalesByProductCard from "../cards/TotalVendasPorProduto";
import UsersCard from "../cards/UsersCard";
import UsersCard2 from "../cards/UsersCard2";
import VisitorCard from "../cards/VisitorCard";
const SaasMain = () => {
  const activeLayout = useAppSelector((state) => state.layout.isLayout);
  return (
    <div className="row g-4 dashboard-workspace">
      <div className="col-12 dashboard-kpi-section">
        <div className="row g-4 dashboard-kpi-grid">
          <div
            className={`col-12 col-sm-6 col-lg-4 ${activeLayout === "style-1" ||
              activeLayout === "style-3" ||
              activeLayout === "style-4"
              ? "col-xxl col-xl-4"
              : "col-xl"
              }`}
          >
            <TotalSaleCard2 />
          </div>
          <div
            className={`col-12 col-sm-6 col-lg-4 ${activeLayout === "style-1" ||
              activeLayout === "style-3" ||
              activeLayout === "style-4"
              ? "col-xxl col-xl-4"
              : "col-xl"
              }`}
          >
            <TotalOrderCard4 />
          </div>
          <div
            className={`col-12 col-sm-6 col-lg-4 ${activeLayout === "style-1" ||
              activeLayout === "style-3" ||
              activeLayout === "style-4"
              ? "col-xxl col-xl-4"
              : "col-xl"
              }`}
          >
            <VisitorCard />
          </div>

          <div className="col-12 col-sm-6 col-xl">
            <UsersCard />
          </div>

          <div className="col-12 col-lg-6 col-xl">
            <SessionsCard />
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-7 dashboard-chart-col dashboard-chart-col--wide">
        <CustomerCard />
      </div>

      <div className="col-12 col-lg-6 col-xl-5 dashboard-chart-col">
        <SessionsByDeviceCard />
      </div>

      <div className="col-12 col-lg-6 col-xl-5 dashboard-chart-col">
        <SalesByProductCard />
      </div>

      <div
        className={`col-12 col-lg-6 dashboard-collector-col ${activeLayout === "style-1" ||
          activeLayout === "style-3" ||
          activeLayout === "style-4"
          ? "col-xxl-3 col-xl-6"
          : "col-xl-3"
          }`}
      >
        <div className="row g-4">
          <div className="col-12">
            <UsersCard2 />
          </div>

          {/* <div className="col-12">
            <GoalsCard />
          </div>

          <div className="col-12">
            <TrafficCard />
          </div> */}
        </div>
      </div>

      <div
        className={`col-12 dashboard-actions-col ${activeLayout === "style-1" ||
          activeLayout === "style-3" ||
          activeLayout === "style-4"
          ? "col-lg-12 col-xxl-4 col-xl-6"
          : "col-lg-6 col-xl-4"
          }`}
      >
        <CampaignCard />
      </div>

      {/* <div
        className={`col-12 ${activeLayout === "style-1" ||
            activeLayout === "style-3" ||
            activeLayout === "style-4"
            ? "col-lg-12 col-xxl-5 col-xl-12"
            : "col-lg-6 col-xl-5"
          }`}
      >
        <MapLocationCard2 />
      </div> */}

      <div className="col-12">
        <RecentCustomerCard />
      </div>
    </div>
  );
};
export default SaasMain;
