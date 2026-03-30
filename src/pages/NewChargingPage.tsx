import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TableBottomControls from "../components/utils/TableBottomControls";
import api from "../services/api";
import { AllProductDataType, ChargingType } from "../types";
import { ProductStatusLabel } from "../enums/ProductStatusLabel";

type PageResponse<T> = {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

const normalizePage = <T,>(data: PageResponse<T>) => {
  const page = data.page ?? {
    size: data.size ?? 10,
    number: data.number ?? 0,
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
  };
  return {
    content: data.content ?? [],
    size: page.size,
    number: page.number,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  };
};

/* ── estilos ───────────────────────────────────────────────── */

const S = {
  sectionCard: {
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    marginTop: 14,
    overflow: "hidden",
  } as React.CSSProperties,

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    cursor: "pointer",
    background: "#f8f9fa",
    border: "none",
    width: "100%",
    textAlign: "left" as const,
  } as React.CSSProperties,

  sectionBody: {
    borderTop: "0.5px solid #e0e0e0",
  } as React.CSSProperties,

  dot: (color: string): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  } as React.CSSProperties,

  th: {
    textAlign: "left" as const,
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,

  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#1a1a1a",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,

  tdMuted: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#aaa",
    verticalAlign: "middle" as const,
    fontSize: 12,
  } as React.CSSProperties,

  footerBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    flexWrap: "wrap" as const,
    gap: 8,
  } as React.CSSProperties,

  sendBtn: {
    background: "#185FA5",
    color: "#E6F1FB",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,

  editBtn: {
    background: "#f1f1f1",
    border: "0.5px solid #e0e0e0",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 13,
    color: "#555",
    cursor: "pointer",
  } as React.CSSProperties,

  qtyInput: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 13,
    width: 80,
    outline: "none",
    background: "#fff",
    color: "#1a1a1a",
  } as React.CSSProperties,

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "0 12px",
    height: 38,
    width: "100%",
    maxWidth: 420,
  } as React.CSSProperties,

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    color: "#1a1a1a",
    width: "100%",
  } as React.CSSProperties,
};

const statusBadgeStyle = (): React.CSSProperties => ({
  display: "inline-block",
  padding: "3px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
});

/* ── componente ────────────────────────────────────────────── */

const NewChargingPage = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);
  const [dataPerPage] = useState(10);
  const [dataList, setDataList] = useState<AllProductDataType[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchName, setSearchName] = useState("");

  const [chargingPage, setChargingPage] = useState(0);
  const [, setChargingTotalElements] = useState(0);
  const [chargingTotalPages, setChargingTotalPages] = useState(0);
  const [chargingPerPage] = useState(10);
  const [chargingList, setChargingList] = useState<ChargingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const [openCharging, setOpenCharging] = useState(true);
  const [openProducts, setOpenProducts] = useState(false);

  const fetchChargings = async (page = chargingPage, name = searchName) => {
    try {
      const response = await api.get<PageResponse<ChargingType>>(
        "/charging/all",
        {
          params: {
            page,
            size: chargingPerPage,
            name: name?.trim() || undefined,
          },
        },
      );
      if (response.status === 200) {
        const normalized = normalizePage(response.data);
        setChargingList(normalized.content);
        setChargingTotalElements(normalized.totalElements);
        setChargingTotalPages(normalized.totalPages);
        setChargingPage(normalized.number);
      } else {
        alert("Erro ao carregar carregamentos");
      }
    } catch (error: any) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const fetchProducts = async (page = currentPage, name = searchName) => {
    try {
      setLoading(true);
      const response = await api.get<PageResponse<AllProductDataType>>(
        "/product/all",
        {
          params: { page, size: dataPerPage, name: name?.trim() || undefined },
        },
      );
      if (response.status === 200) {
        const normalized = normalizePage(response.data);
        setDataList(normalized.content);
        setTotalElements(normalized.totalElements);
        setTotalPages(normalized.totalPages);
        setCurrentPage(normalized.number);
        setQuantities((prev) => {
          const updated = { ...prev };
          normalized.content.forEach((p) => {
            if (updated[p.id] === undefined) updated[p.id] = 0;
          });
          return updated;
        });
      } else {
        alert("Erro ao carregar produtos");
      }
    } catch (error: any) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(0);
      setChargingPage(0);
      fetchProducts(0, searchName);
      fetchChargings(0, searchName);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchName]);

  const handleQuantityChange = (productId: number, value: string) => {
    const num = Number(value);
    setQuantities({ ...quantities, [productId]: num >= 0 ? num : 0 });
  };

  const handleSendCharging = async () => {
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: Number(id), quantity: qty }));

    if (items.length === 0) {
      alert("Digite quantidades em pelo menos um produto.");
      return;
    }

    try {
      const response = await api.put("/charging/add", items);
      if (response.status === 200 || response.status === 201) {
        alert("Carregamento enviado com sucesso!");
        setDataList((prev) =>
          prev.map((p) => {
            const sentQty = quantities[p.id] || 0;
            return sentQty > 0 ? { ...p, amount: p.amount - sentQty } : p;
          }),
        );
        await fetchChargings(0, searchName);
        const reset: any = {};
        Object.keys(quantities).forEach((id) => (reset[id] = 0));
        setQuantities(reset);
        await fetchProducts(currentPage, searchName);
      } else {
        alert("Erro ao enviar carregamento.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const paginate = (pageNumber: number) => {
    const pageIndex = pageNumber - 1;
    setCurrentPage(pageIndex);
    fetchProducts(pageIndex, searchName);
  };

  const paginateCharging = (pageNumber: number) => {
    const pageIndex = pageNumber - 1;
    setChargingPage(pageIndex);
    fetchChargings(pageIndex, searchName);
  };

  const chargingPageNumbers = Array.from(
    { length: chargingTotalPages },
    (_, i) => i + 1,
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const indexOfFirstData = currentPage * dataPerPage;
  const indexOfLastData = indexOfFirstData + dataList.length;

  const Spinner = () => (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 4px" }}>
      <div className="col-12">
        {/* ── Barra de pesquisa ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div>
            <div style={S.searchWrap}>
              <i
                className="fa-light fa-magnifying-glass"
                style={{ color: "#aaa", fontSize: 14 }}
              />
              <input
                type="text"
                style={S.searchInput}
                placeholder="Pesquisar por nome do produto..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              {searchName?.trim() && (
                <button
                  onClick={() => setSearchName("")}
                  title="Limpar"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  <i className="fa-light fa-xmark" />
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 5 }}>
              {searchName?.trim()
                ? `Filtrando por: "${searchName}"`
                : "Digite algo para pesquisar"}
            </div>
          </div>
        </div>

        {/* ── Seção: Carregamento atual ── */}
        <div style={S.sectionCard}>
          <button
            style={S.sectionHeader}
            onClick={() => setOpenCharging((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={S.dot("#378ADD")} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Carregamento atual
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#aaa" }}>
              {openCharging ? "▲" : "▼"}
            </span>
          </button>

          {openCharging && (
            <div style={S.sectionBody}>
              {loading ? (
                <Spinner />
              ) : (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>ID</th>
                          <th style={S.th}>Nome</th>
                          <th style={S.th}>Em estoque</th>
                          <th style={S.th}>Preço</th>
                          <th style={S.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chargingList.map((charging) =>
                          [...charging.chargingItems]
                            .sort((a, b) => a.id - b.id)
                            .map((item) => (
                              <tr key={item.id}>
                                <td style={S.tdMuted}>{item.productId}</td>
                                <td style={S.td}>{item.nameProduct}</td>
                                <td style={S.td}>{item.quantity}</td>
                                <td style={S.td}>
                                  R$ {item.priceProduct.toFixed(2)}
                                </td>
                                <td style={S.td}>
                                  <span
                                    style={{
                                      ...statusBadgeStyle(),
                                      background: "#E6F1FB",
                                      color: "#185FA5",
                                    }}
                                  >
                                    {ProductStatusLabel[item.status]}
                                  </span>
                                </td>
                              </tr>
                            )),
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={S.footerBar}>
                    <TableBottomControls
                      indexOfFirstData={chargingPage * chargingPerPage}
                      indexOfLastData={
                        chargingPage * chargingPerPage + chargingList.length
                      }
                      dataList={chargingList}
                      currentPage={chargingPage + 1}
                      totalPages={chargingTotalPages}
                      paginate={paginateCharging}
                      pageNumbers={chargingPageNumbers}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Seção: Produtos do estoque ── */}
        <div style={S.sectionCard}>
          <button
            style={S.sectionHeader}
            onClick={() => setOpenProducts((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={S.dot("#639922")} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Produtos do estoque
              </span>
              <span style={{ fontSize: 12, color: "#aaa" }}>
                {totalElements} itens
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#aaa" }}>
              {openProducts ? "▲" : "▼"}
            </span>
          </button>

          {openProducts && (
            <div style={S.sectionBody}>
              {loading ? (
                <Spinner />
              ) : (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>ID</th>
                          <th style={S.th}>Nome</th>
                          <th style={S.th}>Em estoque</th>
                          <th style={S.th}>Preço</th>
                          <th style={S.th}>Status</th>
                          <th style={S.th}>Quantidade</th>
                          <th style={S.th}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataList.map((product) => (
                          <tr key={product.id}>
                            <td style={S.tdMuted}>{product.id}</td>
                            <td style={S.td}>{product.name}</td>
                            <td style={S.td}>{product.amount}</td>
                            <td style={S.td}>R$ {product.value}</td>
                            <td style={S.td}>
                              <span
                                style={{
                                  ...statusBadgeStyle(),
                                  background: "#EAF3DE",
                                  color: "#3B6D11",
                                }}
                              >
                                {ProductStatusLabel[product.status]}
                              </span>
                            </td>
                            <td style={S.td}>
                              <input
                                type="number"
                                min="0"
                                style={S.qtyInput}
                                value={quantities[product.id] || 0}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    product.id,
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td style={S.td}>
                              <button
                                style={S.editBtn}
                                title="Editar"
                                onClick={() =>
                                  navigate(`/update-product/${product.id}`)
                                }
                              >
                                <i className="fa-light fa-pen" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{ ...S.footerBar, justifyContent: "space-between" }}
                  >
                    <TableBottomControls
                      indexOfFirstData={indexOfFirstData}
                      indexOfLastData={indexOfLastData}
                      dataList={dataList}
                      currentPage={currentPage + 1}
                      totalPages={totalPages}
                      paginate={paginate}
                      pageNumbers={pageNumbers}
                    />
                    <button style={S.sendBtn} onClick={handleSendCharging}>
                      Enviar carregamento
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChargingPage;
