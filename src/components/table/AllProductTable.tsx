import { useNavigate } from "react-router-dom";
import { AllProductDataType } from "../../types";
import { ProductStatusLabel } from "../../enums/ProductStatusLabel";

type Props = {
  tableData: AllProductDataType[];
  handleDelete: (id: number) => void;
};

const AllProductTable = ({ tableData, handleDelete }: Props) => {
  const navigate = useNavigate();
  return (
    <table className="table table-dashed table-hover digi-dataTable all-product-table product-data-table">
      <thead>
        <tr>
          <th className="no-sort">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
            </div>
          </th>
          <th>Nome</th>
          <th>Estoque</th>
          <th>Preço</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((item) => (
          <tr key={item.id}>
            <td>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="table-product-card">
                <div className="product-row-icon" aria-hidden="true">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div className="part-txt">
                  <span className="product-name">{item.name}</span>
                  <span className="product-category">Marca: {item.brand}</span>
                </div>
              </div>
            </td>
            <td>{item.amount}</td>
            <td>${item.value}</td>
            <td>
              <span className={`product-status product-status--${item.status}`}>
                <span className="product-status__dot" />
                {ProductStatusLabel[item.status]}
              </span>
            </td>
            <td>
              <div className="btn-box product-actions">
                <button
                  title="Editar"
                  onClick={() => navigate(`/update-product/${item.id}`)}
                >
                  <i className="fa-light fa-pen"></i>
                </button>
                <button
                  title="Deletar"
                  onClick={() => handleDelete(item.id)}
                  className="text-danger"
                >
                  <i className="fa-light fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AllProductTable;
