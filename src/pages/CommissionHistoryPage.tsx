import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type CollectorOption = {
  id: number;
  collectorName: string;
};

type SellerOption = {
  idSeller: number;
  nomeSeller: string;
};

type CommissionHistoryItem = {
  ownerName: string;
  ownerType: string;
  interval: string;
  generatedAt: string;
  totalCommission: number;
};

type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

enum CommissionOwnerType {
  COLLECTOR = "COLLECTOR",
  SELLER = "SELLER",
}

const CommissionHistory = () => {
  const [ownerType, setOwnerType] = useState<CommissionOwnerType | null>(null);

  const [ownerId, setOwnerId] = useState<number | null>(null);

  const [collectors, setCollectors] = useState<CollectorOption[]>([]);
  const [sellers, setSellers] = useState<SellerOption[]>([]);

  const [history, setHistory] =
    useState<PageResponse<CommissionHistoryItem> | null>(null);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const size = 10;

  const [] = useState<{
    ownerType?: string;
    ownerId?: string;
  }>({});

  useEffect(() => {
    const loadCollectors = async () => {
      const res = await api.get("/collector/name/all");
      setCollectors(res.data);
      console.log(res.data);
    };

    const loadSellers = async () => {
      const res = await api.get("/seller/name/all");
      setSellers(res.data);
      console.log(res.data);
    };

    loadCollectors();
    loadSellers();
  }, []);

  useEffect(() => {
    if (!ownerType) return;

    const fetchHistory = async () => {
      setLoading(true);

      try {
        const isCollector = ownerType === CommissionOwnerType.COLLECTOR;
        const basePath = isCollector ? "/collector" : "/seller";

        const params: any = {
          page,
          size,
        };

        if (ownerId) {
          if (isCollector) {
            params.collectorId = ownerId;
          } else {
            params.sellerId = ownerId;
          }
        }

        const res = await api.get(`${basePath}/commission-history`, { params });

        setHistory(res.data);
      } catch (err) {
        console.error(err);
        alert("Erro ao buscar histórico.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [ownerType, ownerId, page]);

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection title="Histórico de Comissão" link="/inicio" />

      <div className="row mt-3">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4">Consulta de Comissões Anteriores</h4>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Funcionário *</label>
                  <select
                    className="form-control"
                    value={ownerType ?? ""}
                    onChange={(e) => {
                      const value = e.target.value as CommissionOwnerType;
                      setOwnerType(value);
                      setOwnerId(null);
                      setHistory(null);
                      setPage(0);
                    }}
                  >
                    <option value="">Selecione...</option>
                    <option value={CommissionOwnerType.COLLECTOR}>
                      Cobrador
                    </option>
                    <option value={CommissionOwnerType.SELLER}>Vendedor</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    {ownerType === CommissionOwnerType.SELLER
                      ? "Vendedor *"
                      : "Cobrador *"}
                  </label>

                  <select
                    className="form-control"
                    value={ownerId ?? ""}
                    disabled={!ownerType}
                    onChange={(e) => {
                      setOwnerId(
                        e.target.value ? Number(e.target.value) : null,
                      );
                      setPage(0);
                    }}
                  >
                    <option value="">Selecione...</option>

                    {ownerType === CommissionOwnerType.COLLECTOR &&
                      collectors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.collectorName}
                        </option>
                      ))}

                    {ownerType === CommissionOwnerType.SELLER &&
                      sellers.map((s) => (
                        <option key={s.idSeller} value={s.idSeller}>
                          {s.nomeSeller}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              {loading && <div className="text-center mt-4">Carregando...</div>}
            </div>
            <div className="mt-4 px-4 pb-4">
              {history && history.content.length === 0 && (
                <div className="alert alert-info">
                  Nenhum histórico encontrado.
                </div>
              )}

              {history && history.content.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Período</th>
                        <th>Gerado em</th>
                        <th>Comissão (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.content.map((item, index) => (
                        <tr key={index}>
                          <td>{item.ownerName}</td>
                          <td>{item.interval}</td>
                          <td>
                            {new Date(item.generatedAt).toLocaleString("pt-BR")}
                          </td>
                          <td>
                            {item.totalCommission.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {history && (
                    <div className="d-flex justify-content-end mt-3">
                      <nav>
                        <ul className="pagination pagination-sm mb-0 shadow-sm">
                          <li
                            className={`page-item ${page === 0 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setPage(page - 1)}
                            >
                              «
                            </button>
                          </li>
                          {[...Array(history.totalPages)].map((_, index) => (
                            <li
                              key={index}
                              className={`page-item ${page === index ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setPage(index)}
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${
                              page + 1 >= history.totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setPage(page + 1)}
                            >
                              »
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionHistory;
