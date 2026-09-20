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

type ClientSearchData = {
  id: number;
  name: string;
  cpf: string;
  phone?: string;
};

type ChargingItem = {
  id: number;
  productId: number;
  chargingId: number;
  quantity: number;
  nameProduct: string;
  brand: string;
  priceProduct: number;
  status: number;
};

type Charging = {
  id: number;
  chargingDate: string;
  userName: string;
  description: string;
  data: string;
  chargingItems: ChargingItem[];
};

const BRAZIL_STATES = [
  // { value: "", label: "SELECIONE" },
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

const normalizeState = (value: string | null | undefined): string => {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();

  const state = BRAZIL_STATES.find(
    (item) =>
      item.value.toLowerCase() === normalized ||
      item.label.toLowerCase() === normalized,
  );

  return state?.value ?? "";
};

const STORE_AND_APPROVE_ENDPOINT = "/sale/store-and-approve";
const PRODUCTS_ENDPOINT = "/charging/all";
const CPF_VALIDATOR = "/cpf/validar";
const CLIENT_SEARCH_ENDPOINT = "/client/search";

const S: Record<string, React.CSSProperties> = {
  page: { padding: "0 4px" },

  card: {
    background: "var(--rtc-card-bg, #fff)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },

  cardHead: {
    padding: "14px 18px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--rtc-text, #1a1a1a)",
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
    color: "var(--rtc-muted, #888)",
  },

  input: {
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--rtc-text, #1a1a1a)",
    background: "var(--rtc-card-bg, #fff)",
    outline: "none",
    width: "100%",
  },

  select: {
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--rtc-text, #1a1a1a)",
    background: "var(--rtc-card-bg, #fff)",
    outline: "none",
    width: "100%",
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--rtc-card-bg, #fff)",
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
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
    color: "var(--rtc-text, #1a1a1a)",
    width: "100%",
  },

  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--rtc-soft-muted, #aaa)",
    fontSize: 14,
    padding: 0,
    flexShrink: 0,
  },

  hint: {
    fontSize: 12,
    color: "var(--rtc-soft-muted, #aaa)",
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
    color: "var(--rtc-muted, #888)",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
    whiteSpace: "nowrap" as const,
  },

  thRight: {
    textAlign: "right" as const,
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--rtc-muted, #888)",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
  },

  td: {
    padding: "9px 12px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    color: "var(--rtc-text, #1a1a1a)",
    verticalAlign: "middle" as const,
  },

  tdRight: {
    padding: "9px 12px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    color: "var(--rtc-text, #1a1a1a)",
    verticalAlign: "middle" as const,
    textAlign: "right" as const,
  },

  tdEmpty: {
    padding: "24px 0",
    textAlign: "center" as const,
    color: "var(--rtc-soft-muted, #aaa)",
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
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
    borderRadius: 6,
    padding: "5px 8px",
    fontSize: 13,
    width: 80,
    background: "var(--rtc-card-bg, #fff)",
    color: "var(--rtc-text, #1a1a1a)",
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
    background: "var(--rtc-panel-bg, #f8f9fa)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 10,
    padding: "12px 16px",
  },

  summaryLabel: {
    fontSize: 11,
    color: "var(--rtc-muted, #888)",
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--rtc-text, #1a1a1a)",
  },

  gridClient: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    alignItems: "start",
  },
};

const getSaveBtn = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: disabled ? "var(--rtc-disabled-bg, #f1f1f1)" : "#185FA5",
  color: disabled ? "var(--rtc-soft-muted, #aaa)" : "#E6F1FB",
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
  const [products, setProducts] = useState<ChargingItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [saleDate, setSaleDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [installments, setInstallments] = useState(1);
  const [cashPaid, setCashPaid] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientSearchData[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [cpfError, setCpfError] = useState("");

  const [client, setClient] = useState<ClientForm>({
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

  const isFormValid = useMemo(() => {
    const clientIsValid =
      selectedClientId !== null ||
      (client.name.trim() !== "" &&
        client.cpf.replace(/\D/g, "").length === 11 &&
        client.phone.replace(/\D/g, "").length > 0 &&
        client.address.zipCode.replace(/\D/g, "").length === 8 &&
        client.address.state.trim() !== "" &&
        client.address.city.trim() !== "" &&
        client.address.street.trim() !== "" &&
        client.address.number.trim() !== "" &&
        client.address.complement.trim() !== "");

    const productsAreValid =
      selectedProducts.length > 0 &&
      selectedProducts.every(
        (product) => product.productId > 0 && Number(product.quantity) > 0,
      );

    const paymentIsValid = paymentMethod.trim() !== "";

    return clientIsValid && productsAreValid && paymentIsValid;
  }, [selectedClientId, client, selectedProducts, paymentMethod]);

  const fetchProducts = async (name = searchName) => {
    try {
      setLoadingProducts(true);

      const response = await api.get<PageResponse<Charging>>(
        PRODUCTS_ENDPOINT,
        {
          params: {
            page: 0,
            size: 4,
            name: name?.trim() ? name.trim() : undefined,
          },
        },
      );

      if (response.status === 200) {
        const chargingItems = response.data.content.flatMap(
          (charging) => charging.chargingItems ?? [],
        );

        setProducts(chargingItems);
      } else {
        alert("Erro ao carregar produtos");
      }
    } catch (error: any) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoadingProducts(false);
    }
  };

  // useEffect(() => {
  //   fetchProducts("");
  // }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(searchName);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchName]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchClients(clientSearch);
    }, 400);

    return () => clearTimeout(timeout);
  }, [clientSearch]);

  const handleSelectClient = (selectedClient: ClientSearchData) => {
    setSelectedClientId(selectedClient.id);

    setClientSearch(`${selectedClient.name} - ${selectedClient.cpf}`);

    setClient((prev) => ({
      ...prev,
      name: selectedClient.name,
      cpf: selectedClient.cpf,
      phone: selectedClient.phone ?? "",
    }));

    setCpfError("");
    setClientResults([]);
  };

  const clearSelectedClient = () => {
    setSelectedClientId(null);
    setClientSearch("");
    setClientResults([]);

    setClient({
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

    setCpfError("");
  };

  const handleClientChange = (field: keyof ClientForm, value: string) => {
    setSelectedClientId(null);

    setClient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    field: keyof ClientForm["address"],
    value: string,
  ) =>
    setClient((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const getProductValue = (product: ChargingItem) =>
    Number(product.priceProduct ?? 0);

  const getProductName = (product: ChargingItem) =>
    product.nameProduct ?? `Produto ${product.productId}`;

  const getProductQuantity = (product: ChargingItem) =>
    Number(product.quantity ?? 0);

  const handleAddProduct = (product: ChargingItem) => {
    const productId = Number(product.productId);

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

  async function validateCpf(cpf: string): Promise<boolean> {
    const cleanCpf = cpf.replace(/\D/g, "");

    setCpfError("");

    if (!cleanCpf) {
      setCpfError("CPF é obrigatório.");
      return false;
    }

    if (cleanCpf.length !== 11) {
      setCpfError("CPF deve ter 11 dígitos.");
      return false;
    }

    try {
      const response = await api.get<boolean>(`${CPF_VALIDATOR}/${cleanCpf}`);

      const isValid = response.data;

      if (!isValid) {
        setCpfError("CPF inválido.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao validar CPF:", error);
      setCpfError("Verificar CPF digitado.");
      return false;
    }
  }

  const getLocalDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const effectiveSaleDate = useCurrentDate
    ? getLocalDate()
    : saleDate;

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!selectedClientId) {
      const cpfIsValid = await validateCpf(client.cpf);

      if (!cpfIsValid) {
        return;
      }
    }
    
    const payload = {
      preSale: {
        uuidPreSale: crypto.randomUUID(),

        // A pré-venda deve possuir a mesma data efetiva da venda.
        preSaleDate: effectiveSaleDate,

        sellerId: Number(3),
        chargingId: Number(1),
        clientId: selectedClientId,

        client: selectedClientId
          ? null
          : {
            ...client,
            cpf: client.cpf.replace(/\D/g, ""),
          },

        products: selectedProducts.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },

      paymentMethod,
      installments: Number(installments),
      cashPaid: Number(cashPaid),

      // null mantém no backend o comportamento de utilizar a data atual.
      saleDate: useCurrentDate ? null : saleDate,

      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    try {
      setSaving(true);

      const response = await api.post(STORE_AND_APPROVE_ENDPOINT, payload);

      if (response.status === 200 || response.status === 201) {
        alert("Venda cadastrada com sucesso!");

        setSelectedClientId(null);
        setClientSearch("");
        setClientResults([]);

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

    handleAddressChange("zipCode", maskZipCode(zipCode));

    if (zipCode.length !== 8) return;

    try {
      const response = await api.get(`/cep/${zipCode}`);
      const data = response.data;

      setClient((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          zipCode: maskZipCode(zipCode),
          street: data.street ?? data.logradouro ?? prev.address.street,
          city: data.city ?? data.localidade ?? prev.address.city,

          state: normalizeState(data.state || data.uf),

          complement:
            data.complement ??
            data.complemento ??
            prev.address.complement,
        },
      }));
    } catch (error) {
      console.error(error);
      alert("CEP não encontrado ou erro ao buscar CEP");
    }
  };

  const brl = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fetchClients = async (search: string) => {
    const value = search.trim();

    if (value.length < 3) {
      setClientResults([]);
      return;
    }

    try {
      setLoadingClients(true);

      const response = await api.get<ClientSearchData[]>(
        CLIENT_SEARCH_ENDPOINT,
        {
          params: {
            search: value,
          },
        },
      );

      setClientResults(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClientResults([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const maskCpf = (value: string) => {
    const numbers = onlyNumbers(value).slice(0, 11);

    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const maskPhone = (value: string) => {
    const numbers = onlyNumbers(value).slice(0, 11);

    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const maskZipCode = (value: string) => {
    const numbers = onlyNumbers(value).slice(0, 8);

    return numbers.replace(/(\d{5})(\d)/, "$1-$2");
  };

  return (
    <div style={S.page}>
      <div className="row g-4">
        <div className="col-12">
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Dados do cliente</div>
            </div>

            <div style={S.cardBody}>
              <div style={{ marginBottom: 16 }}>
                <div style={S.field}>
                  <label style={S.label}>Buscar cliente cadastrado</label>

                  <div style={{ position: "relative" }}>
                    <div style={S.searchWrap}>
                      <i
                        className="fa-light fa-magnifying-glass"
                        style={{
                          color: "var(--rtc-soft-muted, #aaa)",
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      />

                      <input
                        type="text"
                        style={S.searchInput}
                        placeholder="Digite nome ou CPF do cliente..."
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setSelectedClientId(null);
                        }}
                      />

                      {clientSearch?.trim() && (
                        <button
                          style={S.clearBtn}
                          type="button"
                          onClick={clearSelectedClient}
                          title="Limpar cliente"
                        >
                          <i className="fa-light fa-xmark" />
                        </button>
                      )}
                    </div>

                    {loadingClients && (
                      <div style={S.hint}>Buscando clientes...</div>
                    )}

                    {clientResults.length > 0 && !selectedClientId && (
                      <div
                        style={{
                          position: "absolute",
                          top: 42,
                          left: 0,
                          zIndex: 20,
                          width: "100%",
                          maxWidth: 420,
                          background: "var(--rtc-card-bg, #fff)",
                          border: "0.5px solid var(--rtc-border, #e0e0e0)",
                          borderRadius: 8,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          overflow: "hidden",
                        }}
                      >
                        {clientResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectClient(item)}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              padding: "10px 12px",
                              textAlign: "left",
                              cursor: "pointer",
                              borderBottom:
                                "0.5px solid var(--rtc-border, #e0e0e0)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--rtc-text, #1a1a1a)",
                              }}
                            >
                              {item.name}
                            </div>

                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--rtc-muted, #888)",
                                marginTop: 2,
                              }}
                            >
                              CPF: {item.cpf}
                              {item.phone ? ` • Tel: ${item.phone}` : ""}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedClientId ? (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "#3B6D11",
                        fontWeight: 600,
                      }}
                    >
                      Está venda será associada ao cliente cadastrado!
                    </div>
                  ) : (
                    <div style={S.hint}>
                      Se o cliente já existir, selecione na lista. Se não
                      existir, preencha os dados abaixo.
                    </div>
                  )}
                </div>
              </div>

              <div style={S.gridClient}>
                <div style={S.field}>
                  <label style={S.label}>Nome</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.name}
                    disabled={!!selectedClientId}
                    onChange={(e) => handleClientChange("name", e.target.value)}
                  />
                </div>

                <div style={S.field}>
                  <label style={S.label}>CPF</label>

                  <input
                    style={{
                      ...S.input,
                      borderColor: cpfError ? "#dc2626" : S.input.borderColor,
                    }}
                    type="text"
                    value={client.cpf}
                    required={!selectedClientId}
                    disabled={!!selectedClientId}
                    maxLength={14}
                    onChange={(e) => {
                      handleClientChange("cpf", maskCpf(e.target.value));
                      setCpfError("");
                    }}
                  />

                  {cpfError && !selectedClientId && (
                    <small style={{ color: "#dc2626", marginTop: 4 }}>
                      {cpfError}
                    </small>
                  )}
                </div>

                <div style={S.field}>
                  <label style={S.label}>Telefone</label>
                  <input
                    style={S.input}
                    type="text"
                    value={client.phone}
                    disabled={!!selectedClientId}
                    onChange={(e) =>
                      handleClientChange("phone", maskPhone(e.target.value))
                    }
                  />
                </div>
              </div>

              {!selectedClientId && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  <div style={S.field}>
                    <label style={S.label}>CEP</label>
                    <input
                      style={S.input}
                      type="text"
                      placeholder="Digite o CEP"
                      maxLength={9}
                      value={client.address.zipCode}
                      onChange={(e) => handleZipCodeChange(maskZipCode(e.target.value))}
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
                      <option value="" disabled>
                        SELECIONE
                      </option>

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
              )}
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
                    style={{
                      color: "var(--rtc-soft-muted, #aaa)",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
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
                                  (td) =>
                                  (td.style.background =
                                    "var(--rtc-hover-bg, #f8f9fa)"),
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
                            .forEach(
                              (td) =>
                              (td.style.background =
                                "var(--rtc-hover-bg, #f8f9fa)"),
                            )
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
                {/* Data da venda */}
                <div style={S.field}>
                  <label style={S.label}>Data da venda</label>

                  <input
                    style={S.input}
                    type="date"
                    value={useCurrentDate ? "" : saleDate}
                    disabled={useCurrentDate}
                    required={!useCurrentDate}
                    max={new Date().toISOString().substring(0, 10)}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={useCurrentDate}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setUseCurrentDate(checked);

                        if (checked) {
                          setSaleDate("");
                        }
                      }}
                    />

                    Usar data atual
                  </label>
                </div>

                {/* Forma de pagamento */}
                <div style={S.field}>
                  <label style={S.label}>Forma de pagamento</label>

                  <select
                    style={S.select}
                    value={paymentMethod}
                    required
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="" disabled>
                      SELECIONE
                    </option>

                    <option value="CASH">Dinheiro</option>
                    <option value="PARCEL">Parcelado</option>
                    <option value="CREDIT">Cartão de crédito</option>
                    <option value="DEBIT">Cartão de débito</option>
                    <option value="PIX">Pix</option>
                  </select>
                </div>

                {/* Parcelas */}
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

                {/* Valor pago */}
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
                  style={getSaveBtn(
                    saving ||
                    !isFormValid ||
                    (!useCurrentDate && !saleDate)
                  )}
                  type="button"
                  disabled={
                    saving ||
                    !isFormValid ||
                    (!useCurrentDate && !saleDate)
                  }
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
