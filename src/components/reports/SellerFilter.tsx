import AsyncReportSelect from "./AsyncReportSelect";
import { getReportSellers } from "../../services/reportFilterOptionsService";
import { ReportFilterValue } from "../../types/reportPdf";

type Props = { id: string; value?: ReportFilterValue; onChange: (value: ReportFilterValue) => void };

const SellerFilter = ({ id, value, onChange }: Props) => (
  <AsyncReportSelect
    id={id}
    label="Vendedor"
    value={value}
    placeholder="Selecione o vendedor"
    loadOptions={getReportSellers}
    onChange={onChange}
    valueAsNumber
  />
);

export default SellerFilter;
