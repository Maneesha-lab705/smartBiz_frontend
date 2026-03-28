import { Box, Typography, Button, InputBase, IconButton } from "@mui/material";
import {
  SearchRounded,
  AddRounded,
  FilterListRounded,
} from "@mui/icons-material";

export default function PageHeader({
  title,
  subtitle,
  onAdd,
  addLabel = "Add New",
  searchValue,
  onSearch,
  action,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        mb: 3,
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E293B" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.3 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {onSearch !== undefined && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: "#fff",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              px: 1.5,
              py: 0.8,
              width: 220,
            }}
          >
            <SearchRounded sx={{ color: "#94A3B8", fontSize: 18 }} />
            <InputBase
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              sx={{ fontSize: "0.875rem", flex: 1 }}
            />
          </Box>
        )}
        {action}
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={onAdd}
            sx={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              borderRadius: "10px",
              px: 2.5,
              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8, #6D28D9)",
              },
            }}
          >
            {addLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
