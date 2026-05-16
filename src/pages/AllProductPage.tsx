import { useState, useEffect } from "react";
import AllProductTable from "../components/table/AllProductTable";
import TableBottomControls from "../components/utils/TableBottomControls";
import api from "../services/api";
import { AllProductDataType } from "../types";

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const AllProductPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [dataPerPage] = useState(10);

  const [dataList, setDataList] = useState<AllProductDataType[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState("");

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async (page = 0, name = searchName) => {
    try {
      setLoading(true);

      const response = await api.get<PageResponse<AllProductDataType>>(
        "/product/all",
        {
          params: {
            page,
            size: dataPerPage,
            name: name?.trim() ? name.trim() : undefined,
          },
        },
      );

      if (response.status === 200) {
        setDataList(response.data.content);
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      } else {
        alert("Erro ao carregar produtos");
      }
    } catch (error: any) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // primeira carga
  useEffect(() => {
    fetchProducts(0, "");
  }, []);

  // 🔥 busca automática enquanto digita (debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(0);
      fetchProducts(0, searchName);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchName]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchProducts(0, searchName);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const response = await api.delete(`/product/${id}/delete`);

      if (response.status === 200 || response.status === 204) {
        fetchProducts(currentPage, searchName);
        alert("Produto deletado com sucesso!");
      } else {
        alert("Erro ao deletar produto.");
      }
    } catch (error: any) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const paginate = (pageNumber: number) => {
    const pageIndex = pageNumber - 1;
    setCurrentPage(pageIndex);
    fetchProducts(pageIndex, searchName);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const indexOfFirstData = currentPage * dataPerPage;
  const indexOfLastData = indexOfFirstData + dataList.length;

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="panel">
          <div className="panel-body">
            <div className="product-table-quantity">
              <ul>
                <li className="text-white">Todos Produtos ({totalElements})</li>
              </ul>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div className="input-group" style={{ width: "420px" }}>
                    <span className="input-group-text">
                      <i className="fa-light fa-magnifying-glass"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Pesquisar por nome do produto..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                    />

                    {searchName?.trim() && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearchName("")}
                        title="Limpar"
                      >
                        <i className="fa-light fa-xmark"></i>
                      </button>
                    )}
                  </div>
                  <small className="text-muted">
                    {searchName?.trim()
                      ? `Filtrando por: "${searchName}"`
                      : ""}
                  </small>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <AllProductTable
                  tableData={dataList}
                  handleDelete={handleDelete}
                />

                <TableBottomControls
                  indexOfFirstData={indexOfFirstData}
                  indexOfLastData={indexOfLastData}
                  dataList={dataList}
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  paginate={paginate}
                  pageNumbers={pageNumbers}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductPage;
