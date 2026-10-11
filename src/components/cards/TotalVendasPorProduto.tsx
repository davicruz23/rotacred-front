import { useEffect, useState } from "react";
import api from "../../services/api";
import SalesByProductChart from "../charts/SalesByProductChart";

type TotalProduto = {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalValue: number;
};

const SalesByProductCard = () => {
  const [products, setProducts] = useState<TotalProduto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("dashboard/count/products-sold")
      .then((res) => setProducts(res.data))
      .catch((err) =>
        console.error("Erro ao buscar vendas por produto:", err)
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="card ps-0 full-height dashboard-card dashboard-product-card d-flex align-items-center justify-content-center">
        <p>Carregando...</p>
      </div>
    );

  return (
    <div className="card ps-0 full-height dashboard-card dashboard-product-card">
      <h5 className="mb-4 fw-medium ps-4">Produtos Mais Vendidos</h5>

      <div className="d-flex align-items-center justify-content-between">
        <SalesByProductChart data={products} />
        <div className="sessions-by-device-content">
          {products.map((p) => (
            <div key={p.productId} className="mb-3">
              <p className="mb-1 fw-semibold">{p.productName}</p>
              <p className="mb-0 text-muted">
                Quantidade: <strong>{p.totalQuantity}</strong>
              </p>
              <p className="mb-0 text-muted">
                Valor total:{" "}
                <strong>
                  R${" "}
                  {p.totalValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesByProductCard;
