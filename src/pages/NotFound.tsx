import { Box, Button, Typography } from "@mui/material";

const NotFound = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f7f4f2",
      }}
    >
      <Typography variant="h1" style={{ color: "black" }}>
        404
      </Typography>
      <Typography variant="h6" style={{ color: "black" }}>
        La pagina che stai cercando non esiste.
      </Typography>
      <Button href="/" variant="outlined" color="success">
        Home
      </Button>
    </Box>
  );
};

export default NotFound;
