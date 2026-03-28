import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Select,
  MenuItem,
} from "@mui/material";
import {
  BusinessRounded,
  PeopleRounded,
  AutoAwesomeRounded,
  TrendingUpRounded,
  VerifiedRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { adminAPI } from "../../api/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [growth, setGrowth] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    adminAPI
      .getStats()
      .then((r) => {
        if (r.data) {
          setStats(r.data);
          setRecent(r.data.recentBusinesses || []);
        }
      })
      .catch(() => {});
  }, []);

  const statCards = [
    {
      label: "Total Businesses",
      value: stats.totalBusinesses,
      icon: <BusinessRounded />,
      color: "#2563EB",
      sub: `${stats.activeBusinesses} active`,
    },
    {
      label: "Inactive Businesses",
      value: stats.inactiveBusinesses,
      icon: <PeopleRounded />,
      color: "#7C3AED",
      sub: `${stats.newBusinessesThisMonth} new this month`,
    },
    {
      label: "AI Requests",
      value: (stats.totalAiRequestsThisMonth || 0).toLocaleString(),
      icon: <AutoAwesomeRounded />,
      color: "#F59E0B",
      sub: "This month",
    },
    {
      label: "Platform Revenue",
      value: `Rs. ${((stats.totalPlatformRevenue || 0) / 1000).toFixed(0)}K`,
      icon: <TrendingUpRounded />,
      color: "#10B981",
      sub: "Total",
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Platform overview & analytics
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((s) => (
          <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <Card
              sx={{
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: `${s.color}18`,
                }}
              >
                <Box sx={{ color: s.color }}>{s.icon}</Box>
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1E293B" }}
                >
                  {s.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748B", display: "block" }}
                >
                  {s.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: s.color, fontWeight: 600 }}
                >
                  {s.sub}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Business Growth
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                />
                <Bar
                  dataKey="signups"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  name="New Signups"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              AI Usage Trend
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth}>
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="aiRequests"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#aiGrad)"
                  name="AI Requests"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Businesses
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recent.map((b) => (
              <TableRow key={b.businessId || b.id} sx={{ "& td": { py: 1.5 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                <TableCell sx={{ color: "#64748B" }}>{b.ownerName}</TableCell>
                <TableCell>
                  <Chip
                    label={b.type}
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
                    icon={
                      b.status === "ACTIVE" ? (
                        <VerifiedRounded sx={{ fontSize: "14px !important" }} />
                      ) : (
                        <WarningAmberRounded
                          sx={{ fontSize: "14px !important" }}
                        />
                      )
                    }
                    sx={{
                      background:
                        b.status === "ACTIVE" ? "#10B98118" : "#F59E0B18",
                      color: b.status === "ACTIVE" ? "#10B981" : "#F59E0B",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      border: "none",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#94A3B8" }}>
                  {b.createdAt
                    ? new Date(b.createdAt).toLocaleDateString()
                    : b.joinedAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
