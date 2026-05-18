import { useEffect, useState } from "react";
import TableBottomControls from "../components/utils/TableBottomControls";
import api from "../services/api";

type ProductType = {
  id: number;
  nameProduct: string;
  quantity: number;
  price: number;
};

type InstallmentType = {
  id: number;
  dueDate: string;
  amount: number;
};

type SaleType = {
  id: number;
  saleDate: string;
  paymentType: string;
  clientName: string;
  products: ProductType[];
  installments: InstallmentType[];
  nparcel: number;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

enum SaleStatusFilter {
  TODOS = 0,
  ATIVOS = 1,
  DEFEITO_PRODUTO = 2,
  DEVOLVIDO_CLIENTE = 3,
  DESISTENCIA = 4,
  REAVIDO = 5,
  DANIFICADO = 6,
  FINALIZADO = 7,
}

const SalesListPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [dataPerPage] = useState(5);

  const [dataList, setDataList] = useState<SaleType[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [clientName, setClientName] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("");
  const [saleDate, setSaleDate] = useState("");

  const fetchSales = async (
    page = 0,
    filters = { clientName, cpf, status, saleDate },
  ) => {
    try {
      setLoading(true);

      const response = await api.get<PageResponse<SaleType>>("/sale/all", {
        params: {
          page,
          size: dataPerPage,
          clientName: filters.clientName.trim() || undefined,
          cpf: filters.cpf.trim() || undefined,
          status: filters.status.trim() || undefined,
          saleDate: filters.saleDate || undefined,
        },
      });

      setDataList(response.data.content);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error: any) {
      console.error(error);
      alert("Erro ao carregar vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(0);
  }, []);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchSales(0);
  };

  const handleClearFilters = () => {
    setClientName("");
    setCpf("");
    setStatus("");
    setSaleDate("");
    setCurrentPage(0);

    fetchSales(0, {
      clientName: "",
      cpf: "",
      status: "ATIVOS",
      saleDate: "",
    });
  };

  const paginate = (pageNumber: number) => {
    const pageIndex = pageNumber - 1;
    setCurrentPage(pageIndex);
    fetchSales(pageIndex);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const indexOfFirstData = currentPage * dataPerPage;
  const indexOfLastData = indexOfFirstData + dataList.length;

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="panel">
          <div className="panel-body">
            <div className="product-table-quantity">
              <ul>
                <li className="text-white">Todas Vendas ({totalElements})</li>
              </ul>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value={SaleStatusFilter.TODOS}>TODOS</option>
                  <option value={SaleStatusFilter.ATIVOS}>ATIVOS</option>
                  <option value={SaleStatusFilter.REAVIDO}>RECUPERADOS</option>
                  <option value={SaleStatusFilter.DESISTENCIA}>
                    DESISTÊNCIAS
                  </option>
                  <option value={SaleStatusFilter.DEFEITO_PRODUTO}>
                    DEFEITO NO PRODUTO
                  </option>
                  <option value={SaleStatusFilter.DEVOLVIDO_CLIENTE}>
                    DEVOLVIDO PELO CLIENTE
                  </option>
                  <option value={SaleStatusFilter.DANIFICADO}>
                    DANIFICADO
                  </option>
                  <option value={SaleStatusFilter.FINALIZADO}>
                    FINALIZADO
                  </option>
                </select>
              </div>

              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome do cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>

              <div className="col-md-2 d-flex gap-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSearch}
                >
                  Filtrar
                </button>

                <button
                  className="btn btn-secondary w-100"
                  onClick={handleClearFilters}
                >
                  Limpar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Data da Venda</th>
                      <th>Tipo de Pagamento</th>
                      <th>Total</th>
                      <th>Primeira Parcela</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataList.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.id}</td>
                        <td>{sale.clientName}</td>
                        <td>{sale.saleDate}</td>
                        <td>{sale.paymentType}</td>

                        <td>
                          R${" "}
                          {sale.products
                            .reduce(
                              (total, product) =>
                                total + product.quantity * product.price,
                              0,
                            )
                            .toFixed(2)}
                        </td>

                        <td>
                          {sale.installments
                            .filter((installment) => installment.amount > 0)
                            .slice(0, 1)
                            .map((installment) => (
                              <span key={installment.id}>
                                {installment.dueDate}
                              </span>
                            ))}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesListPage;
