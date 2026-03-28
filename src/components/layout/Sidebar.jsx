import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  DashboardRounded,
  Inventory2Rounded,
  PeopleRounded,
  LocalShippingRounded,
  ReceiptRounded,
  AccountBalanceWalletRounded,
  AssessmentRounded,
  AutoAwesomeRounded,
  BusinessRounded,
  AdminPanelSettingsRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  SupervisorAccountRounded,
  BarChartRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const ownerNav = [
  { label: "Dashboard", icon: <DashboardRounded />, path: "/dashboard" },
  { label: "Products", icon: <Inventory2Rounded />, path: "/products" },
  { label: "Customers", icon: <PeopleRounded />, path: "/customers" },
  { label: "Suppliers", icon: <LocalShippingRounded />, path: "/suppliers" },
  { label: "Sales", icon: <ReceiptRounded />, path: "/sales" },
  {
    label: "Expenses",
    icon: <AccountBalanceWalletRounded />,
    path: "/expenses",
  },
  { label: "Reports", icon: <AssessmentRounded />, path: "/reports" },
  {
    label: "AI Insights",
    icon: <AutoAwesomeRounded />,
    path: "/ai",
    highlight: true,
  },
];

const adminNav = [
  { label: "Admin Dashboard", icon: <BarChartRounded />, path: "/admin" },
  { label: "Businesses", icon: <BusinessRounded />, path: "/admin/businesses" },
  { label: "Users", icon: <SupervisorAccountRounded />, path: "/admin/users" },
  { label: "AI Logs", icon: <AutoAwesomeRounded />, path: "/admin/ai-logs" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navItems = isAdmin ? adminNav : ownerNav;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
          color: "#fff",
          border: "none",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2.5,
          py: 2.5,
          minHeight: 72,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
              }}
            >
              <AdminPanelSettingsRounded sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2 }}
              >
                SmartBiz
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontSize: "0.7rem" }}
              >
                {isAdmin ? "Admin Panel" : "Business Suite"}
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AdminPanelSettingsRounded sx={{ fontSize: 20, color: "#fff" }} />
          </Box>
        )}
        {!collapsed && (
          <IconButton onClick={onToggle} size="small" sx={{ color: "#64748B" }}>
            <ChevronLeftRounded />
          </IconButton>
        )}
      </Box>

      {collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <IconButton onClick={onToggle} size="small" sx={{ color: "#64748B" }}>
            <ChevronRightRounded />
          </IconButton>
        </Box>
      )}

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

      <List sx={{ px: collapsed ? 0.5 : 1.5, mt: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              item.path !== "/admin" &&
              location.pathname.startsWith(item.path));

          return (
            <Tooltip
              key={item.path}
              title={collapsed ? item.label : ""}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderRadius: "10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    px: collapsed ? 1.5 : 2,
                    py: 1.2,
                    background: active
                      ? "linear-gradient(135deg, rgba(37,99,235,0.8), rgba(124,58,237,0.6))"
                      : "transparent",
                    "&:hover": {
                      background: active
                        ? "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(124,58,237,0.7))"
                        : "rgba(255,255,255,0.06)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      color: active ? "#fff" : "#94A3B8",
                      "& svg": { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: active ? 600 : 400,
                        color: active ? "#fff" : "#CBD5E1",
                      }}
                    />
                  )}
                  {!collapsed && item.highlight && (
                    <Chip
                      label="AI"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                        color: "#fff",
                        border: "none",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2, mb: 1 }} />
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: "0.875rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            flexShrink: 0,
          }}
        >
          {user?.fullName?.charAt(0) || "U"}
        </Avatar>
        {!collapsed && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#fff",
                fontSize: "0.8rem",
                noWrap: true,
              }}
            >
              {user?.fullName || "User"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748B", fontSize: "0.7rem", display: "block" }}
            >
              {user?.role === "ADMIN" ? "Administrator" : "Business Owner"}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
