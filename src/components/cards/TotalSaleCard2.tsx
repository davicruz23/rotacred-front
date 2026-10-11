import { useEffect, useState } from "react";
import api from "../../services/api";

type TotalSalesData = {
  totalSale: number;
  percentual: number;
};

const TotalSaleCard2 = () => {
  const [data, setData] = useState<TotalSalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("dashboard/count/sales")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Erro ao buscar vendas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-kpi-skeleton">Carregando...</div>;

  const valorFormatado = data
    ? data.totalSale.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    : "R$ 0,00"

  const percentual = data?.percentual ?? 0;
  const isPositive = percentual >= 0;

  return (
    <div className="card saas-cta-card dashboard-kpi-card dashboard-kpi-card--sales">
      <div className="d-flex align-items-center">
        <div className="icon-wrap">
          <i className="ti ti-basket"></i>
        </div>
        <h6 className="mb-0 fw-medium text-white">Total Vendido</h6>
      </div>

      <h3 className="title my-4 text-white">{valorFormatado}</h3>

      <div className="subtitle text-white">
        <i
          className={`ti ${
            isPositive ? "ti-arrow-up text-success" : "ti-arrow-down text-danger"
          }`}
        ></i>
        <span
          className={`fw-semibold ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {Math.abs(percentual).toFixed(1)}%
        </span>{" "}
        {isPositive ? "de aumento" : "de queda"}
      </div>
    </div>
  );
};

export default TotalSaleCard2;
