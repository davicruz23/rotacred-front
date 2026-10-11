import { useEffect, useState } from "react";
import { searchReportClients } from "../../services/reportFilterOptionsService";
import { ReportFilterValue } from "../../types/reportPdf";

type Props = {
  id: string;
  value?: ReportFilterValue;
  onChange: (value: ReportFilterValue) => void;
};

const ClientFilter = ({ id, value, onChange }: Props) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 3) {
      setOptions([]);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const nextOptions = await searchReportClients(term);
        if (active) setOptions(nextOptions);
      } catch (error) {
        console.error("Erro ao buscar clientes para o relatório:", error);
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <div className="report-filter-field report-filter-autocomplete">
      <label htmlFor={`${id}-search`}>Cliente</label>
      <input
        id={`${id}-search`}
        className="form-control"
        value={search}
        placeholder="Digite o nome do cliente"
        onChange={(event) => {
          setSearch(event.target.value);
          onChange("");
        }}
      />
      {loading && <small className="report-filter-help">Buscando clientes...</small>}
      {options.length > 0 && (
        <select
          className="form-select report-filter-autocomplete__results"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(event) => onChange(event.target.value ? Number(event.target.value) : "")}
        >
          <option value="">Selecione o cliente encontrado</option>
          {options.map((option) => (
            <option key={`${id}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <small className="report-filter-help">O PDF recebe o ID selecionado automaticamente.</small>
    </div>
  );
};

export default ClientFilter;
