import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";

type SellerOption = {
  idSeller: number;
  nomeSeller: string;
};

type CommissionReason =
  | "ADIANTAMENTO"
  | "FECHAMENTO_MENSAL"
  | "CONSULTA"
  | "OUTRO";

type CommissionResponse = {
  sellerId: number;
  sellerName: string;
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
    marginBottom: 14,
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

  alertInfo: {
    background: "#E6F1FB",
    color: "#185FA5",
    border: "0.5px solid #B5D4F4",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
  },

  alertWarn: {
    background: "#FAEEDA",
    color: "#854F0B",
    border: "0.5px solid #F2D09A",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
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
    background: "#EAF3DE",
    border: "0.5px solid #C0DD97",
    borderRadius: 8,
    padding: "12px 14px",
    marginTop: 4,
  },

  highlightItemBlue: {
    background: "#E6F1FB",
    border: "0.5px solid #B5D4F4",
    borderRadius: 8,
    padding: "12px 14px",
    marginTop: 4,
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

  consultNote: {
    fontSize: 12,
    color: "var(--rtc-muted, #888)",
    marginTop: 10,
    fontStyle: "italic" as const,
  },
};

const getSubmitBtnStyle = (
  disabled: boolean,
  isConsult: boolean,
): React.CSSProperties => ({
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: disabled ? "var(--rtc-disabled-bg, #f1f1f1)" : isConsult ? "#185FA5" : "#3B6D11",
  color: disabled ? "var(--rtc-soft-muted, #aaa)" : "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  marginTop: 6,
});

/* ── componente ── */

const CommissionSellerPage = () => {
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [sellerId, setSellerId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentPercentage, setPaymentPercentage] = useState<number | "">("");
  const [reason, setReason] = useState<CommissionReason | "">("");
  const [response, setResponse] = useState<CommissionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const isOnlyConsultation = reason === "CONSULTA" || reason === "OUTRO";

  useEffect(() => {
    const loadingSellers = async () => {
      try {
        const res = await api.get("/seller/name/all");
        setSellers(res.data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar vendedores.");
      }
    };
    loadingSellers();
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDateBr = (iso: string) => {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  const getReasonLabel = (reasonValue: CommissionReason) => {
    const labels: Record<CommissionReason, string> = {
      ADIANTAMENTO: "Adiantamento",
      FECHAMENTO_MENSAL: "Fechamento mensal",
      CONSULTA: "Consulta",
      OUTRO: "Outro",
    };
    return labels[reasonValue];
  };

  const isConsultationReason = (reasonValue: CommissionReason) =>
    reasonValue === "CONSULTA" || reasonValue === "OUTRO";

  const handleSearch = async () => {
    if (!sellerId) {
      alert("Selecione o vendedor.");
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
    if (!paymentPercentage) {
      alert("Informe o percentual da comissão.");
      return;
    }
    if (Number(paymentPercentage) <= 0 || Number(paymentPercentage) > 100) {
      alert("O percentual deve ser maior que 0 e menor ou igual a 100.");
      return;
    }
    if (!reason) {
      alert("Selecione o motivo da consulta.");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await api.post(`/seller/${sellerId}/commission`, {
        startDate,
        endDate,
        paymentPercentage,
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
        <BreadcrumbSection title="Comissão do Vendedor" link="/inicio" />

        <div className="commission-card" style={S.card}>
          <div className="commission-card__header" style={S.cardHead}>
            <div style={S.cardTitle}>Calcular comissão</div>
          </div>

          <div className="commission-card__body" style={S.cardBody}>
            <div className="commission-form-grid" style={S.grid}>
              {/* Vendedor */}
              <div className="commission-field" style={S.field}>
                <label style={S.label}>Vendedor *</label>
                <select
                  className="commission-control"
                  style={S.select}
                  value={sellerId}
                  onChange={(e) =>
                    setSellerId(e.target.value ? Number(e.target.value) : "")
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {sellers.map((seller) => (
                    <option key={seller.idSeller} value={seller.idSeller}>
                      {seller.nomeSeller}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data inicial */}
              <div className="commission-field" style={S.field}>
                <label style={S.label}>Data inicial *</label>
                <input
                  type="date"
                  className="commission-control"
                  style={S.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* Data final */}
              <div className="commission-field" style={S.field}>
                <label style={S.label}>Data final *</label>
                <input
                  type="date"
                  className="commission-control"
                  style={S.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {/* Percentual */}
              <div className="commission-field" style={S.field}>
                <label style={S.label}>Percentual da comissão (%) *</label>
                <input
                  type="number"
                  className="commission-control"
                  style={S.input}
                  value={paymentPercentage}
                  min="1"
                  max="100"
                  step="0.01"
                  placeholder="Ex: 30"
                  onChange={(e) =>
                    setPaymentPercentage(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  required
                />
              </div>

              {/* Motivo — ocupa coluna cheia */}
              <div className="commission-field commission-field--wide" style={{ ...S.field, gridColumn: "1 / -1" }}>
                <label style={S.label}>Motivo da consulta *</label>
                <select
                  className="commission-control"
                  style={S.select}
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as CommissionReason | "")
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="ADIANTAMENTO">Adiantamento</option>
                  <option value="FECHAMENTO_MENSAL">Fechamento mensal</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
            </div>

            {/* Aviso de motivo */}
            {reason && (
              <div
                style={{
                  ...(isOnlyConsultation ? S.alertInfo : S.alertWarn),
                  marginTop: 14,
                }}
              >
                {isOnlyConsultation
                  ? "Este filtro é apenas para consulta. O valor será simulado e não será salvo como pagamento no histórico."
                  : "Este filtro gera pagamento de comissão e será salvo no histórico."}
              </div>
            )}

            {/* Botão */}
            <button
              className="commission-submit-button"
              type="button"
              style={getSubmitBtnStyle(loading, isOnlyConsultation)}
              disabled={loading}
              onClick={handleSearch}
            >
              {loading
                ? "Calculando..."
                : isOnlyConsultation
                  ? "Consultar comissão"
                  : "Calcular e salvar comissão"}
            </button>

            {/* Resultado */}
            {response && (
              <div className="commission-result" style={S.resultCard}>
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
                    <div style={S.resultLabel}>Vendedor</div>
                    <div style={S.resultValue}>{response.sellerName}</div>
                  </div>
                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Período</div>
                    <div style={S.resultValue}>
                      {formatDateBr(response.startDate)} →{" "}
                      {formatDateBr(response.endDate)}
                    </div>
                  </div>
                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Motivo</div>
                    <div style={S.resultValue}>
                      {getReasonLabel(response.reason)}
                    </div>
                  </div>
                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Comissão total do período</div>
                    <div style={S.resultValue}>
                      R$ {formatCurrency(response.totalCommission)}
                    </div>
                  </div>
                  <div style={S.resultItem}>
                    <div style={S.resultLabel}>Percentual informado</div>
                    <div style={S.resultValue}>
                      {response.paymentPercentage}%
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

                <hr style={S.divider} />

                <div
                  style={
                    isConsultationReason(response.reason)
                      ? S.highlightItemBlue
                      : S.highlightItem
                  }
                >
                  <div style={S.highlightLabel}>
                    {isConsultationReason(response.reason)
                      ? "Valor simulado para o percentual informado"
                      : "Valor a pagar agora"}
                  </div>
                  <div
                    style={{
                      ...S.highlightValue,
                      color: isConsultationReason(response.reason)
                        ? "#185FA5"
                        : "#3B6D11",
                    }}
                  >
                    R$ {formatCurrency(response.amountToPay)}
                  </div>
                </div>

                {isConsultationReason(response.reason) && (
                  <div style={S.consultNote}>
                    Esta consulta não foi salva como pagamento de comissão.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionSellerPage;
