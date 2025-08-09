// React
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Firebase
import { auth } from "../../firebaseConfig";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import type { StorageReference } from "firebase/storage";

// MUI
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Utils
import { getResizedImageUrls } from "../utils/imageUtils";

const storage = getStorage();
interface Pianta {
  id: string;
  specie?: string;
  fotoUrls?: string[];
  fotoCopertinaIndex?: number;
  famiglia?: string;
  famigliaId?: string;
  genere?: string;
  genereId?: string;
  sinonimi?: string;
  sottospecie?: string;
  varieta?: string;
  forma?: string;
  cultivar?: string;
  descrittorePianta?: string;
  descrizione?: string;
  origine?: string;
  habitat?: string;
  esposizione?: string;
  bagnature?: string;
  temperaturaMinima?: string;
  updatedAt?: string;
}

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [piante, setPiante] = useState<Pianta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pianta;
    direction: "ascending" | "descending";
  }>({ key: "updatedAt", direction: "descending" });

  // Carica le piante dal db
  useEffect(() => {
    const fetchPiante = async () => {
      setLoading(true);
      try {
        // 1. Carica famiglie e generi e crea le mappe di lookup
        const [famiglieSnap, generiSnap, pianteSnap] = await Promise.all([
          getDocs(collection(db, "famiglie")),
          getDocs(collection(db, "generi")),
          getDocs(collection(db, "piante")),
        ]);

        const famiglieMap = new Map(
          famiglieSnap.docs.map((doc) => [doc.id, doc.data().nome])
        );
        const generiMap = new Map(
          generiSnap.docs.map((doc) => [doc.id, doc.data().nome])
        );

        // 2. Mappa le piante e arricchiscile con i nomi
        const pianteConNomi = pianteSnap.docs.map((doc) => {
          const data = doc.data();

          // Costruiamo un nuovo oggetto pulito
          const piantaMappata: Pianta = {
            id: doc.id, // L'ID corretto dal documento
            specie: data.specie,
            famigliaId: data.famigliaId,
            genereId: data.genereId,
            fotoUrls: data.fotoUrls,
            fotoCopertinaIndex: data.fotoCopertinaIndex,
            sinonimi: data.sinonimi,
            sottospecie: data.sottospecie,
            varieta: data.varieta,
            forma: data.forma,
            cultivar: data.cultivar,
            descrittorePianta: data.descrittorePianta,
            descrizione: data.descrizione,
            origine: data.origine,
            habitat: data.habitat,
            esposizione: data.esposizione,
            bagnature: data.bagnature,
            temperaturaMinima: data.temperaturaMinima,
            updatedAt: data.updatedAt,
            famiglia: famiglieMap.get(data.famigliaId || "") || "N/A",
            genere: generiMap.get(data.genereId || "") || "N/A",
          };
          return piantaMappata;
        });

        setPiante(pianteConNomi);
      } catch (err) {
        console.error("Errore nel caricamento dei dati della dashboard:", err);
        setError("Impossibile caricare i dati.");
      } finally {
        setLoading(false);
      }
    };
    fetchPiante();
  }, []);

  // Funzione helper per estrarre un valore di data da vari formati
  const getDateValue = (
    value: string | number | Date | { seconds: number } | null | undefined
  ): number | null => {
    if (!value) return null;
    // Controlla se è un oggetto Timestamp di Firestore
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as { seconds?: number }).seconds === "number"
    ) {
      return new Date((value as { seconds: number }).seconds * 1000).getTime();
    }
    // Potrebbe essere già una stringa data o un oggetto Date
    const date = new Date(value as string | number | Date);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
    return null;
  };

  const sortedPiante = useMemo(() => {
    const sortablePiante = [...piante];
    if (sortConfig.key) {
      sortablePiante.sort((a, b) => {
        // Gestione specifica per l'ordinamento per data
        if (sortConfig.key === "updatedAt") {
          const dateA = getDateValue(a.updatedAt);
          const dateB = getDateValue(b.updatedAt);

          if (dateA === null) return 1;
          if (dateB === null) return -1;

          if (dateA < dateB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }

        // Gestione per tutti gli altri tipi (es. stringhe)
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (String(aValue).localeCompare(String(bValue)) < 0) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (String(aValue).localeCompare(String(bValue)) > 0) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePiante;
  }, [piante, sortConfig]);

  const handleSort = (key: keyof Pianta) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const deleteAllFilesInFolder = async (folderRef: StorageReference) => {
    console.log("Tentativo di listAll su:", folderRef.fullPath);
    try {
      const list = await listAll(folderRef);
      await Promise.all(
        list.items.map(async (item) => {
          try {
            await deleteObject(item);
          } catch (err) {
            console.error("Errore eliminando", item.fullPath, err);
          }
        })
      );
      await Promise.all(
        list.prefixes.map((subfolderRef) =>
          deleteAllFilesInFolder(subfolderRef)
        )
      );
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        ("code" in err || "message" in err)
      ) {
        const code = (err as { code?: string }).code;
        const message = (err as { message?: string }).message;
        if (
          code === "storage/unknown" ||
          (message && message.includes("400"))
        ) {
          console.warn(
            "Cartella non trovata o già eliminata:",
            folderRef.fullPath
          );
          return;
        }
      }
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const folderRef = ref(storage, `piante/${id}`);
      await deleteAllFilesInFolder(folderRef);
      await deleteDoc(doc(db, "piante", id));
      setPiante((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Errore durante l'eliminazione della pianta.");
      console.log(err);
    }
  };

  const handleLogout = () => {
    logout();
    auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        mx: "auto",
        width: "100%",
        maxWidth: "1100px",
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          py: 2,
          px: 3,
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => navigate("/dashboard/categorie")}
          >
            Gestisci categorie
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/dashboard/nuova")}
          >
            Aggiungi pianta
          </Button>
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} sx={{ ml: 1.5 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      {error && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}
      <Box sx={{ mt: 2, width: "100%" }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "left" }}>
          Le tue piante:
        </Typography>
        {loading ? (
          <Typography>Caricamento...</Typography>
        ) : piante.length === 0 ? (
          <Typography>Nessuna pianta trovata.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f5f5f5" }}>
                  <TableCell sx={{ width: "80px" }}>
                    <b>Foto</b>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "specie"}
                      direction={
                        sortConfig.key === "specie"
                          ? sortConfig.direction === "ascending"
                            ? "asc"
                            : "desc"
                          : "asc"
                      }
                      onClick={() => handleSort("specie")}
                    >
                      <b>Specie</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "famiglia"}
                      direction={
                        sortConfig.key === "famiglia"
                          ? sortConfig.direction === "ascending"
                            ? "asc"
                            : "desc"
                          : "asc"
                      }
                      onClick={() => handleSort("famiglia")}
                    >
                      <b>Famiglia</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "genere"}
                      direction={
                        sortConfig.key === "genere"
                          ? sortConfig.direction === "ascending"
                            ? "asc"
                            : "desc"
                          : "asc"
                      }
                      onClick={() => handleSort("genere")}
                    >
                      <b>Genere</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "updatedAt"}
                      direction={
                        sortConfig.key === "updatedAt"
                          ? sortConfig.direction === "ascending"
                            ? "asc"
                            : "desc"
                          : "asc"
                      }
                      onClick={() => handleSort("updatedAt")}
                    >
                      <b>Ultima modifica</b>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <b>Azioni</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPiante.map((pianta) => {
                  const coverIndex = pianta.fotoCopertinaIndex ?? 0;
                  const coverUrl = pianta.fotoUrls?.[coverIndex];
                  const imageUrls = getResizedImageUrls(coverUrl);
                  return (
                    <TableRow key={pianta.id}>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={imageUrls.thumbnail}
                          sx={{ width: 56, height: 56 }}
                        >
                          <ImageIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>{pianta.specie || "-"}</TableCell>
                      <TableCell>{pianta.famiglia || "-"}</TableCell>
                      <TableCell>{pianta.genere || "-"}</TableCell>
                      <TableCell>
                        {pianta.updatedAt
                          ? new Date(
                              typeof pianta.updatedAt === "string"
                                ? pianta.updatedAt
                                : typeof pianta.updatedAt === "object" &&
                                  pianta.updatedAt !== null &&
                                  "seconds" in pianta.updatedAt
                                ? (pianta.updatedAt as { seconds: number })
                                    .seconds * 1000
                                : ""
                            ).toLocaleString("it-IT")
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizza pianta">
                          <IconButton
                            color="secondary"
                            sx={{ mr: 1 }}
                            onClick={() => navigate(`/pianta/${pianta.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifica pianta">
                          <IconButton
                            color="primary"
                            sx={{ mr: 1 }}
                            onClick={() =>
                              navigate(`/dashboard/nuova/${pianta.id}`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina pianta">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setDeleteId(pianta.id);
                              setConfirmOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare la pianta{" "}
            <b>{piante.find((p) => p.id === deleteId)?.specie || ""}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annulla</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={async () => {
              if (deleteId) {
                setDeleting(true);
                await handleDelete(deleteId);
                setDeleting(false);
              }
              setConfirmOpen(false);
              setDeleteId(null);
            }}
          >
            {deleting ? "Eliminazione..." : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Dashboard;
