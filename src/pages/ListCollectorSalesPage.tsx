import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";
import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
} from "react-icons/fa";

type SaleReturnsType = {
  saleReturnId: number;
  productId: number;
  productName: string;
  quantityReturned: number;
  valueAbatido: number;
  returnDate: string;
  status: string;
};

type ProductType = {
  id: number;
  nameProduct: string;
  quantity: number;
  price: number;
};

type InstallmentType = {
  id: number;
  dueDate: string;
  amount: number;
  paid: boolean;
  status: string | null;
  isValid: boolean;
  attemptLongitude: number;
  attemptLatitude: number;
};

type SaleType = {
  id: number;
  fullPaid: boolean;
  numberSale: string;
  saleDate: string;
  paymentType: string;
  clientName: string;
  total: number;
  saleStatus: string;
  longitude: number;
  latitude: number;
  products: ProductType[];
  installments: InstallmentType[];
  saleReturns: SaleReturnsType[];
  nparcel: number;
};

type CollectorType = {
  id: number;
  collectorName: string;
  sales: SaleType[];
};

type CollectorSimpleType = {
  id: number;
  collectorName: string;
};

enum SaleStatusFilter {
  TODOS = 0,
  ATIVOS = 1,
  DESISTENCIA = 4,
  REAVIDO = 5,
}

type PaymentFilterType = "TODOS" | "ATIVOS" | "INATIVOS";

const ListCollectorSalesPage = () => {
  const [collectorData, setCollectorData] = useState<CollectorType[]>([]);
  const [collectors, setCollectors] = useState<CollectorSimpleType[]>([]);
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [collectorFilter, setCollectorFilter] = useState<number | null>(null);
  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilterType>("TODOS");

  const fetchCollectors = async () => {
    try {
      const response = await api.get("/collector/name/all");
      setCollectors(response.data);
    } catch (error) {
      console.error("Erro ao buscar cobradores:", error);
    }
  };

  const fetchCollectorsWithSales = async (
    status?: number,
    collectorId?: number | null,
    paymentFilter?: PaymentFilterType,
  ) => {
    try {
      let url = "/collector/all/sales";
      const params: string[] = [];

      if (status && status !== 0) {
        params.push(`status=${status}`);
      }

      if (collectorId) {
        params.push(`collectorId=${collectorId}`);
      }

      const fullPaid = mapPaymentFilterToParam(paymentFilter ?? "TODOS");

      if (fullPaid !== undefined) {
        params.push(`fullPaid=${fullPaid}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await api.get(url);
      setCollectorData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      alert("Erro ao carregar cobradores.");
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  useEffect(() => {
    fetchCollectorsWithSales(statusFilter, collectorFilter, paymentFilter);
  }, [statusFilter, collectorFilter, paymentFilter]);

  const mapPaymentFilterToParam = (
    filter: PaymentFilterType,
  ): boolean | undefined => {
    switch (filter) {
      case "ATIVOS":
        return false; // tem parcela em aberto
      case "INATIVOS":
        return true; // tudo pago
      default:
        return undefined; // não envia → TODOS
    }
  };

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection title="Lista de venda para cobrança" link="/inicio" />

      <div className="card p-4 shadow-sm">
        <h3 className="mb-4">Lista de cobranças</h3>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Vendas por status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(Number(e.target.value))}
            >
              <option value={SaleStatusFilter.TODOS}>TODOS</option>
              <option value={SaleStatusFilter.ATIVOS}>ATIVOS</option>
              <option value={SaleStatusFilter.REAVIDO}>RECUPERADOS</option>
              <option value={SaleStatusFilter.DESISTENCIA}>DESISTÊNCIAS</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Vendas por cobrador
            </label>
            <select
              className="form-select"
              value={collectorFilter ?? ""}
              onChange={(e) =>
                setCollectorFilter(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            >
              <option value="">TODOS</option>
              {collectors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.collectorName.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Vendas Ativas/Finalizadas
            </label>
            <select
              className="form-select"
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as PaymentFilterType)
              }
            >
              <option value="TODOS">TODOS</option>
              <option value="ATIVOS">ATIVOS</option>
              <option value="INATIVOS">FINALIZADOS</option>
            </select>
          </div>
        </div>

        <div className="accordion" id="accordionCollectors">
          {collectorData.map((collector) => (
            <div className="accordion-item" key={collector.id}>
              <h2
                className="accordion-header"
                id={`heading-coll-${collector.id}`}
              >
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#coll-${collector.id}`}
                  aria-expanded="false"
                  aria-controls={`coll-${collector.id}`}
                >
                  {collector.collectorName} ({collector.sales.length} Cobranças)
                </button>
              </h2>
              <div
                id={`coll-${collector.id}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading-coll-${collector.id}`}
                data-bs-parent="#accordionCollectors"
              >
                <div className="accordion-body">
                  {collector.sales.length === 0 && (
                    <p className="text-muted">Nenhuma venda encontrada.</p>
                  )}

                  <div className="accordion" id={`sales-${collector.id}`}>
                    {collector.sales.map((sale) => {
                      const isReadOnlySale =
                        sale.saleStatus === "DEFEITO_PRODUTO" ||
                        sale.saleStatus === "DESISTENCIA";

                      return (
                        <div className="accordion-item" key={sale.id}>
                          <h2
                            className="accordion-header"
                            id={`heading-sale-${sale.id}`}
                          >
                            <button
                              className={`accordion-button collapsed ${
                                isReadOnlySale
                                  ? "bg-secondary text-white"
                                  : "bg-light"
                              }`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#sale-${sale.id}`}
                              aria-expanded="false"
                              aria-controls={`sale-${sale.id}`}
                            >
                              <div className="d-flex w-100 align-items-center">
                                <span>
                                  Venda #{sale.id} — {sale.clientName}
                                </span>

                                <span
                                  className={`badge ms-auto me-3 ${
                                    sale.fullPaid
                                      ? "bg-secondary"
                                      : "bg-success"
                                  }`}
                                >
                                  {sale.fullPaid ? "FINALIZADO" : "ATIVO"}
                                </span>
                              </div>
                            </button>
                          </h2>

                          <div
                            id={`sale-${sale.id}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading-sale-${sale.id}`}
                            data-bs-parent={`#sales-${collector.id}`}
                          >
                            <div className="accordion-body">
                              <p>
                                <strong>Data:</strong> {sale.saleDate}
                              </p>
                              <p>
                                <strong>Método:</strong> {sale.paymentType}
                              </p>
                              <p>
                                <strong>Parcelas:</strong> {sale.nparcel}x
                              </p>
                              <p>
                                <strong>Total:</strong> R$ {sale.total}
                              </p>

                              {/* ✅ Botão estilizado do Google Maps */}
                              {sale.latitude && sale.longitude && (
                                <div className="mb-3">
                                  <button
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                    disabled={isReadOnlySale}
                                    onClick={() => {
                                      if (isReadOnlySale) return;

                                      window.open(
                                        `https://www.google.com/maps?q=${sale.latitude},${sale.longitude}`,
                                        "_blank",
                                        "noopener,noreferrer",
                                      );
                                    }}
                                    title={
                                      isReadOnlySale
                                        ? "Venda bloqueada (DEFEITO_PRODUTO/DESISTENCIA)"
                                        : "Abrir localização no Google Maps"
                                    }
                                  >
                                    <i className="bi bi-geo-alt-fill"></i> Ver
                                    no Mapa
                                  </button>
                                </div>
                              )}

                              <hr />

                              <h6>🛒 Produtos:</h6>
                              <ul className="list-group mb-3">
                                {sale.products.map((p) => (
                                  <li key={p.id} className="list-group-item">
                                    <strong>{p.quantity}x</strong>{" "}
                                    {p.nameProduct} — R$ {p.price}
                                  </li>
                                ))}
                              </ul>

                              {/* 🔁 BLOCO DE DEVOLUÇÕES */}
                              {sale.saleReturns &&
                                sale.saleReturns.length > 0 && (
                                  <>
                                    <h6 className="text-danger">
                                      🔁 Observações:
                                    </h6>
                                    <ul className="list-group mb-3">
                                      {sale.saleReturns.map((s) => (
                                        <li
                                          key={s.saleReturnId}
                                          className="list-group-item border-danger"
                                        >
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                              <strong>
                                                Produto: {s.productName}
                                              </strong>
                                              <div>
                                                Valor abatido das parcelas: R${" "}
                                                {s.valueAbatido}
                                              </div>
                                              <small className="text-muted">
                                                Data: {s.returnDate}
                                              </small>
                                            </div>

                                            <span
                                              className={`badge ${
                                                s.status === "DANIFICADO"
                                                  ? "bg-danger"
                                                  : s.status === "DESISTENCIA"
                                                    ? "bg-warning text-dark"
                                                    : s.status ===
                                                        "DEVOLVIDO_CLIENTE"
                                                      ? "bg-info"
                                                      : "bg-secondary"
                                              }`}
                                            >
                                              {s.status}
                                            </span>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              <h6 className="mt-3">💰 Parcelas:</h6>
                              <table className="table table-sm table-bordered">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Pago</th>
                                    <th>Localização da cobrança</th>
                                    <th>Ver localização</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sale.installments.map((i, index) => (
                                    <tr key={i.id}>
                                      <td>{index + 1}</td>
                                      <td>{i.dueDate}</td>
                                      <td>R$ {i.amount}</td>
                                      <td style={{ textAlign: "center" }}>
                                        {i.paid ? (
                                          <FaCheckCircle
                                            color="#28a745"
                                            size={18}
                                            title="Parcela Paga"
                                          />
                                        ) : (
                                          <FaTimesCircle
                                            color="#dc3545"
                                            size={18}
                                            title="Parcela Pendente"
                                          />
                                        )}
                                      </td>

                                      <td style={{ textAlign: "center" }}>
                                        {i.isValid === true && (
                                          <FaCheckCircle
                                            color="#28a745"
                                            size={18}
                                            title="Localização validada"
                                          />
                                        )}

                                        {i.isValid === false && (
                                          <FaTimesCircle
                                            color="#dc3545"
                                            size={18}
                                            title="Localização inválida"
                                          />
                                        )}

                                        {i.isValid == null && (
                                          <FaMinusCircle
                                            color="#6c757d"
                                            size={18}
                                            title="Localização não verificada"
                                          />
                                        )}
                                      </td>

                                      <td
                                        style={{
                                          cursor:
                                            !isReadOnlySale &&
                                            i.attemptLatitude &&
                                            i.attemptLongitude
                                              ? "pointer"
                                              : "not-allowed",
                                          textAlign: "center",
                                          opacity: isReadOnlySale ? 0.6 : 1,
                                        }}
                                        title={
                                          isReadOnlySale
                                            ? "Venda bloqueada (DEFEITO_PRODUTO/DESISTENCIA)"
                                            : i.attemptLatitude &&
                                                i.attemptLongitude
                                              ? "Abrir localização no Google Maps"
                                              : "Localização indisponível"
                                        }
                                        onClick={() => {
                                          if (isReadOnlySale) return;

                                          if (
                                            i.attemptLatitude &&
                                            i.attemptLongitude
                                          ) {
                                            window.open(
                                              `https://www.google.com/maps?q=${i.attemptLatitude},${i.attemptLongitude}`,
                                              "_blank",
                                              "noopener,noreferrer",
                                            );
                                          }
                                        }}
                                      >
                                        <FaMapMarkerAlt
                                          size={18}
                                          color={
                                            isReadOnlySale
                                              ? "#ccc"
                                              : i.attemptLatitude &&
                                                  i.attemptLongitude
                                                ? "#007bff"
                                                : "#ccc"
                                          }
                                          style={{
                                            transition:
                                              "transform 0.2s, color 0.2s",
                                          }}
                                          onMouseEnter={(e) => {
                                            if (isReadOnlySale) return;

                                            if (
                                              i.attemptLatitude &&
                                              i.attemptLongitude
                                            ) {
                                              e.currentTarget.style.transform =
                                                "scale(1.2)";
                                              e.currentTarget.style.color =
                                                "#0056b3";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (isReadOnlySale) return;

                                            if (
                                              i.attemptLatitude &&
                                              i.attemptLongitude
                                            ) {
                                              e.currentTarget.style.transform =
                                                "scale(1.0)";
                                              e.currentTarget.style.color =
                                                "#007bff";
                                            }
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListCollectorSalesPage;
