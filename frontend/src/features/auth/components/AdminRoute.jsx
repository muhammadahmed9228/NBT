import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <div className="py-12 text-center text-neutral-500">Checking authorization...</div>;
  }

  return isAuthenticated && user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}