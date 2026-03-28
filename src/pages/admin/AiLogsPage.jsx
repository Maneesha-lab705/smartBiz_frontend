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
  Typography,
  Avatar,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { AutoAwesomeRounded, AddRounded, DeleteRounded } from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { adminAPI } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";

const TYPE_CONFIGS = {
  INSIGHT: { label: "Insight", bg: "#2563EB18", color: "#2563EB" },
  EMAIL: { label: "Email", bg: "#7C3AED18", color: "#7C3AED" },
  MARKETING: { label: "Marketing", bg: "#F59E0B18", color: "#F59E0B" },
};

export default function AiLogsPage() {
  const showToast = useToast();
  const [logs, setLogs] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", key: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI
      .getAiUsageLogs()
      .then((r) => setLogs(r.data?.content || r.data || []))
      .catch(() => setLogs([]));

    adminAPI
      .getApiKeys()
      .then((r) => setApiKeys(r.data || []))
      .catch(() => setApiKeys([]));
  }, []);

  const handleAdd = () => {
    setSaving(true);
    adminAPI
      .createApiKey(form)
      .then((r) => {
        setApiKeys([...apiKeys, r.data]);
        setDialogOpen(false);
        setForm({ name: "", key: "" });
        showToast("API Key added successfully", "success");
      })
      .catch((err) => showToast("Failed to add API Key", "error"))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    adminAPI
      .deleteApiKey(id)
      .then(() => {
        setApiKeys(apiKeys.filter((k) => k.id !== id));
        showToast("API Key deleted successfully", "success");
      })
      .catch(() => showToast("Failed to delete API Key", "error"));
  };

  const totalTokens = logs.reduce((a, l) => a + l.tokensUsed, 0);
  const filtered = logs.filter(
    (l) =>
      l.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      l.type?.toLowerCase().includes(search.toLowerCase()) ||
      l.prompt?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <PageHeader
        title="AI Management"
        subtitle="Manage API keys and monitor AI feature usage"
      />

      {/* API Keys Section */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">API Keys</Typography>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setDialogOpen(true)}
          >
            Add API Key
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.name}</TableCell>
                <TableCell>{key.key}</TableCell>
                <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(key.id)}>
                    <DeleteRounded />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* AI Logs Section */}
      <PageHeader
        title="AI Usage Logs"
        subtitle="Monitor AI feature usage across businesses"
        searchValue={search}
        onSearch={setSearch}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total AI Requests", value: logs.length, color: "#2563EB" },
          {
            label: "Total Tokens Used",
            value: totalTokens.toLocaleString(),
            color: "#F59E0B",
          },
          {
            label: "Insights Generated",
            value: logs.filter((l) => l.type === "INSIGHT").length,
            color: "#7C3AED",
          },
          {
            label: "Emails Generated",
            value: logs.filter((l) => l.type === "EMAIL").length,
            color: "#10B981",
          },
        ].map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
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
              <TableCell>Business</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Prompt</TableCell>
              <TableCell>Tokens</TableCell>
              <TableCell>Date & Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((l) => {
              const tc = TYPE_CONFIGS[l.type] || TYPE_CONFIGS.INSIGHT;
              return (
                <TableRow key={l.id} sx={{ "& td": { py: 1.5 } }}>
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
                        {l.businessName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        >
                          {l.businessName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                          {l.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tc.label}
                      size="small"
                      sx={{
                        background: tc.bg,
                        color: tc.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: "hidden" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748B",
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {l.prompt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={l.tokensUsed}
                      size="small"
                      sx={{
                        background: "#F59E0B18",
                        color: "#F59E0B",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#94A3B8", fontSize: "0.8rem" }}>
                    {l.createdAt}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <AutoAwesomeRounded
              sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
            />
            <Typography sx={{ color: "#94A3B8" }}>No AI logs found</Typography>
          </Box>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={saving || !form.name || !form.key}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
