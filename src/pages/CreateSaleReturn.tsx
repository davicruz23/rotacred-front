import { useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type SaleSearchType = {
  saleId: number;
  saleDate: string;
  clientName: string;
  cpf: string;
  city: string;
};

type SaleDetailType = {
  saleId: number;
  clientName: string;
  saleDate: string;
  products: {
    productId: number;
    productName: string;
    quantityBought: number;
  }[];
};

enum ReturnStatus {
  ATIVO = 1,
  DEFEITO_PRODUTO = 2,
  DEVOLVIDO_CLIENTE = 3,
  DESISTENCIA = 4,
  REAVIDO = 5,
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
    margin: 0,
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

  select: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    width: "100%",
  },

  textarea: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    width: "100%",
    resize: "vertical" as const,
    minHeight: 72,
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

  selectBtn: {
    border: "0.5px solid #B5D4F4",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#185FA5",
    background: "#E6F1FB",
    cursor: "pointer",
  },

  footerPg: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderTop: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    flexWrap: "wrap" as const,
    gap: 8,
  },

  pgBtns: { display: "flex", gap: 4 },

  saleMeta: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap" as const,
    marginBottom: 18,
  },

  metaItem: { display: "flex", flexDirection: "column" as const, gap: 3 },
  metaLabel: { fontSize: 11, color: "#888" },
  metaValue: { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: 10,
  },

  qtySelect: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 6,
    padding: "5px 8px",
    fontSize: 13,
    width: 80,
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 12,
    marginBottom: 16,
  },

  divider: {
    border: "none",
    borderTop: "0.5px solid #e0e0e0",
    margin: "16px 0",
  },
};

const getSubmitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: disabled ? "#f1f1f1" : "#3B6D11",
  color: disabled ? "#aaa" : "#EAF3DE",
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

const getPgBtnStyle = (
  active: boolean,
  disabled: boolean,
): React.CSSProperties => ({
  border: "0.5px solid #d0d0d0",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  cursor: disabled ? "default" : "pointer",
  background: active ? "#185FA5" : "#fff",
  color: active ? "#E6F1FB" : "#1a1a1a",
  opacity: disabled ? 0.4 : 1,
});

/* ── componente ── */

const CreateSaleReturn = () => {
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [sales, setSales] = useState<SaleSearchType[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleDetailType | null>(null);
  const [status, setStatus] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState<
    { productId: number; quantityReturned: number }[]
  >([]);

  const searchSales = async (pageNumber = 0) => {
    try {
      const response = await api.get("/sale/sales/search", {
        params: {
          id: searchId ? Number(searchId) : undefined,
          name: searchName || undefined,
          cpf: searchCpf || undefined,
          city: searchCity || undefined,
          page: pageNumber,
          size: size,
          sort: "saleDate,desc",
        },
      });
      setSales(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const loadSaleDetail = async (saleId: number) => {
    try {
      const response = await api.get(`sale/sales/${saleId}`);
      setSelectedSale(response.data);
      setItems([]);
    } catch (error) {
      console.error("Erro ao carregar venda:", error);
    }
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantityReturned: quantity } : i,
        );
      }
      return [...prev, { productId, quantityReturned: quantity }];
    });
  };

  const handleSubmit = async () => {
    if (!selectedSale) return;
    const validItems = items.filter(
      (i) => i.quantityReturned && i.quantityReturned > 0,
    );
    if (validItems.length === 0) {
      alert("Selecione ao menos uma quantidade para devolver.");
      return;
    }
    if (!status) {
      alert("Selecione um status obrigatório.");
      return;
    }
    try {
      await api.post(`/sale-return/sales/${selectedSale.saleId}/returns`, {
        items: validItems.map((i) => ({
          productId: i.productId,
          quantityReturned: i.quantityReturned,
        })),
        status,
        description,
      });
      alert("Devolução registrada com sucesso!");
      setSelectedSale(null);
      setItems([]);
      setDescription("");
      setStatus("");
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
    }
  };

  const isFormValid =
    items.some((i) => i.quantityReturned && i.quantityReturned > 0) &&
    status !== "";

  return (
    <div style={S.page}>
      <div className="container-fluid px-2 px-md-3 my-2">
        <BreadcrumbSection title="Registrar Ocorrência" link="/inicio" />

        {/* ── Busca ── */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Buscar venda</span>
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
                <input
                  type="text"
                  style={S.input}
                  value={searchCpf}
                  onChange={(e) => setSearchCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Cidade</label>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    style={{ ...S.input, flex: 1 }}
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Digite a cidade"
                  />

                  <button style={S.searchBtn} onClick={() => searchSales(0)}>
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Resultado ── */}
        {sales && (
          <div style={S.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>ID</th>
                    <th style={S.th}>Cliente</th>
                    <th style={S.th}>CPF</th>
                    <th style={S.th}>Data</th>
                    <th style={S.th}>Cidade</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
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
                        Nenhuma venda encontrada
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr
                        key={sale.saleId}
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
                        <td style={S.tdMuted}>{sale.saleId}</td>
                        <td style={S.td}>{sale.clientName}</td>
                        <td style={S.tdMuted}>{sale.cpf}</td>
                        <td style={S.td}>{sale.saleDate}</td>
                        <td style={S.td}>{sale.city}</td>
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <button
                            style={S.selectBtn}
                            onClick={() => loadSaleDetail(sale.saleId)}
                          >
                            Selecionar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 0 && (
              <div style={S.footerPg}>
                <span style={{ fontSize: 12, color: "#aaa" }}>
                  Página {page + 1} de {totalPages}
                </span>
                <div style={S.pgBtns}>
                  <button
                    style={getPgBtnStyle(false, page === 0)}
                    disabled={page === 0}
                    onClick={() => page > 0 && searchSales(page - 1)}
                  >
                    «
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      style={getPgBtnStyle(page === index, false)}
                      onClick={() => searchSales(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    style={getPgBtnStyle(false, page + 1 >= totalPages)}
                    disabled={page + 1 >= totalPages}
                    onClick={() =>
                      page + 1 < totalPages && searchSales(page + 1)
                    }
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Detalhe da venda ── */}
        {selectedSale && (
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>Venda #{selectedSale.saleId}</span>
            </div>
            <div style={S.cardBody}>
              <div style={S.saleMeta}>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>Cliente</span>
                  <span style={S.metaValue}>{selectedSale.clientName}</span>
                </div>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>Data</span>
                  <span style={S.metaValue}>{selectedSale.saleDate}</span>
                </div>
              </div>

              <div style={S.sectionTitle}>Produtos da venda</div>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Produto</th>
                      <th style={S.th}>Qtd disponível</th>
                      <th style={S.th}>Devolver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.products.map((p) => (
                      <tr key={p.productId}>
                        <td style={S.td}>{p.productName}</td>
                        <td style={S.td}>{p.quantityBought}</td>
                        <td style={S.td}>
                          <select
                            style={S.qtySelect}
                            defaultValue={0}
                            onChange={(e) =>
                              handleQuantityChange(
                                p.productId,
                                Number(e.target.value),
                              )
                            }
                          >
                            {Array.from(
                              { length: p.quantityBought + 1 },
                              (_, i) => (
                                <option key={i} value={i}>
                                  {i}
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr style={S.divider} />

              <div style={S.formGrid}>
                <div style={S.field}>
                  <label style={S.label}>Status</label>
                  <select
                    style={S.select}
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  >
                    <option value="">Selecione</option>
                    <option value={ReturnStatus.DEFEITO_PRODUTO}>
                      Acionar garantia
                    </option>
                    <option value={ReturnStatus.DESISTENCIA}>
                      Desistência
                    </option>
                    <option value={ReturnStatus.REAVIDO}>Recuperado</option>
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Descrição</label>
                  <textarea
                    style={S.textarea}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o motivo da ocorrência..."
                  />
                </div>
              </div>

              <button
                style={getSubmitBtnStyle(!isFormValid)}
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                Registrar ocorrência
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSaleReturn;
