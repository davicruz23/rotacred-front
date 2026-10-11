import AsyncReportSelect from "./AsyncReportSelect";
import { getReportCities } from "../../services/reportFilterOptionsService";
import { ReportFilterValue } from "../../types/reportPdf";

type Props = { id: string; value?: ReportFilterValue; onChange: (value: ReportFilterValue) => void };

const CityFilter = ({ id, value, onChange }: Props) => (
  <AsyncReportSelect
    id={id}
    label="Cidade"
    value={value}
    placeholder="Selecione a cidade"
    loadOptions={getReportCities}
    onChange={onChange}
    unavailableMessage="O back precisa disponibilizar o catálogo de cidades."
  />
);

export default CityFilter;
