import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import { AddBoxRounded, Inventory2Rounded } from "@mui/icons-material";
import { supplierAPI, productAPI, batchAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const EMPTY_FORM = {
  batchNumber: "",
  name: "",
  category: "",
  qty: "",
  costPrice: "",
  sellingPrice: "",
  newProductName: "",
};

function genBatchNumber() {
  return `BATCH-${Date.now().toString().slice(-6)}`;
}

export default function StockInDialog({
  open,
  onClose,
  products = [],
  onSaved,
}) {
  const { user } = useAuth();
  const showToast = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [productMode, setProductMode] = useState("existing");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    batchNumber: genBatchNumber(),
  });
  const [loading, setLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSuppliersLoading(true);
    supplierAPI
      .getAll()
      .then((r) => setSuppliers(r.data || []))
      .catch(() => setSuppliers([]))
      .finally(() => setSuppliersLoading(false));
  }, [open]);

  useEffect(() => {
    if (selectedProduct) {
      setForm((f) => ({
        ...f,
        sellingPrice: String(selectedProduct.sellingPrice || ""),
      }));
    }
  }, [selectedProduct]);

  const reset = () => {
    setSelectedSupplier(null);
    setSelectedProduct(null);
    setProductMode("existing");
    setForm({ ...EMPTY_FORM, batchNumber: genBatchNumber() });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      showToast("Please select a supplier", "error");
      return;
    }
    if (productMode === "existing" && !selectedProduct) {
      showToast("Please select a product", "error");
      return;
    }
    if (productMode === "new" && !form.newProductName.trim()) {
      showToast("Please enter a product name", "error");
      return;
    }
    if (!form.qty || Number(form.qty) <= 0) {
      showToast("Please enter a valid quantity", "error");
      return;
    }
    if (!form.costPrice || Number(form.costPrice) <= 0) {
      showToast("Please enter cost price", "error");
      return;
    }

    setLoading(true);
    try {
      let productId = selectedProduct?.productId ?? null;
      let productName =
        selectedProduct?.ProductName ?? form.newProductName.trim();

      if (productMode === "new") {
        const newProd = await productAPI.create({
          productName: form.newProductName.trim(),
          status: "ACTIVE",
          sellingPrice: Number(form.sellingPrice) || 0,
          billingPrice: Number(form.costPrice) || 0,
          businessId: user.businessId,
        });
        productId = newProd.data?.productId;
        productName = form.newProductName.trim();
      }

      await batchAPI.create({
        batchNumber: form.batchNumber || genBatchNumber(),
        name: form.name,
        category: form.category,
        qty: Number(form.qty),
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice) || 0,
        productName: productName,
        productId: productId,
        supplierId: selectedSupplier.supplierId,
        businessId: user.businessId,
      });

      showToast(
        productMode === "new"
          ? "Product created & batch saved successfully"
          : "Batch saved successfully",
        "success",
      );
      onSaved?.();
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save batch";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AddBoxRounded sx={{ color: "#2563EB" }} />
          Stock In — Add Batch
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Supplier
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={suppliers}
              loading={suppliersLoading}
              getOptionLabel={(s) => s.name || ""}
              value={selectedSupplier}
              onChange={(_, v) => setSelectedSupplier(v)}
              isOptionEqualToValue={(o, v) => o.supplierId === v.supplierId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Supplier"
                  size="small"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {suppliersLoading ? (
                          <CircularProgress size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText={
                    suppliers.length === 0 && !suppliersLoading
                      ? "No suppliers found — add suppliers in the Suppliers page first"
                      : ""
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Product
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={productMode}
              exclusive
              onChange={(_, v) => {
                if (v) {
                  setProductMode(v);
                  setSelectedProduct(null);
                }
              }}
              size="small"
              sx={{ mb: 1 }}
            >
              <ToggleButton
                value="existing"
                sx={{ px: 2, textTransform: "none", fontWeight: 500 }}
              >
                <Inventory2Rounded fontSize="small" sx={{ mr: 0.5 }} /> Existing
                Product
              </ToggleButton>
              <ToggleButton
                value="new"
                sx={{ px: 2, textTransform: "none", fontWeight: 500 }}
              >
                <AddBoxRounded fontSize="small" sx={{ mr: 0.5 }} /> New Product
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {productMode === "existing" ? (
            <Grid item xs={12}>
              <Autocomplete
                options={products}
                getOptionLabel={(p) => p.ProductName || ""}
                value={selectedProduct}
                onChange={(_, v) => setSelectedProduct(v)}
                isOptionEqualToValue={(o, v) => o.productId === v.productId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    size="small"
                    required
                  />
                )}
                renderOption={(props, p) => (
                  <Box component="li" {...props} key={p.productId}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.ProductName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        Current stock: {p.QTY} · Rs. {p.sellingPrice}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TextField
                label="New Product Name"
                value={form.newProductName}
                onChange={set("newProductName")}
                fullWidth
                required
                size="small"
                helperText="A new product will be created automatically"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Batch Details
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Batch Number"
              value={form.batchNumber}
              onChange={set("batchNumber")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Batch Name / Description"
              value={form.name}
              onChange={set("name")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Category"
              value={form.category}
              onChange={set("category")}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Quantity"
              type="number"
              value={form.qty}
              onChange={set("qty")}
              fullWidth
              size="small"
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cost Price (Rs.)"
              type="number"
              value={form.costPrice}
              onChange={set("costPrice")}
              fullWidth
              size="small"
              required
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Selling Price (Rs.)"
              type="number"
              value={form.sellingPrice}
              onChange={set("sellingPrice")}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              helperText={selectedProduct ? "Pre-filled from product" : ""}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{ color: "#64748B" }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            px: 3,
          }}
        >
          {loading ? "Saving..." : "Save Batch"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
