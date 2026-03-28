import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  VisibilityRounded,
  VisibilityOffRounded,
  AdminPanelSettingsRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (!user.adminRole || user.adminRole === "NONE") {
        setError("This account does not have admin access.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
      "&.Mui-focused fieldset": { borderColor: "#e53935" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.45)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#e53935" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0d1b2a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #e53935, #b71c1c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 8px 24px rgba(229,57,53,0.4)",
            }}
          >
            <AdminPanelSettingsRounded sx={{ color: "#fff", fontSize: 36 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#fff">
            Admin Portal
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.4)", mt: 0.5 }}
          >
            SmartBiz Administration
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Admin Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            sx={inputSx}
          />

          <TextField
            label="Password"
            type={showPw ? "text" : "password"}
            fullWidth
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPw((v) => !v)}
                    edge="end"
                    sx={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {showPw ? (
                      <VisibilityOffRounded fontSize="small" />
                    ) : (
                      <VisibilityRounded fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={inputSx}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(135deg, #e53935, #b71c1c)",
              boxShadow: "0 4px 16px rgba(229,57,53,0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #ef5350, #c62828)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Sign In as Admin"
            )}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: "rgba(255,255,255,0.35)", mt: 0.5 }}
          >
            Business owner?{" "}
            <Link
              to="/login"
              style={{
                color: "#90caf9",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Business Login
            </Link>
            {" · "}
            <Link
              to="/admin-register"
              style={{
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Register Admin
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
