import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUpRounded,
  PeopleRounded,
  Inventory2Rounded,
  ReceiptRounded,
  AccountBalanceWalletRounded,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "../../components/common/StatCard";
import { dashboardAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

const COLORS = ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"];

const STATUS_COLORS = {
  COMPLETED: { bg: "#10B98118", color: "#10B981" },
  PENDING: { bg: "#F59E0B18", color: "#F59E0B" },
  CANCELLED: { bg: "#EF444418", color: "#EF4444" },
};

const EMPTY_SUMMARY = {
  totalSalesToday: 0,
  totalSalesMonth: 0,
  totalCustomers: 0,
  totalProducts: 0,
  lowStockCount: 0,
  totalExpensesMonth: 0,
  netProfitMonth: 0,
  pendingInvoices: 0,
};

function fmt(n) {
  if (n >= 1000000) return `Rs. ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `Rs. ${(n / 1000).toFixed(0)}K`;
  return `Rs. ${n}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [chart, setChart] = useState([]);
  const [recent, setRecent] = useState([]);
  const [category, setCategory] = useState([]);
  const [period, setPeriod] = useState("6months");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.businessId) return;
    setLoading(true);

    const now = new Date();
    const from = new Date(now);
    if (period === "30days") from.setDate(from.getDate() - 30);
    else if (period === "12months") from.setFullYear(from.getFullYear() - 1);
    else from.setMonth(from.getMonth() - 6);
    const fmtDate = (d) => d.toISOString().split("T")[0];

    Promise.all([
      dashboardAPI.getSummary(user.businessId).catch(() => null),
      dashboardAPI
        .getSalesReport(user.businessId, fmtDate(from), fmtDate(now))
        .catch(() => null),
    ])
      .then(([s, r]) => {
        if (s?.data) {
          const d = s.data;
          setSummary({
            totalSalesToday: d.totalSalesToday ?? 0,
            totalSalesMonth: d.totalSalesThisMonth ?? 0,
            totalCustomers: d.totalCustomers ?? 0,
            totalProducts: d.totalProducts ?? 0,
            lowStockCount: d.lowStockCount ?? 0,
            totalExpensesMonth: d.totalExpensesThisMonth ?? 0,
            netProfitMonth: d.netIncomeThisMonth ?? 0,
            pendingInvoices: 0,
          });
          setRecent(d.recentSales || []);
          const top = d.topSellingProducts || [];
          const totalRev = top.reduce(
            (acc, p) => acc + (p.totalRevenue || 0),
            0,
          );
          setCategory(
            totalRev > 0
              ? top.map((p) => ({
                  name: p.productName || `Product ${p.productId}`,
                  value: Math.round((p.totalRevenue / totalRev) * 100),
                }))
              : [],
          );
        }
        if (r?.data?.dailySales) {
          setChart(
            r.data.dailySales.map((d) => ({
              month: d.date,
              sales: d.revenue || 0,
              expenses: 0,
            })),
          );
        }
      })
      .finally(() => setLoading(false));
  }, [period, user?.businessId]);

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E293B" }}>
            Good morning, {user?.fullName?.split(" ")[0]} 👋
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.3 }}>
            Here's what's happening with your business today
          </Typography>
        </Box>
        <Chip
          label={`Today · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
          sx={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            color: "#64748B",
            fontWeight: 500,
          }}
        />
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Sales"
            value={fmt(summary.totalSalesToday)}
            icon={<TrendingUpRounded />}
            color="#2563EB"
            trend="up"
            trendValue="+12.5%"
            subtitle="vs yesterday"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Monthly Revenue"
            value={fmt(summary.totalSalesMonth)}
            icon={<AccountBalanceWalletRounded />}
            color="#7C3AED"
            trend="up"
            trendValue="+8.2%"
            subtitle="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Net Profit"
            value={fmt(summary.netProfitMonth)}
            icon={<ReceiptRounded />}
            color="#10B981"
            trend="up"
            trendValue="+5.4%"
            subtitle="this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Customers"
            value={summary.totalCustomers.toLocaleString()}
            icon={<PeopleRounded />}
            color="#F59E0B"
            trend="up"
            trendValue="+3"
            subtitle="new this week"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Revenue Overview
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Sales vs Expenses
                </Typography>
              </Box>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                size="small"
                sx={{ borderRadius: "8px", fontSize: "0.8rem" }}
              >
                <MenuItem value="6months">Last 6 months</MenuItem>
                <MenuItem value="12months">Last 12 months</MenuItem>
                <MenuItem value="30days">Last 30 days</MenuItem>
              </Select>
            </Box>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={chart}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(v) => [fmt(v)]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#salesGrad)"
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fill="url(#expGrad)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
            <Box
              sx={{ display: "flex", gap: 3, mt: 1, justifyContent: "center" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#2563EB",
                  }}
                />
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Sales
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#EF4444",
                  }}
                />
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Expenses
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Sales by Category
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              This month
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={category}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {category.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}
            >
              {category.map((item, i) => (
                <Box
                  key={item.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", fontSize: "0.8rem" }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "55%",
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: "#F1F5F9",
                        "& .MuiLinearProgress-bar": {
                          background: COLORS[i % COLORS.length],
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#1E293B", minWidth: 28 }}
                    >
                      {item.value}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card>
            <Box
              sx={{
                p: 3,
                pb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Sales
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Latest transactions
                </Typography>
              </Box>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.map((row) => (
                  <TableRow
                    key={row.saleId}
                    sx={{ "& td": { py: 1.5, fontSize: "0.875rem" } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#2563EB" }}>
                      {row.invoiceNumber}
                    </TableCell>
                    <TableCell>{row.customerName || "Walk-in"}</TableCell>
                    <TableCell sx={{ color: "#64748B" }}>—</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Rs. {Number(row.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="COMPLETED"
                        size="small"
                        sx={{
                          background: STATUS_COLORS.COMPLETED.bg,
                          color: STATUS_COLORS.COMPLETED.color,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          border: "none",
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#94A3B8" }}>
                      {row.createdAt?.split(" ")[0]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Card
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #FEF3C718, #FEF3C740)",
                border: "1px solid #F59E0B30",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    background: "#F59E0B20",
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                  }}
                >
                  <WarningAmberRounded sx={{ color: "#F59E0B" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1E293B" }}
                  >
                    {summary.lowStockCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    Low stock products
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                border: "1px solid #E2E8F0",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{
                    background: "#2563EB18",
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                  }}
                >
                  <Inventory2Rounded sx={{ color: "#2563EB" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1E293B" }}
                  >
                    {summary.totalProducts}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    Total Products
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    background: "#fff",
                    borderRadius: "10px",
                    p: 1.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#2563EB" }}
                  >
                    {summary.pendingInvoices}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Pending
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    background: "#fff",
                    borderRadius: "10px",
                    p: 1.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#10B981" }}
                  >
                    {summary.totalCustomers}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Customers
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)", mb: 0.5 }}
              >
                Monthly Profit
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
                {fmt(summary.netProfitMonth)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                After Rs. {(summary.totalExpensesMonth / 1000).toFixed(0)}K
                expenses
              </Typography>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
