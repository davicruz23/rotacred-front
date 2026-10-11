import { useAppSelector } from "../../redux/hooks";

const AuthTopLogo = () => {
  const darkMode = useAppSelector((state) => state.theme.isDark);
  return (
    <>
      <div className="logo">
        <a href="#">
          {darkMode ? (
            <img src="/img/core-img/rotacredlogolinhabranca.png" alt="logo" />
          ) : (
            <img
              src="/img/core-img/rotacredlogolinhabranca.png"
              alt="logo"
              style={{
                maxWidth: "400px",
                height: "auto",
                display: "block",
                margin: "0 auto"
              }}
            />
          )}
        </a>
      </div>
      {/* <Link to="/">
        <i className="fa-duotone fa-house-chimney"></i>
      </Link> */}
    </>
  );
};
export default AuthTopLogo;
