import { useEffect, useState } from "react";
import api from "../../services/api";

const CityCountCard = () => {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("dashboard/count/cities")
      .then((res) => setTotal(res.data)) // aqui o backend retorna só o número
      .catch((err) => console.error("Erro ao buscar total de cidades:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-kpi-skeleton">Carregando...</div>;

  return (
    <div className="card saas-cta-card dashboard-kpi-card dashboard-kpi-card--cities">
      <div className="d-flex align-items-center">
        <div className="icon-wrap">
          <i className="ti ti-building"></i>
        </div>
        <h6 className="mb-0 fw-medium text-white">Total de Cidades</h6>
      </div>

      <h3 className="title my-4 text-white">{total.toLocaleString("pt-BR")}</h3>

      <div className="subtitle text-white">Total de cidades</div>
    </div>
  );
};

export default CityCountCard;
