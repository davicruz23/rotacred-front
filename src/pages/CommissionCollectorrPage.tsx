import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type CollectorOption = {
  id: number;
  collectorName: string;
};

type CommissionReason =
  | "ADIANTAMENTO"
  | "FECHAMENTO_MENSAL"
  | "CONSULTA"
  | "OUTRO";

type CommissionResponse = {
  collectorId: number;
  collectorName: string;
  startDate: string;
  endDate: string;
  totalCommission: number;
  paymentPercentage: number;
  previousPaidAmount: number;
  amountToPay: number;
  reason: CommissionReason;
};

/* ── estilos ── */

const S: Record<string, React.CSSProperties> = {
  page: { padding: "0 4px" },

  card: {
    background: "var(--rtc-card-bg, #fff)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },

  cardHead: {
    padding: "14px 18px",
    borderBottom: "0.5px solid var(--rtc-border, #e0e0e0)",
    background: "var(--rtc-panel-bg, #f8f9fa)",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--rtc-text, #1a1a1a)",
  },

  cardBody: { padding: 20 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
  },

  field: { display: "flex", flexDirection: "column" as const, gap: 5 },

  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--rtc-muted, #888)",
  },

  input: {
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--rtc-text, #1a1a1a)",
    background: "var(--rtc-card-bg, #fff)",
    outline: "none",
    width: "100%",
  },

  select: {
    border: "0.5px solid var(--rtc-input-border, #d0d0d0)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "var(--rtc-text, #1a1a1a)",
    background: "var(--rtc-card-bg, #fff)",
    outline: "none",
    width: "100%",
  },

  infoBox: {
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginTop: 14,
    lineHeight: 1.4,
  },

  consultationInfoBox: {
    background: "#EAF4FF",
    border: "0.5px solid #B8DAFF",
    color: "#185FA5",
  },

  paymentInfoBox: {
    background: "#FFF8E5",
    border: "0.5px solid #F1D27A",
    color: "#7A5A00",
  },

  divider: {
    border: "none",
    borderTop: "0.5px solid var(--rtc-border, #e0e0e0)",
    margin: "16px 0",
  },

  resultCard: {
    background: "var(--rtc-panel-bg, #f8f9fa)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 10,
    padding: "18px 20px",
    marginTop: 20,
  },

  resultCardConsultation: {
    background: "#F4FAFF",
    border: "0.5px solid #B8DAFF",
  },

  resultCardPayment: {
    background: "#F7FBF1",
    border: "0.5px solid #C0DD97",
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--rtc-text, #1a1a1a)",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },

  resultItem: {
    background: "var(--rtc-card-bg, #fff)",
    border: "0.5px solid var(--rtc-border, #e0e0e0)",
    borderRadius: 8,
    padding: "10px 12px",
  },

  resultLabel: {
    fontSize: 11,
    color: "var(--rtc-muted, #888)",
    marginBottom: 3,
  },

  resultValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--rtc-text, #1a1a1a)",
  },

  highlightItem: {
    borderRadius: 8,
    padding: "12px 14px",
    marginTop: 4,
  },

  highlightItemConsultation: {
    background: "#EAF4FF",
    border: "0.5px solid #B8DAFF",
  },

  highlightItemPayment: {
    background: "#EAF3DE",
    border: "0.5px solid #C0DD97",
  },

  highlightLabel: {
    fontSize: 11,
    color: "var(--rtc-muted, #888)",
    marginBottom: 4,
  },

  highlightValue: {
    fontSize: 22,
    fontWeight: 700,
  },

  highlightValueConsultation: {
    color: "#185FA5",
  },

  highlightValuePayment: {
    color: "#3B6D11",
  },

  smallText: {
    display: "block",
    marginTop: 12,
    fontSize: 12,
    color: "var(--rtc-muted, #666)",
  },
};

const getSubmitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: disabled ? "var(--rtc-disabled-bg, #f1f1f1)" : "#185FA5",
  color: disabled ? "var(--rtc-soft-muted, #aaa)" : "#E6F1FB",
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  marginTop: 14,
});

/* ── componente ── */

const CommissionCollectorPage = () => {
  const [collectors, setCollectors] = useState<CollectorOption[]>([]);
  const [collectorId, setCollectorId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentPercentage, setPaymentPercentage] = useState<number | "">("");
  const [reason, setReason] = useState<CommissionReason | "">("");
  const [response, setResponse] = useState<CommissionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const isOnlyConsultation = reason === "CONSULTA" || reason === "OUTRO";

  useEffect(() => {
    const loadCollectors = async () => {
      try {
        const res = await api.get("/collector/name/all");
        setCollectors(res.data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar cobradores.");
      }
    };

    loadCollectors();
  }, []);

  const formatBr = (iso: string) => {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getReasonLabel = (reasonValue: CommissionReason) => {
    const labels: Record<CommissionReason, string> = {
      ADIANTAMENTO: "Adiantamento",
      FECHAMENTO_MENSAL: "Fechamento mensal",
      CONSULTA: "Consulta",
      OUTRO: "Outro",
    };

    return labels[reasonValue];
  };

  const isConsultationReason = (reasonValue: CommissionReason) => {
    return reasonValue === "CONSULTA" || reasonValue === "OUTRO";
  };

  const handleSearch = async () => {
    if (!collectorId) {
      alert("Selecione o cobrador.");
      return;
    }

    if (!startDate) {
      alert("Informe a data inicial.");
      return;
    }

    if (!endDate) {
      alert("Informe a data final.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("A data final não pode ser anterior à data inicial.");
      return;
    }

    if (paymentPercentage !== "") {
      if (Number(paymentPercentage) <= 0 || Number(paymentPercentage) > 100) {
        alert("O percentual deve ser maior que 0 e menor ou igual a 100.");
        return;
      }
    }

    if (!reason) {
      alert("Selecione o motivo da consulta.");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await api.post(`/collector/${collectorId}/commission`, {
        startDate,
        endDate,
        paymentPercentage: paymentPercentage === "" ? null : paymentPercentage,
        reason,
      });

      setResponse(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao calcular comissão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commission-page" style={S.page}>
      <div className="container-fluid px-1 my-1 commission-page__inner">
        <BreadcrumbSection title="Comissão do Cobrador" link="/inicio" />

        <div className="commission-card" style={S.card}>
          <div className="commission-card__header" style={S.cardHead}>
            <div style={S.cardTitle}>Calcular comissão</div>
          </div>

          <div className="commission-card__body" style={S.cardBody}>
            <div className="commission-form-grid" style={S.grid}>
              <div className="commission-field" style={S.field}>
                <label style={S.label}>Cobrador *</label>
                <select
                  className="commission-control"
                  style={S.select}
                  value={collectorId}
                  onChange={(e) =>
                    setCollectorId(e.target.value ? Number(e.target.value) : "")
                  }
                >
                  <option value="">Selecione...</option>
                  {collectors.map((collector) => (
                    <option key={collector.id} value={collector.id}>
                      {collector.collectorName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="commission-field" style={S.field}>
                <label style={S.label}>Data inicial *</label>
                <input
                  type="date"
                  className="commission-control"
                  style={S.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="commission-field" style={S.field}>
                <label style={S.label}>Data final *</label>
                <input
                  type="date"
                  className="commission-control"
                  style={S.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="commission-field" style={S.field}>
                <label style={S.label}>Percentual da comissão (%)</label>
                <input
                  type="number"
                  className="commission-control"
                  style={S.input}
                  value={paymentPercentage}
                  min="1"
                  max="100"
                  step="0.01"
                  placeholder="Opcional. Ex: 30"
                  onChange={(e) =>
                    setPaymentPercentage(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                />
              </div>

              <div className="commission-field" style={S.field}>
                <label style={S.label}>Motivo da consulta *</label>
                <select
                  className="commission-control"
                  style={S.select}
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as CommissionReason | "")
                  }
                >
                  <option value="">Selecione...</option>
                  <option value="ADIANTAMENTO">Adiantamento</option>
                  <option value="FECHAMENTO_MENSAL">Fechamento mensal</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
            </div>

            {reason && (
              <div
                style={{
                  ...S.infoBox,
                  ...(isOnlyConsultation
                    ? S.consultationInfoBox
                    : S.paymentInfoBox),
                }}
              >
                {isOnlyConsultation
                  ? "Este motivo é apenas para consulta. O valor será simulado e não será salvo como pagamento no histórico."
                  : "Este motivo gera pagamento de comissão e será salvo no histórico."}
              </div>
            )}

            <button
              className="commission-submit-button"
              style={getSubmitBtnStyle(loading)}
              disabled={loading}
              onClick={handleSearch}
            >
              {loading
                ? "Calculando..."
                : isOnlyConsultation
                  ? "Consultar comissão"
                  : "Calcular e salvar comissão"}
            </button>

            {response && (
              <div
                style={{
                  ...S.resultCard,
                  ...(isConsultationReason(response.reason)
                    ? S.resultCardConsultation
                    : S.resultCardPayment),
                }}
              >
                <div style={S.resultTitle}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isConsultationReason(response.reason)
                        ? "#185FA5"
                        : "#3B6D11",
                      flexShrink: 0,
                    }}
                  />
                  {isConsultationReason(response.reason)
                    ? "Consulta de comissão"
                    : "Comissão salva no histórico"}
                </div>

                <div style={S.resultGrid}>
                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Cobrador</div>
                    <div style={S.resultValue}>{response.collectorName}</div>
                  </div>

                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Período</div>
                    <div style={S.resultValue}>
                      {formatBr(response.startDate)} →{" "}
                      {formatBr(response.endDate)}
                    </div>
                  </div>

                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Motivo</div>
                    <div style={S.resultValue}>
                      {getReasonLabel(response.reason)}
                    </div>
                  </div>

                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Percentual informado</div>
                    <div style={S.resultValue}>
                      {response.paymentPercentage}%
                    </div>
                  </div>
                </div>

                <hr style={S.divider} />

                <div style={S.resultGrid}>
                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Comissão total do período</div>
                    <div style={S.resultValue}>
                      R$ {formatCurrency(response.totalCommission)}
                    </div>
                  </div>

                  {!isConsultationReason(response.reason) && (
                    <div style={S.resultItem}>
                      <div style={S.resultLabel}>Valor já pago no período</div>
                      <div style={S.resultValue}>
                        R$ {formatCurrency(response.previousPaidAmount)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="commission-result"
                  style={{
                    ...S.highlightItem,
                    ...(isConsultationReason(response.reason)
                      ? S.highlightItemConsultation
                      : S.highlightItemPayment),
                  }}
                >
                  <div style={S.highlightLabel}>
                    {isConsultationReason(response.reason)
                      ? "Valor simulado para o percentual informado"
                      : "Valor a pagar agora"}
                  </div>

                  <div
                    style={{
                      ...S.highlightValue,
                      ...(isConsultationReason(response.reason)
                        ? S.highlightValueConsultation
                        : S.highlightValuePayment),
                    }}
                  >
                    R$ {formatCurrency(response.amountToPay)}
                  </div>
                </div>

                {isConsultationReason(response.reason) && (
                  <small style={S.smallText}>
                    Esta consulta não foi salva como pagamento de comissão.
                  </small>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionCollectorPage;
