import { type JSX } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "../components/Card";
import Skeleton from "@mui/material/Skeleton";

import type { DataSingle } from "../types/general";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#f00",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

interface HomePageProps {
  data: DataSingle[];
}

const Home = (props: HomePageProps): JSX.Element => {
  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
      <Grid container spacing={2} sx={{ maxWidth: "1200px", margin: "auto" }}>
        {props.data.map((item) => (
          <Grid
            size={{ xs: 12, md: 6, lg: 4 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            {item ? (
              <Card key={item.id} id={item.id} name={item.acf.specie} />
            ) : (
              <Skeleton variant="rectangular" width={210} height={118} />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
