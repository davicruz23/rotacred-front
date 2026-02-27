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

  return (
    <div className="table table-dashed table-hover digi-dataTable all-product-table">
      <div className="col-12">
        <div className="panel">

          <div className="panel-header px-3 pt-3">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-6">
                <div className="input-group" style={{ width: "420px" }}>
                  <span className="input-group-text">
                    <i className="fa-light fa-magnifying-glass"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar por nome do produto..."
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
              </div>

              <div className="col-12 col-md-6 text-md-end">
                <small className="text-muted">
                  {searchName?.trim()
                    ? `Filtrando por: "${searchName}"`
                    : "Digite algo para pesquisar"}
                </small>
              </div>
            </div>
          </div>

          <div className="panel-body">
            <div className="accordion" id="chargingAccordion">
              <div className="accordion-item bg-transparent border-0 mb-3">
                <h2 className="accordion-header" id="headingCharging">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseCharging"
                    aria-expanded="true"
                    aria-controls="collapseCharging"
                  >
                    <span className="text-black">CARREGAMENTO ATUAL</span>
                  </button>
                </h2>

                <div
                  id="collapseCharging"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingCharging"
                  // data-bs-parent="#chargingAccordion"
                >
                  <div className="accordion-body">
                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table className="table table-striped text-white">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>NOME</th>
                                <th>EM ESTOQUE</th>
                                <th>Preço</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chargingList.map((charging) =>
                                [...charging.chargingItems]
                                  .sort((a, b) => a.id - b.id)
                                  .map((item) => (
                                    <tr key={item.id}>
                                      <td>{item.productId}</td>
                                      <td>{item.nameProduct}</td>
                                      <td>{item.quantity}</td>
                                      <td>R$ {item.priceProduct.toFixed(2)}</td>
                                      <td>{ProductStatusLabel[item.status]}</td>
                                    </tr>
                                  )),
                              )}
                            </tbody>
                          </table>
                        </div>

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
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="accordion-item bg-transparent border-0">
                <h2 className="accordion-header" id="headingProducts">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseProducts"
                    aria-expanded="false"
                    aria-controls="collapseProducts"
                  >
                    <span className="text-black">
                      PRODUTOS DO ESTOQUE ({totalElements})
                    </span>
                  </button>
                </h2>

                <div
                  id="collapseProducts"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingProducts"
                  // data-bs-parent="#chargingAccordion"
                >
                  <div className="accordion-body">
                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table className="table table-striped text-white">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Em Estoque</th>
                                <th>Preço</th>
                                <th>Status</th>
                                <th>Quantidade</th>
                                <th>Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dataList.map((product) => (
                                <tr key={product.id}>
                                  <td>{product.id}</td>
                                  <td>{product.name}</td>
                                  <td>{product.amount}</td>
                                  <td>R$ {product.value}</td>
                                  <td>{ProductStatusLabel[product.status]}</td>
                                  <td>
                                    <input
                                      type="number"
                                      min="0"
                                      className="form-control"
                                      value={quantities[product.id] || 0}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                      style={{ width: "100px" }}
                                    />
                                  </td>
                                  <td>
                                    <div className="btn-box">
                                      <button
                                        title="Editar"
                                        onClick={() =>
                                          navigate(
                                            `/update-product/${product.id}`,
                                          )
                                        }
                                      >
                                        <i className="fa-light fa-pen"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <TableBottomControls
                            indexOfFirstData={indexOfFirstData}
                            indexOfLastData={indexOfLastData}
                            dataList={dataList}
                            currentPage={currentPage + 1}
                            totalPages={totalPages}
                            paginate={paginate}
                            pageNumbers={pageNumbers}
                          />
                        </div>

                        <div className="text-end p-3">
                          <button
                            className="btn btn-primary"
                            onClick={handleSendCharging}
                          >
                            Enviar Carregamento
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChargingPage;
