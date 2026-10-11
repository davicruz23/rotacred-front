import { ReportFilterValue } from "../../types/reportPdf";

type Props = {
  startKey: string;
  endKey: string;
  startValue?: ReportFilterValue;
  endValue?: ReportFilterValue;
  onChange: (key: string, value: ReportFilterValue) => void;
};

const DateRangeFilter = ({
  startKey,
  endKey,
  startValue,
  endValue,
  onChange,
}: Props) => (
  <div className="report-filter-field report-filter-date-range">
    <span className="report-filter-label">Período</span>
    <div className="report-date-range-controls">
      <label htmlFor={startKey}>De</label>
      <input
        id={startKey}
        className="form-control"
        type="date"
        value={startValue ?? ""}
        onChange={(event) => onChange(startKey, event.target.value)}
      />
      <label htmlFor={endKey}>Até</label>
      <input
        id={endKey}
        className="form-control"
        type="date"
        value={endValue ?? ""}
        onChange={(event) => onChange(endKey, event.target.value)}
      />
    </div>
  </div>
);

export default DateRangeFilter;
