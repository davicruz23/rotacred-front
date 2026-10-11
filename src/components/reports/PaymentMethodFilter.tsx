import { ReportFilterOption, ReportFilterValue } from "../../types/reportPdf";

type Props = {
  id: string;
  label?: string;
  value?: ReportFilterValue;
  options: ReportFilterOption[];
  onChange: (value: ReportFilterValue) => void;
};

const PaymentMethodFilter = ({ id, label = "Forma de pagamento", value, options, onChange }: Props) => (
  <div className="report-filter-field">
    <label htmlFor={id}>{label}</label>
    <select id={id} className="form-select" value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value || "all"} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export default PaymentMethodFilter;
