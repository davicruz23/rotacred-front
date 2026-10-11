import { useEffect, useState } from "react";
import TableBottomControls from "../components/utils/TableBottomControls";
import api from "../services/api";
import "bootstrap-icons/font/bootstrap-icons.css";

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
  paid: boolean;
};

type SaleType = {
  id: number;
  saleDate: string;
  paymentType: string;
  clientName: string;
  statusSale: string;
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

type AdminPaymentInstallmentType = {
  id: number;
  dueDate: string;
  amount: number;
  paid: boolean;
};

type AdminPaymentInfoType = {
  saleId: number;
  clientName: string;
  openBalance: number;
  installments: AdminPaymentInstallmentType[];
};

enum SaleStatusFilter {
  TODOS = 0,
  ATIVO = 1,
  DEFEITO_PRODUTO = 2,
  DEVOLVIDO_CLIENTE = 3,
  DESISTENCIA = 4,
  REAVIDO = 5,
  DANIFICADO = 6,
  FINALIZADO = 7,
}

const SalesListPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [dataPerPage] = useState(10);

  const [dataList, setDataList] = useState<SaleType[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [clientName, setClientName] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [unpaidOnly, setUnpaidOnly] = useState(false);

  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleType | null>(null);
  const [newFirstDueDate, setNewFirstDueDate] = useState("");
  const [currentFirstDueDate, setCurrentFirstDueDate] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [adminPaymentAmount, setAdminPaymentAmount] = useState("");
  const [adminPaymentMethod, setAdminPaymentMethod] = useState("PIX");
  const [adminPaymentNote, setAdminPaymentNote] = useState("");
  const [paymentSaleInfo, setPaymentSaleInfo] =
    useState<AdminPaymentInfoType | null>(null);
  const [appliedUnpaidOnly, setAppliedUnpaidOnly] = useState(false);

  const fetchSales = async (
    page = 0,
    filters = { clientName, cpf, status, saleDate, unpaidOnly },
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
          unpaidOnly: filters.unpaidOnly || undefined,
        },
      });

      setDataList(response.data.content);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error: unknown) {
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
    setAppliedUnpaidOnly(unpaidOnly);
    fetchSales(0);
  };

  const handleClearFilters = () => {
    setClientName("");
    setCpf("");
    setStatus("");
    setSaleDate("");
    setUnpaidOnly(false);
    setCurrentPage(0);
    setAppliedUnpaidOnly(false);

    fetchSales(0, {
      clientName: "",
      cpf: "",
      status: SaleStatusFilter.TODOS.toString(),
      saleDate: "",
      unpaidOnly: false,
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

  const openChangeDateModal = (sale: SaleType) => {
    const firstDueDate = sale.installments
      .filter((installment) => installment.amount > 0)
      .slice(0, 1)[0]?.dueDate;

    if (!firstDueDate) {
      alert("Essa venda não possui primeira parcela.");
      return;
    }

    setSelectedSale(sale);
    setCurrentFirstDueDate(firstDueDate);
    setNewFirstDueDate(firstDueDate);
    setShowDateModal(true);
  };

  const parseDate = (date: string) => {
    if (date.includes("/")) {
      const [day, month, year] = date.split("/");
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const [year, month, day] = date.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const handleChangeFirstDueDate = async () => {
    if (!selectedSale) return;

    if (parseDate(newFirstDueDate) < parseDate(currentFirstDueDate)) {
      alert(
        "A nova data não pode ser anterior à data atual da primeira parcela.",
      );
      return;
    }

    try {
      await api.patch(
        `/sale/sales/${selectedSale.id}/open-installments/due-dates`,
        {
          firstDueDate: newFirstDueDate,
        },
      );

      setShowDateModal(false);
      setSelectedSale(null);
      fetchSales(currentPage);
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar a data da primeira parcela.");
    }
  };

  const openAdminPaymentModal = async (sale: SaleType) => {
    try {
      const response = await api.get<AdminPaymentInfoType>(
        `/sale/${sale.id}/admin-payment-info`,
      );

      setPaymentSaleInfo(response.data);
      setAdminPaymentAmount("");
      setAdminPaymentMethod("PIX");
      setAdminPaymentNote("");
      setShowPaymentModal(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar informações do pagamento.");
    }
  };

  const handleAdminPayment = async () => {
    if (!paymentSaleInfo) return;

    const amount = Number(adminPaymentAmount);

    if (!amount || amount <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (amount > paymentSaleInfo.openBalance) {
      alert("O pagamento não pode ser maior que o saldo devedor.");
      return;
    }

    try {
      await api.put(`/sale/${paymentSaleInfo.saleId}/admin-payment`, {
        amount,
        paymentMethod: adminPaymentMethod,
        note: adminPaymentNote || null,
      });

      setShowPaymentModal(false);
      setPaymentSaleInfo(null);
      fetchSales(currentPage);
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar pagamento.");
    }
  };

  const hasOpenInstallments = (sale: SaleType) => {
    return sale.installments.some((installment) => !installment.paid);
  };

  const canShowPaymentButton = (sale: SaleType) => {
    return (
      sale.statusSale !== "FINALIZADO" &&
      sale.installments.some((installment) => installment.paid !== true)
    );
  };

  return (
    <div className="row g-4 sales-workspace sales-list-page">
      <div className="col-12">
        <div className="panel sales-list-panel">
          <div className="panel-body sales-list-panel-body">
            <div className="product-table-quantity sales-list-hero">
              <ul>
                <li className="text-white sales-list-hero-title">
                  Todas Vendas ({totalElements})
                </li>
              </ul>
            </div>

            <div className="row g-2 mb-3 sales-list-filters">
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value={SaleStatusFilter.TODOS}>TODOS</option>
                  <option value={SaleStatusFilter.ATIVO}>ATIVOS</option>
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

              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome do cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="col-md-2">
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

              <div className="col-md-2">
                <select
                  className="form-select"
                  value={unpaidOnly ? "true" : "false"}
                  onChange={(e) => setUnpaidOnly(e.target.value === "true")}
                >
                  <option value="false">TODAS</option>
                  <option value="true">SEM PARCELA PAGA</option>
                </select>
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
              <div className="table-responsive sales-list-table-wrap">
                <table className="table table-bordered table-hover align-middle sales-list-table">
                  <thead>
                    <tr>
                      <th>Nº VENDA</th>
                      <th>Cliente</th>
                      <th>Data da Venda</th>
                      <th>Tipo de Pagamento</th>
                      <th>Total</th>
                      <th>Primeira Parcela</th>
                      <th>Ações</th>
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

                        <td>
                          <div className="d-flex gap-2 sales-list-actions">
                            {appliedUnpaidOnly && hasOpenInstallments(sale) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-warning"
                                title="Alterar data"
                                onClick={() => openChangeDateModal(sale)}
                              >
                                <i className="bi bi-calendar-event"></i>
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              title={
                                canShowPaymentButton(sale)
                                  ? "Registrar pagamento"
                                  : "Venda finalizada ou sem parcelas em aberto"
                              }
                              disabled={!canShowPaymentButton(sale)}
                              onClick={() => openAdminPaymentModal(sale)}
                            >
                              <i className="bi bi-cash-coin"></i>
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
            )}
          </div>
        </div>
      </div>
      {showDateModal && (
        <div className="modal fade show d-block sales-modal" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content sales-modal__content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Alterar data da primeira parcela
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDateModal(false)}
                />
              </div>

              <div className="modal-body">
                <p className="mb-2">
                  Venda Nº <strong>{selectedSale?.id}</strong>
                </p>

                <label className="form-label">
                  Nova data da primeira parcela
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={newFirstDueDate}
                  min={currentFirstDueDate}
                  onChange={(e) => setNewFirstDueDate(e.target.value)}
                />

                <small className="text-muted">
                  A data não pode ser anterior a {currentFirstDueDate}.
                </small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDateModal(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleChangeFirstDueDate}
                >
                  Salvar alteração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDateModal && <div className="modal-backdrop fade show" />}

      {showPaymentModal && paymentSaleInfo && (
        <div className="modal fade show d-block sales-modal" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content sales-modal__content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Registrar pagamento administrativo
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                />
              </div>

              <div className="modal-body">
                <p className="mb-1">
                  Venda Nº <strong>{paymentSaleInfo.saleId}</strong>
                </p>

                <p className="mb-3">
                  Cliente: <strong>{paymentSaleInfo.clientName}</strong>
                </p>

                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paymentSaleInfo.installments.map((installment) => (
                        <tr key={installment.id}>
                          <td>{installment.dueDate}</td>
                          <td>R$ {installment.amount.toFixed(2)}</td>
                          <td>
                            {installment.paid ? (
                              <span className="badge bg-success">Pago</span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Em aberto
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info">
                  Saldo devedor atual:{" "}
                  <strong>R$ {paymentSaleInfo.openBalance.toFixed(2)}</strong>
                </div>

                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Valor recebido</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={adminPaymentAmount}
                      onChange={(e) => setAdminPaymentAmount(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Forma de pagamento</label>
                    <select
                      className="form-select"
                      value={adminPaymentMethod}
                      onChange={(e) => setAdminPaymentMethod(e.target.value)}
                    >
                      <option value="PIX">PIX</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CARTAO">Cartão</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Saldo após pagamento</label>
                    <input
                      className="form-control"
                      value={`R$ ${Math.max(
                        paymentSaleInfo.openBalance -
                          Number(adminPaymentAmount || 0),
                        0,
                      ).toFixed(2)}`}
                      disabled
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Observação</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={adminPaymentNote}
                      onChange={(e) => setAdminPaymentNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentSaleInfo(null);
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleAdminPayment}
                >
                  Registrar pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && <div className="modal-backdrop fade show" />}
    </div>
  );
};

export default SalesListPage;
