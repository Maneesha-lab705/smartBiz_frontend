import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  const isAdmin = Boolean(user.adminRole && user.adminRole !== "NONE");
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!adminOnly && isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}
