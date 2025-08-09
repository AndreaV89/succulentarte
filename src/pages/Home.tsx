// React
import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

// MUI
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

// Components
import CardPianta, { CardPiantaSkeleton } from "../components/CardPianta";

// Fallback image
import { FALLBACK_IMAGE_URL } from "../utils/constants";

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const { famiglie, loading } = useData();

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
        <Grid
          container
          spacing={4}
          sx={{ maxWidth: "1200px", margin: "auto" }}
          justifyContent="center"
        >
          {/* Usiamo un array per renderizzare gli skeleton in modo pulito */}
          {Array.from(new Array(6)).map((_, index) => (
            <Grid key={index}>
              <CardPiantaSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
      <Grid
        container
        spacing={4}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {famiglie.length === 0 ? (
          <Grid>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessuna famiglia trovata nel catalogo.
            </Box>
          </Grid>
        ) : (
          famiglie.map((famiglia) => (
            <Grid key={famiglia.id}>
              <CardPianta
                pianta={{
                  id: famiglia.id,
                  specie: famiglia.nome,
                  fotoUrls: [famiglia.fotoUrl || FALLBACK_IMAGE_URL],
                }}
                onClick={() => navigate(`/catalogo/famiglia/${famiglia.id}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Home;
