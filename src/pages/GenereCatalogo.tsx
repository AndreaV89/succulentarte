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

// Fallback image
import { FALLBACK_IMAGE_URL } from "../utils/constants";

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
    const fetchGenere = async () => {
      const snap = await getDocs(
        query(collection(db, "generi"), where("nome", "==", nome))
      );
      if (!snap.empty) {
        setDescrizione(snap.docs[0].data().descrizione || "");
        setFamigliaNome(snap.docs[0].data().famiglia || "");
      }
    };
    const fetchSpecie = async () => {
      const snap = await getDocs(
        query(collection(db, "piante"), where("genere", "==", nome))
      );
      setSpecie(
        snap.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().specie,
          fotoUrl:
            (doc.data().fotoThumbnailUrls && doc.data().fotoThumbnailUrls[0]) ||
            doc.data().fotoUrls?.[0] ||
            FALLBACK_IMAGE_URL,
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
      {loading ? (
        <>
          <Skeleton variant="rounded" width={400} height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width={400} height={42} sx={{ mb: 3 }} />
          <Skeleton
            variant="rounded"
            width={1200}
            height={150}
            sx={{ mb: 4 }}
          />
        </>
      ) : (
        <>
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
        </>
      )}

      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {loading ? (
          <>
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
          </>
        ) : specie.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessuna specie trovata per questo genere.
            </Box>
          </Grid>
        ) : (
          specie.map((s) => (
            <Grid
              size={{ xs: 12 }}
              key={s.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={s.id}
                specie={s.nome}
                fotoUrl={s.fotoUrl || FALLBACK_IMAGE_URL}
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
