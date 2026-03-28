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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  VisibilityRounded,
  VisibilityOffRounded,
  PersonAddRounded,
} from "@mui/icons-material";
import { authAPI } from "../../api/api";

const EMPTY = { name: "", email: "", password: "", role: "ADMIN" };

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.adminRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
      setTimeout(() => navigate("/admin-login"), 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
      "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.45)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#7C3AED" },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.45)" },
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
          maxWidth: 440,
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
              background: "linear-gradient(135deg, #7C3AED, #2563EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
            }}
          >
            <PersonAddRounded sx={{ color: "#fff", fontSize: 34 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#fff">
            Create Admin Account
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
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Admin account created! Redirecting to login...
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Full Name"
            fullWidth
            required
            value={form.name}
            onChange={set("name")}
            sx={inputSx}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={set("email")}
            sx={inputSx}
          />

          <TextField
            label="Password"
            type={showPw ? "text" : "password"}
            fullWidth
            required
            value={form.password}
            onChange={set("password")}
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

          <FormControl fullWidth sx={inputSx}>
            <InputLabel sx={{ color: "rgba(255,255,255,0.45)" }}>
              Role
            </InputLabel>
            <Select
              value={form.role}
              onChange={set("role")}
              label="Role"
              sx={{ color: "#fff" }}
              MenuProps={{
                PaperProps: {
                  sx: { background: "#1e293b", color: "#fff" },
                },
              }}
            >
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="SUPPORT">Support</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || success}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(135deg, #7C3AED, #2563EB)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #6D28D9, #1D4ED8)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Create Admin Account"
            )}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: "rgba(255,255,255,0.35)", mt: 0.5 }}
          >
            Already have an account?{" "}
            <Link
              to="/admin-login"
              style={{
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Admin Login →
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
