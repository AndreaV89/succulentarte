// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CopyrightIcon from "@mui/icons-material/Copyright";

const siteInfo = {
  author: "Renzo Vannetti",
  address: "Via A. De Gasperi 11, 53013 Gaiole in Chianti (SI)",
  instagramUrl: "https://instagram.com/tuo_profilo", // Sostituisci con il tuo URL
  facebookUrl: "https://facebook.com/tuo_profilo", // Sostituisci con il tuo URL
  email: "mailto:tua_email@example.com", // Sostituisci con la tua email
};

const Footer = () => {
  return (
    <footer>
      <Box
        sx={{
          background: "linear-gradient(90deg, #018732 0%, #00b86b 100%)",
          boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.15)",
          py: 2,
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
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CopyrightIcon sx={{ fontSize: 18, mr: 0.5 }} />
              {new Date().getFullYear()} {siteInfo.author}
            </Typography>

            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "block" } }}
              aria-hidden="true"
            >
              |
            </Box>

            <Typography variant="body2">{siteInfo.address}</Typography>
          </Box>
        </Container>
      </Box>
    </footer>
  );
};

export default Footer;
