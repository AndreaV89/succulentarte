import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CardPianta from "../components/CardPianta";
import Skeleton from "@mui/material/Skeleton";

import type { DataSingle } from "../types/general";

interface HomePageProps {
  data: DataSingle[];
  isLoading: boolean;
}

const Home = (props: HomePageProps): JSX.Element => {
  const navigate = useNavigate();
  console.log(props.data);

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
      <Grid
        container
        spacing={2}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {props.isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Grid
                key={idx}
                size={{ xs: 12, md: 6, lg: 4 }}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width={320}
                  height={414}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            ))
          : props.data.map((item) => (
              <Grid
                key={item.id}
                size={{ xs: 12, md: 6, lg: 4 }}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <CardPianta
                  id={String(item.id)}
                  specie={item.specie || "Specie sconosciuta"}
                  fotoUrl={
                    item.fotoUrls && item.fotoUrls.length > 0
                      ? item.fotoUrls[0]
                      : undefined
                  }
                  onClick={() => navigate(`/pianta/${item.id}`)}
                />
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};

export default Home;
