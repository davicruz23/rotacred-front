import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type SaleReturnType = {
  saleReturnId: number;
  returnDate: string;
  saleStatus: number;
  productNameReturned: string;
  quantityReturned: number;
  saleDTO: {
    saleDate: string;
    clientName: string;
  };
};

enum ReturnStatus {
  DEVOLVIDO_CLIENTE = 3,
  DANIFICADO = 6,
}

const UpdateSaleReturn = () => {
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCpf, setSearchCpf] = useState("");

  const [sales, setSales] = useState<SaleReturnType[]>([]);
  const [loading, setLoading] = useState(false);

  const [pendingStatus, setPendingStatus] = useState<{
    [key: number]: number | undefined;
  }>({});

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);

      const response = await api.get("/sale-return/status/end", {
        params: {
          id: searchId ? Number(searchId) : undefined,
          name: searchName || undefined,
          cpf: searchCpf || undefined,
        },
      });

      setSales(response.data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    saleReturnId: number,
    newStatus: number,
  ) => {
    try {
      await api.patch(`/sale-return/${saleReturnId}/update/status`, {
        status: newStatus,
      });

      setSales((prev) =>
        prev.map((sale) =>
          sale.saleReturnId === saleReturnId
            ? { ...sale, saleStatus: newStatus }
            : sale,
        ),
      );

      setPendingStatus((prev) => {
        const updated = { ...prev };
        delete updated[saleReturnId];
        return updated;
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error?.response?.data);
    }
  };

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection title="Atualizar Status de Produtos em Garantia" link="/inicio" />

      {/* 🔎 FILTROS */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">N° VENDA</label>
              <input
                type="number"
                className="form-control"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small">NOME DO CLIENTE</label>
              <input
                type="text"
                className="form-control"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small">CPF</label>
              <input
                type="text"
                className="form-control"
                value={searchCpf}
                onChange={(e) => setSearchCpf(e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={fetchSales}>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 LISTA */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">Carregando...</div>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>N° VENDA</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Data</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.saleReturnId}>
                    <td>{sale.saleReturnId}</td>
                    <td>{sale.saleDTO.clientName}</td>
                    <td>{sale.productNameReturned}</td>
                    <td>{sale.quantityReturned}</td>
                    <td>{sale.returnDate}</td>

                    <td className="text-end d-flex gap-2 justify-content-end align-items-center">
                      {/* 🔹 STATUS ATUAL */}
                      <span className="badge bg-secondary">
                        {ReturnStatus[sale.saleStatus]}
                      </span>

                      {/* 🔹 SELECT NOVO STATUS */}
                      <select
                        className="form-select form-select-sm w-auto"
                        value={pendingStatus[sale.saleReturnId] ?? ""}
                        onChange={(e) =>
                          setPendingStatus((prev) => ({
                            ...prev,
                            [sale.saleReturnId]:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          }))
                        }
                      >
                        <option value="">SELECIONE</option>

                        {Object.entries(ReturnStatus)
                          .filter(([key]) => isNaN(Number(key)))
                          .map(([key, value]) => (
                            <option
                              key={value}
                              value={value}
                              disabled={value === sale.saleStatus}
                            >
                              {key.replace("_", " ")}
                            </option>
                          ))}
                      </select>

                      {/* 🔹 BOTÃO */}
                      <button
                        className="btn btn-sm btn-success"
                        disabled={
                          pendingStatus[sale.saleReturnId] === undefined
                        }
                        onClick={() =>
                          handleStatusChange(
                            sale.saleReturnId,
                            pendingStatus[sale.saleReturnId]!,
                          )
                        }
                      >
                        Atualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateSaleReturn;
