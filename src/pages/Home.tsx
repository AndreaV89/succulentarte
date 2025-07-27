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

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const [famiglie, setFamiglie] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamiglie = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "famiglie"));
      setFamiglie(snap.docs.map((doc) => doc.data().nome));
      setLoading(false);
    };
    fetchFamiglie();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, mt: "130px", mb: "50px" }}>
      <Grid
        container
        spacing={2}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Caricamento...
            </Box>
          </Grid>
        ) : famiglie.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessuna famiglia trovata nel catalogo.
            </Box>
          </Grid>
        ) : (
          famiglie.map((nome) => (
            <Grid
              key={nome}
              size={{ xs: 12, md: 6, lg: 4 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={nome}
                specie={nome}
                fotoUrl="https://us.123rf.com/450wm/pixora/pixora2503/pixora250322977/242679423-stylish-navelwort-houseplant-art.jpg?ver=6"
                onClick={() => navigate(`/catalogo/famiglia/${nome}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Home;
