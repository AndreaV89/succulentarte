// React
import { useState, useEffect } from "react";

// Firebase
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// MUI
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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const Categorie = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"famiglia" | "genere" | null>(
    null
  );
  const [deleteName, setDeleteName] = useState<string | null>(null);

  // Famiglie
  const [famiglie, setFamiglie] = useState<
    { nome: string; descrizione: string; fotoUrl?: string }[]
  >([]);
  const [famigliaFotoUrl, setFamigliaFotoUrl] = useState<string | null>(null);
  const [famigliaFotoFile, setFamigliaFotoFile] = useState<File | null>(null);
  const [famigliaNome, setFamigliaNome] = useState("");
  const [famigliaDescrizione, setFamigliaDescrizione] = useState("");
  const [famigliaEdit, setFamigliaEdit] = useState<{
    nome: string;
    descrizione: string;
    fotoUrl?: string;
  } | null>(null);

  // Generi
  const [generi, setGeneri] = useState<
    { nome: string; descrizione: string; famiglia: string; fotoUrl?: string }[]
  >([]);
  const [genereFotoUrl, setGenereFotoUrl] = useState<string | null>(null);
  const [genereFotoFile, setGenereFotoFile] = useState<File | null>(null);
  const [genereNome, setGenereNome] = useState("");
  const [genereDescrizione, setGenereDescrizione] = useState("");
  const [genereFamiglia, setGenereFamiglia] = useState("");
  const [genereEdit, setGenereEdit] = useState<{
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    famiglia: string;
  } | null>(null);

  // Modali
  const [showFamigliaModal, setShowFamigliaModal] = useState(false);
  const [showGenereModal, setShowGenereModal] = useState(false);

  // Carica famiglie e generi da Firestore
  const fetchData = async () => {
    const famSnap = await getDocs(collection(db, "famiglie"));
    setFamiglie(
      famSnap.docs.map((doc) => ({
        nome: doc.data().nome,
        descrizione: doc.data().descrizione || "",
        fotoUrl: doc.data().fotoUrl,
      }))
    );
    const genSnap = await getDocs(collection(db, "generi"));
    setGeneri(
      genSnap.docs.map((doc) => ({
        nome: doc.data().nome,
        descrizione: doc.data().descrizione || "",
        famiglia: doc.data().famiglia || "",
        fotoUrl: doc.data().fotoUrl,
      }))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset modali
  const resetFamigliaForm = () => {
    setFamigliaEdit(null);
    setFamigliaNome("");
    setFamigliaDescrizione("");
    setFamigliaFotoUrl(null);
    setFamigliaFotoFile(null);
    setShowFamigliaModal(false);
  };
  const resetGenereForm = () => {
    setGenereEdit(null);
    setGenereNome("");
    setGenereDescrizione("");
    setGenereFamiglia("");
    setGenereFotoUrl(null);
    setGenereFotoFile(null);
    setShowGenereModal(false);
  };

  // Aggiungi/modifica famiglia
  const handleAggiungiFamiglia = async () => {
    if (!famigliaNome.trim()) return;
    try {
      let fotoUrl = famigliaFotoUrl || "";
      const storage = getStorage();

      // Se l'utente ha rimosso una foto esistente
      if (famigliaEdit?.fotoUrl && !famigliaFotoUrl && !famigliaFotoFile) {
        const fotoRef = ref(storage, famigliaEdit.fotoUrl);
        try {
          await deleteObject(fotoRef);
        } catch (error) {
          console.warn("La foto da eliminare non è stata trovata:", error);
        }
        fotoUrl = ""; // Assicura che l'URL venga rimosso da Firestore
      }

      // Se l'utente ha caricato una nuova foto
      if (famigliaFotoFile) {
        // Se c'era una vecchia foto, eliminala prima di caricare la nuova
        if (famigliaEdit?.fotoUrl) {
          const fotoRef = ref(storage, famigliaEdit.fotoUrl);
          try {
            await deleteObject(fotoRef);
          } catch (error) {
            console.warn("La vecchia foto non è stata trovata:", error);
          }
        }
        const storageRef = ref(
          storage,
          `categorie/famiglie/${Date.now()}_${famigliaFotoFile.name}`
        );
        await uploadBytes(storageRef, famigliaFotoFile);
        fotoUrl = await getDownloadURL(storageRef);
      }

      const data = {
        nome: famigliaNome.trim(),
        descrizione: famigliaDescrizione.trim(),
        fotoUrl: fotoUrl,
      };

      if (famigliaEdit) {
        // Modifica
        const snap = await getDocs(
          query(
            collection(db, "famiglie"),
            where("nome", "==", famigliaEdit.nome)
          )
        );
        if (!snap.empty) {
          await updateDoc(doc(db, "famiglie", snap.docs[0].id), data);
        }
      } else {
        // Nuova
        await addDoc(collection(db, "famiglie"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      await fetchData();
      resetFamigliaForm();
    } catch (err) {
      alert("Errore: " + err);
    }
  };

  // Modifica famiglia
  const handleModificaFamiglia = (famiglia: {
    nome: string;
    descrizione: string;
    fotoUrl?: string;
  }) => {
    setFamigliaEdit(famiglia);
    setFamigliaNome(famiglia.nome);
    setFamigliaDescrizione(famiglia.descrizione);
    setFamigliaFotoUrl(famiglia.fotoUrl || null);
    setShowFamigliaModal(true);
  };

  // Rimuovi foto famiglia
  const handleRimuoviFotoFamiglia = () => {
    setFamigliaFotoFile(null);
    setFamigliaFotoUrl(null);
  };

  // Aggiungi/modifica genere
  const handleAggiungiGenere = async () => {
    if (!genereNome.trim() || !genereFamiglia) return;
    try {
      let fotoUrl = genereFotoUrl || "";
      const storage = getStorage();

      // Se l'utente ha rimosso una foto esistente
      if (genereEdit?.fotoUrl && !genereFotoUrl && !genereFotoFile) {
        const fotoRef = ref(storage, genereEdit.fotoUrl);
        try {
          await deleteObject(fotoRef);
        } catch (error) {
          console.warn("La foto da eliminare non è stata trovata:", error);
        }
        fotoUrl = ""; // Assicura che l'URL venga rimosso da Firestore
      }

      // Se l'utente ha caricato una nuova foto
      if (genereFotoFile) {
        // Se c'era una vecchia foto, eliminala prima di caricare la nuova
        if (genereEdit?.fotoUrl) {
          const fotoRef = ref(storage, genereEdit.fotoUrl);
          try {
            await deleteObject(fotoRef);
          } catch (error) {
            console.warn("La vecchia foto non è stata trovata:", error);
          }
        }
        const storageRef = ref(
          storage,
          `categorie/generi/${Date.now()}_${genereFotoFile.name}`
        );
        await uploadBytes(storageRef, genereFotoFile);
        fotoUrl = await getDownloadURL(storageRef);
      }

      const data = {
        nome: genereNome.trim(),
        descrizione: genereDescrizione.trim(),
        famiglia: genereFamiglia,
        fotoUrl: fotoUrl, // <-- AGGIUNTO
      };

      if (genereEdit) {
        // Modifica
        const snap = await getDocs(
          query(collection(db, "generi"), where("nome", "==", genereEdit.nome))
        );
        if (!snap.empty) {
          await updateDoc(doc(db, "generi", snap.docs[0].id), data);
        }
      } else {
        // Nuovo
        await addDoc(collection(db, "generi"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      await fetchData();
      resetGenereForm();
    } catch (err) {
      alert("Errore: " + err);
    }
  };

  // Modifica genere
  const handleModificaGenere = (genere: {
    nome: string;
    descrizione: string;
    famiglia: string;
    fotoUrl?: string;
  }) => {
    setGenereEdit(genere);
    setGenereNome(genere.nome);
    setGenereDescrizione(genere.descrizione);
    setGenereFamiglia(genere.famiglia || "");
    setGenereFotoUrl(genere.fotoUrl || null);
    setShowGenereModal(true);
  };

  // Rimuovi foto genere
  const handleRimuoviFotoGenere = () => {
    setGenereFotoFile(null);
    setGenereFotoUrl(null);
  };

  // Elimina famiglia
  const handleRimuoviFamiglia = async (nome: string) => {
    try {
      const snap = await getDocs(
        query(collection(db, "famiglie"), where("nome", "==", nome))
      );
      if (snap.empty) return;

      const docToDelete = snap.docs[0];
      const fotoUrl = docToDelete.data().fotoUrl;

      // Se esiste una foto, eliminala prima da Storage
      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);
        try {
          await deleteObject(fotoRef);
        } catch (storageError) {
          console.warn(
            "Impossibile eliminare la foto da Storage (potrebbe essere già stata rimossa):",
            storageError
          );
        }
      }

      // Ora elimina il documento da Firestore
      await deleteDoc(doc(db, "famiglie", docToDelete.id));
      await fetchData();
    } catch (err) {
      alert("Errore durante l'eliminazione della famiglia: " + err);
    }
  };

  // Elimina genere
  const handleRimuoviGenere = async (nome: string) => {
    try {
      const snap = await getDocs(
        query(collection(db, "generi"), where("nome", "==", nome))
      );
      if (snap.empty) return;

      const docToDelete = snap.docs[0];
      const fotoUrl = docToDelete.data().fotoUrl;

      // Se esiste una foto, eliminala prima da Storage
      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);
        try {
          await deleteObject(fotoRef);
        } catch (storageError) {
          console.warn(
            "Impossibile eliminare la foto da Storage (potrebbe essere già stata rimossa):",
            storageError
          );
        }
      }

      // Ora elimina il documento da Firestore
      await deleteDoc(doc(db, "generi", docToDelete.id));
      await fetchData();
    } catch (err) {
      alert("Errore durante l'eliminazione del genere: " + err);
    }
  };

  // Modal di conferma eliminazione genere/famiglia
  const askDelete = (type: "famiglia" | "genere", name: string) => {
    setDeleteType(type);
    setDeleteName(name);
    setConfirmOpen(true);
  };

  // Gestisce l'eliminazione di generi/famiglie
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
        maxWidth: 1600,
        mx: "auto",
        p: { xs: 2, md: 4 },
        flexGrow: 1,
      }}
    >
      <Typography variant="h4" sx={{ mb: 5, textAlign: "center" }}>
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
                    sx={{
                      background: "#FFC107",
                      color: "#222",
                      "&:hover": { background: "#ffb300" },
                    }}
                    size="small"
                    onClick={() => setShowFamigliaModal(true)}
                    aria-label="Aggiungi famiglia"
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
                    sx={{
                      background: "#FFC107",
                      color: "#222",
                      "&:hover": { background: "#ffb300" },
                    }}
                    size="small"
                    onClick={() => setShowGenereModal(true)}
                    aria-label="Aggiungi genere"
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
                            aria-label="Modifica famiglia"
                            onClick={() =>
                              handleModificaFamiglia(famiglie[idx])
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Elimina famiglia"
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
                            aria-label="Modifica genere"
                            onClick={() => handleModificaGenere(generi[idx])}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Elimina genere"
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
        onClose={resetFamigliaForm}
      >
        <DialogTitle>
          {famigliaEdit ? "Modifica famiglia" : "Aggiungi famiglia"}
        </DialogTitle>
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
            <Button variant="outlined" component="label">
              Carica Foto Famiglia
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  e.target.files && setFamigliaFotoFile(e.target.files[0])
                }
              />
            </Button>
            {(famigliaFotoUrl || famigliaFotoFile) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  component="img"
                  src={
                    famigliaFotoFile
                      ? URL.createObjectURL(famigliaFotoFile)
                      : famigliaFotoUrl || ""
                  }
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    alignSelf: "center",
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={handleRimuoviFotoFamiglia}
                >
                  Rimuovi Foto
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFamigliaForm}>Annulla</Button>
          <Button
            variant="contained"
            sx={{
              background: "#FFC107",
              color: "#222",
              "&:hover": { background: "#ffb300" },
            }}
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
        onClose={resetGenereForm}
      >
        <DialogTitle>
          {genereEdit ? "Modifica genere" : "Aggiungi genere"}
        </DialogTitle>
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
            <Button variant="outlined" component="label">
              Carica Foto Genere
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  e.target.files && setGenereFotoFile(e.target.files[0])
                }
              />
            </Button>
            {(genereFotoUrl || genereFotoFile) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  component="img"
                  src={
                    genereFotoFile
                      ? URL.createObjectURL(genereFotoFile)
                      : genereFotoUrl || ""
                  }
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    alignSelf: "center",
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={handleRimuoviFotoGenere}
                >
                  Rimuovi Foto
                </Button>
              </Box>
            )}
            <Select
              value={genereFamiglia}
              onChange={(e) => setGenereFamiglia(e.target.value)}
              size="small"
              sx={{ mt: 2 }}
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleziona famiglia</em>
              </MenuItem>
              {famiglie.map((f) => (
                <MenuItem key={f.nome} value={f.nome}>
                  {f.nome}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetGenereForm}>Annulla</Button>
          <Button
            variant="contained"
            sx={{
              background: "#FFC107",
              color: "#222",
              "&:hover": { background: "#ffb300" },
            }}
            onClick={handleAggiungiGenere}
            disabled={!genereNome.trim() || !genereFamiglia}
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
