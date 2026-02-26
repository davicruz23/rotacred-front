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
  2: "GARANTIA",
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
  const [statusFilter, setStatusFilter] = useState<number>(0);

  const fetchReturns = async (status?: number) => {
    try {
      let url = "sale-return/sale-returns";

      const params: string[] = [];

      if (status && status !== 0) { 
        params.push(`status=${status}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await api.get(url);
      setReturns(response.data);
    } catch (error) {
      console.error("Erro ao buscar devoluções:", error);
    }
  };

  useEffect(() => {
    fetchReturns(statusFilter);
  }, [statusFilter]);

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection
        title="Devoluções de Vendas"
        link="/inicio"
      />

      <div className="card p-4 shadow-sm">
        <h3 className="mb-4">Lista de Devoluções</h3>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Filtrar por status
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
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-light">
              <tr>
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
                  <td colSpan={7} className="text-center text-muted">
                    Nenhuma devolução encontrada.
                  </td>
                </tr>
              )}

              {returns.map((r) => (
                <tr key={r.saleReturnId}>
                  <td>{r.saleDTO.clientName}</td>
                  <td>{r.productNameReturned}</td>
                  <td>{r.quantityReturned}</td>
                  <td>
                    <span className={`badge bg-${statusColor[r.saleStatus] || "secondary"}`}>
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
      </div>
    </div>
  );
};

export default ListReturnSalesStatus;