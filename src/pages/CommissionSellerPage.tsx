import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type SellerOption = {
  idSeller: number;
  nomeSeller: string;
};

type CommissionResponse = {
  sellerId: number;
  sellerName: string;
  startDate: string;
  endDate: string;
  commission: number;
};

const CommissionSellerPage = () => {
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [sellerId, setsellerId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saveHistory, setSaveHistory] = useState(false);

  const [response, setResponse] = useState<CommissionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadingSelles = async () => {
      try {
        const res = await api.get("/seller/name/all");
        setSellers(res.data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar vendedores.");
      }
    };

    loadingSelles();
  }, []);

  const handleSearch = async () => {
    if (!sellerId) {
      alert("Informe o ID do vendedor!");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(`/seller/${sellerId}/commission`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          saveHistory,
        },
      });

      setResponse(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar comissão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection title="Comissão do Vendedor" link="/inicio" />

      <div className="card shadow-sm mt-3">
        <div className="card-body">
          <h4 className="card-title mb-4">Consultar Comissão</h4>

          {/* Form */}
          <div className="row g-3">

            {/* SELECT do cobrador */}
            <div className="col-md-4">
              <label className="form-label">Vendedor *</label>
              <select
                className="form-control"
                value={sellerId}
                onChange={(e) =>
                  setsellerId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">Selecione...</option>
                {sellers.map((s) => (
                  <option key={s.idSeller} value={s.idSeller}>
                    {s.nomeSeller}
                  </option>
                ))}
              </select>
            </div>

            {/* Data inicial */}
            <div className="col-md-4">
              <label className="form-label">Data inicial</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Data final */}
            <div className="col-md-4">
              <label className="form-label">Data final</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Salvar histórico */}
            <div className="col-md-12 mt-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="saveHistory"
                  className="form-check-input"
                  checked={saveHistory}
                  onChange={(e) => setSaveHistory(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="saveHistory">
                  Salvar no histórico?
                </label>
              </div>
            </div>

            <div className="col-md-12 mt-3">
              <button
                onClick={handleSearch}
                className="btn btn-primary w-100 btn-lg"
              >
                Calcular Comissão
              </button>
            </div>
          </div>

          {/* Resultado */}
          {loading && (
            <div className="text-center mt-4">Carregando...</div>
          )}

          {response && (
            <div className="alert alert-success mt-4">
              <h5>Comissão</h5>

              <p>
                <strong>Vendedor:</strong> {response.sellerName}
              </p>

              <p>
                <strong>Período:</strong>{" "}
                {(() => {
                  const formatBr = (iso: string) => {
                    const [y, m, d] = iso.split("T")[0].split("-");
                    return `${d}/${m}/${y}`;
                  };
                  return `${formatBr(response.startDate)} Até ${formatBr(response.endDate)}`;
                })()}
              </p>

              <p>
                <strong>Comissão (R$):</strong>{" "}
                {response.commission.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CommissionSellerPage;
