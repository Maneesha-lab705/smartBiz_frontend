import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB",
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#7C3AED",
      light: "#8B5CF6",
      dark: "#6D28D9",
      contrastText: "#fff",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B",
      light: "#FCD34D",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    background: {
      default: "#F1F5F9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0,0,0,0.08)",
    "0px 2px 6px rgba(0,0,0,0.08)",
    "0px 4px 12px rgba(0,0,0,0.08)",
    "0px 6px 16px rgba(0,0,0,0.10)",
    "0px 8px 24px rgba(0,0,0,0.10)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          "&:hover": { boxShadow: "0 4px 12px rgba(37,99,235,0.3)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #F1F5F9",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F8FAFC",
            color: "#64748B",
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        },
      },
    },
  },
});

export default theme;
