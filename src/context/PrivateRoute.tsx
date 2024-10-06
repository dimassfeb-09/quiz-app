import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const user = localStorage.getItem("email");
  return user !== null;
};

interface PrivateRouteProps {
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  return isAuthenticated() ? (
    children ? (
      <>{children}</>
    ) : (
      <Outlet />
    )
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
