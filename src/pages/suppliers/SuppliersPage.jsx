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
  LocalShippingRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { supplierAPI } from "../../api/api";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
};

export default function SuppliersPage() {
  const showToast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(() => {
    supplierAPI
      .getAll()
      .then((r) => setSuppliers(r.data?.content || r.data || []))
      .catch(() => setSuppliers([]));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = (s = null) => {
    setEditing(s);
    setForm(
      s ? { name: s.name, email: s.email, phone: s.contact || "" } : EMPTY,
    );
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = { name: form.name, contact: form.phone, email: form.email };
    try {
      if (editing) {
        await supplierAPI.update(editing.supplierId || editing.id, payload);
        setSuppliers((p) =>
          p.map((x) =>
            (x.supplierId || x.id) === (editing.supplierId || editing.id)
              ? { ...x, ...form }
              : x,
          ),
        );
        showToast("Supplier updated successfully", "success");
      } else {
        const res = await supplierAPI.create(payload);
        setSuppliers((p) => [
          ...p,
          res.data || { ...form, supplierId: Date.now() },
        ]);
        showToast("Supplier added successfully", "success");
      }
      setOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save supplier";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supplierAPI.delete(id);
      setSuppliers((p) => p.filter((x) => (x.supplierId || x.id) !== id));
      showToast("Supplier deleted", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete supplier";
      showToast(msg, "error");
    }
    setDeleteId(null);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const filtered = suppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers`}
        onAdd={() => handleOpen()}
        addLabel="Add Supplier"
        searchValue={search}
        onSearch={setSearch}
      />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Phone / Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.supplierId || s.id} sx={{ "& td": { py: 1.5 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        background: "#7C3AED18",
                        color: "#7C3AED",
                        fontWeight: 700,
                      }}
                    >
                      {s.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        {s.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#64748B", fontSize: "0.875rem" }}>
                  {s.contact || s.phone || "—"}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(s)}
                      sx={{ color: "#2563EB" }}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(s.supplierId || s.id)}
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
            <LocalShippingRounded
              sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
            />
            <Typography sx={{ color: "#94A3B8" }}>
              No suppliers found
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
          {editing ? "Edit Supplier" : "Add Supplier"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Supplier Name"
                value={form.name}
                onChange={set("name")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone / Contact"
                value={form.phone}
                onChange={set("phone")}
                fullWidth
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
            {loading ? "Saving..." : editing ? "Update" : "Add Supplier"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Supplier</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this supplier?
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
