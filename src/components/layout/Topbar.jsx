import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  useTheme,
  InputBase,
  Chip,
} from "@mui/material";
import {
  NotificationsRounded,
  SearchRounded,
  LogoutRounded,
  PersonRounded,
  SettingsRounded,
  LightModeRounded,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Topbar({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const drawerWidth = collapsed ? 72 : 260;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        transition: "width 0.3s ease, margin 0.3s ease",
        background: "rgba(241,245,249,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2E8F0",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: "#fff",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            px: 2,
            py: 0.8,
            width: 280,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SearchRounded sx={{ color: "#94A3B8", fontSize: 18 }} />
          <InputBase
            placeholder="Search anything..."
            sx={{ fontSize: "0.875rem", color: "#1E293B", flex: 1 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label="AI Ready"
            size="small"
            sx={{
              background: "linear-gradient(135deg, #2563EB20, #7C3AED20)",
              color: "#2563EB",
              fontWeight: 600,
              fontSize: "0.7rem",
              border: "1px solid #2563EB30",
            }}
          />

          <IconButton
            size="small"
            sx={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsRounded sx={{ fontSize: 20, color: "#64748B" }} />
            </Badge>
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              px: 1.5,
              py: 0.5,
              cursor: "pointer",
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.75rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              }}
            >
              {user?.fullName?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.2 }}
              >
                {user?.fullName?.split(" ")[0] || "User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748B", fontSize: "0.65rem" }}
              >
                {user?.role === "ADMIN" ? "Admin" : "Owner"}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 180,
                mt: 1,
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PersonRounded sx={{ mr: 1.5, fontSize: 18, color: "#64748B" }} />{" "}
              Profile
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <SettingsRounded
                sx={{ mr: 1.5, fontSize: 18, color: "#64748B" }}
              />{" "}
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "#EF4444" }}>
              <LogoutRounded sx={{ mr: 1.5, fontSize: 18 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
