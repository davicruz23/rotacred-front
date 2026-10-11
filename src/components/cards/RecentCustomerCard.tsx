import { useEffect, useState } from "react";
import api from "../../services/api";

const formatPhone = (phone: string) => {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
};


type Cliente = {
  id: number;
  name: string;
  city: string;
  phone: string;
};

const RecentCustomerCard = () => {
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentClients = async () => {
    try {
      const response = await api.get("/dashboard/recents");
      setCustomers(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes recentes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentClients();
  }, []);

  return (
    <div className="card full-height dashboard-card dashboard-recent-card">
      <div className="card-header-area mb-3 recent-customer-wrap orders-sales-overview-wrap flex-wrap">
        <h5 className="fw-medium">Clientes Recentes</h5>
        {/* <MonthDropdown /> */}
      </div>

      <div className="table-responsive recent-customer-table">
        <table className="table w-100" id="orderlistTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Cidade</th>
              <th>Contato</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-3">
                  Carregando...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-3">
                  Nenhum cliente encontrado
                </td>
              </tr>
            ) : (
              customers.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.city}</td>
                  <td>{formatPhone(item.phone)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentCustomerCard;
