import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#018732",
        height: "65px",
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Container sx={{ color: "white" }}>
        © Renzo Vannetti Via A. De Gasperi 11, 53013 Gaiole in Chianti (SI)
      </Container>
    </Box>
  );
};

export default Footer;
