import { ReportFilterValue } from "../../types/reportPdf";

type Props = {
  id: string;
  label: string;
  value?: ReportFilterValue;
  placeholder?: string;
  type?: "text" | "number";
  onChange: (value: ReportFilterValue) => void;
};

const FilterControl = ({
  id,
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: Props) => (
  <div className="report-filter-field">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      className="form-control"
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      min={type === "number" ? 0 : undefined}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange(type === "number" && nextValue ? Number(nextValue) : nextValue);
      }}
    />
  </div>
);

export default FilterControl;
