import { useEffect, useState } from "react";
import api from "../../services/api";

type TotalClientsData = {
  totalClients: number;
};

const UsersCard = () => {
  const [data, setData] = useState<TotalClientsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("dashboard/count/total-clients")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Erro ao buscar total de clientes:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card saas-cta-card dashboard-kpi-card dashboard-kpi-card--clients d-flex align-items-center justify-content-center">
        <p className="text-white mb-0">Carregando...</p>
      </div>
    );
  }

  const total = data?.totalClients ?? 0;

  return (
    <div className="card saas-cta-card dashboard-kpi-card dashboard-kpi-card--clients">
      <div className="d-flex align-items-center">
        <div className="icon-wrap">
          <i className="ti ti-users"></i>
        </div>
        <h6 className="mb-0 fw-medium text-white">Clientes</h6>
      </div>
      <h3 className="title my-4 text-white">{total}</h3>
      <div className="subtitle text-white">Total de clientes</div>
    </div>
  );
};

export default UsersCard;
