import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const Contatti = () => {
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    setLoading(true);
    // Simula invio
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px", color: "black" }}>
      <Grid
        container
        spacing={4}
        sx={{ maxWidth: "900px", margin: "auto" }}
        justifyContent="center"
      >
        <Grid size={{ xs: 12 }}>
          <Typography
            gutterBottom
            variant="h3"
            sx={{ color: "success.main", fontWeight: 700 }}
          >
            Contattami
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card elevation={3} sx={{ borderRadius: 4, background: "#f8fafc" }}>
            <CardContent>
              <Typography gutterBottom>
                Vieni a trovarmi a{" "}
                <Link
                  underline="hover"
                  href="https://www.google.it/maps/place/Via+Alcide+de+Gasperi,+11,+53013+Gaiole+In+Chianti+SI/@43.4677893,11.430667,17z/data=!3m1!4b1!4m6!3m5!1s0x132bcbde56dd180b:0xe9110140a9ec6507!8m2!3d43.4677893!4d11.430667!16s%2Fg%2F11c0_njw50?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  sx={{ color: "success.main", fontWeight: 500 }}
                >
                  Gaiole in Chianti, Via A. de Gasperi 11, 53013 (SI)
                </Link>
              </Typography>
              <Typography gutterBottom>
                Chiamami al{" "}
                <Link
                  underline="hover"
                  href="tel:+393703013861"
                  sx={{ color: "success.main", fontWeight: 500 }}
                >
                  370 3013861
                </Link>
              </Typography>
              <Typography gutterBottom>
                Oppure scrivimi tramite il modulo qui sotto. Ti risponderò il
                prima possibile!
              </Typography>
              <Box mt={3} component="form" autoComplete="off">
                <Grid
                  container
                  spacing={3}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Nome"
                      variant="outlined"
                      type="text"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Email"
                      type="email"
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      variant="outlined"
                      label="Messaggio"
                      multiline
                      rows={6}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={handleClick}
                      loading={loading}
                      loadingPosition="end"
                      color="success"
                      sx={{
                        width: { xs: "100%", sm: "50%" },
                        fontWeight: 700,
                        fontSize: 18,
                        borderRadius: 99,
                        boxShadow: 2,
                        mx: "auto",
                        display: "block",
                        mt: 2,
                      }}
                    >
                      Invia
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Contatti;
