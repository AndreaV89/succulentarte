// React
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CardPianta, { CardPiantaSkeleton } from "../components/CardPianta";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";

// Utils
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
  famigliaId: string;
}

const FamigliaCatalogo = () => {
  const navigate = useNavigate();
  const { famigliaId } = useParams<{ famigliaId: string }>();

  const { famiglie, generi, loading: dataLoading } = useData();
  const famiglia = (famiglie as Famiglia[]).find((f) => f.id === famigliaId);
  const generiFiltrati = generi.filter(
    (g: Genere) => g.famigliaId === famigliaId
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        maxWidth: "1100px",
        mx: "auto",
        px: 2,
      }}
    >
      {dataLoading ? (
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
            <Typography sx={{ mb: 4, color: "#666", whiteSpace: "pre-wrap" }}>
              {famiglia.descrizione || "Nessuna descrizione disponibile."}
            </Typography>
          </>
        )
      )}

      <Grid
        container
        spacing={4}
        sx={{ maxWidth: "1200px", margin: "auto" }}
        justifyContent="center"
      >
        {dataLoading ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid key={index}>
              <CardPiantaSkeleton />
            </Grid>
          ))
        ) : generiFiltrati.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 6, color: "#888" }}>
              Nessun genere trovato per questa famiglia.
            </Box>
          </Grid>
        ) : (
          generiFiltrati.map((g: Genere) => (
            <Grid key={g.id}>
              <CardPianta
                pianta={{
                  id: g.id,
                  specie: g.nome, // Usiamo il nome del genere come titolo
                  fotoUrls: [g.fotoUrl || FALLBACK_IMAGE_URL], // Creiamo un array con l'URL
                }}
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
