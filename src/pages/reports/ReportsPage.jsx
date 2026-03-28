import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  DownloadRounded,
  AssessmentRounded,
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  ReceiptRounded,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import PageHeader from "../../components/common/PageHeader";
import { reportAPI } from "../../api/api";

export default function ReportsPage() {
  const [period, setPeriod] = useState("6months");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalSales = report.reduce((a, r) => a + r.sales, 0);
  const totalExpenses = report.reduce((a, r) => a + r.expenses, 0);
  const totalProfit = report.reduce((a, r) => a + r.profit, 0);
  const totalTx = report.reduce((a, r) => a + r.transactions, 0);

  const handleGenerate = () => {
    setLoading(true);
    reportAPI
      .getSalesReport({ period })
      .then((r) => setReport(r.data || []))
      .catch(() => setReport([]))
      .finally(() => setLoading(false));
  };

  const fmt = (n) =>
    n >= 1000000
      ? `Rs. ${(n / 1000000).toFixed(2)}M`
      : `Rs. ${(n / 1000).toFixed(0)}K`;

  return (
    <Box>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business performance summary"
        action={
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                label="Period"
              >
                <MenuItem value="30days">Last 30 days</MenuItem>
                <MenuItem value="3months">Last 3 months</MenuItem>
                <MenuItem value="6months">Last 6 months</MenuItem>
                <MenuItem value="12months">Last 12 months</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                borderRadius: "10px",
              }}
            >
              {loading ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Generate"
              )}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadRounded />}
              sx={{ borderRadius: "10px" }}
            >
              Export
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            label: "Total Revenue",
            value: fmt(totalSales),
            color: "#2563EB",
            icon: <TrendingUpRounded />,
          },
          {
            label: "Total Expenses",
            value: fmt(totalExpenses),
            color: "#EF4444",
            icon: <AccountBalanceWalletRounded />,
          },
          {
            label: "Net Profit",
            value: fmt(totalProfit),
            color: "#10B981",
            icon: <AssessmentRounded />,
          },
          {
            label: "Transactions",
            value: totalTx.toLocaleString(),
            color: "#F59E0B",
            icon: <ReceiptRounded />,
          },
        ].map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card
              sx={{
                p: 2.5,
                borderLeft: `4px solid ${s.color}`,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ color: s.color }}>{s.icon}</Box>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {s.label}
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
              Revenue vs Expenses
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={report}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                  formatter={(v) => [fmt(v)]}
                />
                <Legend />
                <Bar
                  dataKey="sales"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  name="Sales"
                />
                <Bar
                  dataKey="expenses"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Profit Trend
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={report}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                  formatter={(v) => [fmt(v)]}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10B981" }}
                  name="Net Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Monthly Breakdown
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Expenses</TableCell>
              <TableCell>Net Profit</TableCell>
              <TableCell>Margin</TableCell>
              <TableCell>Transactions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((r) => {
              const margin = ((r.profit / r.sales) * 100).toFixed(1);
              return (
                <TableRow key={r.month} sx={{ "& td": { py: 1.5 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{r.month}</TableCell>
                  <TableCell sx={{ color: "#2563EB", fontWeight: 600 }}>
                    Rs. {r.sales.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ color: "#EF4444" }}>
                    Rs. {r.expenses.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ color: "#10B981", fontWeight: 700 }}>
                    Rs. {r.profit.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${margin}%`}
                      size="small"
                      sx={{
                        background: "#10B98118",
                        color: "#10B981",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        border: "none",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#64748B" }}>
                    {r.transactions}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
