import { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import EditIcon from "@mui/icons-material/Edit";

const Categorie = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"famiglia" | "genere" | null>(
    null
  );
  const [deleteName, setDeleteName] = useState<string | null>(null);
  // Famiglie
  const [famiglie, setFamiglie] = useState<
    { nome: string; descrizione: string }[]
  >([]);
  const [famigliaNome, setFamigliaNome] = useState("");
  const [famigliaDescrizione, setFamigliaDescrizione] = useState("");
  const [famigliaEdit, setFamigliaEdit] = useState<{
    nome: string;
    descrizione: string;
  } | null>(null);

  // Generi
  const [generi, setGeneri] = useState<{ nome: string; descrizione: string }[]>(
    []
  );
  const [genereNome, setGenereNome] = useState("");
  const [genereDescrizione, setGenereDescrizione] = useState("");

  // Sostituisci showFamigliaForm/showGenereForm con showFamigliaModal/showGenereModal
  const [showFamigliaModal, setShowFamigliaModal] = useState(false);
  const [showGenereModal, setShowGenereModal] = useState(false);
  const [genereEdit, setGenereEdit] = useState<{
    nome: string;
    descrizione: string;
  } | null>(null);

  // Carica famiglie e generi da Firestore
  useEffect(() => {
    const fetchData = async () => {
      const famSnap = await getDocs(collection(db, "famiglie"));
      setFamiglie(
        famSnap.docs.map((doc) => ({
          nome: doc.data().nome,
          descrizione: doc.data().descrizione || "",
        }))
      );
      const genSnap = await getDocs(collection(db, "generi"));
      setGeneri(
        genSnap.docs.map((doc) => ({
          nome: doc.data().nome,
          descrizione: doc.data().descrizione || "",
        }))
      );
    };
    fetchData();
  }, []);

  // Aggiungi famiglia
  const handleAggiungiFamiglia = async () => {
    if (!famigliaNome.trim()) return;
    if (famigliaEdit) {
      // Modifica
      const snap = await getDocs(collection(db, "famiglie"));
      const docToUpdate = snap.docs.find(
        (d) => d.data().nome === famigliaEdit.nome
      );
      if (docToUpdate) {
        await updateDoc(doc(db, "famiglie", docToUpdate.id), {
          nome: famigliaNome.trim(),
          descrizione: famigliaDescrizione.trim(),
        });
        setFamiglie((prev) =>
          prev.map((f) =>
            f.nome === famigliaEdit.nome
              ? {
                  nome: famigliaNome.trim(),
                  descrizione: famigliaDescrizione.trim(),
                }
              : f
          )
        );
      }
    } else {
      // Nuova
      await addDoc(collection(db, "famiglie"), {
        nome: famigliaNome.trim(),
        descrizione: famigliaDescrizione.trim(),
        createdAt: serverTimestamp(),
      });
      setFamiglie((prev) => [
        ...prev,
        { nome: famigliaNome.trim(), descrizione: famigliaDescrizione.trim() },
      ]);
    }
    setFamigliaNome("");
    setFamigliaDescrizione("");
    setFamigliaEdit(null);
    setShowFamigliaModal(false);
  };

  // Modifica famiglia
  const handleModificaFamiglia = (famiglia: {
    nome: string;
    descrizione: string;
  }) => {
    setFamigliaEdit(famiglia);
    setFamigliaNome(famiglia.nome);
    setFamigliaDescrizione(famiglia.descrizione);
    setShowFamigliaModal(true);
  };

  // Aggiungi genere
  const handleAggiungiGenere = async () => {
    if (!genereNome.trim()) return;
    if (genereEdit) {
      // Modifica
      const snap = await getDocs(collection(db, "generi"));
      const docToUpdate = snap.docs.find(
        (d) => d.data().nome === genereEdit.nome
      );
      if (docToUpdate) {
        await updateDoc(doc(db, "generi", docToUpdate.id), {
          nome: genereNome.trim(),
          descrizione: genereDescrizione.trim(),
        });

        setGeneri((prev) =>
          prev.map((g) =>
            g.nome === genereEdit.nome
              ? {
                  nome: genereNome.trim(),
                  descrizione: genereDescrizione.trim(),
                }
              : g
          )
        );
      }
    } else {
      // Nuovo
      await addDoc(collection(db, "generi"), {
        nome: genereNome.trim(),
        descrizione: genereDescrizione.trim(),
        createdAt: serverTimestamp(),
      });
      setGeneri((prev) => [
        ...prev,
        { nome: genereNome.trim(), descrizione: genereDescrizione.trim() },
      ]);
    }
    setGenereNome("");
    setGenereDescrizione("");
    setGenereEdit(null);
    setShowGenereModal(false);
  };

  // Modifica genere
  const handleModificaGenere = (genere: {
    nome: string;
    descrizione: string;
  }) => {
    setGenereEdit(genere);
    setGenereNome(genere.nome);
    setGenereDescrizione(genere.descrizione);
    setShowGenereModal(true);
  };

  // Elimina famiglia
  const handleRimuoviFamiglia = async (nome: string) => {
    const snap = await getDocs(collection(db, "famiglie"));
    const docToDelete = snap.docs.find((d) => d.data().nome === nome);
    if (docToDelete) {
      await deleteDoc(doc(db, "famiglie", docToDelete.id));
      setFamiglie((prev) => prev.filter((f) => f.nome !== nome));
    }
  };

  // Elimina genere
  const handleRimuoviGenere = async (nome: string) => {
    const snap = await getDocs(collection(db, "generi"));
    const docToDelete = snap.docs.find((d) => d.data().nome === nome);
    if (docToDelete) {
      await deleteDoc(doc(db, "generi", docToDelete.id));
      setGeneri((prev) => prev.filter((g) => g.nome !== nome));
    }
  };

  const handleCloseFamigliaModal = () => {
    setShowFamigliaModal(false);
    setFamigliaEdit(null);
    setFamigliaNome("");
    setFamigliaDescrizione("");
  };

  const handleCloseGenereModal = () => {
    setShowGenereModal(false);
    setGenereEdit(null);
    setGenereNome("");
    setGenereDescrizione("");
  };

  const askDelete = (type: "famiglia" | "genere", name: string) => {
    setDeleteType(type);
    setDeleteName(name);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteType === "famiglia" && deleteName) {
      await handleRimuoviFamiglia(deleteName);
    }
    if (deleteType === "genere" && deleteName) {
      await handleRimuoviGenere(deleteName);
    }
    setConfirmOpen(false);
    setDeleteType(null);
    setDeleteName(null);
  };

  return (
    <Box
      sx={{
        mt: "130px",
        mb: "50px",
        maxWidth: 1600, // aumentato da 1300 a 1600
        mx: "auto",
        p: { xs: 2, md: 4 },
      }}
    >
      <Typography variant="h4" sx={{ mb: 5 }}>
        Gestione categorie
      </Typography>

      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={3}
                  sx={{ background: "#f5f5f5", minWidth: 400 }}
                >
                  <b>Famiglie</b>
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={3}
                  sx={{
                    background: "#f5f5f5",
                    minWidth: 400,
                    borderLeft: "2px solid #e0e0e0",
                  }}
                >
                  <b>Generi</b>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ minWidth: 180, py: 2 }}>
                  <b>Nome</b>
                </TableCell>
                <TableCell sx={{ minWidth: 220, py: 2 }}>
                  <b>Descrizione</b>
                </TableCell>
                <TableCell sx={{ width: 60, py: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => setShowFamigliaModal(true)}
                  >
                    +
                  </Button>
                </TableCell>
                <TableCell
                  sx={{ minWidth: 180, py: 2, borderLeft: "2px solid #e0e0e0" }}
                >
                  <b>Nome</b>
                </TableCell>
                <TableCell sx={{ minWidth: 220, py: 2 }}>
                  <b>Descrizione</b>
                </TableCell>
                <TableCell sx={{ width: 60, py: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => setShowGenereModal(true)}
                  >
                    +
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({
                length: Math.max(famiglie.length, generi.length, 1),
              }).map((_, idx) => (
                <TableRow key={idx}>
                  {/* Famiglia */}
                  {famiglie[idx] ? (
                    <>
                      <TableCell sx={{ py: 2 }}>{famiglie[idx].nome}</TableCell>
                      <TableCell
                        sx={{
                          py: 2,
                          maxWidth: 250,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {famiglie[idx].descrizione}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              handleModificaFamiglia(famiglie[idx])
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              askDelete("famiglia", famiglie[idx].nome)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </>
                  ) : idx === 0 ? (
                    <>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ color: "#888", py: 3 }}
                      >
                        Nessuna famiglia
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </>
                  )}

                  {/* Genere */}
                  {generi[idx] ? (
                    <>
                      <TableCell
                        sx={{ py: 2, borderLeft: "2px solid #e0e0e0" }}
                      >
                        {generi[idx].nome}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2,
                          maxWidth: 250,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {generi[idx].descrizione}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleModificaGenere(generi[idx])}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              askDelete("genere", generi[idx].nome)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </>
                  ) : idx === 0 ? (
                    <>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{
                          color: "#888",
                          py: 3,
                          borderLeft: "2px solid #e0e0e0",
                        }}
                      >
                        Nessun genere
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ borderLeft: "2px solid #e0e0e0" }} />
                      <TableCell sx={{ borderLeft: "2px solid #e0e0e0" }} />
                      <TableCell sx={{ borderLeft: "2px solid #e0e0e0" }} />
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* MODAL FAMIGLIA */}
      <Dialog
        maxWidth="sm"
        fullWidth
        open={showFamigliaModal}
        onClose={handleCloseFamigliaModal}
      >
        <DialogTitle>Aggiungi famiglia</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nome famiglia"
              value={famigliaNome}
              onChange={(e) => setFamigliaNome(e.target.value)}
              size="small"
              autoFocus
            />
            <TextField
              label="Descrizione"
              value={famigliaDescrizione}
              onChange={(e) => setFamigliaDescrizione(e.target.value)}
              size="small"
              multiline
              minRows={6}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFamigliaModal(false)}>Annulla</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAggiungiFamiglia}
            disabled={!famigliaNome.trim()}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL GENERE */}
      <Dialog
        maxWidth="sm"
        fullWidth
        open={showGenereModal}
        onClose={handleCloseGenereModal}
      >
        <DialogTitle>Aggiungi genere</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nome genere"
              value={genereNome}
              onChange={(e) => setGenereNome(e.target.value)}
              size="small"
              autoFocus
            />
            <TextField
              label="Descrizione"
              value={genereDescrizione}
              onChange={(e) => setGenereDescrizione(e.target.value)}
              size="small"
              multiline
              minRows={6}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGenereModal(false)}>Annulla</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAggiungiGenere}
            disabled={!genereNome.trim()}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>
      {/* MODAL CONFERMA ELIMINAZIONE */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare{" "}
            {deleteType === "famiglia" ? "la famiglia" : "il genere"}{" "}
            <b>{deleteName}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annulla</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categorie;
