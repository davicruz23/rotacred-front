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

/* ── helpers de estilo ─────────────────────────────────────── */

const getReturnBadgeStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    DANIFICADO: { background: "#FCEBEB", color: "#A32D2D" },
    DESISTENCIA: { background: "#FAEEDA", color: "#854F0B" },
    DEVOLVIDO_CLIENTE: { background: "#E6F1FB", color: "#185FA5" },
  };
  return map[status] ?? { background: "#F1EFE8", color: "#5F5E5A" };
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const avatarColors = [
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#EAF3DE", color: "#27500A" },
];

/* ── estilos base como objetos ─────────────────────────────── */

const S = {
  // collector card
  collCard: {
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    background: "#fff",
  } as React.CSSProperties,

  collHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    cursor: "pointer",
    background: "#fff",
    border: "none",
    width: "100%",
    textAlign: "left" as const,
    gap: 12,
  } as React.CSSProperties,

  avatar: (idx: number): React.CSSProperties => ({
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: avatarColors[idx % avatarColors.length].bg,
    color: avatarColors[idx % avatarColors.length].color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  }),

  collBody: {
    borderTop: "0.5px solid #e0e0e0",
    padding: "14px 16px",
  } as React.CSSProperties,

  // sale card
  saleCard: {
    border: "0.5px solid #e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  } as React.CSSProperties,

  saleHeader: (isReadOnly: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    cursor: "pointer",
    background: isReadOnly ? "#F1EFE8" : "#f8f9fa",
    border: "none",
    width: "100%",
    textAlign: "left" as const,
  }),

  saleBody: {
    padding: "16px",
    borderTop: "0.5px solid #e0e0e0",
    background: "#fff",
  } as React.CSSProperties,

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 14,
  } as React.CSSProperties,

  infoItem: {
    background: "#f8f9fa",
    borderRadius: 8,
    padding: "10px 12px",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    margin: "14px 0 8px",
  } as React.CSSProperties,

  badge: (fullPaid: boolean): React.CSSProperties => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.3px",
    background: fullPaid ? "#F1EFE8" : "#EAF3DE",
    color: fullPaid ? "#5F5E5A" : "#3B6D11",
  }),

  productItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 8,
    border: "0.5px solid #e0e0e0",
    marginBottom: 6,
    fontSize: 13,
    background: "#fff",
  } as React.CSSProperties,

  returnItem: {
    border: "0.5px solid #e0e0e0",
    borderLeft: "3px solid #E24B4A",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } as React.CSSProperties,

  returnBadge: (status: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    ...getReturnBadgeStyle(status),
  }),

  mapBtn: (disabled: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 8,
    border: disabled ? "0.5px solid #e0e0e0" : "0.5px solid #B5D4F4",
    fontSize: 12,
    fontWeight: 500,
    color: disabled ? "#aaa" : "#185FA5",
    background: disabled ? "#f8f9fa" : "#E6F1FB",
    cursor: disabled ? "not-allowed" : "pointer",
    marginBottom: 14,
  }),

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  } as React.CSSProperties,

  th: {
    textAlign: "left" as const,
    padding: "8px 10px",
    borderBottom: "0.5px solid #e0e0e0",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    background: "#f8f9fa",
  } as React.CSSProperties,

  td: {
    padding: "8px 10px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#222",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,

  tdCenter: {
    padding: "8px 10px",
    borderBottom: "0.5px solid #e0e0e0",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

/* ── componente principal ──────────────────────────────────── */

const ListCollectorSalesPage = () => {
  const [collectorData, setCollectorData] = useState<CollectorType[]>([]);
  const [collectors, setCollectors] = useState<CollectorSimpleType[]>([]);
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [collectorFilter, setCollectorFilter] = useState<number | null>(null);
  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilterType>("TODOS");
  const [openCollectors, setOpenCollectors] = useState<Set<number>>(new Set());
  const [openSales, setOpenSales] = useState<Set<number>>(new Set());

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

      if (status && status !== 0) params.push(`status=${status}`);
      if (collectorId) params.push(`collectorId=${collectorId}`);

      const fullPaid = mapPaymentFilterToParam(paymentFilter ?? "TODOS");
      if (fullPaid !== undefined) params.push(`fullPaid=${fullPaid}`);

      if (params.length > 0) url += `?${params.join("&")}`;

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
        return false;
      case "INATIVOS":
        return true;
      default:
        return undefined;
    }
  };

  const toggleCollector = (id: number) => {
    setOpenCollectors((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSale = (id: number) => {
    setOpenSales((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openMaps = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection title="Lista de venda para cobrança" link="/inicio" />

      <div className="card p-4 shadow-sm">
        <h3 className="mb-4">Lista de cobranças</h3>

        {/* ── Filtros ── */}
        <div className="row mb-4">
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

        {/* ── Lista de cobradores ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {collectorData.map((collector, collIdx) => {
            const isCollOpen = openCollectors.has(collector.id);

            return (
              <div key={collector.id} style={S.collCard}>
                {/* Cabeçalho do cobrador */}
                <button
                  style={{
                    ...S.collHeader,
                    background: isCollOpen ? "#f8f9fa" : "#fff",
                  }}
                  onClick={() => toggleCollector(collector.id)}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={S.avatar(collIdx)}>
                      {getInitials(collector.collectorName)}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {collector.collectorName}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#888", marginTop: 1 }}
                      >
                        {collector.sales.length} cobrança
                        {collector.sales.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      transition: "transform 0.2s",
                      transform: isCollOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* Corpo do cobrador */}
                {isCollOpen && (
                  <div style={S.collBody}>
                    {collector.sales.length === 0 && (
                      <p style={{ color: "#aaa", fontSize: 13 }}>
                        Nenhuma venda encontrada.
                      </p>
                    )}

                    {collector.sales.map((sale) => {
                      const isReadOnlySale =
                        sale.saleStatus === "DEFEITO_PRODUTO" ||
                        sale.saleStatus === "DESISTENCIA";
                      const isSaleOpen = openSales.has(sale.id);

                      return (
                        <div key={sale.id} style={S.saleCard}>
                          {/* Cabeçalho da venda */}
                          <button
                            style={S.saleHeader(isReadOnlySale)}
                            onClick={() => toggleSale(sale.id)}
                          >
                            <div style={{ textAlign: "left" }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                }}
                              >
                                Venda #{sale.id} — {sale.clientName}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#888",
                                  marginTop: 2,
                                }}
                              >
                                {sale.saleDate} · {sale.nparcel}x · R${" "}
                                {sale.total}
                              </div>
                            </div>
                            <span style={S.badge(sale.fullPaid)}>
                              {sale.fullPaid ? "Finalizado" : "Ativo"}
                            </span>
                          </button>

                          {/* Corpo da venda */}
                          {isSaleOpen && (
                            <div style={S.saleBody}>
                              {/* Info grid */}
                              <div style={S.infoGrid}>
                                <div style={S.infoItem}>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#888",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Data
                                  </div>
                                  <div
                                    style={{ fontSize: 14, fontWeight: 600 }}
                                  >
                                    {sale.saleDate}
                                  </div>
                                </div>
                                <div style={S.infoItem}>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#888",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Método
                                  </div>
                                  <div
                                    style={{ fontSize: 14, fontWeight: 600 }}
                                  >
                                    {sale.paymentType}
                                  </div>
                                </div>
                                <div style={S.infoItem}>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#888",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Parcelas
                                  </div>
                                  <div
                                    style={{ fontSize: 14, fontWeight: 600 }}
                                  >
                                    {sale.nparcel}x
                                  </div>
                                </div>
                                <div style={S.infoItem}>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#888",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Total
                                  </div>
                                  <div
                                    style={{ fontSize: 14, fontWeight: 600 }}
                                  >
                                    R$ {sale.total}
                                  </div>
                                </div>
                              </div>

                              {/* Botão mapa da venda */}
                              {sale.latitude && sale.longitude && (
                                <button
                                  style={S.mapBtn(isReadOnlySale)}
                                  disabled={isReadOnlySale}
                                  title={
                                    isReadOnlySale
                                      ? "Venda bloqueada (DEFEITO_PRODUTO/DESISTENCIA)"
                                      : "Abrir localização no Google Maps"
                                  }
                                  onClick={() => {
                                    if (!isReadOnlySale)
                                      openMaps(sale.latitude, sale.longitude);
                                  }}
                                >
                                  <FaMapMarkerAlt size={13} /> Ver no mapa
                                </button>
                              )}

                              {/* Produtos */}
                              <div style={S.sectionTitle}>Produtos</div>
                              {sale.products.map((p) => (
                                <div key={p.id} style={S.productItem}>
                                  <span>
                                    <span
                                      style={{ color: "#888", fontSize: 12 }}
                                    >
                                      {p.quantity}x
                                    </span>{" "}
                                    {p.nameProduct}
                                  </span>
                                  <span style={{ fontWeight: 600 }}>
                                    R$ {p.price}
                                  </span>
                                </div>
                              ))}

                              {/* Devoluções */}
                              {sale.saleReturns &&
                                sale.saleReturns.length > 0 && (
                                  <>
                                    <div
                                      style={{
                                        ...S.sectionTitle,
                                        color: "#A32D2D",
                                      }}
                                    >
                                      Observações / Devoluções
                                    </div>
                                    {sale.saleReturns.map((s) => (
                                      <div
                                        key={s.saleReturnId}
                                        style={S.returnItem}
                                      >
                                        <div>
                                          <div
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 600,
                                            }}
                                          >
                                            {s.productName}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 12,
                                              color: "#888",
                                              marginTop: 2,
                                            }}
                                          >
                                            Abatido das parcelas: R$ {s.valueAbatido}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 11,
                                              color: "#aaa",
                                              marginTop: 2,
                                            }}
                                          >
                                            {s.returnDate}
                                          </div>
                                        </div>
                                        <span style={S.returnBadge(s.status)}>
                                          {s.status}
                                        </span>
                                      </div>
                                    ))}
                                  </>
                                )}

                              {/* Parcelas */}
                              <div style={S.sectionTitle}>Parcelas</div>
                              <div style={{ overflowX: "auto" }}>
                                <table style={S.table}>
                                  <thead>
                                    <tr>
                                      <th style={S.th}>#</th>
                                      <th style={S.th}>Vencimento</th>
                                      <th style={S.th}>Valor</th>
                                      <th
                                        style={{ ...S.th, textAlign: "center" }}
                                      >
                                        Pago
                                      </th>
                                      <th
                                        style={{ ...S.th, textAlign: "center" }}
                                      >
                                        Localização
                                      </th>
                                      <th
                                        style={{ ...S.th, textAlign: "center" }}
                                      >
                                        Ver no mapa
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sale.installments.map((inst, index) => (
                                      <tr key={inst.id}>
                                        <td style={S.td}>{index + 1}</td>
                                        <td style={S.td}>{inst.dueDate}</td>
                                        <td style={S.td}>R$ {inst.amount}</td>

                                        <td style={S.tdCenter}>
                                          {inst.paid ? (
                                            <FaCheckCircle
                                              color="#3B6D11"
                                              size={16}
                                              title="Parcela Paga"
                                            />
                                          ) : (
                                            <FaTimesCircle
                                              color="#A32D2D"
                                              size={16}
                                              title="Parcela Pendente"
                                            />
                                          )}
                                        </td>

                                        <td style={S.tdCenter}>
                                          {inst.isValid === true && (
                                            <FaCheckCircle
                                              color="#3B6D11"
                                              size={16}
                                              title="Localização validada"
                                            />
                                          )}
                                          {inst.isValid === false && (
                                            <FaTimesCircle
                                              color="#A32D2D"
                                              size={16}
                                              title="Localização inválida"
                                            />
                                          )}
                                          {inst.isValid === null && (
                                            <FaMinusCircle
                                              color="#aaa"
                                              size={16}
                                              title="Localização não verificada"
                                            />
                                          )}
                                        </td>

                                        <td
                                          style={{
                                            ...S.tdCenter,
                                            cursor:
                                              !isReadOnlySale &&
                                              inst.attemptLatitude &&
                                              inst.attemptLongitude
                                                ? "pointer"
                                                : "not-allowed",
                                            opacity: isReadOnlySale ? 0.4 : 1,
                                          }}
                                          title={
                                            isReadOnlySale
                                              ? "Venda bloqueada (DEFEITO_PRODUTO/DESISTENCIA)"
                                              : inst.attemptLatitude &&
                                                  inst.attemptLongitude
                                                ? "Abrir localização no Google Maps"
                                                : "Localização indisponível"
                                          }
                                          onClick={() => {
                                            if (
                                              !isReadOnlySale &&
                                              inst.attemptLatitude &&
                                              inst.attemptLongitude
                                            ) {
                                              openMaps(
                                                inst.attemptLatitude,
                                                inst.attemptLongitude,
                                              );
                                            }
                                          }}
                                        >
                                          <FaMapMarkerAlt
                                            size={16}
                                            color={
                                              isReadOnlySale
                                                ? "#ccc"
                                                : inst.attemptLatitude &&
                                                    inst.attemptLongitude
                                                  ? "#185FA5"
                                                  : "#ccc"
                                            }
                                            style={{
                                              transition: "transform 0.2s",
                                            }}
                                            onMouseEnter={(e) => {
                                              if (
                                                !isReadOnlySale &&
                                                inst.attemptLatitude &&
                                                inst.attemptLongitude
                                              ) {
                                                e.currentTarget.style.transform =
                                                  "scale(1.2)";
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.transform =
                                                "scale(1)";
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ListCollectorSalesPage;
