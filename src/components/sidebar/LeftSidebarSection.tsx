import { Link } from "react-router-dom";
import SideMenuNavSection from "../navigation/SideMenuNavSection";
import { useAppSelector } from "../../redux/hooks";
import { MutableRefObject } from "react";
type Props = {
  logoutBtn?: boolean;
  customLogo?: string;
  dashedDivider?: boolean;
  noTitle?: boolean;
  iconOnly?: boolean;
  noDefaultOpen?: boolean;
  toggleClose?: () => void;
  sidebarRef: MutableRefObject<HTMLDivElement | null>;
};
const LeftSidebarSection = ({
  logoutBtn,
  customLogo,
  dashedDivider,
  noTitle,
  iconOnly,
  noDefaultOpen,
  toggleClose,
  sidebarRef,
}: Props) => {
  const darkMode = useAppSelector((state) => state.theme.isDark);
  const sidebarBgImage = useAppSelector((state) => state.sidebarBg.sidebarBg);
  return (
    <div
      className={`webdesh-sidemenu-area ${
        sidebarBgImage !== "" ? "sidebar-bg-detected" : ""
      }`}
      id="sideMenuWrapper"
      style={{
        ...(sidebarBgImage !== "" && {
          backgroundImage: `url(${sidebarBgImage})`,
        }),
      }}
      ref={sidebarRef}
    >
      <div className="webdesh-logo">
        {customLogo ? (
          <Link to="/">
            <img className="white-logo" src={customLogo} alt="logo" />
          </Link>
        ) : (
          <Link to="/">
            {darkMode ? (
              <img
                className="dark-mode-logo"
                src="/img/core-img/rotacredlogolinhabranca.png"
                alt="logo"
              />
            ) : (
              <img
                className="light-mode-logo"
                src="/img/core-img/rotacredlogolinhabranca.png"
                alt="logo"
              />
            )}
          </Link>
        )}
      </div>
      <div className="webdesh-sidenav" id="webdeshSideNav">
        <SideMenuNavSection
          logoutBtn={logoutBtn}
          dashedDivider={dashedDivider}
          noTitle={noTitle}
          iconOnly={iconOnly}
          noDefaultOpen={noDefaultOpen}
        />
      </div>
      {logoutBtn && (
        <a href="#" className="sidenav-logout">
          <i className="ti ti-logout"></i> Log Out
        </a>
      )}
      <div className="close-sidemenu" role="button" onClick={toggleClose}>
        <i className="ti ti-x"></i>
      </div>
    </div>
  );
};
export default LeftSidebarSection;
