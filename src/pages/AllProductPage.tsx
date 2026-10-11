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

  // // primeira carga
  // useEffect(() => {
  //   fetchProducts(0, "");
  // }, []);

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
    <div className="row g-4 product-page product-list-page">
      <div className="col-12">
        <div className="product-page__heading">
          <div>
            <span className="product-page__eyebrow">CATÁLOGO &amp; ESTOQUE</span>
            <h1>Produtos</h1>
            <p>Consulte, organize e mantenha seu inventário sempre atualizado.</p>
          </div>

          <div className="product-page__metric">
            <span>Itens cadastrados</span>
            <strong>{totalElements}</strong>
            <small>no catálogo</small>
          </div>
        </div>

        <div className="panel product-panel">
          <div className="panel-body product-panel__body">
            <div className="product-toolbar">
              <div className="product-toolbar__copy">
                <span className="product-toolbar__eyebrow">INVENTÁRIO</span>
                <h2>Todos os produtos</h2>
                <p>Pesquise por nome para encontrar um item rapidamente.</p>
              </div>

              <div className="product-toolbar__search">
                <div className="input-group product-search-group">
                  <span className="input-group-text">
                    <i className="fa-light fa-magnifying-glass"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar produto..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    aria-label="Pesquisar produto por nome"
                  />

                  {searchName?.trim() && (
                    <button
                      className="btn product-search-clear"
                      type="button"
                      onClick={() => setSearchName("")}
                      title="Limpar pesquisa"
                    >
                      <i className="fa-light fa-xmark"></i>
                    </button>
                  )}
                </div>

                <small className="product-search-caption">
                  {searchName?.trim()
                    ? `Filtrando por: "${searchName}"`
                    : `${totalElements} itens disponíveis`}
                </small>
              </div>
            </div>

            {loading ? (
              <div className="product-loading-state">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <span>Carregando produtos...</span>
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
