import { useEffect, useState } from "react";
import api from "../../services/api";

type TotalCobrancasData = {
  totalCobrado: number;
  percentualCrescimento: number;
};

const TotalOrderCard4 = () => {
  const [data, setData] = useState<TotalCobrancasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("dashboard/count/total-cobrado")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Erro ao buscar total cobrado:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  const valorFormatado = data
    ? data.totalCobrado.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "R$ 0,00";

  const percentual = data?.percentualCrescimento ?? 0;
  const isPositive = percentual >= 0;

  return (
    <div className="card saas-cta-card">
      <div className="d-flex align-items-center">
        <div className="icon-wrap">
          <i className="ti ti-clipboard"></i>
        </div>
        <h6 className="mb-0 fw-medium text-white">Total Cobrado</h6>
      </div>
      <h3 className="title my-4 text-white">{valorFormatado}</h3>

      <div className="subtitle text-white">
        <i
          className={`ti ${
            isPositive
              ? "ti-arrow-up text-success"
              : "ti-arrow-down text-danger"
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

export default TotalOrderCard4;
