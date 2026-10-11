import { ReportFilterField, ReportFilterValue, ReportFilterValues } from "../../types/reportPdf";
import CityFilter from "./CityFilter";
import ClientFilter from "./ClientFilter";
import CollectorFilter from "./CollectorFilter";
import DateRangeFilter from "./DateRangeFilter";
import FilterControl from "./FilterControl";
import PaymentMethodFilter from "./PaymentMethodFilter";
import ProductFilter from "./ProductFilter";
import SellerFilter from "./SellerFilter";
import StatusFilter from "./StatusFilter";

type Props = {
  fields: ReportFilterField[];
  values: ReportFilterValues;
  onChange: (key: string, value: ReportFilterValue) => void;
};

const SelectFilter = ({
  field,
  value,
  onChange,
}: {
  field: ReportFilterField;
  value?: ReportFilterValue;
  onChange: (value: ReportFilterValue) => void;
}) => (
  <div className="report-filter-field">
    <label htmlFor={`report-${field.key}`}>{field.label}</label>
    <select
      id={`report-${field.key}`}
      className="form-select"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Selecione</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ReportFilters = ({ fields, values, onChange }: Props) => {
  return (
    <div className="report-filters">
      {fields.map((field) => {
        if (field.type === "dateRange") {
          return (
            <DateRangeFilter
              key={field.key}
              startKey={field.startKey || "startDate"}
              endKey={field.endKey || "endDate"}
              startValue={values[field.startKey || "startDate"]}
              endValue={values[field.endKey || "endDate"]}
              onChange={onChange}
            />
          );
        }

        const value = values[field.key];
        const handleChange = (nextValue: ReportFilterValue) =>
          onChange(field.key, nextValue);

        switch (field.type) {
          case "city":
            return <CityFilter key={field.key} id={`report-${field.key}`} value={value} onChange={handleChange} />;
          case "client":
            return <ClientFilter key={field.key} id={`report-${field.key}`} value={value} onChange={handleChange} />;
          case "seller":
            return <SellerFilter key={field.key} id={`report-${field.key}`} value={value} onChange={handleChange} />;
          case "collector":
            return <CollectorFilter key={field.key} id={`report-${field.key}`} value={value} onChange={handleChange} />;
          case "responsible":
            return <CollectorFilter key={field.key} id={`report-${field.key}`} label={field.label} value={value} onChange={handleChange} />;
          case "product":
            return <ProductFilter key={field.key} id={`report-${field.key}`} value={value} valueMode={field.valueMode} onChange={handleChange} />;
          case "status":
            return <StatusFilter key={field.key} id={`report-${field.key}`} value={value} options={field.options ?? []} onChange={handleChange} />;
          case "paymentMethod":
            return <PaymentMethodFilter key={field.key} id={`report-${field.key}`} value={value} options={field.options ?? []} onChange={handleChange} />;
          case "dimension":
          case "dateType":
          case "paymentType":
          case "sort":
            return <SelectFilter key={field.key} field={field} value={value} onChange={handleChange} />;
          case "text":
          default:
            return (
              <FilterControl
                key={field.key}
                id={`report-${field.key}`}
                label={field.label}
                value={value}
                placeholder={field.placeholder}
                onChange={handleChange}
              />
            );
        }
      })}
    </div>
  );
};

export default ReportFilters;
