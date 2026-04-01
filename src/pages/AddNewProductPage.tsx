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
    cardSub: {
      fontSize: 12,
      color: "#888",
      marginTop: 3,
    },
    cardBody: {
      padding: 20,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: "#888",
    },
    input: {
      border: "0.5px solid #d0d0d0",
      borderRadius: 8,
      padding: "9px 12px",
      fontSize: 13,
      color: "#1a1a1a",
      background: "#fff",
      outline: "none",
      width: "100%",
    },
    prefixWrap: {
      display: "flex",
      alignItems: "center",
      border: "0.5px solid #d0d0d0",
      borderRadius: 8,
      overflow: "hidden",
      background: "#fff",
    },
    prefix: {
      padding: "9px 12px",
      fontSize: 13,
      color: "#888",
      background: "#f8f9fa",
      borderRight: "0.5px solid #e0e0e0",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    },
    prefixInput: {
      border: "none",
      outline: "none",
      padding: "9px 12px",
      fontSize: 13,
      color: "#1a1a1a",
      background: "transparent",
      width: "100%",
    },
    divider: {
      border: "none",
      borderTop: "0.5px solid #e0e0e0",
      margin: "20px 0 16px",
    },
    submitBtn: {
      width: "100%",
      padding: "11px",
      borderRadius: 8,
      border: "none",
      background: "#185FA5",
      color: "#E6F1FB",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  return (
    <div style={S.page}>
      <div className="row g-4">
        <div className="col-12">
          <BreadcrumbSection
            title="Adicionar Novo Produto"
            link="/all-product"
          />
        </div>

        <div className="col-12">
          <div style={S.formCard}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Informações do produto</div>
              <div style={S.cardSub}>
                Preencha os campos abaixo para cadastrar um novo produto
              </div>
            </div>

            <div style={S.cardBody}>
              <form onSubmit={handleSubmit}>
                <div style={S.grid}>
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

                <button type="submit" style={S.submitBtn}>
                  Adicionar produto
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewProductPage;
