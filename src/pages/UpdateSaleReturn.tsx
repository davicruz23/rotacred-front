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

type SaleSearchType = {
  saleId: number;
  saleDate: string;
  clientName: string;
  cpf: string;
  city: string;
};

type SaleDetailType = {
  saleId: number;
  clientName: string;
  saleDate: string;
  products: {
    productId: number;
    productName: string;
    quantityBought: number;
  }[];
};

enum ReturnStatus {
  ATIVO = 1,
  DEFEITO_PRODUTO = 2,
  DEVOLVIDO_CLIENTE = 3,
  DESISTENCIA = 4,
  REAVIDO = 5,
  DANIFICADO = 6,
}

const UpdateSaleReturn = () => {
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  //const [sales, setSales] = useState<SaleSearchType[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleDetailType | null>(null);
  const [status, setStatus] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [sales, setSales] = useState<SaleReturnType[]>([]);
  const [pendingStatus, setPendingStatus] = useState<{
    [key: number]: number;
  }>({});

  const [items, setItems] = useState<
    { productId: number; quantityReturned: number }[]
  >([]);

  const searchSales = async () => {
    try {
      const response = await api.get("/sale-return/status/end", {
        // params: {
        //   id: searchId ? Number(searchId) : undefined,
        //   name: searchName || undefined,
        //   cpf: searchCpf || undefined,
        //   city: searchCity || undefined,
        // },
      });

      setSales(response.data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  const handleStatusChange = async (
    saleReturnId: number,
    newStatus: number
  ) => {
    try {
      await api.patch(
        `/sale-return/${saleReturnId}/update/status`,
        {
          status: newStatus,
        }
      );

      setSales((prev) =>
        prev.map((sale) =>
          sale.saleReturnId === saleReturnId
            ? { ...sale, saleStatus: newStatus }
            : sale
        )
      );

      setPendingStatus((prev) => {
        const updated = { ...prev };
        delete updated[saleReturnId];
        return updated;
      });

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const loadSaleDetail = async (saleId: number) => {
    try {
      const response = await api.get(`sale/sales/${saleId}`);
      setSelectedSale(response.data);
      setItems([]);
    } catch (error) {
      console.error("Erro ao carregar venda:", error);
    }
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantityReturned: quantity } : i,
        );
      }
      return [...prev, { productId, quantityReturned: quantity }];
    });
  };

  const handleSubmit = async () => {
    if (!selectedSale) return;

    const validItems = items.filter(
      (i) => i.quantityReturned && i.quantityReturned > 0,
    );

    if (validItems.length === 0) {
      alert("Selecione ao menos uma quantidade para devolver.");
      return;
    }

    if (!status) {
      alert("Selecione um status obrigatório.");
      return;
    }

    try {
      await api.post(`/sale-return/sales/${selectedSale.saleId}/returns`, {
        items: validItems.map((i) => ({
          productId: i.productId,
          quantityReturned: i.quantityReturned,
        })),
        status,
        description,
      });

      alert("Devolução registrada com sucesso!");
      setSelectedSale(null);
      setItems([]);
      setDescription("");
      setStatus("");
    } catch (error) {
      console.error("Erro ao registrar devolução:", error);
    }
  };

  const isFormValid =
    items.some((i) => i.quantityReturned && i.quantityReturned > 0) &&
    status !== "";

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection title="Registrar Devolução" link="/inicio" />

      {/* 🔎 CARD DE BUSCA */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold">Buscar Venda</h5>
            <button className="btn btn-primary px-4" onClick={searchSales}>
              <i className="bi bi-search me-2"></i>
              Buscar
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label text-muted small">ID da Venda</label>
              <input
                type="number"
                className="form-control"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label text-muted small">
                Nome do Cliente
              </label>
              <input
                type="text"
                className="form-control"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label text-muted small">CPF</label>
              <input
                type="text"
                className="form-control"
                value={searchCpf}
                onChange={(e) => setSearchCpf(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label text-muted small">Cidade</label>
              <input
                type="text"
                className="form-control"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📋 RESULTADO DA BUSCA */}
      {sales.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Qtd</th>
                  <th>Data</th>
                  <th>Produto</th>
                  <th className="text-end"></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.saleReturnId}>
                    <td>{sale.saleReturnId}</td>
                    <td>{sale.saleDTO.clientName}</td>
                    <td>{sale.quantityReturned}</td>
                    <td>{sale.returnDate}</td>
                    <td>{sale.productNameReturned}</td>
                    <td className="text-end">
                      <select
                        className="form-select form-select-sm"
                        value={
                          pendingStatus[sale.saleReturnId] ?? sale.saleStatus
                        }
                        onChange={(e) =>
                          setPendingStatus((prev) => ({
                            ...prev,
                            [sale.saleReturnId]: Number(e.target.value),
                          }))
                        }
                      >
                        {Object.entries(ReturnStatus)
                          .filter(([key]) => isNaN(Number(key)))
                          .map(([key, value]) => (
                            <option key={value} value={value}>
                              {key.replace("_", " ")}
                            </option>
                          ))}
                      </select>
                      <button
                        className="btn btn-sm btn-success ms-2"
                        disabled={!pendingStatus[sale.saleReturnId]}
                        onClick={() =>
                          handleStatusChange(
                            sale.saleReturnId,
                            pendingStatus[sale.saleReturnId]
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
          </div>
        </div>
      )}

      {/* 🛒 DETALHE DA VENDA */}
      {selectedSale && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="mb-4">
              <h5 className="fw-semibold mb-1">Venda #{selectedSale.saleId}</h5>
              <div className="text-muted">
                Cliente: {selectedSale.clientName} | Data:{" "}
                {selectedSale.saleDate}
              </div>
            </div>

            <h6 className="fw-semibold mb-3">Produtos da Venda</h6>

            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Produto</th>
                    <th>Qtd para devolução</th>
                    <th style={{ width: 150 }}>Qtd Devolver</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.products.map((p) => (
                    <tr key={p.productId}>
                      <td>{p.productName}</td>
                      <td>{p.quantityBought}</td>
                      <td>
                        <select
                          className="form-select"
                          defaultValue={0}
                          onChange={(e) =>
                            handleQuantityChange(
                              p.productId,
                              Number(e.target.value),
                            )
                          }
                        >
                          {Array.from(
                            { length: p.quantityBought + 1 },
                            (_, i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                >
                  <option value="">SELECIONE</option>
                  {/* <option value={ReturnStatus.ATIVO}>ATIVO</option> */}
                  <option value={ReturnStatus.DEFEITO_PRODUTO}>
                    ACIONAR GARANTIA
                  </option>
                  {/* <option value={ReturnStatus.DEVOLVIDO_CLIENTE}>
                    DEVOLVER PARA CLIENTE
                  </option> */}
                  <option value={ReturnStatus.DESISTENCIA}>DESISTÊNCIA</option>
                  <option value={ReturnStatus.REAVIDO}>RECUPERADO</option>
                  {/* <option value={ReturnStatus.DANIFICADO}>DANIFICADO</option> */}
                </select>
              </div>

              <div className="col-md-8">
                <label className="form-label fw-semibold">Descrição</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="text-end">
              <button
                className="btn btn-success px-4"
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                Registrar Devolução
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateSaleReturn;
