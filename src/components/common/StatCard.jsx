import { Box, Card, Typography, Avatar } from "@mui/material";
import { TrendingUpRounded, TrendingDownRounded } from "@mui/icons-material";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "#2563EB",
  trend,
  trendValue,
}) {
  const isPositive = trend === "up";

  return (
    <Card
      sx={{
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        border: "1px solid #F1F5F9",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: color,
          borderRadius: "12px 12px 0 0",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "#64748B",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.7rem",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mt: 0.5,
              color: "#1E293B",
              fontSize: { xs: "1.5rem", sm: "1.8rem" },
            }}
          >
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: `${color}18`,
            "& svg": { color: color, fontSize: 24 },
          }}
        >
          {icon}
        </Avatar>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              background: isPositive ? "#10B98118" : "#EF444418",
              borderRadius: "6px",
              px: 0.8,
              py: 0.2,
            }}
          >
            {isPositive ? (
              <TrendingUpRounded sx={{ fontSize: 14, color: "#10B981" }} />
            ) : (
              <TrendingDownRounded sx={{ fontSize: 14, color: "#EF4444" }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isPositive ? "#10B981" : "#EF4444",
                fontSize: "0.7rem",
              }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: "#94A3B8", fontSize: "0.75rem" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
