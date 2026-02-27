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
  2: "NA GARANTIA",
  3: "DEVOLVIDO",
  4: "DESISTÊNCIA",
  5: "RECUPERADO",
  6: "DANIFICADO",
};

const statusColor: Record<number, string> = {
  4: "warning",
  5: "success",
  6: "danger",
};

const ListReturnSalesStatus = () => {
  const [returns, setReturns] = useState<SaleReturnType[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [searchName, setSearchName] = useState("");
  const [searchCpf, setSearchCpf] = useState("");

  const fetchReturns = async (
    status?: number,
    pageNumber = 0
  ) => {
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
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection
        title="Lista de Ocorrências"
        link="/inicio"
      />

      <div className="card p-4 shadow-sm">
        <h3 className="mb-4">Lista de Ocorrências</h3>

        <div className="row g-3 align-items-end mb-4">

          <div className="col-md-3">
            <label className="form-label fw-semibold">
              Status
            </label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(Number(e.target.value))}
            >
              <option value={ReturnStatusFilter.TODOS}>TODOS</option>
              <option value={ReturnStatusFilter.DEFEITO_PRODUTO}>
                GARANTIA
              </option>
              <option value={ReturnStatusFilter.DESISTENCIA}>
                DESISTÊNCIA
              </option>
              <option value={ReturnStatusFilter.REAVIDO}>
                RECUPERADO
              </option>
              <option value={ReturnStatusFilter.DANIFICADO}>
                DANIFICADO
              </option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Nome</label>
            <input
              type="text"
              className="form-control"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Digite o nome"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">CPF</label>
            <input
              type="text"
              className="form-control"
              value={searchCpf}
              onChange={(e) => setSearchCpf(e.target.value)}
              placeholder="Digite o CPF"
            />
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-primary w-100"
              onClick={() => fetchReturns(statusFilter, 0)}
            >
              Buscar
            </button>
          </div>

        </div>

        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>N° VENDA</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Status</th>
                <th>Data Devolução</th>
                <th>Data Venda</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    Nenhuma Venda encontrada.
                  </td>
                </tr>
              )}

              {returns.map((r) => (
                <tr key={r.saleReturnId}>
                  <td>{r.saleDTO.saleId}</td>
                  <td>{r.saleDTO.clientName}</td>
                  <td>{r.productNameReturned}</td>
                  <td>{r.quantityReturned}</td>
                  <td>
                    <span
                      className={`badge bg-${statusColor[r.saleStatus] || "secondary"
                        }`}
                    >
                      {statusMap[r.saleStatus] || r.saleStatus}
                    </span>
                  </td>
                  <td>{r.returnDate}</td>
                  <td>{r.saleDTO.saleDate}</td>
                  <td>{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO AQUI FORA */}
        <div className="d-flex justify-content-end mt-3">
          <nav>
            <ul className="pagination pagination-sm mb-0 shadow-sm">

              <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => fetchReturns(statusFilter, page - 1)}
                >
                  «
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${page === index ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => fetchReturns(statusFilter, index)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${page + 1 >= totalPages ? "disabled" : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() => fetchReturns(statusFilter, page + 1)}
                >
                  »
                </button>
              </li>

            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ListReturnSalesStatus;