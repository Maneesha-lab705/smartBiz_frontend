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
  Autocomplete,
  Tooltip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  ReceiptRounded,
  AddRounded,
  DeleteRounded,
  VisibilityRounded,
  CloseRounded,
  PrintRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { saleAPI, productAPI, customerAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

const STATUS_COLORS = {
  COMPLETED: { bg: "#10B98118", color: "#10B981" },
  PENDING: { bg: "#F59E0B18", color: "#F59E0B" },
  CANCELLED: { bg: "#EF444418", color: "#EF4444" },
};

const normalizeSale = (s) => ({
  ...s,
  totalAmount:
    s.totalAmount ??
    (s.saleItems || []).reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  status: s.status ?? s.payment?.paymentStatus ?? "COMPLETED",
  itemCount: s.itemCount ?? s.saleItems?.length ?? 0,
  createdAt: !s.createdAt
    ? null
    : typeof s.createdAt === "number"
      ? new Date(s.createdAt).toISOString()
      : s.createdAt,
});

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [viewSale, setViewSale] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([
    { product: null, quantity: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.businessId) {
      saleAPI
        .getByBusiness(user.businessId)
        .then((r) =>
          setSales((r.data?.content || r.data || []).map(normalizeSale)),
        )
        .catch(() => setSales([]));
    }
    if (user?.businessId) {
      productAPI
        .getByBusiness(user.businessId)
        .then((r) =>
          setProducts(
            (r.data || []).map((p) => ({
              id: p.productId,
              name: p.productName ?? p.ProductName ?? "",
              sellingPrice: p.sellingPrice,
            })),
          ),
        )
        .catch(() => setProducts([]));
      customerAPI
        .getByBusiness(user.businessId)
        .then((r) =>
          setCustomers(
            (r.data || []).map((c) => ({ id: c.customerId, name: c.name })),
          ),
        )
        .catch(() => setCustomers([]));
    }
  }, [user?.businessId]);

  const addItem = () =>
    setItems([...items, { product: null, quantity: 1, price: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === "product" && value) updated[i].price = value.sellingPrice;
    setItems(updated);
  };

  const total = items.reduce(
    (acc, item) => acc + (item.price * item.quantity || 0),
    0,
  );

  const handleCreateSale = async () => {
    const validItems = items.filter((i) => i.product);
    if (validItems.length === 0) return;
    setLoading(true);
    const payload = {
      businessId: user?.businessId,
      customerId: customer?.id ?? null,
      saleItems: validItems.map((i) => ({
        productId: i.product.id,
        qty: i.quantity,
        unitPrice: i.price,
        totalAmount: i.price * i.quantity,
      })),
      payment: {
        paymentMethod,
        paymentStatus: "COMPLETED",
        amount: total,
      },
    };
    try {
      const res = await saleAPI.create(payload);
      setSales((p) => [normalizeSale(res.data), ...p]);
      setNewSaleOpen(false);
    } catch (err) {
      console.error("Create sale failed:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setItems([{ product: null, quantity: 1, price: 0 }]);
      setCustomer(null);
      setNotes("");
    }
  };

  const filtered = sales.filter(
    (s) =>
      s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <PageHeader
        title="Sales & Invoices"
        subtitle={`${sales.length} total transactions`}
        onAdd={() => setNewSaleOpen(true)}
        addLabel="New Sale"
        searchValue={search}
        onSearch={setSearch}
      />

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s) => {
              const sc = STATUS_COLORS[s.status] || STATUS_COLORS.PENDING;
              return (
                <TableRow key={s.saleId ?? s.id} sx={{ "& td": { py: 1.5 } }}>
                  <TableCell sx={{ fontWeight: 700, color: "#2563EB" }}>
                    {s.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          background: "#2563EB18",
                          color: "#2563EB",
                        }}
                      >
                        {s.customerName?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {s.customerName || "Walk-in"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#64748B" }}>
                    {s.itemCount} items
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Rs. {Number(s.totalAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status}
                      size="small"
                      sx={{
                        background: sc.bg,
                        color: sc.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#94A3B8", fontSize: "0.875rem" }}>
                    {s.createdAt?.split("T")[0]}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => setViewSale(s)}
                        sx={{ color: "#2563EB" }}
                      >
                        <VisibilityRounded fontSize="small" />
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
            <ReceiptRounded sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
            <Typography sx={{ color: "#94A3B8" }}>No sales found</Typography>
          </Box>
        )}
      </Card>

      <Dialog
        open={newSaleOpen}
        onClose={() => setNewSaleOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          New Sale
          <IconButton onClick={() => setNewSaleOpen(false)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={8}>
              <Autocomplete
                options={customers}
                getOptionLabel={(o) => o.name || ""}
                value={customer}
                onChange={(_, v) => setCustomer(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer (optional - Walk-in)"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Payment"
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="TRANSFER">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#64748B" }}
              >
                ITEMS
              </Typography>
              {items.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    mb: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Autocomplete
                    options={products}
                    getOptionLabel={(o) => o.name || ""}
                    value={item.product}
                    onChange={(_, v) => updateItem(i, "product", v)}
                    sx={{ flex: 1 }}
                    renderInput={(params) => (
                      <TextField {...params} label="Product" size="small" />
                    )}
                  />
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, "quantity", parseInt(e.target.value) || 1)
                    }
                    size="small"
                    sx={{ width: 80 }}
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(i, "price", parseFloat(e.target.value) || 0)
                    }
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <Typography
                    sx={{
                      minWidth: 100,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    sx={{ color: "#EF4444" }}
                  >
                    <CloseRounded fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddRounded />}
                onClick={addItem}
                size="small"
                sx={{ color: "#2563EB" }}
              >
                Add Item
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Subtotal
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Rs. {total.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 4, mt: 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2563EB" }}>
              Rs. {total.toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setNewSaleOpen(false)}
            sx={{ color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSale}
            disabled={loading || items.every((i) => !i.product)}
            sx={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              px: 3,
            }}
          >
            {loading ? "Creating..." : "Create Sale"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!viewSale}
        onClose={() => setViewSale(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          Invoice Details
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Print">
              <IconButton size="small">
                <PrintRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => setViewSale(null)}>
              <CloseRounded fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        {viewSale && (
          <DialogContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#2563EB" }}
                >
                  {viewSale.invoiceNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  {viewSale.createdAt?.split("T")[0]}
                </Typography>
              </Box>
              <Chip
                label={viewSale.status}
                sx={{
                  background: (
                    STATUS_COLORS[viewSale.status] || STATUS_COLORS.PENDING
                  ).bg,
                  color: (
                    STATUS_COLORS[viewSale.status] || STATUS_COLORS.PENDING
                  ).color,
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography variant="body2">
              <strong>Customer:</strong> {viewSale.customerName || "Walk-in"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Total Amount
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#2563EB" }}
              >
                Rs. {Number(viewSale.totalAmount).toLocaleString()}
              </Typography>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
