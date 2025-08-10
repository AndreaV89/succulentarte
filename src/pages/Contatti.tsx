// src/pages/Contatti.tsx con Debug

import React from "react";
import axios from "axios";

// ... tutti gli altri import di MUI ...
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

//const FUNCTION_URL = "../../api/send-email";

const Contatti = () => {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [messaggio, setMessaggio] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nome || !email || !messaggio) {
      setError("Per favore, compila tutti i campi.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("../../api/send-email", {
        nome,
        email,
        messaggio,
      });

      setSuccess("Messaggio inviato! Grazie per avermi contattato.");
      setNome("");
      setEmail("");
      setMessaggio("");
    } catch (err) {
      console.error("Errore chiamata funzione:", err);
      setError("Impossibile inviare il messaggio. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        px: { xs: 2, md: 4 },
      }}
    >
      <Grid
        container
        spacing={{ xs: 4, md: 8 }}
        justifyContent="center"
        alignItems="flex-start"
        sx={{ maxWidth: "1200px" }}
      >
        {/* Colonna Sinistra: Info Contatto */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
          >
            Mettiamoci in contatto
          </Typography>
          <Typography sx={{ mb: 4, color: "text.secondary" }}>
            Hai domande, curiosità o vuoi semplicemente salutarmi? Compila il
            modulo o usa i contatti qui sotto. Sarò felice di risponderti!
          </Typography>

          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <LocationOnIcon color="secondary" />
              <Link
                underline="hover"
                href="https://www.google.it/maps/place/Via+Alcide+de+Gasperi,+11,+53013+Gaiole+In+Chianti+SI/@43.4677893,11.430667,17z/data=!3m1!4b1!4m6!3m5!1s0x132bcbde56dd180b:0xe9110140a9ec6507!8m2!3d43.4677893!4d11.430667!16s%2Fg%2F11c0_njw50?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                color="text.primary"
              >
                Via A. de Gasperi 11, 53013 Gaiole in Chianti (SI)
              </Link>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <PhoneIcon color="secondary" />
              <Link
                underline="hover"
                href="tel:+393703013861"
                color="text.primary"
              >
                370 3013861
              </Link>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <EmailIcon color="secondary" />
              <Link
                underline="hover"
                href="mailto:r.vannetti@gmail.com"
                color="text.primary"
              >
                r.vannetti@gmail.com
              </Link>
            </Stack>
          </Stack>
        </Grid>

        {/* Colonna Destra: Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
            <Box
              component="form"
              autoComplete="off"
              onSubmit={handleClick}
              noValidate
            >
              <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <TextField
                  label="Il tuo nome"
                  variant="outlined"
                  fullWidth
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
                <TextField
                  label="La tua email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  variant="outlined"
                  label="Il tuo messaggio"
                  multiline
                  rows={5}
                  fullWidth
                  value={messaggio}
                  onChange={(e) => setMessaggio(e.target.value)}
                  required
                />
                <Button
                  variant="contained"
                  endIcon={loading ? null : <SendIcon />}
                  type="submit"
                  disabled={loading}
                  size="large"
                  sx={{
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={26} color="inherit" />
                  ) : (
                    "Invia Messaggio"
                  )}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Contatti;
