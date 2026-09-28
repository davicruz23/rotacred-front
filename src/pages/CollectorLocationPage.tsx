import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

interface CollectorDTO {
  collectorId: number;
  userId: number;
  collectorName: string;
}

interface ChargePointDTO {
  installmentId: number | string;
  saleId: number | string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  status: "PAID" | "NOT_PAID" | string;
  color: "GREEN" | "RED" | string;
  withinRadius: boolean;
  amount: number;
}

interface CollectorRouteDTO {
  collectorId: number;
  userId: number;
  collectorName: string;
  points: ChargePointDTO[];
}

interface CollectorActivityDTO {
  periodKey: string;
  points: ChargePointDTO[];
}

/* ── estilos ── */

const S: Record<string, React.CSSProperties> = {
  page: { padding: "16px 4px" },

  pageHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  pageIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#E6F1FB",
    color: "#185FA5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  },

  pageSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },

  errorBox: {
    background: "#FCEBEB",
    color: "#A32D2D",
    border: "0.5px solid #F7C1C1",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: 16,
  },

  collCard: {
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    textAlign: "left" as const,
    width: "100%",
    transition: "box-shadow 0.15s, border-color 0.15s",
  },

  collCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "0.5px solid #e0e0e0",
    gap: 10,
  },

  collAvatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#E6F1FB",
    color: "#185FA5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
  },

  collName: {
    fontSize: 17,
    fontWeight: 600,
    color: "#1a1a1a",
  },

  collId: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 2,
  },

  collBody: {
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },

  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },

  infoIcon: {
    fontSize: 18,
    color: "#185FA5",
    marginTop: 1,
    flexShrink: 0,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  },

  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    marginTop: 3,
  },

  collFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderTop: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    fontSize: 14,
    fontWeight: 600,
    color: "#185FA5",
  },

  emptyBox: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
    border: "0.5px dashed #d0d0d0",
    borderRadius: 12,
    background: "#fff",
    color: "#aaa",
    gap: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#555",
  },

  emptySub: {
    fontSize: 13,
    color: "#aaa",
  },

  spinnerWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
    gap: 12,
    color: "#aaa",
    fontSize: 13,
  },

  // Modal
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  modal: {
    background: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
    maxWidth: 960,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  modalHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "0.5px solid #e0e0e0",
    background: "#f8f9fa",
    gap: 12,
    flexShrink: 0,
  },

  modalHeadLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  modalIcon: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#E6F1FB",
    color: "#185FA5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    flexShrink: 0,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a1a",
  },

  modalSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "0.5px solid #e0e0e0",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
    color: "#555",
    flexShrink: 0,
  },

  modalBody: {
    display: "grid",
    gridTemplateColumns: "1fr 240px",
    minHeight: 420,
    overflow: "hidden",
    flex: 1,
  },

  mapArea: {
    position: "relative" as const,
    width: "100%",
    height: 420,
    background: "#f3f4f6",
  },

  sidebar: {
    borderLeft: "0.5px solid #e0e0e0",
    background: "#fff",
    padding: 16,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },

  sideItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 3,
  },

  sideLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  },

  sideValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
  },

  sideValueSm: {
    fontSize: 13,
    color: "#555",
    wordBreak: "break-all" as const,
  },

  refreshBtn: {
    width: "100%",
    padding: "9px",
    borderRadius: 8,
    border: "none",
    background: "#185FA5",
    color: "#E6F1FB",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: "auto",
  },

  refreshBtnDisabled: {
    width: "100%",
    padding: "9px",
    borderRadius: 8,
    border: "none",
    background: "#f1f1f1",
    color: "#aaa",
    fontSize: 13,
    fontWeight: 600,
    cursor: "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: "auto",
  },
};

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message ?? fallback;
};

const ordenarPontos = (points: ChargePointDTO[]) =>
  [...points].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

const criarIconeNumerado = (color: string, number: number) => {
  const green = color === "GREEN";
  const red = color === "RED";
  const fillColor = green ? "#22c55e" : red ? "#ef4444" : "#9ca3af";
  const borderColor = green ? "#15803d" : red ? "#b91c1c" : "#6b7280";

  return divIcon({
    className: "collector-charge-number-icon",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border:3px solid ${borderColor};border-radius:50%;background:${fillColor};color:#fff;font:700 12px Arial,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.35)">${number}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

/* ── componente ── */

function CollectorLocationPage() {
  const navigate = useNavigate();
  const dataAtual = new Date();
  const hoje = [dataAtual.getFullYear(), String(dataAtual.getMonth() + 1).padStart(2, "0"), String(dataAtual.getDate()).padStart(2, "0")].join("-");
  const [collectors, setCollectors] = useState<CollectorDTO[]>([]);
  const [selectedCollector, setSelectedCollector] = useState<CollectorDTO | null>(null);
  const [route, setRoute] = useState<CollectorRouteDTO | null>(null);
  const [startDate, setStartDate] = useState(hoje);
  const [endDate, setEndDate] = useState(hoje);
  const [loadingCollectors, setLoadingCollectors] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState("");
  const [expandedCollectorId, setExpandedCollectorId] = useState<number | null>(null);
  const [loadingActivityCollectorId, setLoadingActivityCollectorId] = useState<number | null>(null);
  const [activityByCollector, setActivityByCollector] = useState<Record<number, CollectorActivityDTO>>({});
  const [hoveredPointKey, setHoveredPointKey] = useState<string | null>(null);
  const tooltipCloseTimer = useRef<number | null>(null);

  const buscarCollectors = useCallback(async () => {
    try {
      setError("");
      const response = await api.get<CollectorDTO[]>("/tracking/collectors");
      setCollectors(response.data ?? []);
    } catch (error: unknown) {
      console.error("Erro ao buscar cobradores:", error);
      setError(getApiErrorMessage(error, "Não foi possível carregar os cobradores."));
    } finally {
      setLoadingCollectors(false);
    }
  }, []);

  const buscarRota = useCallback(async (collector: CollectorDTO) => {
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      setError("Período inválido: a data inicial deve ser anterior ou igual à data final.");
      return;
    }
    try {
      setLoadingRoute(true);
      setError("");
      const response = await api.get<CollectorRouteDTO>(
        `/tracking/collectors/${collector.userId}/route`,
        { params: { start: startDate, end: endDate } },
      );
      setRoute({
        ...response.data,
        points: ordenarPontos(response.data?.points ?? []),
      });
    } catch (error: unknown) {
      console.error("Erro ao buscar rota:", error);
      setError(getApiErrorMessage(error, "Não foi possível carregar as cobranças do cobrador."));
    } finally {
      setLoadingRoute(false);
    }
  }, [endDate, startDate]);

  const buscarAtividade = useCallback(async (collector: CollectorDTO) => {
    if (!startDate || !endDate || startDate > endDate) return;

    const periodKey = `${startDate}:${endDate}`;
    const cachedActivity = activityByCollector[collector.userId];
    if (cachedActivity?.periodKey === periodKey) return;

    try {
      setLoadingActivityCollectorId(collector.userId);
      setError("");
      const response = await api.get<CollectorRouteDTO>(
        `/tracking/collectors/${collector.userId}/route`,
        { params: { start: startDate, end: endDate } },
      );
      setActivityByCollector((previous) => ({
        ...previous,
        [collector.userId]: {
          periodKey,
          points: ordenarPontos(response.data?.points ?? []),
        },
      }));
    } catch (error: unknown) {
      console.error("Erro ao buscar atividade do cobrador:", error);
      setError(getApiErrorMessage(error, "Não foi possível carregar a atividade do cobrador."));
    } finally {
      setLoadingActivityCollectorId(null);
    }
  }, [activityByCollector, endDate, startDate]);

  const selecionarCollector = (collector: CollectorDTO) => {
    setSelectedCollector(collector);
    setRoute(null);
  };

  const fecharMapa = () => {
    setSelectedCollector(null);
    setRoute(null);
    setError("");
  };

  const alternarAtividade = (collector: CollectorDTO) => {
    setExpandedCollectorId((previous) =>
      previous === collector.userId ? null : collector.userId,
    );
  };

  const abrirMapaComAtividade = (collector: CollectorDTO, points: ChargePointDTO[]) => {
    setSelectedCollector(collector);
    setRoute({
      collectorId: collector.collectorId,
      userId: collector.userId,
      collectorName: collector.collectorName,
      points,
    });
  };

  useEffect(() => {
    void buscarCollectors();
  }, [buscarCollectors]);

  useEffect(() => {
    if (!selectedCollector) return;
    if (route?.userId === selectedCollector.userId) return;
    void buscarRota(selectedCollector);
  }, [buscarRota, route?.userId, selectedCollector]);

  useEffect(() => {
    if (expandedCollectorId === null) return;
    const collector = collectors.find((item) => item.userId === expandedCollectorId);
    if (collector) void buscarAtividade(collector);
  }, [buscarAtividade, collectors, expandedCollectorId]);

  const pontos = route?.points ?? [];
  const coordenadas = pontos.map((ponto): [number, number] => [ponto.latitude, ponto.longitude]);
  const ultimoPonto = pontos.length > 0 ? pontos[pontos.length - 1] : null;

  const formatarData = (data: string | null | undefined) => {
    if (!data) return "Sem localização";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(data));
  };

  function AjustarMapa({ pontos }: { pontos: ChargePointDTO[] }) {
    const map = useMap();
    useEffect(() => {
      if (pontos.length === 0) return;
      const timeout = window.setTimeout(() => {
        map.invalidateSize();
        const limites: [number, number][] = pontos.map((p) => [p.latitude, p.longitude]);
        if (limites.length === 1) { map.setView(limites[0], 17); return; }
        map.fitBounds(limites, { padding: [40, 40] });
      }, 200);
      return () => window.clearTimeout(timeout);
    }, [pontos, map]);
    return null;
  }

  const formatarValor = (amount: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount ?? 0);

  const formatarDataFiltro = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
  };

  const statusCobranca = (status: string) => {
    if (status === "PAID") return "Cobrança registrada como paga";
    if (status === "NOT_PAID") return "Tentativa sem pagamento";
    return status;
  };

  const raioCobranca = (withinRadius: boolean) =>
    withinRadius ? "Dentro do raio permitido" : "Fora do raio permitido ou cobrança não validada";

  const abrirCobranca = (ponto: ChargePointDTO) => {
    const params = new URLSearchParams({
      saleId: String(ponto.saleId),
      installmentId: String(ponto.installmentId),
    });
    navigate(`/collector-sales?${params.toString()}`);
  };

  const getPontoKey = (ponto: ChargePointDTO, index: number) =>
    `${ponto.installmentId}-${ponto.saleId}-${ponto.capturedAt}-${index}`;

  const manterTooltipAberto = () => {
    if (tooltipCloseTimer.current !== null) {
      window.clearTimeout(tooltipCloseTimer.current);
      tooltipCloseTimer.current = null;
    }
  };

  const agendarFechamentoTooltip = () => {
    manterTooltipAberto();
    tooltipCloseTimer.current = window.setTimeout(() => {
      setHoveredPointKey(null);
      tooltipCloseTimer.current = null;
    }, 250);
  };

  return (
    <div style={S.page}>

      {/* Cabeçalho */}
      <div style={S.pageHead}>
        <div style={S.pageIcon}>
          <i className="ti ti-route" />
        </div>
        <div>
          <div style={S.pageTitle}>Acompanhar cobranças</div>
          <div style={S.pageSub}>Consulte as cobranças registradas pelos cobradores.</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 12, marginBottom: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#334155" }}>
          Data inicial
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            style={{ border: "1px solid #94a3b8", borderRadius: 7, padding: "8px 10px", color: "#1f2937", backgroundColor: "#fff", fontSize: 13, fontWeight: 500, opacity: 1, WebkitTextFillColor: "#1f2937" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#334155" }}>
          Data final
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            style={{ border: "1px solid #94a3b8", borderRadius: 7, padding: "8px 10px", color: "#1f2937", backgroundColor: "#fff", fontSize: 13, fontWeight: 500, opacity: 1, WebkitTextFillColor: "#1f2937" }}
          />
        </label>
      </div>

      {/* Erro */}
      {error && <div style={S.errorBox}>{error}</div>}

      {/* Loading */}
      {loadingCollectors ? (
        <div style={S.spinnerWrap}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <span>Carregando cobradores...</span>
        </div>

      ) : collectors.length === 0 ? (
        <div style={S.emptyBox}>
          <i className="ti ti-map-pin-off" style={{ fontSize: 40 }} />
          <div style={S.emptyTitle}>Nenhum cobrador encontrado</div>
          <div style={S.emptySub}>Ainda não existem cobradores disponíveis para acompanhamento.</div>
        </div>

      ) : (
        <div style={S.grid}>
          {collectors.map((collector) => {
            const atividade = activityByCollector[collector.userId]?.points ?? [];
            const atividadeAberta = expandedCollectorId === collector.userId;
            const carregandoAtividade = loadingActivityCollectorId === collector.userId;

            return (
              <div key={collector.collectorId} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
              key={collector.collectorId}
              type="button"
              style={S.collCard}
              onClick={() => selecionarCollector(collector)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#B5D4F4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0";
              }}
            >
              {/* Topo */}
              <div style={S.collCardTop}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={S.collAvatar}>{getInitials(collector.collectorName)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={S.collName}>{collector.collectorName}</div>
                    <div style={S.collId}>Cobrador #{collector.collectorId}</div>
                  </div>
                </div>
                <span style={{ ...S.infoLabel, color: "#185FA5" }}>Ver cobranças</span>
              </div>

              {/* Corpo */}
              <div style={S.collBody}>
                <div style={S.infoRow}>
                  <i className="ti ti-calendar" style={S.infoIcon} />
                  <div>
                    <div style={S.infoLabel}>Período consultado</div>
                    <div style={S.infoValue}>
                      {startDate && endDate
                        ? `${formatarDataFiltro(startDate)} a ${formatarDataFiltro(endDate)}`
                        : "Nenhuma localização registrada"}
                    </div>
                  </div>
                </div>
                <div style={S.infoRow}>
                  <i className="ti ti-user-check" style={S.infoIcon} />
                  <div>
                    <div style={S.infoLabel}>Identificação</div>
                    <div style={S.infoValue}>Cobrador #{collector.collectorId}</div>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div style={S.collFooter}>
                <span>Acompanhar rota</span>
                <i className="ti ti-chevron-right" />
              </div>
                </button>

                <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={() => alternarAtividade(collector)}
                    style={{ width: "100%", border: "none", background: "#f8f9fa", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: "#185FA5", fontSize: 13, fontWeight: 600 }}
                  >
                    <span>
                      <i className="ti ti-list-details" style={{ marginRight: 6 }} />
                      Atividade do cobrador
                    </span>
                    <i className={`ti ti-chevron-${atividadeAberta ? "up" : "down"}`} />
                  </button>

                  {atividadeAberta && (
                    <div style={{ padding: 10, borderTop: "0.5px solid #e0e0e0" }}>
                      {carregandoAtividade ? (
                        <div style={{ padding: "12px 4px", textAlign: "center", color: "#888", fontSize: 12 }}>
                          <span className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                          Carregando atividade...
                        </div>
                      ) : atividade.length === 0 ? (
                        <div style={{ padding: "10px 4px", color: "#888", fontSize: 12, textAlign: "center" }}>
                          Nenhuma cobrança no período selecionado.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {atividade.map((ponto, index) => (
                            <button
                              key={getPontoKey(ponto, index)}
                              type="button"
                              onClick={() => abrirMapaComAtividade(collector, atividade)}
                              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 7, background: "#fff", padding: "8px 9px", display: "flex", alignItems: "center", gap: 8, textAlign: "left", cursor: "pointer" }}
                            >
                              <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: ponto.color === "GREEN" ? "#22c55e" : "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                                {index + 1}
                              </span>
                              <span style={{ minWidth: 0, flex: 1 }}>
                                <span style={{ display: "block", color: "#1f2937", fontSize: 12, fontWeight: 600 }}>
                                  Venda #{ponto.saleId} · {statusCobranca(ponto.status)}
                                </span>
                                <span style={{ display: "block", color: "#6b7280", fontSize: 11, marginTop: 2 }}>
                                  {formatarData(ponto.capturedAt)} · {ponto.withinRadius ? "Dentro do raio" : "Fora do raio"}
                                </span>
                              </span>
                              <span style={{ color: "#1f2937", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                                {formatarValor(ponto.amount)}
                              </span>
                              <i className="ti ti-map-2" style={{ color: "#185FA5", fontSize: 16 }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedCollector && (
        <div style={S.overlay}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>

            {/* Cabeçalho do modal */}
            <div style={S.modalHead}>
              <div style={S.modalHeadLeft}>
                <div style={S.modalIcon}>
                  <i className="ti ti-route" />
                </div>
                <div>
                  <div style={S.modalTitle}>Cobranças de {selectedCollector.collectorName}</div>
                  <div style={S.modalSub}>
                    {pontos.length} ponto{pontos.length !== 1 ? "s" : ""} registrado{pontos.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <button style={S.closeBtn} type="button" onClick={fecharMapa}>✕</button>
            </div>

            {/* Corpo do modal */}
            <div style={S.modalBody}>

              {/* Mapa */}
              <div style={S.mapArea}>
                {loadingRoute ? (
                  <div style={{ ...S.spinnerWrap, minHeight: 420 }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <span>Carregando cobranças...</span>
                  </div>
                ) : pontos.length === 0 ? (
                  <div style={{ ...S.emptyBox, minHeight: 420, borderRadius: 0, border: "none" }}>
                    <i className="ti ti-map-off" style={{ fontSize: 40 }} />
                    <div style={S.emptyTitle}>Nenhum ponto registrado</div>
                    <div style={S.emptySub}>Este cobrador ainda não possui cobranças no período.</div>
                  </div>
                ) : ultimoPonto ? (
                  <MapContainer
                    key={selectedCollector.userId}
                    center={[ultimoPonto.latitude, ultimoPonto.longitude]}
                    zoom={16}
                    scrollWheelZoom
                    style={{ height: "420px", width: "100%", zIndex: 1 }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <AjustarMapa pontos={pontos} />
                    {coordenadas.length > 1 && (
                      <Polyline
                        positions={coordenadas}
                        pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.75 }}
                      />
                    )}
                    {pontos.map((ponto, index) => {
                      const pontoKey = getPontoKey(ponto, index);

                      return (
                        <Marker
                          key={pontoKey}
                          position={[ponto.latitude, ponto.longitude]}
                          icon={criarIconeNumerado(ponto.color, index + 1)}
                          eventHandlers={{
                            mouseover: () => {
                              manterTooltipAberto();
                              setHoveredPointKey(pontoKey);
                            },
                            mouseout: agendarFechamentoTooltip,
                          }}
                        >
                          {hoveredPointKey === pontoKey && (
                            <Tooltip permanent direction="top" offset={[0, 0]} interactive>
                              <div
                                style={{ minWidth: 180, textAlign: "center" }}
                                onMouseEnter={manterTooltipAberto}
                                onMouseLeave={agendarFechamentoTooltip}
                              >
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                  Cobrança da venda #{ponto.saleId}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  Deseja ver esta cobrança?
                                </div>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    abrirCobranca(ponto);
                                  }}
                                  style={{
                                    border: "none",
                                    borderRadius: 5,
                                    padding: "5px 9px",
                                    background: "#185FA5",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  Ver cobrança
                                </button>
                              </div>
                            </Tooltip>
                          )}
                        <Popup>
                          <strong>Cobrança</strong><br />
                          Cobrador: {selectedCollector.collectorName}<br />
                          Data: {formatarData(ponto.capturedAt)}<br />
                          Valor: {formatarValor(ponto.amount)}<br />
                          Status: {statusCobranca(ponto.status)}<br />
                          Raio: {raioCobranca(ponto.withinRadius)}
                        </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                ) : null}
              </div>

              {/* Sidebar */}
              <aside style={S.sidebar}>
                <div style={S.sideItem}>
                  <div style={S.sideLabel}>Cobrador</div>
                  <div style={S.sideValue}>{selectedCollector.collectorName}</div>
                </div>

                <div style={S.sideItem}>
                  <div style={S.sideLabel}>Período</div>
                  <div style={S.sideValueSm}>{startDate} a {endDate}</div>
                </div>

                <div style={S.sideItem}>
                  <div style={S.sideLabel}>Pontos de cobrança</div>
                  <div style={{ ...S.sideValue, fontSize: 22 }}>{pontos.length}</div>
                </div>

                <div style={S.sideItem}>
                  <div style={S.sideLabel}>Última cobrança</div>
                  <div style={S.sideValueSm}>
                    {ultimoPonto ? formatarData(ultimoPonto.capturedAt) : "Sem localização"}
                  </div>
                </div>

                {ultimoPonto && (
                  <div style={S.sideItem}>
                    <div style={S.sideLabel}>Coordenadas do ponto</div>
                    <div style={S.sideValueSm}>
                      {ultimoPonto.latitude.toFixed(6)}, {ultimoPonto.longitude.toFixed(6)}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  style={loadingRoute ? S.refreshBtnDisabled : S.refreshBtn}
                  disabled={loadingRoute}
                  onClick={() => void buscarRota(selectedCollector)}
                >
                  <i className="ti ti-refresh" />
                  Atualizar cobranças
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectorLocationPage;
