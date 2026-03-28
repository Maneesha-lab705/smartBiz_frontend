import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const drawerWidth = collapsed ? 72 : 260;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#F1F5F9" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          ml: 0,
          transition: "margin 0.3s ease",
        }}
      >
        <Topbar collapsed={collapsed} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: "72px",
            p: 3,
            minHeight: "calc(100vh - 72px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
