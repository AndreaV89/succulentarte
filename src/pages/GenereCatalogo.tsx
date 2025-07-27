// React
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import CardPianta from "../components/CardPianta";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

const GenereCatalogo = () => {
  const navigate = useNavigate();
  const { nome } = useParams<{ nome: string }>();
  const [descrizione, setDescrizione] = useState<string>("");
  const [famigliaNome, setFamigliaNome] = useState<string>("");
  const [specie, setSpecie] = useState<
    { id: string; nome: string; fotoUrl?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Carica descrizione genere
    const fetchGenere = async () => {
      const snap = await getDocs(
        query(collection(db, "generi"), where("nome", "==", nome))
      );
      if (!snap.empty) {
        setDescrizione(snap.docs[0].data().descrizione || "");
        setFamigliaNome(snap.docs[0].data().famiglia || "");
      }
    };
    // Carica specie del genere
    const fetchSpecie = async () => {
      const snap = await getDocs(
        query(collection(db, "piante"), where("genere", "==", nome))
      );
      setSpecie(
        snap.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().specie,
          fotoUrl:
            doc.data().fotoUrls ||
            "https://us.123rf.com/450wm/pixora/pixora2503/pixora250322977/242679423-stylish-navelwort-houseplant-art.jpg?ver=6",
        }))
      );
    };
    Promise.all([fetchGenere(), fetchSpecie()]).finally(() =>
      setLoading(false)
    );
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
        <Link
          sx={{ cursor: "pointer" }}
          underline="hover"
          color="inherit"
          onClick={() => navigate(`/catalogo/famiglia/${famigliaNome}`)}
        >
          {famigliaNome || "Famiglia"}
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
        spacing={3}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={320}
              height={80}
              sx={{ borderRadius: 2, mx: "auto" }}
            />
          </Grid>
        ) : specie.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={320}
              height={80}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ) : (
          specie.map((s) => (
            <Grid
              size={{ xs: 12, md: 6, lg: 4 }}
              key={s.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={s.id}
                specie={s.nome}
                fotoUrl={s.fotoUrl}
                onClick={() => navigate(`/pianta/${s.id}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default GenereCatalogo;
