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
  doc,
  getDoc,
} from "firebase/firestore";
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

interface Genere {
  id: string;
  nome: string;
  descrizione: string;
  famigliaId: string;
}

interface Famiglia {
  id: string;
  nome: string;
}

interface Pianta {
  id: string;
  specie: string;
  fotoUrl?: string;
}

const GenereCatalogo = () => {
  const navigate = useNavigate();
  const { genereId } = useParams<{ genereId: string }>();
  const [genere, setGenere] = useState<Genere | null>(null);
  const [famiglia, setFamiglia] = useState<Famiglia | null>(null);
  const [piante, setPiante] = useState<Pianta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genereId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 2. Recupera i dati del genere usando l'ID
        const genereDocRef = doc(db, "generi", genereId);
        const genereDocSnap = await getDoc(genereDocRef);

        if (!genereDocSnap.exists()) {
          console.error("Nessun genere trovato con questo ID:", genereId);
          throw new Error("Genere non trovato");
        }

        const genereData = {
          id: genereDocSnap.id,
          ...genereDocSnap.data(),
        } as Genere;
        setGenere(genereData);

        // 3. Una volta ottenuto il genere, recupera la famiglia e le piante in parallelo
        const famigliaDocRef = doc(db, "famiglie", genereData.famigliaId);
        const pianteQuery = query(
          collection(db, "piante"),
          where("genereId", "==", genereId)
        );

        const [famigliaDocSnap, pianteSnap] = await Promise.all([
          getDoc(famigliaDocRef),
          getDocs(pianteQuery),
        ]);

        // Elabora i risultati
        if (famigliaDocSnap.exists()) {
          setFamiglia({
            id: famigliaDocSnap.id,
            ...famigliaDocSnap.data(),
          } as Famiglia);
        }

        setPiante(
          pianteSnap.docs.map((doc) => ({
            id: doc.id,
            specie: doc.data().specie,
            fotoUrl: doc.data().fotoThumbnailUrl || doc.data().fotoUrl,
          }))
        );
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
        setGenere(null);
        setFamiglia(null);
        setPiante([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [genereId]);

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
        famiglia &&
        genere && (
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
                onClick={() => navigate(`/catalogo/famiglia/${famiglia.id}`)}
              >
                {famiglia.nome}
              </Link>
              <Typography color="text.primary">{genere.nome}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {genere.nome}
            </Typography>
            <Typography sx={{ mb: 4, color: "#666" }}>
              {genere.descrizione || "Nessuna descrizione disponibile."}
            </Typography>
          </>
        )
      )}

      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {loading ? (
          // Skeleton per le card
          Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton variant="rounded" height={414} />
            </Grid>
          ))
        ) : piante.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessuna specie trovata per questo genere.
            </Box>
          </Grid>
        ) : (
          piante.map((p) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={p.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CardPianta
                id={p.id}
                specie={p.specie}
                fotoUrl={p.fotoUrl || FALLBACK_IMAGE_URL}
                onClick={() => navigate(`/pianta/${p.id}`)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default GenereCatalogo;
