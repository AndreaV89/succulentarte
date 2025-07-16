import { useEffect } from "react";
import { type JSX } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
//import Card from "../components/Card";
import Skeleton from "@mui/material/Skeleton";

import type { DataSingle } from "../types/general";

interface HomePageProps {
  data: DataSingle[];
  isLoading: boolean;
}

const Home = (props: HomePageProps): JSX.Element => {
  useEffect(() => {
    console.log("Home.tsx");
  }, []);

  useEffect(() => {
    console.log(props.data?.[0]?.acf ?? "No data available");
  }, [props.data]);

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
      <Grid container spacing={2} sx={{ maxWidth: "1200px", margin: "auto" }}>
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton variant="rectangular" width={349} height={389} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton variant="rectangular" width={349} height={389} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton variant="rectangular" width={349} height={389} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton variant="rectangular" width={349} height={389} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton variant="rectangular" width={349} height={389} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton variant="rectangular" width={349} height={389} />
        </Grid>
      </Grid>
      {/*       <Grid container spacing={2} sx={{ maxWidth: "1200px", margin: "auto" }}>
        {props.data.map((item) =>
          props.isLoading ? (
            <Grid
              size={{ xs: 12, md: 6, lg: 4 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Skeleton variant="rectangular" width={349} height={389} />
            </Grid>
          ) : (
            <Grid
              key={item.id}
              size={{ xs: 12, md: 6, lg: 4 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card key={item.id} id={item.id} name={item.acf.specie} />
            </Grid>
          )
        )}
      </Grid> */}
    </Box>
  );
};

export default Home;
