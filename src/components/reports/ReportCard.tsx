import { useEffect, useMemo, useState } from "react";
import { downloadReportPdf } from "../../services/reportPdfService";
import {
  ReportDefinition,
  ReportFilterValue,
  ReportFilterValues,
} from "../../types/reportPdf";
import ReportFilters from "./ReportFilters";
import ReportPdfButton from "./ReportPdfButton";

const STORAGE_KEY = "rotacred.report-pdf-filters.v1";

type StoredFilters = Record<string, ReportFilterValues>;

const readStoredFilters = (): StoredFilters => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredFilters) : {};
  } catch {
    return {};
  }
};

const ReportCard = ({ definition }: { definition: ReportDefinition }) => {
  const [filters, setFilters] = useState<ReportFilterValues>(() => {
    return readStoredFilters()[definition.key] || {};
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const allFilters = readStoredFilters();
    allFilters[definition.key] = filters;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFilters));
  }, [definition.key, filters]);

  const hasFilters = useMemo(
    () => Object.values(filters).some((value) => value !== "" && value !== undefined),
    [filters],
  );

  const handleChange = (key: string, value: ReportFilterValue) => {
    setFeedback(null);
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setFeedback(null);
  };

  const handleDownload = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const filename = await downloadReportPdf(
        definition.endpoint,
        filters,
        definition.filename,
      );
      setFeedback({ type: "success", message: `${filename} baixado com sucesso.` });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível baixar o relatório.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="report-card">
      <div className="report-card__header">
        <div className="report-card__icon" aria-hidden="true">
          <i className="ti ti-file-analytics" />
        </div>
        <div>
          <span className="report-card__eyebrow">PDF</span>
          <h2>{definition.title}</h2>
        </div>
      </div>

      <p className="report-card__description">{definition.description}</p>

      <ReportFilters
        fields={definition.fields}
        values={filters}
        onChange={handleChange}
      />

      <div className="report-card__footer">
        <button
          type="button"
          className="btn report-clear-button"
          onClick={clearFilters}
          disabled={loading || !hasFilters}
        >
          Limpar filtros
        </button>
        <ReportPdfButton loading={loading} onClick={handleDownload} />
      </div>

      {feedback && (
        <div
          className={`report-feedback report-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          <i
            className={feedback.type === "success" ? "ti ti-circle-check" : "ti ti-alert-circle"}
            aria-hidden="true"
          />
          {feedback.message}
        </div>
      )}
    </article>
  );
};

export default ReportCard;
