import { useEffect, useState } from "react";
import { ReportFilterValue } from "../../types/reportPdf";
import { ReportLookupOption } from "../../services/reportFilterOptionsService";

type Props = {
  id: string;
  label: string;
  value?: ReportFilterValue;
  placeholder: string;
  loadOptions: () => Promise<ReportLookupOption[]>;
  onChange: (value: ReportFilterValue) => void;
  valueAsNumber?: boolean;
  optionValue?: "value" | "label";
  unavailableMessage?: string;
};

const AsyncReportSelect = ({
  id,
  label,
  value,
  placeholder,
  loadOptions,
  onChange,
  valueAsNumber = false,
  optionValue = "value",
  unavailableMessage,
}: Props) => {
  const [options, setOptions] = useState<ReportLookupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setFailed(false);
        const nextOptions = await loadOptions();
        if (active) setOptions(nextOptions);
      } catch (error) {
        console.error(`Erro ao carregar opções do filtro ${label}:`, error);
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [label, loadOptions]);

  return (
    <div className="report-filter-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="form-select"
        value={value === undefined || value === null ? "" : String(value)}
        disabled={loading || failed}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(valueAsNumber && nextValue ? Number(nextValue) : nextValue);
        }}
      >
        <option value="">
          {loading ? "Carregando..." : failed ? unavailableMessage ?? "Catálogo indisponível" : placeholder}
        </option>
        {options.map((option) => (
          <option key={`${id}-${option.value}`} value={option[optionValue]}>
            {option.label}
          </option>
        ))}
      </select>
      {failed && unavailableMessage && (
        <small className="report-filter-help">{unavailableMessage}</small>
      )}
    </div>
  );
};

export default AsyncReportSelect;
