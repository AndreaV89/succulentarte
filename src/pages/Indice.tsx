// React
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

// Firebase
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Utils
import { getResizedImageUrls } from "../utils/imageUtils";

type Pianta = {
  id: string;
  specie: string;
  genere: string;
  famiglia: string;
  imageUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
};

const Indice = () => {
  const {
    famiglie,
    generi,
    famiglieMap,
    generiMap,
    loading: dataLoading,
  } = useData();
  const [piante, setPiante] = useState<Pianta[]>([]);
  const [pianteLoading, setPianteLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFamiglia, setSelectedFamiglia] = useState<string>("");
  const [selectedGenere, setSelectedGenere] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Pianta>("specie");
  const navigate = useNavigate();

  useEffect(() => {
    if (dataLoading) return;

    const fetchPiante = async () => {
      try {
        setPianteLoading(true);
        setError(null);

        const pianteSnap = await getDocs(collection(db, "piante"));

        const arr: Pianta[] = pianteSnap.docs.map((doc) => {
          const data = doc.data();
          let copertinaUrl: string | undefined;
          if (data.fotoUrls && data.fotoUrls.length > 0) {
            const coverIndex = data.fotoCopertinaIndex ?? 0;
            copertinaUrl = data.fotoUrls[coverIndex] || data.fotoUrls[0];
          }
          const imageUrls = getResizedImageUrls(copertinaUrl);
          return {
            id: doc.id,
            specie: data.specie,
            genere: generiMap.get(data.genereId) || "N/D",
            famiglia: famiglieMap.get(data.famigliaId) || "N/D",
            imageUrls,
          };
        });
        setPiante(arr);
      } catch (err) {
        console.error("Errore nel caricamento delle piante:", err);
        setError("Impossibile caricare l'indice. Riprova più tardi.");
      } finally {
        setPianteLoading(false);
      }
    };
    fetchPiante();
  }, [dataLoading, famiglieMap, generiMap]);

  const famiglieList = useMemo(
    () => famiglie.map((f) => f.nome).sort((a, b) => a.localeCompare(b)),
    [famiglie]
  );

  const generiList = useMemo(() => {
    if (!selectedFamiglia) {
      // Se nessuna famiglia è selezionata, mostra tutti i generi
      return generi.map((g) => g.nome).sort((a, b) => a.localeCompare(b));
    }
    // Altrimenti, filtra i generi in base alla famiglia selezionata
    const selectedFamigliaId = famiglie.find(
      (f) => f.nome === selectedFamiglia
    )?.id;
    return generi
      .filter((g) => g.famigliaId === selectedFamigliaId)
      .map((g) => g.nome)
      .sort((a, b) => a.localeCompare(b));
  }, [generi, famiglie, selectedFamiglia]);

  const handleRequestSort = (property: keyof Pianta) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredAndSortedPiante = useMemo(() => {
    return piante
      .filter((pianta) => {
        const famigliaMatch = selectedFamiglia
          ? pianta.famiglia === selectedFamiglia
          : true;
        const genereMatch = selectedGenere
          ? pianta.genere === selectedGenere
          : true;
        return famigliaMatch && genereMatch; // Questa riga mancava
      })
      .sort((a, b) => {
        // Gestione per evitare errori se un valore è undefined
        const valA = a[orderBy] || "";
        const valB = b[orderBy] || "";

        if (valB < valA) {
          return order === "asc" ? 1 : -1;
        }
        if (valB > valA) {
          return order === "asc" ? -1 : 1;
        }
        return 0;
      });
  }, [piante, selectedFamiglia, selectedGenere, order, orderBy]);

  const renderContent = () => {
    if (dataLoading || pianteLoading) {
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
    if (piante.length === 0 && !pianteLoading) {
      return (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          Nessuna pianta trovata nel catalogo.
        </Typography>
      );
    }
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth>
              <InputLabel id="famiglia-filter-label">
                Filtra per Famiglia
              </InputLabel>
              <Select
                labelId="famiglia-filter-label"
                id="famiglia-filter"
                value={selectedFamiglia}
                label="Filtra per Famiglia"
                onChange={(e) => {
                  setSelectedFamiglia(e.target.value);
                  setSelectedGenere("");
                }}
              >
                <MenuItem value="">
                  <em>Tutte le famiglie</em>
                </MenuItem>
                {famiglieList.map((famiglia) => (
                  <MenuItem key={famiglia} value={famiglia}>
                    {famiglia}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth>
              <InputLabel id="genere-filter-label">
                Filtra per Genere
              </InputLabel>
              <Select
                labelId="genere-filter-label"
                id="genere-filter"
                value={selectedGenere}
                label="Filtra per Genere"
                onChange={(e) => setSelectedGenere(e.target.value)}
              >
                <MenuItem value="">
                  <em>Tutti i generi</em>
                </MenuItem>
                {generiList.map((genere) => (
                  <MenuItem key={genere} value={genere}>
                    {genere}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSelectedFamiglia("");
                setSelectedGenere("");
              }}
              startIcon={<ClearAllIcon />}
              disabled={!selectedFamiglia && !selectedGenere}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
        {filteredAndSortedPiante.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mostrando <b>{filteredAndSortedPiante.length}</b> di{" "}
              <b>{piante.length}</b> piante.
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ background: "#f5f5f5" }}>
                    <TableCell sx={{ py: 1, px: 2 }}></TableCell>
                    <TableCell sx={{ py: 2, px: 3, fontSize: "1rem" }}>
                      <TableSortLabel
                        active={orderBy === "specie"}
                        direction={orderBy === "specie" ? order : "asc"}
                        onClick={() => handleRequestSort("specie")}
                      >
                        <b>Specie</b>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 3, fontSize: "1rem" }}>
                      <TableSortLabel
                        active={orderBy === "genere"}
                        direction={orderBy === "genere" ? order : "asc"}
                        onClick={() => handleRequestSort("genere")}
                      >
                        <b>Genere</b>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 3, fontSize: "1rem" }}>
                      <TableSortLabel
                        active={orderBy === "famiglia"}
                        direction={orderBy === "famiglia" ? order : "asc"}
                        onClick={() => handleRequestSort("famiglia")}
                      >
                        <b>Famiglia</b>
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedPiante.map((pianta) => (
                    <TableRow
                      key={pianta.id}
                      hover
                      onClick={() => navigate(`/pianta/${pianta.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ py: 1, px: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={pianta.imageUrls.thumbnail}
                          sx={{ width: 56, height: 56 }}
                        >
                          <ImageIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>{pianta.specie}</TableCell>
                      <TableCell>{pianta.genere}</TableCell>
                      <TableCell>{pianta.famiglia}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ minWidth: 750 }}>
            <Typography
              color="text.secondary"
              textAlign="center"
              sx={{ py: 6 }}
            >
              Nessuna pianta trovata con i filtri selezionati.
            </Typography>
          </Box>
        )}
      </>
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        maxWidth: 1200,
        mx: "auto",
        px: 2,
      }}
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
