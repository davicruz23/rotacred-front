import SessionsByDeviceChart from "../charts/SessionsByDeviceChart";
import { useEffect, useState } from "react";
import api from "../../services/api"; // 👈 importa o mesmo client que você já usa

const SessionsByDeviceCard = () => {
  const [status, setStatus] = useState({

    APROVADA: 0,
    PENDENTE: 0,
    RECUSADA: 0,

  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("dashboard/count/preSales/status")
      .then((res) => setStatus(res.data))
      .catch((err) => console.error("Erro ao buscar status:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card ps-0 full-height dashboard-card dashboard-status-card d-flex align-items-center justify-content-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="card ps-0 full-height dashboard-card dashboard-status-card">
      <h5 className="mb-4 fw-medium ps-4">Status de Vendas</h5>

      <div className="d-flex align-items-center justify-content-between">
        <SessionsByDeviceChart data={status} />
        <div className="sessions-by-device-content">



          <div className="mb-3">
            <p className="mb-2">Pendentes</p>
            <h5 className="mb-0">{status.PENDENTE}</h5>
          </div>

          <div className="mb-3">
            <p className="mb-2">Recusadas</p>
            <h5 className="mb-0">{status.RECUSADA}</h5>
          </div>

          <div>
            <p className="mb-2">Aprovadas</p>
            <h5 className="mb-0">{status.APROVADA}</h5>
          </div>


        </div>
      </div>
    </div>
  );
};

export default SessionsByDeviceCard;
