import { Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

export function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "4rem", mb: 1 }}>
        404
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, fontSize: "1.125rem" }}>
        Page not found
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary">
        Go home
      </Button>
    </Box>
  );
}
