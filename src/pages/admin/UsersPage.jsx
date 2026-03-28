import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Typography,
  Tooltip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  BlockRounded,
  CheckCircleRounded,
  SupervisorAccountRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { adminAPI, authAPI } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";

const EMPTY_FORM = { name: "", email: "", password: "", role: "ADMIN" };

export default function UsersPage() {
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI
      .getUsers()
      .then((r) => {
        const raw = r.data?.content || r.data || [];
        setUsers(
          raw.map((u) => ({
            ...u,
            id: u.userId,
            fullName: u.name,
            role:
              u.adminRole && u.adminRole !== "NONE"
                ? "ADMIN"
                : "BUSINESS_OWNER",
            enabled: true,
          })),
        );
      })
      .catch(() => setUsers([]));
  }, []);

  const toggleUser = async (id, enabled) => {
    setUsers((us) =>
      us.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u)),
    );
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      await authAPI.adminRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      showToast("Admin account created successfully", "success");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setUsers((prev) => [
        ...prev,
        {
          id: Date.now(),
          fullName: form.name,
          email: form.email,
          role: "ADMIN",
          adminRole: form.role,
          bussinessRole: "NONE",
          enabled: true,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create admin";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      (roleFilter === "ALL" || u.role === roleFilter) &&
      (u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle={`${users.length} total users`}
        onAdd={() => setDialogOpen(true)}
        addLabel="Create Admin"
        searchValue={search}
        onSearch={setSearch}
        action={
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150, borderRadius: "10px" }}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="BUSINESS_OWNER">Business Owners</MenuItem>
            <MenuItem value="ADMIN">Admins</MenuItem>
          </Select>
        }
      />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Business</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} sx={{ "& td": { py: 1.5 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background:
                          u.role === "ADMIN"
                            ? "linear-gradient(135deg, #EF4444, #DC2626)"
                            : "linear-gradient(135deg, #2563EB20, #7C3AED20)",
                        color: u.role === "ADMIN" ? "#fff" : "#2563EB",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                      }}
                    >
                      {u.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {u.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        {u.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.role === "ADMIN" ? "Admin" : "Business Owner"}
                    size="small"
                    sx={{
                      background:
                        u.role === "ADMIN" ? "#EF444418" : "#2563EB18",
                      color: u.role === "ADMIN" ? "#EF4444" : "#2563EB",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      border: "none",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#64748B", fontSize: "0.875rem" }}>
                  {u.businessId ? `Business #${u.businessId}` : "—"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.enabled ? "Active" : "Disabled"}
                    size="small"
                    sx={{
                      background: u.enabled ? "#10B98118" : "#EF444418",
                      color: u.enabled ? "#10B981" : "#EF4444",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      border: "none",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#94A3B8" }}>{u.createdAt}</TableCell>
                <TableCell align="right">
                  {u.role !== "ADMIN" && (
                    <Tooltip title={u.enabled ? "Disable User" : "Enable User"}>
                      <IconButton
                        size="small"
                        onClick={() => toggleUser(u.id, u.enabled)}
                        sx={{ color: u.enabled ? "#F59E0B" : "#10B981" }}
                      >
                        {u.enabled ? (
                          <BlockRounded fontSize="small" />
                        ) : (
                          <CheckCircleRounded fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <SupervisorAccountRounded
              sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
            />
            <Typography sx={{ color: "#94A3B8" }}>No users found</Typography>
          </Box>
        )}
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create Admin Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={set("name")}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={set("password")}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select value={form.role} onChange={set("role")} label="Role">
                  <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="SUPPORT">Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving}
            sx={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              px: 3,
            }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
