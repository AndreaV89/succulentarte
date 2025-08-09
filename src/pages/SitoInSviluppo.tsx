// src/pages/SitoInSviluppo.tsx

// React
import { useNavigate } from "react-router-dom";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ConstructionIcon from "@mui/icons-material/Construction";
import EmailIcon from "@mui/icons-material/Email";

const SitoInSviluppo = () => {
  const navigate = useNavigate();

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
      <Button
        href="mailto:r.vannetti@gmail.com" // Puoi cambiare la tua email qui
        variant="contained"
        color="primary"
        size="large"
        startIcon={<EmailIcon />}
        sx={{
          borderRadius: 8,
          px: 4,
          fontWeight: 700,
        }}
      >
        Contattami
      </Button>
    </Box>
  );
};

export default SitoInSviluppo;
