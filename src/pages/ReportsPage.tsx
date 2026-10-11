import { useMemo, useState } from "react";
import reportDefinitions, { reportCategories } from "../data/reportDefinitions";
import ReportCard from "../components/reports/ReportCard";

const ReportsPage = () => {
  const [activeCategory, setActiveCategory] = useState(reportCategories[0].key);

  const selectedCategory = reportCategories.find(
    (category) => category.key === activeCategory,
  ) || reportCategories[0];

  const visibleReports = useMemo(
    () => reportDefinitions.filter((report) => report.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="reports-page">
      <div className="reports-hero">
        <div className="reports-hero__copy">
          <span className="reports-eyebrow">CENTRAL ADMINISTRATIVA</span>
          <h1>Relatórios PDF</h1>
          <p>
            Escolha uma categoria, aplique os filtros e baixe o relatório gerado pelo RotaCred.
          </p>
        </div>
        <div className="reports-hero__badge">
          <i className="ti ti-file-type-pdf" aria-hidden="true" />
          <span>Arquivos oficiais</span>
          <strong>PDF</strong>
        </div>
      </div>

      <div className="reports-tabs" role="tablist" aria-label="Categorias de relatórios">
        {reportCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            role="tab"
            aria-selected={category.key === activeCategory}
            className={`reports-tab ${category.key === activeCategory ? "active" : ""}`}
            onClick={() => setActiveCategory(category.key)}
          >
            <i className={category.icon} aria-hidden="true" />
            <span>
              <strong>{category.label}</strong>
              <small>{category.description}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="reports-section-heading">
        <div>
          <span className="reports-eyebrow">CATEGORIA SELECIONADA</span>
          <h2>{selectedCategory.label}</h2>
          <p>{selectedCategory.description}</p>
        </div>
        <span className="reports-count">
          {visibleReports.length} {visibleReports.length === 1 ? "relatório" : "relatórios"}
        </span>
      </div>

      <div className="reports-grid">
        {visibleReports.map((report) => (
          <ReportCard key={report.key} definition={report} />
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
