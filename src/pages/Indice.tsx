// React
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";

type Pianta = {
  id: string;
  specie: string;
  genere?: string;
  famiglia?: string;
};

const Indice = () => {
  const [piante, setPiante] = useState<Pianta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPiante = async () => {
      try {
        setLoading(true);
        setError(null);
        const snap = await getDocs(collection(db, "piante"));
        const arr: Pianta[] = snap.docs.map((doc) => ({
          id: doc.id,
          specie: doc.data().specie,
          genere: doc.data().genere,
          famiglia: doc.data().famiglia,
        }));
        arr.sort((a, b) => a.specie.localeCompare(b.specie));
        setPiante(arr);
      } catch (err) {
        console.error("Errore nel caricamento delle piante:", err);
        setError("Impossibile caricare l'indice. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };
    fetchPiante();
  }, []);

  const pianteRaggruppate = piante.reduce((acc, pianta) => {
    const primaLettera = pianta.specie[0].toUpperCase();
    if (!acc[primaLettera]) {
      acc[primaLettera] = [];
    }
    acc[primaLettera].push(pianta);
    return acc;
  }, {} as Record<string, Pianta[]>);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Typography color="error" textAlign="center" sx={{ py: 6 }}>
          {error}
        </Typography>
      );
    }
    if (piante.length === 0) {
      return (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          Nessuna pianta trovata nel catalogo.
        </Typography>
      );
    }
    return (
      <List
        sx={{ bgcolor: "background.paper", borderRadius: 2 }}
        subheader={<li />}
      >
        {Object.keys(pianteRaggruppate).map((lettera) => (
          <li key={`section-${lettera}`}>
            <ul>
              <ListSubheader sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                {lettera}
              </ListSubheader>
              {pianteRaggruppate[lettera].map((pianta, index) => (
                <>
                  <ListItemButton
                    key={pianta.id}
                    onClick={() => navigate(`/pianta/${pianta.id}`)}
                  >
                    <ListItemText
                      primary={pianta.specie}
                      secondary={
                        pianta.genere
                          ? `${pianta.genere} – ${pianta.famiglia}`
                          : undefined
                      }
                    />
                  </ListItemButton>
                  {index < pianteRaggruppate[lettera].length - 1 && (
                    <Divider component="li" />
                  )}
                </>
              ))}
            </ul>
          </li>
        ))}
      </List>
    );
  };

  return (
    <Box
      sx={{ flexGrow: 1, mt: "130px", mb: "50px", maxWidth: 900, mx: "auto" }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}
      >
        Indice delle Piante
      </Typography>
      {renderContent()}
    </Box>
  );
};

export default Indice;
