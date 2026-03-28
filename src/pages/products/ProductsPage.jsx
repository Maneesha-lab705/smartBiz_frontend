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
  Chip,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import {
  EditRounded,
  DeleteRounded,
  Inventory2Rounded,
  WarningAmberRounded,
  MoveToInboxRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import StockInDialog from "./StockInDialog";
import { productAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

const normalize = (p) => ({
  ...p,
  ProductName: p.ProductName ?? p.productName ?? "",
  QTY: p.QTY ?? p.qty ?? 0,
});

const EMPTY = {
  ProductName: "",
  status: "ACTIVE",
  sellingPrice: "",
  billingPrice: "",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [stockOpen, setStockOpen] = useState(false);

  const load = useCallback(() => {
    if (!user?.businessId) return;
    setLoading(true);
    productAPI
      .getByBusiness(user.businessId)
      .then((r) => setProducts((r.data || []).map(normalize)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user?.businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = (product = null) => {
    setEditing(product);
    setForm(
      product
        ? {
            ProductName: product.ProductName,
            status: product.status,
            sellingPrice: product.sellingPrice,
            billingPrice: product.billingPrice,
          }
        : EMPTY,
    );
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      productName: form.ProductName,
      status: form.status,
      sellingPrice: Number(form.sellingPrice),
      billingPrice: Number(form.billingPrice),
      businessId: user?.businessId,
    };
    try {
      if (editing) {
        const res = await productAPI.update(editing.productId, payload);
        const updated = normalize(res.data || { ...editing, ...payload });
        setProducts((p) =>
          p.map((x) => (x.productId === editing.productId ? updated : x)),
        );
        showToast("Product updated successfully", "success");
      } else {
        const res = await productAPI.create(payload);
        setProducts((p) => [
          ...p,
          normalize(res.data || { ...payload, productId: Date.now() }),
        ]);
        showToast("Product added successfully", "success");
      }
      setOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save product";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      setProducts((p) => p.filter((x) => x.productId !== id));
      showToast("Product deleted", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete product";
      showToast(msg, "error");
    }
    setDeleteId(null);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = products.filter((p) =>
    p.ProductName?.toLowerCase().includes(search.toLowerCase()),
  );

  const stockChip = (p) => {
    const qty = p.QTY ?? 0;
    if (qty === 0)
      return { label: "Out of Stock", bg: "#EF444418", color: "#EF4444" };
    if (qty <= 5)
      return { label: "Low Stock", bg: "#F59E0B18", color: "#F59E0B" };
    return { label: "In Stock", bg: "#10B98118", color: "#10B981" };
  };

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in inventory`}
        onAdd={() => handleOpen()}
        addLabel="Add Product"
        searchValue={search}
        onSearch={setSearch}
        action={
          <Button
            variant="outlined"
            startIcon={<MoveToInboxRounded />}
            onClick={() => setStockOpen(true)}
            sx={{
              borderRadius: "10px",
              borderColor: "#7C3AED",
              color: "#7C3AED",
              "&:hover": { borderColor: "#6D28D9", bgcolor: "#7C3AED12" },
            }}
          >
            Stock In
          </Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Products", value: products.length, color: "#2563EB" },
          {
            label: "In Stock",
            value: products.filter((p) => p.QTY > 5).length,
            color: "#10B981",
          },
          {
            label: "Low Stock",
            value: products.filter((p) => p.QTY > 0 && p.QTY <= 5).length,
            color: "#F59E0B",
          },
          {
            label: "Out of Stock",
            value: products.filter((p) => !p.QTY || p.QTY === 0).length,
            color: "#EF4444",
          },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ p: 2, borderLeft: `4px solid ${s.color}` }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B" }}>
                {s.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Billing Price</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => {
              const s = stockChip(p);
              return (
                <TableRow key={p.productId} sx={{ "& td": { py: 1.5 } }}>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          background: "#F1F5F9",
                          color: "#2563EB",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                        }}
                      >
                        {p.ProductName?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.ProductName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#64748B" }}>
                    Rs. {Number(p.billingPrice || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Rs. {Number(p.sellingPrice || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {p.QTY <= 5 && p.QTY > 0 && (
                        <WarningAmberRounded
                          sx={{ fontSize: 14, color: "#F59E0B" }}
                        />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.QTY ?? 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.label}
                      size="small"
                      sx={{
                        background: s.bg,
                        color: s.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status || "ACTIVE"}
                      size="small"
                      sx={{
                        background:
                          p.status === "ACTIVE" ? "#10B98118" : "#EF444418",
                        color: p.status === "ACTIVE" ? "#10B981" : "#EF4444",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(p)}
                        sx={{ color: "#2563EB" }}
                      >
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteId(p.productId)}
                        sx={{ color: "#EF4444" }}
                      >
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Inventory2Rounded sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
            <Typography sx={{ color: "#94A3B8" }}>No products found</Typography>
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Product Name"
                value={form.ProductName}
                onChange={set("ProductName")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Billing Price (Rs.)"
                type="number"
                value={form.billingPrice}
                onChange={set("billingPrice")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Selling Price (Rs.)"
                type="number"
                value={form.sellingPrice}
                onChange={set("sellingPrice")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  onChange={set("status")}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                ⓘ Stock quantity is managed via the Suppliers / Batch stock-in
                flow, not set here.
              </Typography>
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
            {loading ? "Saving..." : editing ? "Update" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
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

      <StockInDialog
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        products={products}
        onSaved={load}
      />
    </Box>
  );
}
