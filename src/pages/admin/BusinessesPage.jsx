import { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import {
  BusinessRounded,
  BlockRounded,
  CheckCircleRounded,
  VisibilityRounded,
  VerifiedRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import PageHeader from "../../components/common/PageHeader";
import { adminAPI } from "../../api/api";

const STATUS_COLORS = {
  ACTIVE: {
    bg: "#10B98118",
    color: "#10B981",
    icon: <VerifiedRounded sx={{ fontSize: "14px !important" }} />,
  },
  SUSPENDED: {
    bg: "#F59E0B18",
    color: "#F59E0B",
    icon: <WarningAmberRounded sx={{ fontSize: "14px !important" }} />,
  },
  INACTIVE: {
    bg: "#EF444418",
    color: "#EF4444",
    icon: <BlockRounded sx={{ fontSize: "14px !important" }} />,
  },
};

export default function BusinessesPage() {
  const showToast = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewBiz, setViewBiz] = useState(null);

  useEffect(() => {
    adminAPI
      .getBusinesses()
      .then((r) => setBusinesses(r.data || []))
      .catch(() => setBusinesses([]));
  }, []);

  const toggleStatus = async (id, current) => {
    const newStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminAPI.updateBusinessStatus(id, newStatus);
      setBusinesses((bs) =>
        bs.map((b) => (b.businessId === id ? { ...b, status: newStatus } : b)),
      );
      showToast(
        `Business ${newStatus === "ACTIVE" ? "activated" : "suspended"} successfully`,
        "success",
      );
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update status";
      showToast(msg, "error");
    }
  };

  const filtered = businesses.filter(
    (b) =>
      (statusFilter === "ALL" || b.status === statusFilter) &&
      (b.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        b.ownerName?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Box>
      <PageHeader
        title="Businesses"
        subtitle={`${businesses.length} registered businesses`}
        searchValue={search}
        onSearch={setSearch}
        action={
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 130, borderRadius: "10px" }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </Select>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {["ACTIVE", "SUSPENDED", "INACTIVE"].map((s) => {
          const c = STATUS_COLORS[s];
          return (
            <Grid item xs={4} key={s}>
              <Card sx={{ p: 2, borderLeft: `4px solid ${c.color}` }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: c.color }}
                >
                  {businesses.filter((b) => b.status === s).length}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {s}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((b) => {
              const sc = STATUS_COLORS[b.status] || STATUS_COLORS.INACTIVE;
              return (
                <TableRow key={b.businessId} sx={{ "& td": { py: 1.5 } }}>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          background: "#2563EB18",
                          color: "#2563EB",
                          fontWeight: 700,
                        }}
                      >
                        {b.businessName?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.businessName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{b.ownerName}</Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      {b.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.subscriptionPlan || "BASIC"}
                      size="small"
                      sx={{
                        background: "#F1F5F9",
                        color: "#64748B",
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.status}
                      size="small"
                      icon={sc.icon}
                      sx={{
                        background: sc.bg,
                        color: sc.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        border: "none",
                        "& .MuiChip-icon": { color: sc.color },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#94A3B8" }}>
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleDateString()
                      : b.joinedAt}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => setViewBiz(b)}
                        sx={{ color: "#2563EB" }}
                      >
                        <VisibilityRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={b.status === "ACTIVE" ? "Suspend" : "Activate"}
                    >
                      <IconButton
                        size="small"
                        onClick={() => toggleStatus(b.businessId, b.status)}
                        sx={{
                          color: b.status === "ACTIVE" ? "#F59E0B" : "#10B981",
                        }}
                      >
                        {b.status === "ACTIVE" ? (
                          <BlockRounded fontSize="small" />
                        ) : (
                          <CheckCircleRounded fontSize="small" />
                        )}
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
            <BusinessRounded sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
            <Typography sx={{ color: "#94A3B8" }}>
              No businesses found
            </Typography>
          </Box>
        )}
      </Card>

      <Dialog
        open={!!viewBiz}
        onClose={() => setViewBiz(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Business Details</DialogTitle>
        {viewBiz && (
          <DialogContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                }}
              >
                {viewBiz.businessName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {viewBiz.businessName}
                </Typography>
                <Chip
                  label={viewBiz.status}
                  size="small"
                  sx={{
                    background: (
                      STATUS_COLORS[viewBiz.status] || STATUS_COLORS.INACTIVE
                    ).bg,
                    color: (
                      STATUS_COLORS[viewBiz.status] || STATUS_COLORS.INACTIVE
                    ).color,
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
            {[
              ["Owner", viewBiz.ownerName],
              ["Email", viewBiz.email],
              ["Plan", viewBiz.subscriptionPlan || "BASIC"],
              [
                "Joined",
                viewBiz.createdAt
                  ? new Date(viewBiz.createdAt).toLocaleDateString()
                  : "—",
              ],
            ].map(([k, v]) => (
              <Box
                key={k}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  {k}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {v}
                </Typography>
              </Box>
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setViewBiz(null)}>Close</Button>
          {viewBiz && (
            <Button
              variant="contained"
              onClick={() => {
                toggleStatus(viewBiz.businessId, viewBiz.status);
                setViewBiz(null);
              }}
              color={viewBiz.status === "ACTIVE" ? "warning" : "success"}
            >
              {viewBiz.status === "ACTIVE" ? "Suspend" : "Activate"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
