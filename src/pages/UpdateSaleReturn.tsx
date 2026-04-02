import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type SaleReturnType = {
  saleReturnId: number;
  returnDate: string;
  saleStatus: number;
  productNameReturned: string;
  quantityReturned: number;
  saleDTO: {
    saleDate: string;
    clientName: string;
  };
};

enum ReturnStatus {
  DEVOLVIDO_CLIENTE = 3,
  DANIFICADO = 6,
}

/* ── estilos ── */

const S: Record<string, React.CSSProperties> = {
  page: { padding: "0 4px" },

  card: {
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },

  cardHead: {
    padding: "14px 18px",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
  },

  cardBody: { padding: 18 },

  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },

  field: { display: "flex", flexDirection: "column", gap: 5 },

  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
  },

  input: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    width: "100%",
  },

  searchBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "#185FA5",
    color: "#E6F1FB",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },

  th: {
    textAlign: "left" as const,
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    whiteSpace: "nowrap" as const,
  },

  thRight: {
    textAlign: "right" as const,
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    whiteSpace: "nowrap" as const,
  },

  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#1a1a1a",
    verticalAlign: "middle" as const,
  },

  tdMuted: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#aaa",
    fontSize: 12,
    verticalAlign: "middle" as const,
  },

  tdActions: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    verticalAlign: "middle" as const,
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },

  statusSelect: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 6,
    padding: "5px 8px",
    fontSize: 12,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
  },

  loadingCell: {
    padding: "24px 0",
    textAlign: "center" as const,
    color: "#aaa",
    fontSize: 13,
  },
};

const getStatusBadgeStyle = (status: number): React.CSSProperties => {
  const map: Record<number, React.CSSProperties> = {
    3: { background: "#E6F1FB", color: "#185FA5" },
    6: { background: "#FCEBEB", color: "#A32D2D" },
  };
  return {
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
    ...(map[status] ?? { background: "#F1EFE8", color: "#5F5E5A" }),
  };
};

const getUpdateBtnStyle = (disabled: boolean): React.CSSProperties => ({
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "#f1f1f1" : "#EAF3DE",
  color: disabled ? "#aaa" : "#3B6D11",
});

/* ── componente ── */

const UpdateSaleReturn = () => {
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  const [sales, setSales] = useState<SaleReturnType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    [key: number]: number | undefined;
  }>({});

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sale-return/status/end", {
        params: {
          id: searchId ? Number(searchId) : undefined,
          name: searchName || undefined,
          cpf: searchCpf || undefined,
        },
      });
      setSales(response.data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    saleReturnId: number,
    newStatus: number,
  ) => {
    try {
      await api.patch(`/sale-return/${saleReturnId}/update/status`, {
        status: newStatus,
      });

      fetchSales();
      
      setSales((prev) =>
        prev.map((sale) =>
          sale.saleReturnId === saleReturnId
            ? { ...sale, saleStatus: newStatus }
            : sale,
        ),
      );
      setPendingStatus((prev) => {
        const updated = { ...prev };
        delete updated[saleReturnId];
        return updated;
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error?.response?.data);
    }
  };

  return (
    <div style={S.page}>
      <div className="container-fluid px-1 my-1">
        <BreadcrumbSection
          title="Atualizar Status de Produtos em Garantia"
          link="/inicio"
        />

        {/* ── Filtros ── */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Filtros</span>
          </div>
          <div style={S.cardBody}>
            <div style={S.filters}>
              <div style={S.field}>
                <label style={S.label}>N° venda</label>
                <input
                  type="number"
                  style={S.input}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Ex: 1042"
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Nome do cliente</label>
                <input
                  type="text"
                  style={S.input}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Digite o nome"
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>CPF</label>

                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="text"
                    style={{ ...S.input, flex: 1 }}
                    value={searchCpf}
                    onChange={(e) => setSearchCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />

                  <button style={S.searchBtn} onClick={fetchSales}>
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lista ── */}
        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <div style={S.loadingCell}>Carregando...</div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>N° venda</th>
                    <th style={S.th}>Cliente</th>
                    <th style={S.th}>Produto</th>
                    <th style={S.th}>Qtd</th>
                    <th style={S.th}>Data / hora</th>
                    <th style={S.thRight}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          ...S.td,
                          textAlign: "center",
                          color: "#aaa",
                          padding: "24px 0",
                        }}
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}

                  {sales.map((sale) => (
                    <tr
                      key={sale.saleReturnId}
                      onMouseEnter={(e) =>
                        (e.currentTarget as HTMLTableRowElement)
                          .querySelectorAll("td")
                          .forEach((td) => (td.style.background = "#f8f9fa"))
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget as HTMLTableRowElement)
                          .querySelectorAll("td")
                          .forEach((td) => (td.style.background = ""))
                      }
                    >
                      <td style={S.tdMuted}>{sale.saleReturnId}</td>
                      <td style={S.td}>{sale.saleDTO.clientName}</td>
                      <td style={S.td}>{sale.productNameReturned}</td>
                      <td style={S.td}>{sale.quantityReturned}</td>
                      <td style={S.td}>{sale.returnDate}</td>

                      <td style={S.tdActions}>
                        <div style={S.actions}>
                          <span style={getStatusBadgeStyle(sale.saleStatus)}>
                            {ReturnStatus[sale.saleStatus]}
                          </span>

                          <select
                            style={S.statusSelect}
                            value={pendingStatus[sale.saleReturnId] ?? ""}
                            onChange={(e) =>
                              setPendingStatus((prev) => ({
                                ...prev,
                                [sale.saleReturnId]:
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                              }))
                            }
                          >
                            <option value="">Selecione</option>
                            {Object.entries(ReturnStatus)
                              .filter(([key]) => isNaN(Number(key)))
                              .map(([key, value]) => (
                                <option
                                  key={value}
                                  value={value}
                                  disabled={value === sale.saleStatus}
                                >
                                  {key.replace("_", " ")}
                                </option>
                              ))}
                          </select>

                          <button
                            style={getUpdateBtnStyle(
                              pendingStatus[sale.saleReturnId] === undefined,
                            )}
                            disabled={
                              pendingStatus[sale.saleReturnId] === undefined
                            }
                            onClick={() =>
                              handleStatusChange(
                                sale.saleReturnId,
                                pendingStatus[sale.saleReturnId]!,
                              )
                            }
                          >
                            Atualizar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSaleReturn;
