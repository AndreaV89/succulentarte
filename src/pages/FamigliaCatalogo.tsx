// React
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import {
  getDocs,
  collection,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CardPianta from "../components/CardPianta";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";

// Fallback image
import { FALLBACK_IMAGE_URL } from "../utils/constants";

interface Famiglia {
  id: string;
  nome: string;
  descrizione: string;
}

interface Genere {
  id: string;
  nome: string;
  fotoUrl?: string;
}

const FamigliaCatalogo = () => {
  const navigate = useNavigate();
  const { famigliaId } = useParams<{ famigliaId: string }>();
  const [famiglia, setFamiglia] = useState<Famiglia | null>(null);
  const [generi, setGeneri] = useState<Genere[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!famigliaId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Esegui le query per la famiglia e i generi in parallelo
        const famigliaDocRef = doc(db, "famiglie", famigliaId);
        const generiQuery = query(
          collection(db, "generi"),
          where("famigliaId", "==", famigliaId)
        );

        const [famigliaDocSnap, generiSnap] = await Promise.all([
          getDoc(famigliaDocRef),
          getDocs(generiQuery),
        ]);

        // Elabora i risultati
        if (famigliaDocSnap.exists()) {
          setFamiglia({
            id: famigliaDocSnap.id,
            ...famigliaDocSnap.data(),
          } as Famiglia);
        } else {
          console.error("Nessuna famiglia trovata con questo ID:", famigliaId);
          setFamiglia(null); // Pulisci lo stato se non trovata
        }

        setGeneri(
          generiSnap.docs.map((doc) => ({
            id: doc.id,
            nome: doc.data().nome,
            fotoUrl: doc.data().fotoThumbnailUrl || doc.data().fotoUrl,
          }))
        );
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
        // Resetta gli stati in caso di errore
        setFamiglia(null);
        setGeneri([]);
      } finally {
        // Questo blocco viene eseguito SEMPRE, garantendo che il caricamento termini
        setLoading(false);
      }
    };

    fetchData();
  }, [famigliaId]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        maxWidth: "1200px",
        mx: "auto",
        px: 2,
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
        famiglia && (
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
              <Typography color="text.primary">{famiglia.nome}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {famiglia.nome}
            </Typography>
            <Typography sx={{ mb: 4, color: "#666" }}>
              {famiglia.descrizione || "Nessuna descrizione disponibile."}
            </Typography>
          </>
        )
      )}

      <Grid
        container
        spacing={2}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {loading ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton variant="rounded" height={414} />
            </Grid>
          ))
        ) : generi.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessun genere trovato per questa famiglia.
            </Box>
          </Grid>
        ) : (
          generi.map((g) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={g.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={g.id}
                specie={g.nome}
                fotoUrl={g.fotoUrl || FALLBACK_IMAGE_URL}
                onClick={() => navigate(`/catalogo/genere/${g.id}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default FamigliaCatalogo;
