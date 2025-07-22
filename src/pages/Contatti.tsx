import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";

const Contatti = () => {
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    setLoading(true);
  }

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px", color: "black" }}>
      <Grid
        container
        spacing={2}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        <Grid size={12}>
          <Typography gutterBottom variant="h2" color="error">
            Come posso aiutarti?
          </Typography>
        </Grid>
        <Grid size={12}>
          <Typography gutterBottom>
            Vieni a visitarmi a{" "}
            <Link
              underline="none"
              href={
                "https://www.google.it/maps/place/Via+Alcide+de+Gasperi,+11,+53013+Gaiole+In+Chianti+SI/@43.4677893,11.430667,17z/data=!3m1!4b1!4m6!3m5!1s0x132bcbde56dd180b:0xe9110140a9ec6507!8m2!3d43.4677893!4d11.430667!16s%2Fg%2F11c0_njw50?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D"
              }
              target="_blank"
              component={"a"}
              sx={{ color: "inherit" }}
            >
              Gaiole in Chianti, Via A. de Gasperi 11, 53013 (SI)
            </Link>
          </Typography>
          <Typography gutterBottom>
            Chiamami al{" "}
            <Link
              underline="none"
              href={"tel:+393703013861"}
              component={"a"}
              sx={{ color: "inherit" }}
            >
              370 3013861
            </Link>
          </Typography>
        </Grid>

        <Typography gutterBottom>
          Fatemi sapere le vostre domande, pensieri e idee tramite il modulo
          sottostante. Ti contatterò il prima possibile.
        </Typography>
        <Grid size={8}>
          <Box mt="30px" component="form">
            <Box
              component={"div"}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <TextField
                id="outlined-basic"
                label="Nome"
                variant="outlined"
                type="text"
                sx={{ width: "45%" }}
              />

              <TextField
                id="outlined-basic"
                label="Indirizzo Email"
                type="email"
                variant="outlined"
                sx={{ width: "45%" }}
              />
            </Box>
            <Box mt="30px" component={"div"}>
              <TextField
                id="outlined-basic"
                variant="outlined"
                label="Messaggio"
                multiline
                rows={8}
                sx={{ width: "100%" }}
              />
            </Box>
            <Box mt="30px" display={"flex"} component={"div"}>
              <Button
                variant="outlined"
                endIcon={<SendIcon />}
                onClick={handleClick}
                loading={loading}
                loadingPosition="end"
                color="success"
                sx={{ width: "40%", margin: "auto" }}
              >
                Invia
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Contatti;
