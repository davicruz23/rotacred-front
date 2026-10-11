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
    background: "var(--rc-surface, #fff)",
    border: "1px solid var(--rc-border, #e3ebf5)",
    borderRadius: 18,
    marginTop: 18,
    overflow: "hidden",
    boxShadow: "var(--rc-shadow, 0 18px 45px rgba(29, 65, 120, 0.08))",
  } as React.CSSProperties,

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px",
    cursor: "pointer",
    background: "var(--rc-page, #f3f7fc)",
    border: "none",
    borderBottom: "1px solid var(--rc-border, #e3ebf5)",
    width: "100%",
    textAlign: "left" as const,
  } as React.CSSProperties,

  sectionBody: {
    borderTop: "1px solid var(--rc-border, #e3ebf5)",
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
    color: "var(--rc-muted, #64748b)",
    borderBottom: "1px solid var(--rc-border, #e3ebf5)",
    background: "var(--rc-page, #f3f7fc)",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,

  td: {
    padding: "9px 12px",
    borderBottom: "1px solid var(--rc-border, #e3ebf5)",
    color: "var(--rc-ink, #12294b)",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,

  tdMuted: {
    padding: "9px 12px",
    borderBottom: "1px solid var(--rc-border, #e3ebf5)",
    color: "var(--rc-muted, #64748b)",
    verticalAlign: "middle" as const,
    fontSize: 12,
  } as React.CSSProperties,

  footerBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rc-page, #f3f7fc)",
    flexWrap: "wrap" as const,
    gap: 8,
  } as React.CSSProperties,

  sendBtn: {
    background: "linear-gradient(135deg, #2783f6, #1769ed)",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,

  editBtn: {
    background: "var(--rc-page, #f3f7fc)",
    border: "1px solid var(--rc-border, #e3ebf5)",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 13,
    color: "var(--rtc-muted, #555)",
    cursor: "pointer",
  } as React.CSSProperties,

  returnBtn: {
    background: "#F4A100",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 13,
    color: "#fff",
    cursor: "pointer",
  } as React.CSSProperties,

  qtyInput: {
    border: "1px solid var(--rc-border, #dce6f2)",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 13,
    width: 80,
    outline: "none",
    background: "var(--rc-surface, #fff)",
    color: "var(--rc-ink, #12294b)",
  } as React.CSSProperties,

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--rc-surface, #fff)",
    border: "1px solid var(--rc-border, #dce6f2)",
    borderRadius: 10,
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
    color: "var(--rc-ink, #12294b)",
    width: "100%",
  } as React.CSSProperties,

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  } as React.CSSProperties,

  modalBox: {
    width: "100%",
    maxWidth: 430,
    background: "var(--rc-surface, #fff)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
  } as React.CSSProperties,

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  } as React.CSSProperties,

  cancelBtn: {
    background: "var(--rtc-disabled-bg, #f1f1f1)",
    color: "var(--rtc-muted, #555)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,

  dangerBtn: {
    background: "#C62828",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
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

  const [returnModal, setReturnModal] = useState<{
    type: "all" | "item";
    chargingId?: number;
    chargingItemId?: number;
    productName?: string;
  } | null>(null);

  const [returnLoading, setReturnLoading] = useState(false);

  const hasItemsToReturn = chargingList.some((charging) =>
    charging.chargingItems?.some((item) => item.quantity > 0),
  );

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
          params: {
            page,
            size: dataPerPage,
            name: name?.trim() || undefined,
          },
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
            if (updated[p.id] === undefined) {
              updated[p.id] = 0;
            }
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
      .map(([id, qty]) => ({
        productId: Number(id),
        quantity: qty,
      }));

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

        const reset: { [key: number]: number } = {};
        Object.keys(quantities).forEach((id) => {
          reset[Number(id)] = 0;
        });

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

  const openReturnAllModal = () => {
    const charging = chargingList[0];

    if (!charging) {
      alert("Nenhum carregamento encontrado.");
      return;
    }

    if (!hasItemsToReturn) {
      alert("Não existem itens no carregamento para devolver.");
      return;
    }

    setReturnModal({
      type: "all",
      chargingId: charging.id,
    });
  };

  const openReturnItemModal = (chargingItemId: number, productName: string) => {
    setReturnModal({
      type: "item",
      chargingItemId,
      productName,
    });
  };

  const closeReturnModal = () => {
    if (returnLoading) return;
    setReturnModal(null);
  };

  const handleConfirmReturn = async () => {
    if (!returnModal) return;

    try {
      setReturnLoading(true);

      if (returnModal.type === "all") {
        await api.post(`/charging/all/${returnModal.chargingId}`);
      } else {
        await api.post(`/charging/item/${returnModal.chargingItemId}`);
      }

      alert("Devolução realizada com sucesso!");

      setReturnModal(null);

      await fetchChargings(chargingPage, searchName);
      await fetchProducts(currentPage, searchName);
    } catch (error) {
      console.error(error);
      alert("Erro ao devolver produto para o estoque.");
    } finally {
      setReturnLoading(false);
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
    <div style={{ padding: "0 4px" }} className="product-page product-charging-page">
      <div className="col-12">
        <div className="product-page__heading product-page__heading--charging">
          <div>
            <span className="product-page__eyebrow">OPERAÇÃO DE ESTOQUE</span>
            <h1>Atualizar carregamento</h1>
            <p>Envie produtos para a equipe e acompanhe as devoluções em um só lugar.</p>
          </div>

          <div className="product-page__metric">
            <span>Produtos no estoque</span>
            <strong>{totalElements}</strong>
            <small>itens disponíveis</small>
          </div>
        </div>
        {/* ── Barra de pesquisa ── */}
        <div
          className="product-charging-search"
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
                style={{
                  color: "var(--rtc-soft-muted, #aaa)",
                  fontSize: 14,
                }}
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
                  type="button"
                  onClick={() => setSearchName("")}
                  title="Limpar"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--rtc-soft-muted, #aaa)",
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  <i className="fa-light fa-xmark" />
                </button>
              )}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "var(--rtc-soft-muted, #aaa)",
                marginTop: 5,
              }}
            >
              {searchName?.trim()
                ? `Filtrando por: "${searchName}"`
                : "Digite algo para pesquisar"}
            </div>
          </div>
        </div>

        {/* ── Seção: Carregamento atual ── */}
        <div style={S.sectionCard} className="product-operation-card">
          <div
            style={S.sectionHeader}
            onClick={() => setOpenCharging((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={S.dot("#378ADD")} />

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--rtc-text, #1a1a1a)",
                }}
              >
                Carregamento atual
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {chargingList.length > 0 && (
                <button
                  type="button"
                  style={{
                    ...S.returnBtn,
                    opacity: hasItemsToReturn ? 1 : 0.5,
                    cursor: hasItemsToReturn ? "pointer" : "not-allowed",
                  }}
                  disabled={!hasItemsToReturn}
                  onClick={(e) => {
                    e.stopPropagation();
                    openReturnAllModal();
                  }}
                >
                  Devolver tudo
                </button>
              )}

              <span
                style={{
                  fontSize: 11,
                  color: "var(--rtc-soft-muted, #aaa)",
                }}
              >
                {openCharging ? "▲" : "▼"}
              </span>
            </div>
          </div>

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
                          <th style={S.th}>No carregamento</th>
                          <th style={S.th}>Preço</th>
                          <th style={S.th}>Status</th>
                          <th style={S.th}>Ações</th>
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

                                <td style={S.td}>
                                  <button
                                    type="button"
                                    style={{
                                      ...S.returnBtn,
                                      opacity: item.quantity > 0 ? 1 : 0.5,
                                      cursor:
                                        item.quantity > 0
                                          ? "pointer"
                                          : "not-allowed",
                                    }}
                                    disabled={item.quantity <= 0}
                                    title="Devolver produto para o estoque"
                                    onClick={() =>
                                      openReturnItemModal(
                                        item.id,
                                        item.nameProduct,
                                      )
                                    }
                                  >
                                    <i className="fa-light fa-rotate-left" />
                                  </button>
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
        <div style={S.sectionCard} className="product-operation-card">
          <button
            type="button"
            style={S.sectionHeader}
            onClick={() => setOpenProducts((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={S.dot("#639922")} />

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--rtc-text, #1a1a1a)",
                }}
              >
                Produtos do estoque
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: "var(--rtc-soft-muted, #aaa)",
                }}
              >
                {totalElements} itens
              </span>
            </div>

            <span
              style={{
                fontSize: 11,
                color: "var(--rtc-soft-muted, #aaa)",
              }}
            >
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
                                type="button"
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
                    style={{
                      ...S.footerBar,
                      justifyContent: "space-between",
                    }}
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

                    <button
                      type="button"
                      style={S.sendBtn}
                      onClick={handleSendCharging}
                    >
                      Enviar carregamento
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {returnModal && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                color: "var(--rtc-text, #1a1a1a)",
              }}
            >
              Confirmar devolução
            </h3>

            <p
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "var(--rtc-muted, #555)",
                lineHeight: 1.5,
              }}
            >
              {returnModal.type === "all"
                ? "Tem certeza que deseja devolver todos os produtos do carregamento para o estoque?"
                : `Tem certeza que deseja devolver o produto "${returnModal.productName}" para o estoque?`}
            </p>

            <div style={S.modalActions}>
              <button
                type="button"
                style={{
                  ...S.cancelBtn,
                  opacity: returnLoading ? 0.6 : 1,
                  cursor: returnLoading ? "not-allowed" : "pointer",
                }}
                onClick={closeReturnModal}
                disabled={returnLoading}
              >
                Cancelar
              </button>

              <button
                type="button"
                style={{
                  ...S.dangerBtn,
                  opacity: returnLoading ? 0.7 : 1,
                  cursor: returnLoading ? "not-allowed" : "pointer",
                }}
                onClick={handleConfirmReturn}
                disabled={returnLoading}
              >
                {returnLoading ? "Devolvendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewChargingPage;
