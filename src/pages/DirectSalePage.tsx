import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { AllProductDataType } from "../types";

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type SelectedProduct = {
  productId: number;
  name: string;
  quantity: number;
  value: number;
};

type ClientForm = {
  name: string;
  cpf: string;
  phone: string;
  address: {
    state: string;
    city: string;
    street: string;
    number: string;
    zipCode: string;
    complement: string;
  };
};

const BRAZIL_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const STORE_AND_APPROVE_ENDPOINT = "/sale/store-and-approve";
const PRODUCTS_ENDPOINT = "/product/all";


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
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
  },

  cardBody: { padding: 18 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
  },

  field: { display: "flex", flexDirection: "column" as const, gap: 5 },

  label: {
    fontSize: 11,
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

  select: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    width: "100%",
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "0.5px solid #d0d0d0",
    borderRadius: 8,
    padding: "0 12px",
    height: 38,
    maxWidth: 420,
    width: "100%",
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    color: "#1a1a1a",
    width: "100%",
  },

  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: 14,
    padding: 0,
    flexShrink: 0,
  },

  hint: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
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
  },

  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#1a1a1a",
    verticalAlign: "middle" as const,
  },

  tdRight: {
    padding: "9px 12px",
    borderBottom: "0.5px solid #e0e0e0",
    color: "#1a1a1a",
    verticalAlign: "middle" as const,
    textAlign: "right" as const,
  },

  tdEmpty: {
    padding: "24px 0",
    textAlign: "center" as const,
    color: "#aaa",
    fontSize: 13,
  },

  addBtn: {
    border: "0.5px solid #B5D4F4",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#185FA5",
    background: "#E6F1FB",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },

  removeBtn: {
    border: "0.5px solid #F7C1C1",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 12,
    color: "#A32D2D",
    background: "#FCEBEB",
    cursor: "pointer",
  },

  qtyInput: {
    border: "0.5px solid #d0d0d0",
    borderRadius: 6,
    padding: "5px 8px",
    fontSize: 13,
    width: 80,
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
  },

  spinnerWrap: {
    textAlign: "center" as const,
    padding: "24px 0",
  },

  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginTop: 4,
    alignItems: "center",
  },

  summaryCard: {
    background: "#f8f9fa",
    border: "0.5px solid #e0e0e0",
    borderRadius: 10,
    padding: "12px 16px",
  },

  summaryLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
  },
};

const getSaveBtn = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: disabled ? "#f1f1f1" : "#185FA5",
  color: disabled ? "#aaa" : "#E6F1FB",
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});


const DirectSalePage = () => {
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [products, setProducts] = useState<AllProductDataType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  const [paymentMethod, setPaymentMethod] = useState("PARCEL");
  const [installments, setInstallments] = useState(1);
  const [cashPaid, setCashPaid] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [client, setClient] = useState<ClientForm>({
    name: "",
    cpf: "",
    phone: "",
    address: {
      state: "PB",
      city: "",
      street: "",
      number: "",
      zipCode: "",
      complement: "",
    },
  });

  const totalSale = useMemo(
    () =>
      selectedProducts.reduce(
        (total, item) => total + item.value * item.quantity,
        0,
      ),
    [selectedProducts],
  );

  const remainingValue = useMemo(
    () => Math.max(totalSale - Number(cashPaid || 0), 0),
    [totalSale, cashPaid],
  );

  const fetchProducts = async (name = searchName) => {
    try {
      setLoadingProducts(true);
      const response = await api.get<PageResponse<AllProductDataType>>(
        PRODUCTS_ENDPOINT,
        {
          params: {
            page: 0,
            size: 4,
            name: name?.trim() ? name.trim() : undefined,
          },
        },
      );
      if (response.status === 200) setProducts(response.data.content);
      else alert("Erro ao carregar produtos");
    } catch (error: any) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts("");
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(searchName);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchName]);

  const handleClientChange = (field: keyof ClientForm, value: string) =>
    setClient((prev) => ({ ...prev, [field]: value }));

  const handleAddressChange = (
    field: keyof ClientForm["address"],
    value: string,
  ) =>
    setClient((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const getProductValue = (product: any) =>
    Number(product.value ?? product.price ?? product.saleValue ?? 0);

  const getProductName = (product: any) =>
    product.name ?? product.description ?? `Produto ${product.id}`;

  const getProductQuantity = (product: any) =>
    product.amount ?? product.amount ?? `Produto ${product.id}`;

  const handleAddProduct = (product: AllProductDataType) => {
    const productId = Number((product as any).id);
    if (!productId) {
      alert("Produto sem ID válido");
      return;
    }
    const alreadyExists = selectedProducts.some(
      (item) => item.productId === productId,
    );
    if (alreadyExists) {
      setSelectedProducts((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      return;
    }
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId,
        name: getProductName(product),
        quantity: 1,
        value: getProductValue(product),
      },
    ]);
  };

  const handleChangeQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleRemoveProduct = (productId: number) =>
    setSelectedProducts((prev) =>
      prev.filter((item) => item.productId !== productId),
    );

  const handleSubmit = async () => {
    if (!client.name.trim()) {
      alert("Informe o nome do cliente");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Adicione pelo menos um produto");
      return;
    }

    const payload = {
      preSale: {
        uuidPreSale: crypto.randomUUID(),
        preSaleDate: new Date().toISOString().substring(0, 10),
        sellerId: Number(3),
        chargingId: Number(1),
        client,
        products: selectedProducts.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      paymentMethod,
      installments: Number(installments),
      cashPaid: Number(cashPaid),
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    try {
      setSaving(true);
      const response = await api.post(STORE_AND_APPROVE_ENDPOINT, payload);
      if (response.status === 200 || response.status === 201) {
        alert("Venda cadastrada com sucesso!");
        setClient({
          name: "",
          cpf: "",
          phone: "",
          address: {
            state: "",
            city: "",
            street: "",
            number: "",
            zipCode: "",
            complement: "",
          },
        });
        setPaymentMethod("PARCEL");
        setInstallments(1);
        setCashPaid(0);
        setLatitude(0);
        setLongitude(0);
        setSelectedProducts([]);
        setSearchName("");
      } else {
        alert("Erro ao cadastrar venda");
      }
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          "Erro ao conectar com o servidor ao cadastrar venda",
      );
    } finally {
      setSaving(false);
    }
  };

  const onlyNumbers = (value: string) => value.replace(/\D/g, "");

  const handleZipCodeChange = async (value: string) => {
    const zipCode = onlyNumbers(value);
    handleAddressChange("zipCode", zipCode);
    if (zipCode.length !== 8) return;
    try {
      const response = await api.get(`/cep/${zipCode}`);
      const data = response.data;
      setClient((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          zipCode,
          street: data.street ?? data.logradouro ?? prev.address.street,
          city: data.city ?? data.localidade ?? prev.address.city,
          state: data.state ?? data.uf ?? prev.address.state ?? "PB",
          complement:
            data.complement ?? data.complemento ?? prev.address.complement,
        },
      }));
    } catch (error) {
      console.error(error);
      alert("CEP não encontrado ou erro ao buscar CEP");
    }
  };

  const brl = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={S.page}>
      <div className="row g-4">
        <div className="col-12">
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Dados do cliente</div>
            </div>
            <div style={S.cardBody}>
              <div style={S.grid2}>
                <div style={S.field}>
                  <label style={S.label}>Nome</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.name}
                    onChange={(e) => handleClientChange("name", e.target.value)}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>CPF</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.cpf}
                    onChange={(e) => handleClientChange("cpf", e.target.value)}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Telefone</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.phone}
                    onChange={(e) =>
                      handleClientChange("phone", e.target.value)
                    }
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>CEP</label>
                  <input
                    style={S.input}
                    type="text"
                    placeholder="Digite o CEP"
                    maxLength={8}
                    value={client.address.zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Estado</label>
                  <select
                    style={S.select}
                    value={client.address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                  >
                    {BRAZIL_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Cidade</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Número</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.address.number}
                    onChange={(e) =>
                      handleAddressChange("number", e.target.value)
                    }
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Rua</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Complemento</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.address.complement}
                    onChange={(e) =>
                      handleAddressChange("complement", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Produtos da venda</div>
            </div>
            <div style={S.cardBody}>
              <div style={{ marginBottom: 14 }}>
                <div style={S.searchWrap}>
                  <i
                    className="fa-light fa-magnifying-glass"
                    style={{ color: "#aaa", fontSize: 14, flexShrink: 0 }}
                  />
                  <input
                    type="text"
                    style={S.searchInput}
                    placeholder="Pesquisar produto..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                  {searchName?.trim() && (
                    <button
                      style={S.clearBtn}
                      type="button"
                      onClick={() => setSearchName("")}
                      title="Limpar"
                    >
                      <i className="fa-light fa-xmark" />
                    </button>
                  )}
                </div>
                <div style={S.hint}>
                  {searchName?.trim()
                    ? `Filtrando por: "${searchName}"`
                    : "Digite para buscar produtos do banco"}
                </div>
              </div>

              {loadingProducts ? (
                <div style={S.spinnerWrap}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Produto</th>
                        <th style={S.th}>Valor</th>
                        <th style={S.th}>Disponível</th>
                        <th style={S.thRight}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={S.tdEmpty}>
                            Nenhum produto encontrado
                          </td>
                        </tr>
                      ) : (
                        products.map((product: any) => (
                          <tr
                            key={product.id}
                            onMouseEnter={(e) =>
                              (e.currentTarget as HTMLTableRowElement)
                                .querySelectorAll("td")
                                .forEach(
                                  (td) => (td.style.background = "#f8f9fa"),
                                )
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget as HTMLTableRowElement)
                                .querySelectorAll("td")
                                .forEach((td) => (td.style.background = ""))
                            }
                          >
                            <td style={S.td}>{getProductName(product)}</td>
                            <td style={S.td}>
                              {brl(getProductValue(product))}
                            </td>
                            <td style={S.td}>{getProductQuantity(product)}</td>
                            <td style={S.tdRight}>
                              <button
                                style={S.addBtn}
                                type="button"
                                onClick={() => handleAddProduct(product)}
                              >
                                <i
                                  className="fa-light fa-plus"
                                  style={{ marginRight: 4 }}
                                />
                                Adicionar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={S.cardTitle}>Itens selecionados</span>
                {selectedProducts.length > 0 && (
                  <span
                    style={{
                      background: "#E6F1FB",
                      color: "#185FA5",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                    }}
                  >
                    {selectedProducts.length}
                  </span>
                )}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Produto</th>
                    <th style={S.th}>Quantidade</th>
                    <th style={S.th}>Valor unitário</th>
                    <th style={S.th}>Total</th>
                    <th style={S.thRight}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={S.tdEmpty}>
                        Nenhum produto adicionado
                      </td>
                    </tr>
                  ) : (
                    selectedProducts.map((item) => (
                      <tr
                        key={item.productId}
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
                        <td style={S.td}>{item.name}</td>
                        <td style={S.td}>
                          <input
                            type="number"
                            style={S.qtyInput}
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleChangeQuantity(
                                item.productId,
                                Number(e.target.value),
                              )
                            }
                          />
                        </td>
                        <td style={S.td}>{brl(item.value)}</td>
                        <td style={{ ...S.td, fontWeight: 600 }}>
                          {brl(item.value * item.quantity)}
                        </td>
                        <td style={S.tdRight}>
                          <button
                            style={S.removeBtn}
                            type="button"
                            onClick={() => handleRemoveProduct(item.productId)}
                          >
                            <i className="fa-light fa-trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Pagamento</div>
            </div>
            <div style={S.cardBody}>
              <div style={S.grid3}>
                <div style={S.field}>
                  <label style={S.label}>Forma de pagamento</label>
                  <select
                    style={S.select}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">Dinheiro</option>
                    <option value="PARCEL">Parcelado</option>
                    <option value="CREDIT">Cartão de crédito</option>
                    <option value="DEBIT">Cartão de débito</option>
                    <option value="PIX">Pix</option>
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Parcelas</label>
                  <input
                    style={S.input}
                    type="number"
                    min={0}
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Valor pago na hora</label>
                  <input
                    style={S.input}
                    type="number"
                    min={0}
                    step="0.01"
                    value={cashPaid}
                    onChange={(e) => setCashPaid(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ ...S.summaryRow, marginTop: 20 }}>
                <div style={S.summaryCard}>
                  <div style={S.summaryLabel}>Total da venda</div>
                  <div style={S.summaryValue}>{brl(totalSale)}</div>
                </div>
                <div style={S.summaryCard}>
                  <div style={S.summaryLabel}>Valor restante</div>
                  <div
                    style={{
                      ...S.summaryValue,
                      color: remainingValue > 0 ? "#A32D2D" : "#3B6D11",
                    }}
                  >
                    {brl(remainingValue)}
                  </div>
                </div>
                <button
                  style={getSaveBtn(saving)}
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fa-light fa-cart-check" />
                      Cadastrar venda
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectSalePage;
