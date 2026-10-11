import AsyncReportSelect from "./AsyncReportSelect";
import { getReportCollectors } from "../../services/reportFilterOptionsService";
import { ReportFilterValue } from "../../types/reportPdf";

type Props = { id: string; label?: string; value?: ReportFilterValue; onChange: (value: ReportFilterValue) => void };

const CollectorFilter = ({ id, label = "Cobrador", value, onChange }: Props) => (
  <AsyncReportSelect
    id={id}
    label={label}
    value={value}
    placeholder={`Selecione o ${label.toLowerCase()}`}
    loadOptions={getReportCollectors}
    onChange={onChange}
    valueAsNumber
  />
);

export default CollectorFilter;
