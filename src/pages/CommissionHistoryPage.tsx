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

type CommissionReason =
  | "ADIANTAMENTO"
  | "FECHAMENTO_MENSAL"
  | "CONSULTA"
  | "OUTRO";

type CommissionHistoryItem = {
  ownerName: string;
  ownerType: string;
  interval: string;
  generatedAt: string;
  totalCommission: number;
  paymentPercentage: number;
  previousPaidAmount: number;
  amount: number;
  reason: CommissionReason;
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

/* ── estilos ── */

const S: Record<string, React.CSSProperties> = {
  page: { padding: "0 4px" },

  card: {
    background: "var(--rtc-card-bg, #fff)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },

  cardHead: {
    padding: "14px 18px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--rtc-text, #1a1a1a)",
  },

  cardBody: { padding: 18 },

  filtersRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
  },

  field: { display: "flex", flexDirection: "column" as const, gap: 5 },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--rtc-muted, #888)",
  },

  select: {
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 15,
    color: "var(--rtc-text, #1a1a1a)",
    background: "var(--rtc-card-bg, #fff)",
    outline: "none",
    width: "100%",
  },

  selectDisabled: {
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 15,
    color: "var(--rtc-soft-muted, #aaa)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
    outline: "none",
    width: "100%",
    cursor: "not-allowed",
  },

  tableWrap: {
    borderTop: "0.5px solid var(--rtc-border, #e0e0e0)",
    overflowX: "auto" as const,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 15,
  },

  th: {
    textAlign: "left" as const,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--rtc-muted, #888)",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
    whiteSpace: "nowrap" as const,
  },

  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    color: "var(--rtc-text, #1a1a1a)",
    verticalAlign: "middle" as const,
    whiteSpace: "nowrap" as const,
  },

  tdMuted: {
    padding: "9px 12px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    color: "var(--rtc-soft-muted, #aaa)",
    fontSize: 14,
    verticalAlign: "middle" as const,
    whiteSpace: "nowrap" as const,
  },

  tdAmount: {
    padding: "9px 12px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    color: "#3B6D11",
    fontWeight: 700,
    verticalAlign: "middle" as const,
    whiteSpace: "nowrap" as const,
  },

  emptyCell: {
    padding: "28px 0",
    textAlign: "center" as const,
    color: "var(--rtc-soft-muted, #aaa)",
    fontSize: 15,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px",
    borderTop: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
    flexWrap: "wrap" as const,
    gap: 8,
  },

  pgInfo: { fontSize: 13, color: "var(--rtc-soft-muted, #aaa)" },
  pgBtns: { display: "flex", gap: 4 },

  spinnerWrap: {
    textAlign: "center" as const,
    padding: "24px 0",
    color: "var(--rtc-soft-muted, #aaa)",
    fontSize: 15,
  },
};

const getReasonBadgeStyle = (reason: CommissionReason): React.CSSProperties => {
  const map: Record<CommissionReason, React.CSSProperties> = {
    ADIANTAMENTO: { background: "#FAEEDA", color: "#854F0B" },
    FECHAMENTO_MENSAL: { background: "#EAF3DE", color: "#3B6D11" },
    CONSULTA: { background: "#E6F1FB", color: "#185FA5" },
    OUTRO: { background: "#F1EFE8", color: "#5F5E5A" },
  };
  return {
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    ...(map[reason] ?? { background: "#F1EFE8", color: "#5F5E5A" }),
  };
};

const getTypeBadgeStyle = (type: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "3px 9px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  background: type === CommissionOwnerType.COLLECTOR ? "#E1F5EE" : "#FBEAF0",
  color: type === CommissionOwnerType.COLLECTOR ? "#085041" : "#72243E",
});

const getPgBtnStyle = (
  active: boolean,
  disabled: boolean,
): React.CSSProperties => ({
  border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
  borderRadius: 6,
  padding: "5px 12px",
  fontSize: 13,
  cursor: disabled ? "default" : "pointer",
  background: active ? "#185FA5" : "var(--rtc-card-bg, #fff)",
  color: active ? "#E6F1FB" : "var(--rtc-text, #1a1a1a)",
  opacity: disabled ? 0.4 : 1,
});

/* ── componente ── */

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

  useEffect(() => {
    const loadCollectors = async () => {
      try {
        const res = await api.get("/collector/name/all");
        setCollectors(res.data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar cobradores.");
      }
    };
    const loadSellers = async () => {
      try {
        const res = await api.get("/seller/name/all");
        setSellers(res.data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar vendedores.");
      }
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
        const endpoint = isCollector
          ? "/collector/collector-commission-history"
          : "/seller/commission-history";
        const params: Record<string, number> = { page, size };
        if (ownerId) {
          if (isCollector) params.collectorId = ownerId;
          else params.sellerId = ownerId;
        }
        const res = await api.get(endpoint, { params });
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

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatGeneratedAt = (date: string) =>
    new Date(date).toLocaleString("pt-BR");

  const getReasonLabel = (reason: CommissionReason) => {
    const labels: Record<CommissionReason, string> = {
      ADIANTAMENTO: "Adiantamento",
      FECHAMENTO_MENSAL: "Fechamento mensal",
      CONSULTA: "Consulta",
      OUTRO: "Outro",
    };
    return labels[reason];
  };

  const getOwnerTypeLabel = (type: string) => {
    if (type === CommissionOwnerType.COLLECTOR) return "Cobrador";
    if (type === CommissionOwnerType.SELLER) return "Vendedor";
    return "-";
  };

  return (
    <div className="commission-page" style={S.page}>
      <div className="container-fluid px-1 my-1 commission-page__inner">
        <BreadcrumbSection title="Histórico de Comissão" link="/inicio" />

        <div className="commission-card commission-history-card" style={S.card}>
          {/* ── Cabeçalho ── */}
          <div className="commission-card__header" style={S.cardHead}>
            <div style={S.cardTitle}>Consulta de comissões anteriores</div>
          </div>

          {/* ── Filtros ── */}
          <div className="commission-card__body" style={S.cardBody}>
            <div className="commission-form-grid" style={S.filtersRow}>
              <div className="commission-field" style={S.field}>
                <label style={S.label}>Tipo de funcionário *</label>
                <select
                  className="commission-control"
                  style={S.select}
                  value={ownerType ?? ""}
                  onChange={(e) => {
                    const value = e.target.value as CommissionOwnerType;
                    setOwnerType(value || null);
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

              <div className="commission-field" style={S.field}>
                <label style={S.label}>
                  {ownerType === CommissionOwnerType.SELLER
                    ? "Vendedor"
                    : "Cobrador"}
                </label>
                <select
                  className="commission-control"
                  style={ownerType ? S.select : S.selectDisabled}
                  value={ownerId ?? ""}
                  disabled={!ownerType}
                  onChange={(e) => {
                    setOwnerId(e.target.value ? Number(e.target.value) : null);
                    setPage(0);
                  }}
                >
                  <option value="">Todos</option>
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
          </div>

          {/* ── Tabela ── */}
          {loading && <div style={S.spinnerWrap}>Carregando...</div>}

          {!loading && history && history.content.length === 0 && (
            <div style={{ ...S.spinnerWrap, padding: "24px 18px" }}>
              Nenhum histórico encontrado.
            </div>
          )}

          {!loading && history && history.content.length > 0 && (
            <>
              <div className="commission-table-wrap" style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Nome</th>
                      <th style={S.th}>Tipo</th>
                      <th style={S.th}>Motivo</th>
                      <th style={S.th}>Período</th>
                      <th style={S.th}>Gerado em</th>
                      <th style={S.th}>Comissão total</th>
                      <th style={S.th}>%</th>
                      <th style={S.th}>Já pago</th>
                      <th style={S.th}>Valor pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.content.map((item, index) => (
                      <tr
                        key={index}
                        onMouseEnter={(e) =>
                          (e.currentTarget as HTMLTableRowElement)
                            .querySelectorAll("td")
                            .forEach((td) => (td.style.background = "var(--rtc-hover-bg, #f8f9fa)"))
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget as HTMLTableRowElement)
                            .querySelectorAll("td")
                            .forEach((td) => (td.style.background = ""))
                        }
                      >
                        <td style={S.td}>{item.ownerName}</td>
                        <td style={S.td}>
                          <span style={getTypeBadgeStyle(item.ownerType)}>
                            {getOwnerTypeLabel(item.ownerType)}
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={getReasonBadgeStyle(item.reason)}>
                            {getReasonLabel(item.reason)}
                          </span>
                        </td>
                        <td style={S.tdMuted}>{item.interval}</td>
                        <td style={S.tdMuted}>
                          {formatGeneratedAt(item.generatedAt)}
                        </td>
                        <td style={S.td}>
                          R$ {formatCurrency(item.totalCommission)}
                        </td>
                        <td style={S.td}>{item.paymentPercentage}%</td>
                        <td style={S.td}>
                          R$ {formatCurrency(item.previousPaidAmount)}
                        </td>
                        <td style={S.tdAmount}>
                          R$ {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Paginação ── */}
              <div className="commission-pagination" style={S.footer}>
                <span style={S.pgInfo}>
                  Página {page + 1} de {history.totalPages}
                </span>
                <div style={S.pgBtns}>
                  <button
                    style={getPgBtnStyle(false, page === 0)}
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    «
                  </button>
                  {[...Array(history.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      style={getPgBtnStyle(page === index, false)}
                      onClick={() => setPage(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    style={getPgBtnStyle(false, page + 1 >= history.totalPages)}
                    disabled={page + 1 >= history.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionHistory;
