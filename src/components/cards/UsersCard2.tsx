import { useEffect, useState } from "react";
import api from "../../services/api";

type CollectorTop = {
  collectorId: number;
  collectorName: string;
  totalCollectedToday: number;
  totalToCollectThisMonth: number;
};

const UsersCard2List = () => {
  const [collectors, setCollectors] = useState<CollectorTop[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("dashboard/collector/top-today-status");
      setCollectors(res.data);
    };
    load();
  }, []);

  const radius = 26; const circumference = 2 * Math.PI * radius;

  return (

    <div className="d-flex flex-column gap-3">
      {collectors.map((c) => {
        
        const percentage =
          c.totalToCollectThisMonth > 0
            ? Math.min(
                (c.totalCollectedToday / c.totalToCollectThisMonth) * 100,
                100,
              )
            : 0;

        const offset = circumference - (percentage / 100) * circumference;

        return (
          <div key={c.collectorId} className="card saas-small-card">
            <div className="d-flex align-items-center justify-content-between">
              {/* Esperado */}
              <div className="text-end">
                <h4>
                  {c.totalToCollectThisMonth.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h4>
                <p className="mb-0">Esperado</p>
              </div>

              {/* CÍRCULO DINÂMICO */}
              <div className="progress-circle">
                <span className="progress-text">{percentage.toFixed(0)}%</span>

                <svg width="58" height="58">
                  {/* Fundo */}
                  <circle
                    cx="29"
                    cy="29"
                    r={radius}
                    stroke="#F5EFFF"
                    strokeWidth="6"
                    fill="none"
                  />

                  {/* Barra animada */}
                  <circle
                    cx="29"
                    cy="29"
                    r={radius}
                    stroke="#39AD8A"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 29 29)"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
              </div>

              {/* Hoje */}
              <div>
                <h4>
                  {c.totalCollectedToday.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h4>
                <p className="mb-0">Hoje</p>
              </div>
            </div>

            <div className="mt-2 text-center">
              <small className="fw-bold">{c.collectorName}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersCard2List;
