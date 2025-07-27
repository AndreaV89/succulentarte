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

type Pianta = {
  id: string;
  specie: string;
  genere?: string;
  famiglia?: string;
};

const Indice = () => {
  const [piante, setPiante] = useState<Pianta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPiante = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "piante"));
      const arr: Pianta[] = snap.docs.map((doc) => ({
        id: doc.id,
        specie: doc.data().specie,
        genere: doc.data().genere,
        famiglia: doc.data().famiglia,
      }));
      arr.sort((a, b) => a.specie.localeCompare(b.specie));
      setPiante(arr);
      setLoading(false);
    };
    fetchPiante();
  }, []);

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
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {piante.map((pianta) => (
            <ListItemButton
              key={pianta.id}
              onClick={() => navigate(`/pianta/${pianta.id}`)}
              sx={{ borderRadius: 2, mb: 1 }}
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
          ))}
        </List>
      )}
    </Box>
  );
};

export default Indice;
