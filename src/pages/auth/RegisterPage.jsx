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
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import {
  PersonRounded,
  EmailRounded,
  LockRounded,
  BusinessRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  AdminPanelSettingsRounded,
  PhoneRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const steps = ["Personal Info", "Business Info", "Security"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    contactNumber: "",
    businessName: "",
    subscriptionPlan: "BASIC",
    password: "",
    confirmPassword: "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleNext = () => {
    if (activeStep === 0 && (!form.ownerName || !form.email)) {
      setError("Please fill in all required fields");
      return;
    }
    if (activeStep === 1 && !form.businessName) {
      setError("Business name is required");
      return;
    }
    setError("");
    setActiveStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register({ ...payload, role: "OWNER" });
      const isAdmin = Boolean(user?.adminRole && user.adminRole !== "NONE");
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      background: "rgba(255,255,255,0.08)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&.Mui-focused fieldset": { borderColor: "#2563EB" },
    },
    "& .MuiInputLabel-root": { color: "#94A3B8" },
    "& .MuiInputBase-input": { color: "#fff" },
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
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 500 }}>
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
            Create your SmartBiz account
          </Typography>
          <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
            Get started in just a few steps
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
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              "& .MuiStepLabel-label": { color: "#64748B", fontSize: "0.8rem" },
              "& .MuiStepLabel-label.Mui-active": { color: "#fff" },
              "& .MuiStepLabel-label.Mui-completed": { color: "#10B981" },
              "& .MuiStepIcon-root": { color: "#334155" },
              "& .MuiStepIcon-root.Mui-active": { color: "#2563EB" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#10B981" },
              "& .MuiStepConnector-line": {
                borderColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, fontSize: "0.85rem" }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {activeStep === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Owner Name"
                  value={form.ownerName}
                  onChange={set("ownerName")}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRounded
                          sx={{ color: "#64748B", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRounded sx={{ color: "#64748B", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField
                  label="Phone Number"
                  value={form.contactNumber}
                  onChange={set("contactNumber")}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRounded sx={{ color: "#64748B", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <Button
                  variant="contained"
                  onClick={handleNext}
                  fullWidth
                  sx={{
                    mt: 1,
                    py: 1.5,
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    borderRadius: "10px",
                  }}
                >
                  Continue
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Business Name"
                  value={form.businessName}
                  onChange={set("businessName")}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessRounded
                          sx={{ color: "#64748B", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField
                  label="Subscription Plan (BASIC / PRO)"
                  value={form.subscriptionPlan}
                  onChange={set("subscriptionPlan")}
                  fullWidth
                  placeholder="BASIC or PRO"
                  sx={fieldSx}
                />
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "#CBD5E1",
                      borderRadius: "10px",
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    fullWidth
                    sx={{
                      py: 1.5,
                      background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                      borderRadius: "10px",
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
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
                          sx={{ color: "#64748B" }}
                        >
                          {showPass ? (
                            <VisibilityOffRounded />
                          ) : (
                            <VisibilityRounded />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRounded sx={{ color: "#64748B", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(1)}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "#CBD5E1",
                      borderRadius: "10px",
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                      borderRadius: "10px",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} sx={{ color: "#fff" }} />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </form>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "#64748B",
              mt: 3,
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#2563EB", fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
