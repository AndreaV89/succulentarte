// React
import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Firebase
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CardPianta from "../components/CardPianta";
import Skeleton from "@mui/material/Skeleton";

// Fallback image
import { FALLBACK_IMAGE_URL } from "../utils/constants";

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const [famiglie, setFamiglie] = useState<
    { nome: string; fotoUrl?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamiglie = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "famiglie"));
      setFamiglie(
        snap.docs.map((doc) => ({
          nome: doc.data().nome,
          fotoUrl: doc.data().fotoThumbnailUrl || doc.data().fotoUrl,
        }))
      );
      setLoading(false);
    };
    fetchFamiglie();
  }, []);

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
        <Grid
          container
          spacing={2}
          sx={{ maxWidth: "1200px", margin: "auto" }}
          justifyContent="center"
        >
          <Grid size={{ xs: 4 }}>
            <Skeleton variant="rounded" width={316} height={414} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Skeleton variant="rounded" width={316} height={414} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Skeleton variant="rounded" width={316} height={414} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Skeleton variant="rounded" width={316} height={414} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Skeleton variant="rounded" width={316} height={414} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Skeleton variant="rounded" width={316} height={414} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
      <Grid
        container
        spacing={2}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {famiglie.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessuna famiglia trovata nel catalogo.
            </Box>
          </Grid>
        ) : (
          famiglie.map((famiglia) => (
            <Grid
              key={famiglia.nome}
              size={{ xs: 12, md: 6, lg: 4 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={famiglia.nome}
                specie={famiglia.nome}
                fotoUrl={famiglia.fotoUrl || FALLBACK_IMAGE_URL}
                onClick={() => navigate(`/catalogo/famiglia/${famiglia.nome}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Home;
