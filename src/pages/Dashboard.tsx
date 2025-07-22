import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { auth } from "../../firebaseConfig";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import type { StorageReference } from "firebase/storage";

const storage = getStorage();

interface Pianta {
  id: string;
  specie?: string;
  fotoUrls?: string[];
  famiglia?: string;
  genere?: string;
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

  // Carica le piante dal db
  useEffect(() => {
    const fetchPiante = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "piante"));
      setPiante(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    };
    fetchPiante();
  }, []);

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
    // Elimina tutte le foto associate dalla cartella Storage (anche sottocartelle)
    try {
      const folderRef = ref(storage, `piante/${id}`);
      await deleteAllFilesInFolder(folderRef);
    } catch (err) {
      console.log(err);
    }
    // Elimina il documento Firestore
    await deleteDoc(doc(db, "piante", id));
    setPiante((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLogout = () => {
    logout();
    auth.signOut();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    console.log(piante);
  }, [piante]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Benvenuto nella Dashboard!
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{ fontWeight: 600, borderRadius: 3, px: 4, mb: 4 }}
      >
        Logout
      </Button>
      {/* Bottone per andare alla pagina categorie */}
      <Button
        variant="outlined"
        color="primary"
        sx={{ mb: 3 }}
        onClick={() => navigate("/dashboard/categorie")}
      >
        Gestisci categorie
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => navigate("/dashboard/nuova")}
      >
        Aggiungi pianta
      </Button>
      <Box sx={{ mt: 2, width: "100%", maxWidth: 900 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
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
                <TableRow>
                  <TableCell>
                    <b>Specie</b>
                  </TableCell>
                  <TableCell>
                    <b>Famiglia</b>
                  </TableCell>
                  <TableCell>
                    <b>Genere</b>
                  </TableCell>
                  <TableCell>
                    <b>Ultima modifica</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Azioni</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {piante.map((pianta) => (
                  <TableRow key={pianta.id}>
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
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={() =>
                          navigate(`/dashboard/nuova/${pianta.id}`)
                        }
                      >
                        Modifica
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setDeleteId(pianta.id);
                          setConfirmOpen(true);
                        }}
                      >
                        Elimina
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>Sei sicuro di voler eliminare questa pianta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annulla</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteId) {
                await handleDelete(deleteId);
              }
              setConfirmOpen(false);
              setDeleteId(null);
            }}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Dashboard;
