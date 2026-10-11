import AsyncReportSelect from "./AsyncReportSelect";
import { getReportProducts } from "../../services/reportFilterOptionsService";
import { ReportFilterValue } from "../../types/reportPdf";

type Props = { id: string; label?: string; value?: ReportFilterValue; valueMode?: "id" | "label"; onChange: (value: ReportFilterValue) => void };

const ProductFilter = ({ id, label = "Produto", value, valueMode = "id", onChange }: Props) => (
  <AsyncReportSelect
    id={id}
    label={label}
    value={value}
    placeholder={`Selecione ${label.toLowerCase()}`}
    loadOptions={getReportProducts}
    onChange={onChange}
    valueAsNumber={valueMode === "id"}
    optionValue={valueMode === "label" ? "label" : "value"}
  />
);

export default ProductFilter;
