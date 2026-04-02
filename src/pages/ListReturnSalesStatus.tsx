import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type SaleReturnType = {
  saleReturnId: number;
  returnDate: string;
  saleStatus: number;
  productIdReturned: number;
  productNameReturned: string;
  quantityReturned: number;
  description: string;
  saleDTO: {
    saleId: number;
    saleDate: string;
    clientName: string;
  };
};

enum ReturnStatusFilter {
  TODOS = 0,
  DEFEITO_PRODUTO = 2,
  DESISTENCIA = 4,
  REAVIDO = 5,
  DANIFICADO = 6,
}

const statusMap: Record<number, string> = {
  2: "Na garantia",
  3: "Devolvido",
  4: "Desistência",
  5: "Recuperado",
  6: "Danificado",
};

const statusBadge: Record<number, React.CSSProperties> = {
  2: { background: "#E6F1FB", color: "#185FA5" },
  3: { background: "#F1EFE8", color: "#5F5E5A" },
  4: { background: "#FAEEDA", color: "#854F0B" },
  5: { background: "#EAF3DE", color: "#3B6D11" },
  6: { background: "#FCEBEB", color: "#A32D2D" },
};

const S: Record<string, React.CSSProperties> = {
  page: { padding: "0 4px" },

  card: {
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },

  cardHead: {
    padding: "16px 20px",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
  },

  cardBody: { padding: 20 },

  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    marginBottom: 20,
    alignItems: "flex-end",
  },

  field: { display: "flex", flexDirection: "column", gap: 5 },

  label: {
    fontSize: 12,
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

  searchBtn: {
    padding: "9px 20px",
    borderRadius: 8,
    border: "none",
    background: "#185FA5",
    color: "#E6F1FB",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    width: "100%",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },

  th: {
    textAlign: "left",
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#1a1a1a",
    verticalAlign: "middle",
  },

  tdMuted: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#aaa",
    fontSize: 12,
    verticalAlign: "middle",
  },

  tdDesc: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#888",
    fontSize: 12,
    verticalAlign: "middle",
    maxWidth: 200,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    flexWrap: "wrap",
    gap: 8,
  },

  pgInfo: {
    fontSize: 12,
    color: "#aaa",
  },

  pgBtns: { display: "flex", gap: 4 },
};

const getBadgeStyle = (status: number): React.CSSProperties => ({
  display: "inline-block",
  padding: "3px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  ...(statusBadge[status] ?? { background: "#F1EFE8", color: "#5F5E5A" }),
});

const getPgBtnStyle = (
  active: boolean,
  disabled: boolean,
): React.CSSProperties => ({
  border: "0.5px solid #d0d0d0",
  borderRadius: 6,
  padding: "5px 10px",
  fontSize: 12,
  cursor: disabled ? "default" : "pointer",
  background: active ? "#185FA5" : "#fff",
  color: active ? "#E6F1FB" : "#1a1a1a",
  opacity: disabled ? 0.4 : 1,
});

const ListReturnSalesStatus = () => {
  const [returns, setReturns] = useState<SaleReturnType[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [searchName, setSearchName] = useState("");
  const [searchCpf, setSearchCpf] = useState("");

  const fetchReturns = async (status?: number, pageNumber = 0) => {
    try {
      const response = await api.get("sale-return/sale-returns", {
        params: {
          status: status !== 0 ? status : undefined,
          name: searchName || undefined,
          cpf: searchCpf || undefined,
          page: pageNumber,
          size: size,
        },
      });
      setReturns(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (error) {
      console.error("Erro ao buscar devoluções:", error);
    }
  };

  useEffect(() => {
    fetchReturns(statusFilter, 0);
  }, [statusFilter]);

  return (
    <div style={S.page}>
      <div className="container-fluid px-1 my-1">
        <BreadcrumbSection title="Lista de Ocorrências" link="/inicio" />

        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.cardTitle}>Lista de ocorrências</div>
          </div>

          <div style={S.cardBody}>
            {/* ── Filtros ── */}
            <div style={S.filters}>
              <div style={S.field}>
                <label style={S.label}>Status</label>
                <select
                  style={S.select}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(Number(e.target.value))}
                >
                  <option value={ReturnStatusFilter.TODOS}>Todos</option>
                  <option value={ReturnStatusFilter.DEFEITO_PRODUTO}>
                    Garantia
                  </option>
                  <option value={ReturnStatusFilter.DESISTENCIA}>
                    Desistência
                  </option>
                  <option value={ReturnStatusFilter.REAVIDO}>Recuperado</option>
                  <option value={ReturnStatusFilter.DANIFICADO}>
                    Danificado
                  </option>
                </select>
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
                  placeholder="Digite o CPF"
                />
              </div>

              <div style={S.field}>
                <button
                  style={S.searchBtn}
                  onClick={() => fetchReturns(statusFilter, 0)}
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* ── Tabela ── */}
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>N° venda</th>
                    <th style={S.th}>Cliente</th>
                    <th style={S.th}>Produto</th>
                    <th style={S.th}>Qtd</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Data devolução</th>
                    <th style={S.th}>Data venda</th>
                    <th style={S.th}>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          ...S.td,
                          textAlign: "center",
                          color: "#aaa",
                          padding: "24px 0",
                        }}
                      >
                        Nenhuma ocorrência encontrada.
                      </td>
                    </tr>
                  )}

                  {returns.map((r) => (
                    <tr
                      key={r.saleReturnId}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement)
                          .querySelectorAll("td")
                          .forEach((td) => (td.style.background = "#f8f9fa"));
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement)
                          .querySelectorAll("td")
                          .forEach((td) => (td.style.background = ""));
                      }}
                    >
                      <td style={S.tdMuted}>{r.saleDTO.saleId}</td>
                      <td style={S.td}>{r.saleDTO.clientName}</td>
                      <td style={S.td}>{r.productNameReturned}</td>
                      <td style={S.td}>{r.quantityReturned}</td>
                      <td style={S.td}>
                        <span style={getBadgeStyle(r.saleStatus)}>
                          {statusMap[r.saleStatus] || String(r.saleStatus)}
                        </span>
                      </td>
                      <td style={S.td}>{r.returnDate}</td>
                      <td style={S.td}>{r.saleDTO.saleDate}</td>
                      <td style={S.tdDesc} title={r.description}>
                        {r.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Paginação ── */}
            <div style={S.footer}>
              <span style={S.pgInfo}>
                Página {page + 1} de {totalPages || 1}
              </span>
              <div style={S.pgBtns}>
                <button
                  style={getPgBtnStyle(false, page === 0)}
                  disabled={page === 0}
                  onClick={() => fetchReturns(statusFilter, page - 1)}
                >
                  «
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    style={getPgBtnStyle(page === index, false)}
                    onClick={() => fetchReturns(statusFilter, index)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  style={getPgBtnStyle(false, page + 1 >= totalPages)}
                  disabled={page + 1 >= totalPages}
                  onClick={() => fetchReturns(statusFilter, page + 1)}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListReturnSalesStatus;
