import { useEffect, useState } from "react";
import api from "../services/api";
import BreadcrumbSection from "../components/breadcrumb/BreadcrumbSection";
import { useNavigate } from "react-router-dom";

type SaleType = {
  id: number;
  clientId: number;
  clientName: string;
  city: string;
  state: string;
  amount: number;
};

type GroupedType = {
  city: string;
  totalSales: number;
  sales: SaleType[];
};

const AddCitiesByCollectorPage = () => {
  const [collectorList, setCollectorList] = useState<
    { id: number; collectorName: string }[]
  >([]);
  const [groupedSales, setGroupedSales] = useState<GroupedType[]>([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const navigate = useNavigate();

  const fetchGroupedSales = async () => {
    const response = await api.get("/collector/grouped-by-city/assigment");
    setGroupedSales(response.data);
  };

  const fetchCollectors = async () => {
    const response = await api.get("/collector/name/all");
    setCollectorList(response.data);
  };

  useEffect(() => {
    fetchGroupedSales();
    fetchCollectors();
  }, []);

  const toggleSale = (id: number) => {
    setSelectedSales((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleCitySales = (sales: SaleType[]) => {
    const citySaleIds = sales.map((sale) => sale.id);

    const allSelected = citySaleIds.every((id) => selectedSales.includes(id));

    setSelectedSales((prev) => {
      if (allSelected) {
        return prev.filter((id) => !citySaleIds.includes(id));
      }

      const newIds = citySaleIds.filter((id) => !prev.includes(id));
      return [...prev, ...newIds];
    });
  };

  const handleAssign = async () => {
    if (!selectedCollector || selectedSales.length === 0) {
      alert("Selecione o cobrador e as Vendas.");
      return;
    }

    try {
      await api.post(`/collector/assign-sales`, {
        collectorId: Number(selectedCollector),
        saleIds: selectedSales,
      });

      alert("Cobranças Direcionadas!");

      setSelectedSales([]);
      setSelectedCollector("");

      fetchGroupedSales();
    } catch (err: any) {
      if (err?.response?.status === 404) {
        navigate("/error-404", { replace: true });
        return;
      }

      navigate("/error-500", { replace: true });
      return;
    }
  };

  return (
    <div className="container-fluid px-1 my-1">
      <BreadcrumbSection
        title="Atribuir Cobranças ao Cobrador"
        link="/inicio"
      />

      <div className="card shadow-sm p-4 mb-4">
        <h4 className="mb-3">Selecione o cobrador</h4>

        <select
          className="form-select w-25"
          value={selectedCollector}
          onChange={(e) => setSelectedCollector(e.target.value)}
        >
          <option value="">-- selecione --</option>
          {collectorList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.collectorName}
            </option>
          ))}
        </select>
      </div>

      <div className="accordion" id="accordionCities">
        {groupedSales.map((group, index) => (
          <div className="accordion-item" key={group.city}>
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${index}`}
              >
                <span className="flex-grow-1">
                  {group.city} ({group.totalSales})
                </span>

                <div
                  className="d-flex align-items-center gap-2 me-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="small">Selecionar todas</span>

                  <input
                    type="checkbox"
                    checked={group.sales.every((sale) =>
                      selectedSales.includes(sale.id),
                    )}
                    onChange={() => toggleCitySales(group.sales)}
                  />
                </div>
              </button>
            </h2>

            <div
              id={`collapse-${index}`}
              className="accordion-collapse collapse"
              data-bs-parent="#accordionCities"
            >
              <div className="accordion-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Valor</th>
                      <th className="text-end">
                        <div className="d-flex justify-content-end align-items-center gap-2">
                          <span>Selecionar todos</span>
                          <input
                            type="checkbox"
                            checked={group.sales.every((sale) =>
                              selectedSales.includes(sale.id),
                            )}
                            onChange={() => toggleCitySales(group.sales)}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {group.sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.clientName}</td>
                        <td>R$ {sale.amount}</td>
                        <td className="text-end">
                          <input
                            type="checkbox"
                            checked={selectedSales.includes(sale.id)}
                            onChange={() => toggleSale(sale.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-end mt-4">
        <button className="btn btn-success px-4" onClick={handleAssign}>
          Atribuir Selecionadas
        </button>
      </div>
    </div>
  );
};

export default AddCitiesByCollectorPage;
