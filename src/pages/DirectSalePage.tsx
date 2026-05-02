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

const DirectSalePage = () => {
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [products, setProducts] = useState<AllProductDataType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

//   const [sellerId, setSellerId] = useState("");
//   const [chargingId, setChargingId] = useState("");

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

  const totalSale = useMemo(() => {
    return selectedProducts.reduce((total, item) => {
      return total + item.value * item.quantity;
    }, 0);
  }, [selectedProducts]);

  const remainingValue = useMemo(() => {
    return Math.max(totalSale - Number(cashPaid || 0), 0);
  }, [totalSale, cashPaid]);

  const fetchProducts = async (name = searchName) => {
    try {
      setLoadingProducts(true);

      const response = await api.get<PageResponse<AllProductDataType>>(
        PRODUCTS_ENDPOINT,
        {
          params: {
            page: 0,
            size: 1,
            name: name?.trim() ? name.trim() : undefined,
          },
        },
      );

      if (response.status === 200) {
        setProducts(response.data.content);
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

  useEffect(() => {
    fetchProducts("");
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(searchName);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchName]);

  const handleClientChange = (field: keyof ClientForm, value: string) => {
    setClient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    field: keyof ClientForm["address"],
    value: string,
  ) => {
    setClient((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const getProductValue = (product: any) => {
    return Number(product.value ?? product.price ?? product.saleValue ?? 0);
  };

  const getProductName = (product: any) => {
    return product.name ?? product.description ?? `Produto ${product.id}`;
  };

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

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
  };

  const handleSubmit = async () => {
    // if (!sellerId) {
    //   alert("Informe o vendedor");
    //   return;
    // }

    // if (!chargingId) {
    //   alert("Informe o carregamento");
    //   return;
    // }

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

        // setSellerId("");
        // setChargingId("");
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

  const onlyNumbers = (value: string) => {
    return value.replace(/\D/g, "");
  };

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

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="panel">
          <div className="panel-body">
            <div className="product-table-quantity">
              <ul>
                <li className="text-white">Cadastrar Venda</li>
              </ul>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12">
                <h5 className="mb-3">Dados do cliente</h5>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.name}
                  onChange={(e) => handleClientChange("name", e.target.value)}
                />
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label">CPF</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.cpf}
                  onChange={(e) => handleClientChange("cpf", e.target.value)}
                />
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.phone}
                  onChange={(e) => handleClientChange("phone", e.target.value)}
                />
              </div>

              <div className="col-md-6 col-lg-3">
                <label className="form-label">CEP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Digite o CEP"
                  maxLength={8}
                  value={client.address.zipCode}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                />
              </div>

              <div className="col-md-6 col-lg-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-control"
                  value={client.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                >
                  {BRAZIL_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 col-lg-3">
                <label className="form-label">Cidade</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </div>

              <div className="col-md-6 col-lg-3">
                <label className="form-label">Número</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.address.number}
                  onChange={(e) =>
                    handleAddressChange("number", e.target.value)
                  }
                />
              </div>

              <div className="col-md-6 col-lg-6">
                <label className="form-label">Rua</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.address.street}
                  onChange={(e) =>
                    handleAddressChange("street", e.target.value)
                  }
                />
              </div>

              <div className="col-md-6 col-lg-6">
                <label className="form-label">Complemento</label>
                <input
                  type="text"
                  className="form-control"
                  value={client.address.complement}
                  onChange={(e) =>
                    handleAddressChange("complement", e.target.value)
                  }
                />
              </div>
            </div>

            <hr />

            <div className="row g-3 mb-4">
              <div className="col-12">
                <h5 className="mb-3">Produtos da venda</h5>
              </div>

              <div className="col-12">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div className="input-group" style={{ width: "420px" }}>
                    <span className="input-group-text">
                      <i className="fa-light fa-magnifying-glass"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Pesquisar produto..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />

                    {searchName?.trim() && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearchName("")}
                        title="Limpar"
                      >
                        <i className="fa-light fa-xmark"></i>
                      </button>
                    )}
                  </div>

                  <small className="text-muted">
                    {searchName?.trim()
                      ? `Filtrando por: "${searchName}"`
                      : "Digite para buscar produtos do banco"}
                  </small>
                </div>
              </div>

              <div className="col-12">
                {loadingProducts ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dashed table-hover">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Valor</th>
                          <th className="text-end">Ação</th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className="text-center text-muted py-4"
                            >
                              Nenhum produto encontrado
                            </td>
                          </tr>
                        ) : (
                          products.map((product: any) => (
                            <tr key={product.id}>
                              <td>{getProductName(product)}</td>
                              <td>
                                {getProductValue(product).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  },
                                )}
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleAddProduct(product)}
                                >
                                  <i className="fa-light fa-plus me-1"></i>
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

            <div className="row g-3 mb-4">
              <div className="col-12">
                <h5 className="mb-3">Itens selecionados</h5>
              </div>

              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-dashed table-hover">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th style={{ width: "160px" }}>Quantidade</th>
                        <th>Valor unitário</th>
                        <th>Total</th>
                        <th className="text-end">Ação</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center text-muted py-4"
                          >
                            Nenhum produto adicionado
                          </td>
                        </tr>
                      ) : (
                        selectedProducts.map((item) => (
                          <tr key={item.productId}>
                            <td>{item.name}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
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
                            <td>
                              {item.value.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>
                            <td>
                              {(item.value * item.quantity).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                },
                              )}
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  handleRemoveProduct(item.productId)
                                }
                              >
                                <i className="fa-light fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <hr />

            <div className="row g-3 mb-4">
              <div className="col-12">
                <h5 className="mb-3">Pagamento</h5>
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label">Forma de pagamento</label>
                <select
                  className="form-control"
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

              <div className="col-md-6 col-lg-4">
                <label className="form-label">Parcelas</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                />
              </div>

              <div className="col-md-6 col-lg-4">
                <label className="form-label">Valor pago na hora</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  step="0.01"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">Total da venda</small>
                  <strong className="fs-5">
                    {totalSale.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">Valor restante</small>
                  <strong className="fs-5">
                    {remainingValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  disabled={saving}
                  onClick={handleSubmit}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fa-light fa-cart-check me-2"></i>
                      Cadastrar Venda
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
