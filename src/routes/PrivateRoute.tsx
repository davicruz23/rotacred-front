import { Navigate, Outlet } from "react-router-dom";

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  const isValidToken = token &&
    token !== "undefined" &&
    token !== "null" &&
    token !== "" &&
    !isTokenExpired(token);

  if (!isValidToken) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const RoleRoute = ({ roles }: { roles: string[] }) => {
  const token = localStorage.getItem("token");

  const isValidToken = token &&
    token !== "undefined" &&
    token !== "null" &&
    token !== "" &&
    !isTokenExpired(token);

  if (!isValidToken) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role;

    if (!roles.includes(userRole)) {
      return <Navigate to="/error-403" replace />;
    }

    return <Outlet />;

  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export { PrivateRoute, RoleRoute };