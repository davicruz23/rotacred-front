type Props = {
  loading: boolean;
  onClick: () => void;
};

const ReportPdfButton = ({ loading, onClick }: Props) => (
  <button
    type="button"
    className="btn btn-primary report-pdf-button"
    onClick={onClick}
    disabled={loading}
  >
    {loading ? (
      <>
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        Gerando PDF...
      </>
    ) : (
      <>
        <i className="ti ti-file-type-pdf" aria-hidden="true" />
        Exportar PDF
      </>
    )}
  </button>
);

export default ReportPdfButton;
