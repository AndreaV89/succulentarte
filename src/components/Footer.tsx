import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import CopyrightIcon from "@mui/icons-material/Copyright";

const Footer = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(90deg, #018732 0%, #00b86b 100%)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
        minHeight: "65px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        mt: "auto",
      }}
    >
      <Container
        sx={{
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CopyrightIcon sx={{ fontSize: 18, mb: "2px" }} />
          {new Date().getFullYear()} Renzo Vannetti &nbsp;|&nbsp; Via A. De
          Gasperi 11, 53013 Gaiole in Chianti (SI)
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
