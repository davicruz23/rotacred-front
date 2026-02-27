import { useEffect, useRef, useState } from "react";
type Props = {
  toggleSidebarOpen: () => void;
};
const HeaderSection2 = ({ toggleSidebarOpen }: Props) => {
  const [, setActiveDropdown] = useState<string>("");
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);

  const dropdownRef = useRef<HTMLUListElement>(null);

  const token = localStorage.getItem("token");

  let userName = "";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userName = payload.nome || "";
    } catch (error) {
      console.error("Erro ao decodificar token", error);
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const currentDate = new Date().toLocaleDateString("pt-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 100) {
        setIsHeaderFixed(true);
      } else {
        setIsHeaderFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header
      className={`top-header-area d-flex flex-wrap flex-sm-nowrap align-items-center justify-content-between  ${
        isHeaderFixed ? "header-sticky" : ""
      }`}
      id="stickyHeader"
    >
      <div className="left-side-content-area d-flex align-items-center justify-content-between">
        <div
          className="mobile-menu-icon d-md-none"
          id="mobileMenuIcon"
          role="button"
          onClick={toggleSidebarOpen}
        >
          <i className="ti ti-menu-deep"></i>
        </div>

        <div className="help-line-info">
          <button className="btn btn-primary d-flex align-items-center">
            <i className="ti ti-calendar"></i>
            <span className="d-none d-lg-inline">{currentDate}</span>
          </button>
        </div>
      </div>
      <h6 className="mb-0">
        {userName ? ` ${userName}` : ""}
        </h6>
      <div className="right-side-navbar d-flex align-items-center justify-content-between justify-content-md-end">
        <div className="top-search-bar">
          <form action="#" className="" method="get">
            <input
              className="from-control top-search mb-0"
              name="search"
              placeholder="Pesquisar"
              type="search"
            />
            <button className="" type="submit">
              <img alt="" src="/img/icons/search.svg" />
            </button>
          </form>
        </div>

        <ul
          className="ps-0 right-side-content d-flex align-items-center"
          ref={dropdownRef}
        >
          <li className="nav-item ms-2">
            <button
              className="btn topbar-user-meta-data"
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login"; // força redirecionamento
              }}
            >
              <i className="ti ti-logout" style={{ fontSize: 25 }}></i>
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};
export default HeaderSection2;
