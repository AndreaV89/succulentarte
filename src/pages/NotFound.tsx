import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const NotFound = () => {
  return (
    <Box
      sx={{
        mt: 8,
        mb: 4,
        py: 5,
        px: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0f7fa 100%)",
        minHeight: 320,
        maxWidth: 420,
        margin: "auto",
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
      }}
    >
      <SentimentVeryDissatisfiedIcon
        sx={{ fontSize: 80, color: "#ff9800", mb: 2 }}
      />
      <Typography
        variant="h1"
        sx={{ color: "#222", fontWeight: 900, mb: 1, fontSize: 56 }}
      >
        404
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: "#444", mb: 3, textAlign: "center" }}
      >
        Oops! La pagina che cerchi non esiste.
        <br />
        Forse una pianta l'ha mangiata! 🌵
      </Typography>
      <Button
        href="/"
        variant="contained"
        color="success"
        size="large"
        sx={{
          borderRadius: 3,
          px: 4,
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(76,175,80,0.15)",
        }}
      >
        Torna alla Home
      </Button>
    </Box>
  );
};

export default NotFound;
