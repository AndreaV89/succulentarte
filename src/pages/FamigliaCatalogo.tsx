import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CardPianta from "../components/CardPianta";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

const FamigliaCatalogo = () => {
  const navigate = useNavigate();
  const { nome } = useParams<{ nome: string }>();
  const [descrizione, setDescrizione] = useState<string>("");
  const [generi, setGeneri] = useState<{ nome: string; descrizione: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carica descrizione famiglia
    setLoading(true);
    const fetchFamiglia = async () => {
      const snap = await getDocs(
        query(collection(db, "famiglie"), where("nome", "==", nome))
      );

      if (!snap.empty) {
        setDescrizione(snap.docs[0].data().descrizione || "");
      }
    };
    // Carica generi della famiglia
    const fetchGeneri = async () => {
      const snap = await getDocs(
        query(collection(db, "generi"), where("famiglia", "==", nome))
      );
      setGeneri(
        snap.docs.map((doc) => ({
          nome: doc.data().nome,
          descrizione: doc.data().descrizione || "",
        }))
      );
    };
    Promise.all([fetchFamiglia(), fetchGeneri()]).then(() => setLoading(false));
  }, [nome]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          sx={{ cursor: "pointer" }}
          underline="hover"
          color="inherit"
          onClick={() => navigate("/")}
        >
          Home
        </Link>
        <Typography color="text.primary">{nome}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        {nome}
      </Typography>
      <Typography sx={{ mb: 4, color: "#666" }}>
        {descrizione || "Nessuna descrizione disponibile."}
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {loading ? null : generi.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessun genere trovato per questa famiglia.
            </Box>
          </Grid>
        ) : (
          generi.map((g) => (
            <Grid
              size={{ xs: 12, md: 6, lg: 4 }}
              key={g.nome}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={g.nome}
                specie={g.nome}
                fotoUrl="https://us.123rf.com/450wm/pixora/pixora2503/pixora250322977/242679423-stylish-navelwort-houseplant-art.jpg?ver=6"
                onClick={() => navigate(`/catalogo/genere/${g.nome}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default FamigliaCatalogo;
