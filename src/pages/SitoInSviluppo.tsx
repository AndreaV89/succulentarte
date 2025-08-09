// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import ConstructionIcon from "@mui/icons-material/Construction";
import EmailIcon from "@mui/icons-material/Email";

const SitoInSviluppo = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 180px)", // Altezza per riempire lo schermo
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        mt: "130px",
        mb: "50px",
        px: 2,
      }}
    >
      <ConstructionIcon sx={{ fontSize: 80, color: "secondary.main", mb: 3 }} />
      <Typography
        variant="h3"
        sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}
      >
        Sito in costruzione!
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: "text.primary", maxWidth: "600px", mb: 4 }}
      >
        Stiamo lavorando per far sbocciare la versione finale di SucculentArte.
        Torna a trovarci presto per scoprire il nostro catalogo completo!
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EmailIcon color="action" />
        <Typography variant="body1">
          Per informazioni:{" "}
          <Link
            href="mailto:r.vannetti@gmail.com"
            underline="hover"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            r.vannetti@gmail.com
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SitoInSviluppo;
