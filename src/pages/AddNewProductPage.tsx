import { useState } from "react";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";
import api from "../services/api";

const AddNewProductPage = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    amount: 0,
    value: 0,
    status: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        name === "amount" || name === "value" || name === "status"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/product", product);
      if (response.status === 200 || response.status === 201) {
        alert("Produto cadastrado com sucesso!");
        setProduct({ name: "", brand: "", amount: 0, value: 0, status: 1 });
      }
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        alert(`Erro: ${error.response.data.message || "Problema no servidor"}`);
      } else {
        alert("Erro ao conectar com o servidor.");
      }
    }
  };

  /* ── estilos ── */
  const S: Record<string, React.CSSProperties> = {
    page: {
      padding: "0 4px",
    },
    formCard: {
      background: "var(--rc-surface, #fff)",
      border: "1px solid var(--rc-border, #e3ebf5)",
      borderRadius: 18,
      overflow: "hidden",
      marginTop: 18,
      boxShadow: "var(--rc-shadow, 0 18px 45px rgba(29, 65, 120, 0.08))",
    },
    cardHead: {
      padding: "24px 28px",
      borderBottom: "1px solid var(--rc-border, #e3ebf5)",
      background: "linear-gradient(135deg, rgba(39, 131, 246, 0.08), rgba(74, 203, 255, 0.04))",
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: "var(--rc-ink, #12294b)",
      margin: 0,
    },
    cardSub: {
      fontSize: 13,
      color: "var(--rc-muted, #64748b)",
      marginTop: 6,
    },
    cardBody: {
      padding: 28,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 20,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--rc-muted, #64748b)",
      letterSpacing: "0.02em",
    },
    input: {
      border: "1px solid var(--rc-border, #dce6f2)",
      borderRadius: 10,
      padding: "12px 14px",
      fontSize: 14,
      color: "var(--rc-ink, #12294b)",
      background: "var(--rc-surface, #fff)",
      outline: "none",
      width: "100%",
    },
    prefixWrap: {
      display: "flex",
      alignItems: "center",
      border: "1px solid var(--rc-border, #dce6f2)",
      borderRadius: 10,
      overflow: "hidden",
      background: "var(--rc-surface, #fff)",
    },
    prefix: {
      padding: "12px 14px",
      fontSize: 14,
      color: "var(--rc-muted, #64748b)",
      background: "var(--rc-page, #f3f7fc)",
      borderRight: "1px solid var(--rc-border, #e3ebf5)",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    },
    prefixInput: {
      border: "none",
      outline: "none",
      padding: "12px 14px",
      fontSize: 14,
      color: "var(--rc-ink, #12294b)",
      background: "transparent",
      width: "100%",
    },
    divider: {
      border: "none",
      borderTop: "1px solid var(--rc-border, #e3ebf5)",
      margin: "28px 0 22px",
    },
    submitBtn: {
      width: "100%",
      padding: "13px",
      borderRadius: 10,
      border: "none",
      background: "linear-gradient(135deg, #2783f6, #1769ed)",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 22px rgba(23, 105, 237, 0.18)",
    },
  };

  return (
    <div style={S.page} className="product-page product-form-page product-create-page">
      <div className="row g-4">
        <div className="col-12">
          <div className="product-page__breadcrumb">
            <BreadcrumbSection
              title="Adicionar Novo Produto"
              link="/all-product"
            />
          </div>
        </div>

        <div className="col-12">
          <div style={S.formCard} className="product-form-card">
            <div style={S.cardHead} className="product-form-card__header">
              <span className="product-page__eyebrow">CATÁLOGO / NOVO PRODUTO</span>
              <div style={S.cardTitle}>Informações do produto</div>
              <div style={S.cardSub}>
                Preencha os campos abaixo para cadastrar um novo produto
              </div>
            </div>

            <div style={S.cardBody} className="product-form-card__body">
              <form onSubmit={handleSubmit}>
                <div style={S.grid} className="product-form__grid">
                  {/* Nome */}
                  <div style={S.field}>
                    <label style={S.label}>Nome do produto</label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      style={S.input}
                      placeholder="Digite o nome do produto"
                      required
                    />
                  </div>

                  {/* Marca */}
                  <div style={S.field}>
                    <label style={S.label}>Marca</label>
                    <input
                      type="text"
                      name="brand"
                      value={product.brand}
                      onChange={handleChange}
                      style={S.input}
                      placeholder="Marca do produto"
                      required
                    />
                  </div>

                  {/* Quantidade */}
                  <div style={S.field}>
                    <label style={S.label}>Quantidade em estoque</label>
                    <input
                      type="number"
                      name="amount"
                      value={product.amount === 0 ? "" : product.amount}
                      onChange={(e) =>
                        setProduct((prev) => ({
                          ...prev,
                          amount:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                      }
                      style={S.input}
                      min={0}
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Valor */}
                  <div style={S.field}>
                    <label style={S.label}>Valor (R$)</label>
                    <div style={S.prefixWrap}>
                      <span style={S.prefix}>R$</span>
                      <input
                        type="number"
                        name="value"
                        value={product.value === 0 ? "" : product.value}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            value:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          }))
                        }
                        style={S.prefixInput}
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr style={S.divider} />

                <div className="product-form__actions">
                  <button type="submit" style={S.submitBtn}>
                    Adicionar produto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewProductPage;
