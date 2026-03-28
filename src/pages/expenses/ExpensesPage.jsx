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
  Tooltip,
} from "@mui/material";
import {
  EditRounded,
  DeleteRounded,
  AccountBalanceWalletRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { expenseAPI } from "../../api/api";

const CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Transport",
  "Marketing",
  "Supplies",
  "Maintenance",
  "Other",
];

const CAT_COLORS = {
  Rent: "#2563EB",
  Utilities: "#7C3AED",
  Salaries: "#F59E0B",
  Transport: "#10B981",
  Marketing: "#EF4444",
  Supplies: "#06B6D4",
  Maintenance: "#84CC16",
  Other: "#94A3B8",
};

const EMPTY = {
  description: "",
  category: "Other",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    expenseAPI
      .getAll()
      .then((r) => setExpenses(r.data?.content || r.data || []))
      .catch(() => setExpenses([]));
  }, []);

  const handleOpen = (e = null) => {
    setEditing(e);
    setForm(e || EMPTY);
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) {
        await expenseAPI.update(editing.id, form);
        setExpenses((p) =>
          p.map((x) => (x.id === editing.id ? { ...x, ...form } : x)),
        );
      } else {
        const res = await expenseAPI.create(form);
        setExpenses((p) => [...p, res.data]);
      }
      setOpen(false);
    } catch {
      setExpenses((p) =>
        editing
          ? p.map((x) => (x.id === editing.id ? { ...x, ...form } : x))
          : [
              ...p,
              { ...form, id: Date.now(), amount: parseFloat(form.amount) },
            ],
      );
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseAPI.delete(id);
    } catch {}
    setExpenses((p) => p.filter((x) => x.id !== id));
    setDeleteId(null);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const total = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const filtered = expenses.filter(
    (e) =>
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <PageHeader
        title="Expenses"
        subtitle="Track your daily expenses & costs"
        onAdd={() => handleOpen()}
        addLabel="Add Expense"
        searchValue={search}
        onSearch={setSearch}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {CATEGORIES.slice(0, 4).map((cat) => {
          const catTotal = expenses
            .filter((e) => e.category === cat)
            .reduce((a, e) => a + Number(e.amount), 0);
          return (
            <Grid item xs={6} sm={3} key={cat}>
              <Card sx={{ p: 2, borderLeft: `4px solid ${CAT_COLORS[cat]}` }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: CAT_COLORS[cat] }}
                >
                  Rs. {catTotal.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {cat}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card
        sx={{
          mb: 2,
          p: 2.5,
          background: "linear-gradient(135deg, #EF4444, #DC2626)",
          borderRadius: 3,
        }}
      >
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Total Expenses This Month
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#fff", mt: 0.5 }}
        >
          Rs. {total.toLocaleString()}
        </Typography>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} sx={{ "& td": { py: 1.5 } }}>
                <TableCell sx={{ fontWeight: 600 }}>{e.description}</TableCell>
                <TableCell>
                  <Chip
                    label={e.category}
                    size="small"
                    sx={{
                      background: `${CAT_COLORS[e.category] || "#94A3B8"}18`,
                      color: CAT_COLORS[e.category] || "#64748B",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      border: "none",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#EF4444" }}>
                  Rs. {Number(e.amount).toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: "#64748B" }}>{e.date}</TableCell>
                <TableCell sx={{ color: "#94A3B8", fontSize: "0.8rem" }}>
                  {e.notes || "—"}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(e)}
                      sx={{ color: "#2563EB" }}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(e.id)}
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
            <AccountBalanceWalletRounded
              sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
            />
            <Typography sx={{ color: "#94A3B8" }}>No expenses found</Typography>
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
          {editing ? "Edit Expense" : "Add Expense"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={form.description}
                onChange={set("description")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  label="Category"
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Amount (Rs.)"
                type="number"
                value={form.amount}
                onChange={set("amount")}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                value={form.date}
                onChange={set("date")}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={set("notes")}
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
            {loading ? "Saving..." : editing ? "Update" : "Add Expense"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this expense?</Typography>
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
