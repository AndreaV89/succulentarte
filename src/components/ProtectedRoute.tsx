import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import type { JSX } from "react";
import Box from "@mui/material/Box";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

<Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}></Box>;
