// React
import React from "react";

// MUI
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";

const Contatti = () => {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [messaggio, setMessaggio] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function handleClick(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !email || !messaggio) {
      setError("Compila tutti i campi.");
      setTimeout(() => setError(null), 2000);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Messaggio inviato! Ti risponderò presto.");
      setNome("");
      setEmail("");
      setMessaggio("");
      setTimeout(() => setSuccess(null), 3000);
    }, 1500);
  }

  return (
    <Box sx={{ flexGrow: 1, mt: "120px", mb: "50px", color: "black" }}>
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Typography
            gutterBottom
            variant="h3"
            align="center"
            sx={{
              color: "#018732",
              fontWeight: 700,
              mb: 3,
              letterSpacing: ".04em",
            }}
          >
            Contattami
          </Typography>
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "2px solid #FFC107",
              background: "#fffbea",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              px: { xs: 1, sm: 4 },
              py: { xs: 2, sm: 4 },
            }}
          >
            <CardContent>
              <Typography align="center" sx={{ mb: 1.5 }}>
                Vieni a trovarmi a{" "}
                <Link
                  underline="hover"
                  href="https://www.google.it/maps/place/Via+Alcide+de+Gasperi,+11,+53013+Gaiole+In+Chianti+SI/@43.4677893,11.430667,17z/data=!3m1!4b1!4m6!3m5!1s0x132bcbde56dd180b:0xe9110140a9ec6507!8m2!3d43.4677893!4d11.430667!16s%2Fg%2F11c0_njw50?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  sx={{ color: "#018732", fontWeight: 500 }}
                >
                  Gaiole in Chianti, Via A. de Gasperi 11, 53013 (SI)
                </Link>
              </Typography>
              <Typography align="center" sx={{ mb: 1.5 }}>
                Chiamami al{" "}
                <Link
                  underline="hover"
                  href="tel:+393703013861"
                  sx={{ color: "#018732", fontWeight: 500 }}
                >
                  370 3013861
                </Link>
              </Typography>
              <Typography align="center" sx={{ mb: 3 }}>
                Oppure scrivimi tramite il modulo qui sotto. Ti risponderò il
                prima possibile!
              </Typography>
              <Box
                component="form"
                autoComplete="off"
                onSubmit={handleClick}
                sx={{ maxWidth: 480, mx: "auto" }}
              >
                <Stack spacing={2}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      {success}
                    </Alert>
                  )}
                  <TextField
                    label="Nome"
                    variant="outlined"
                    type="text"
                    fullWidth
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    aria-label="Nome"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email"
                  />
                  <TextField
                    variant="outlined"
                    label="Messaggio"
                    multiline
                    rows={6}
                    fullWidth
                    value={messaggio}
                    onChange={(e) => setMessaggio(e.target.value)}
                    aria-label="Messaggio"
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    type="submit"
                    disabled={loading}
                    sx={{
                      width: { xs: "100%", sm: "60%" },
                      fontWeight: 700,
                      fontSize: 18,
                      borderRadius: 99,
                      mx: "auto",
                      background: "#FFC107",
                      color: "#222",
                      boxShadow: 2,
                      mt: 1,
                      "&:hover": { background: "#ffb300" },
                      display: "flex",
                    }}
                    aria-label="Invia messaggio"
                  >
                    {loading ? "Invio..." : "Invia"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Contatti;
