import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../contexts/ToastContext";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  EditRounded,
  DeleteRounded,
  PeopleRounded,
  EmailRounded,
  PhoneRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { customerAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

const EMPTY = { name: "", email: "", phone: "" };

export default function CustomersPage() {
  const { user } = useAuth();
  const showToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(() => {
    if (!user?.businessId) return;
    customerAPI
      .getByBusiness(user.businessId)
      .then((r) => setCustomers(r.data || []))
      .catch(() => setCustomers([]));
  }, [user?.businessId]);
  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = (c = null) => {
    setEditing(c);
    setForm(c || EMPTY);
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) {
        await customerAPI.update(editing.customerId, {
          ...form,
          businessId: user?.businessId,
        });
        setCustomers((p) =>
          p.map((x) =>
            x.customerId === editing.customerId ? { ...x, ...form } : x,
          ),
        );
        showToast("Customer updated successfully", "success");
      } else {
        const res = await customerAPI.create({
          ...form,
          businessId: user?.businessId,
        });
        setCustomers((p) => [
          ...p,
          res.data || { ...form, customerId: Date.now() },
        ]);
        showToast("Customer added successfully", "success");
      }
      setOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save customer";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      setCustomers((p) => p.filter((x) => x.customerId !== id));
      showToast("Customer deleted", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete customer";
      showToast(msg, "error");
    }
    setDeleteId(null);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        onAdd={() => handleOpen()}
        addLabel="Add Customer"
        searchValue={search}
        onSearch={setSearch}
      />

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.customerId} sx={{ "& td": { py: 1.5 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        background:
                          "linear-gradient(135deg, #2563EB20, #7C3AED20)",
                        color: "#2563EB",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                      }}
                    >
                      {c.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        {c.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#64748B", fontSize: "0.875rem" }}>
                  {c.phone}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(c)}
                      sx={{ color: "#2563EB" }}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(c.customerId)}
                      sx={{ color: "#EF4444" }}
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <PeopleRounded sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
            <Typography sx={{ color: "#94A3B8" }}>
              No customers found
            </Typography>
          </Box>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? "Edit Customer" : "Add Customer"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={set("name")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone"
                value={form.phone}
                onChange={set("phone")}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#64748B" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              px: 3,
            }}
          >
            {loading ? "Saving..." : editing ? "Update" : "Add Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this customer?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(deleteId)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
