import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  EmailRounded,
  LockRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  AdminPanelSettingsRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const isAdmin = Boolean(user.adminRole && user.adminRole !== "NONE");
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "50%",
          height: "60%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "50%",
          height: "60%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        },
      }}
    >
      <Box
        sx={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
            }}
          >
            <AdminPanelSettingsRounded sx={{ fontSize: 30, color: "#fff" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
            Welcome to SmartBiz
          </Typography>
          <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
            Sign in to your account to continue
          </Typography>
        </Box>

        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.85rem" }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRounded sx={{ color: "#64748B", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.08)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
                  },
                  "& .MuiInputLabel-root": { color: "#94A3B8" },
                  "& .MuiInputBase-input": { color: "#fff" },
                }}
              />

              <TextField
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRounded sx={{ color: "#64748B", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass(!showPass)}
                        edge="end"
                        sx={{ color: "#64748B" }}
                      >
                        {showPass ? (
                          <VisibilityOffRounded fontSize="small" />
                        ) : (
                          <VisibilityRounded fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.08)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
                  },
                  "& .MuiInputLabel-root": { color: "#94A3B8" },
                  "& .MuiInputBase-input": { color: "#fff" },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  borderRadius: "10px",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1D4ED8, #6D28D9)",
                  },
                  "&:disabled": { background: "#334155" },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>
          </form>

          <Divider
            sx={{
              my: 3,
              borderColor: "rgba(255,255,255,0.1)",
              "&::before, &::after": { borderColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", px: 1 }}>
              Don't have an account?
            </Typography>
          </Divider>

          <Button
            component={Link}
            to="/register"
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "#CBD5E1",
              borderRadius: "10px",
              py: 1.3,
              "&:hover": {
                borderColor: "#2563EB",
                background: "rgba(37,99,235,0.1)",
                color: "#fff",
              },
            }}
          >
            Create Business Account
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: "rgba(255,255,255,0.3)", mt: 1 }}
          >
            Admin?{" "}
            <Link
              to="/admin-login"
              style={{
                color: "#ef9a9a",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Admin Portal →
            </Link>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
