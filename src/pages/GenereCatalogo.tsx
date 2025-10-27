// React
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";

// Firebase
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Componenti
import CardPianta, { CardPiantaSkeleton } from "../components/CardPianta";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

interface Genere {
  id: string;
  nome: string;
  famigliaId: string;
  descrizione?: React.ReactNode;
}

interface Famiglia {
  id: string;
  nome: string;
}

interface Pianta {
  id: string;
  specie: string;
  fotoUrls?: string[];
  fotoCopertinaIndex?: number;
}

const GenereCatalogo = () => {
  const navigate = useNavigate();
  const { genereId } = useParams<{ genereId: string }>();
  const { generi, famiglie, loading: dataLoading } = useData();

  const genere = generi.find((g: Genere) => g.id === genereId);
  const famiglia = famiglie.find((f: Famiglia) => f.id === genere?.famigliaId);

  const [piante, setPiante] = useState<Pianta[]>([]);
  const [pianteLoading, setPianteLoading] = useState(true);

  useEffect(() => {
    // Questo useEffect ora carica SOLO le piante
    const fetchPiante = async () => {
      if (!genereId) return;
      setPianteLoading(true);
      const pianteQuery = query(
        collection(db, "piante"),
        where("genereId", "==", genereId)
      );
      const pianteSnap = await getDocs(pianteQuery);
      const pianteData = pianteSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pianta[];
      setPiante(pianteData);
      setPianteLoading(false);
    };
    fetchPiante();
  }, [genereId]);

  const isLoading = dataLoading || pianteLoading;

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        maxWidth: "1100px",
        mx: "auto",
      }}
    >
      {isLoading ? (
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
        genere && (
          <>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link
                sx={{ cursor: "pointer" }}
                underline="hover"
                onClick={() => navigate("/")}
              >
                Home
              </Link>
              <Link
                sx={{ cursor: "pointer" }}
                underline="hover"
                onClick={() => navigate(`/catalogo/famiglia/${famiglia?.id}`)}
              >
                {famiglia?.nome}
              </Link>
              <Typography color="text.primary">{genere.nome}</Typography>
            </Breadcrumbs>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
            >
              {genere.nome}
            </Typography>
            <Typography
              sx={{
                mb: 4,
                color: "#666",
                whiteSpace: "pre-wrap",
                textAlign: "center",
              }}
            >
              {genere.descrizione || "Nessuna descrizione disponibile."}
            </Typography>
          </>
        )
      )}

      <Grid
        container
        spacing={4}
        sx={{ maxWidth: "1100px", margin: "auto" }}
        justifyContent="center"
      >
        {isLoading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid key={index}>
                <CardPiantaSkeleton />
              </Grid>
            ))
          : piante.map((p) => {
              return (
                <Grid key={p.id}>
                  <CardPianta
                    pianta={p}
                    onClick={() => navigate(`/pianta/${p.id}`)}
                  />
                </Grid>
              );
            })}
      </Grid>
    </Box>
  );
};

export default GenereCatalogo;
