// React
import { useState, useEffect } from "react";

// Firebase
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
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
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

import imageCompression from "browser-image-compression";

const AggiungiCategoria = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "famiglia" | "genere" | "bulk" | null
  >(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openFamigliaId, setOpenFamigliaId] = useState<string | null>(null);
  const [selectedFamiglie, setSelectedFamiglie] = useState<string[]>([]);
  const [selectedGeneri, setSelectedGeneri] = useState<string[]>([]);

  // Famiglie
  const [famiglie, setFamiglie] = useState<
    {
      id: string;
      nome: string;
      descrizione: string;
      fotoUrl?: string;
      fotoThumbnailUrl?: string;
    }[]
  >([]);
  const [famigliaFotoUrl, setFamigliaFotoUrl] = useState<string | null>(null);
  const [famigliaFotoThumbnailUrl, setFamigliaFotoThumbnailUrl] = useState<
    string | null
  >(null);
  const [famigliaFotoFile, setFamigliaFotoFile] = useState<File | null>(null);
  const [famigliaNome, setFamigliaNome] = useState("");
  const [famigliaDescrizione, setFamigliaDescrizione] = useState("");
  const [famigliaEdit, setFamigliaEdit] = useState<{
    id: string;
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  } | null>(null);

  // Generi
  const [generi, setGeneri] = useState<
    {
      id: string;
      nome: string;
      descrizione: string;
      famigliaId: string;
      fotoUrl?: string;
      fotoThumbnailUrl?: string;
    }[]
  >([]);
  const [genereFotoUrl, setGenereFotoUrl] = useState<string | null>(null);
  const [genereFotoThumbnailUrl, setGenereFotoThumbnailUrl] = useState<
    string | null
  >(null);
  const [genereFotoFile, setGenereFotoFile] = useState<File | null>(null);
  const [genereNome, setGenereNome] = useState("");
  const [genereDescrizione, setGenereDescrizione] = useState("");
  const [genereFamiglia, setGenereFamiglia] = useState("");
  const [genereEdit, setGenereEdit] = useState<{
    id: string;
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
    famigliaId: string;
  } | null>(null);

  // Modali
  const [showFamigliaModal, setShowFamigliaModal] = useState(false);
  const [showGenereModal, setShowGenereModal] = useState(false);

  // Errori
  const [notification, setNotification] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const numSelected = selectedFamiglie.length + selectedGeneri.length;

  // Carica famiglie e generi da Firestore
  const fetchData = async () => {
    const famSnap = await getDocs(collection(db, "famiglie"));
    setFamiglie(
      famSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          nome: string;
          descrizione: string;
          fotoUrl?: string;
          fotoThumbnailUrl?: string;
        }),
      }))
    );
    const genSnap = await getDocs(collection(db, "generi"));
    setGeneri(
      genSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          nome: string;
          descrizione: string;
          famigliaId: string;
          fotoUrl?: string;
          fotoThumbnailUrl?: string;
        }),
      }))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset modali
  const resetFamigliaForm = () => {
    setShowFamigliaModal(false);
    setFamigliaEdit(null);
    setFamigliaNome("");
    setFamigliaDescrizione("");
    setFamigliaFotoUrl(null);
    setFamigliaFotoThumbnailUrl(null);
    setFamigliaFotoFile(null);
  };
  const resetGenereForm = () => {
    setShowGenereModal(false);
    setGenereEdit(null);
    setGenereNome("");
    setGenereDescrizione("");
    setGenereFamiglia("");
    setGenereFotoUrl(null);
    setGenereFotoThumbnailUrl(null);
    setGenereFotoFile(null);
  };

  // Aggiungi/modifica famiglia
  const handleAggiungiFamiglia = async () => {
    if (!famigliaNome.trim()) return;
    try {
      let fotoUrl = famigliaFotoUrl || "";
      let fotoThumbnailUrl = famigliaFotoThumbnailUrl || "";
      const storage = getStorage();

      // Se l'utente ha rimosso una foto esistente
      if (famigliaEdit?.fotoUrl && !famigliaFotoUrl && !famigliaFotoFile) {
        const fotoRef = ref(storage, famigliaEdit.fotoUrl);
        await deleteObject(fotoRef).catch((err) =>
          console.warn("Foto originale non trovata", err)
        );
        if (famigliaEdit.fotoThumbnailUrl) {
          const thumbRef = ref(storage, famigliaEdit.fotoThumbnailUrl);
          await deleteObject(thumbRef).catch((err) =>
            console.warn("Miniatura non trovata", err)
          );
        }
        fotoUrl = "";
        fotoThumbnailUrl = "";
      }

      // Se l'utente ha caricato una nuova foto
      if (famigliaFotoFile) {
        // Se c'era una vecchia foto, eliminala prima di caricare la nuova
        if (famigliaEdit?.fotoUrl) {
          const fotoRef = ref(storage, famigliaEdit.fotoUrl);
          await deleteObject(fotoRef).catch((err) =>
            console.warn("Vecchia foto non trovata", err)
          );
        }
        if (famigliaEdit?.fotoThumbnailUrl) {
          const thumbRef = ref(storage, famigliaEdit.fotoThumbnailUrl);
          await deleteObject(thumbRef).catch((err) =>
            console.warn("Vecchia miniatura non trovata", err)
          );
        }

        const timestamp = Date.now();
        const baseFileName = `${timestamp}_${famigliaFotoFile.name}`;

        // Upload originale
        const storageRef = ref(storage, `categorie/famiglie/${baseFileName}`);
        await uploadBytes(storageRef, famigliaFotoFile);
        fotoUrl = await getDownloadURL(storageRef);

        // Crea e upload miniatura
        const thumbOptions = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(
          famigliaFotoFile,
          thumbOptions
        );
        const thumbRef = ref(
          storage,
          `categorie/famiglie/thumb_${baseFileName}`
        );
        await uploadBytes(thumbRef, compressedFile);
        fotoThumbnailUrl = await getDownloadURL(thumbRef);
      }

      const data = {
        nome: famigliaNome.trim(),
        descrizione: famigliaDescrizione.trim(),
        fotoUrl: fotoUrl,
        fotoThumbnailUrl: fotoThumbnailUrl,
      };

      if (famigliaEdit) {
        // Modifica
        await updateDoc(doc(db, "famiglie", famigliaEdit.id), data);
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
      setNotification({
        message: "Si è verificato un errore. Riprova.",
        severity: "error",
      });
      console.error(err);
    }
  };

  // Modifica famiglia
  const handleModificaFamiglia = (famiglia: {
    id: string;
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  }) => {
    setFamigliaEdit(famiglia);
    setFamigliaNome(famiglia.nome);
    setFamigliaDescrizione(famiglia.descrizione);
    setFamigliaFotoUrl(famiglia.fotoUrl || null);
    setFamigliaFotoThumbnailUrl(famiglia.fotoThumbnailUrl || null);
    setShowFamigliaModal(true);
  };

  // Rimuovi foto famiglia
  const handleRimuoviFotoFamiglia = () => {
    setFamigliaFotoFile(null);
    setFamigliaFotoUrl(null);
    setFamigliaFotoThumbnailUrl(null);
  };

  // Aggiungi/modifica genere
  const handleAggiungiGenere = async () => {
    if (!genereNome.trim() || !genereFamiglia) return;
    try {
      let fotoUrl = genereFotoUrl || "";
      let fotoThumbnailUrl = genereFotoThumbnailUrl || "";
      const storage = getStorage();

      // Se l'utente ha rimosso una foto esistente
      if (genereEdit?.fotoUrl && !genereFotoUrl && !genereFotoFile) {
        const fotoRef = ref(storage, genereEdit.fotoUrl);
        await deleteObject(fotoRef).catch((err) =>
          console.warn("Foto originale non trovata", err)
        );
        if (genereEdit.fotoThumbnailUrl) {
          const thumbRef = ref(storage, genereEdit.fotoThumbnailUrl);
          await deleteObject(thumbRef).catch((err) =>
            console.warn("Miniatura non trovata", err)
          );
        }
        fotoUrl = "";
        fotoThumbnailUrl = "";
      }

      // Se l'utente ha caricato una nuova foto
      if (genereFotoFile) {
        // Se c'era una vecchia foto, eliminala prima di caricare la nuova
        if (genereEdit?.fotoUrl) {
          const fotoRef = ref(storage, genereEdit.fotoUrl);
          await deleteObject(fotoRef).catch((err) =>
            console.warn("Vecchia foto non trovata", err)
          );
        }
        if (genereEdit?.fotoThumbnailUrl) {
          const thumbRef = ref(storage, genereEdit.fotoThumbnailUrl);
          await deleteObject(thumbRef).catch((err) =>
            console.warn("Vecchia miniatura non trovata", err)
          );
        }

        const timestamp = Date.now();
        const baseFileName = `${timestamp}_${genereFotoFile.name}`;

        // Upload originale
        const storageRef = ref(storage, `categorie/generi/${baseFileName}`);
        await uploadBytes(storageRef, genereFotoFile);
        fotoUrl = await getDownloadURL(storageRef);

        // Crea e upload miniatura
        const thumbOptions = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(
          genereFotoFile,
          thumbOptions
        );
        const thumbRef = ref(storage, `categorie/generi/thumb_${baseFileName}`);
        await uploadBytes(thumbRef, compressedFile);
        fotoThumbnailUrl = await getDownloadURL(thumbRef);
      }

      const data = {
        nome: genereNome.trim(),
        descrizione: genereDescrizione.trim(),
        famigliaId: genereFamiglia,
        fotoUrl: fotoUrl,
        fotoThumbnailUrl: fotoThumbnailUrl,
      };

      if (genereEdit) {
        // Modifica
        await updateDoc(doc(db, "generi", genereEdit.id), data);
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
    id: string;
    nome: string;
    descrizione: string;
    famigliaId: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  }) => {
    setGenereEdit(genere);
    setGenereNome(genere.nome);
    setGenereDescrizione(genere.descrizione);
    setGenereFamiglia(genere.famigliaId || "");
    setGenereFotoUrl(genere.fotoUrl || null);
    setGenereFotoThumbnailUrl(genere.fotoThumbnailUrl || null);
    setShowGenereModal(true);
  };

  // Rimuovi foto genere
  const handleRimuoviFotoGenere = () => {
    setGenereFotoFile(null);
    setGenereFotoUrl(null);
    setGenereFotoThumbnailUrl(null);
  };

  // Elimina famiglia
  const handleRimuoviFamiglia = async (id: string) => {
    try {
      const docRef = doc(db, "famiglie", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const docToDelete = docSnap.data();
      const fotoUrl = docToDelete.fotoUrl;
      const fotoThumbnailUrl = docToDelete.data().fotoThumbnailUrl;

      // Se esiste una foto, eliminala prima da Storage
      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);
        await deleteObject(fotoRef).catch((err) =>
          console.warn("Foto non trovata", err)
        );
      }
      if (fotoThumbnailUrl) {
        const storage = getStorage();
        const thumbRef = ref(storage, fotoThumbnailUrl);
        await deleteObject(thumbRef).catch((err) =>
          console.warn("Miniatura non trovata", err)
        );
      }

      // Ora elimina il documento da Firestore
      await deleteDoc(doc(db, "famiglie", docToDelete.id));
      await fetchData();
    } catch (err) {
      alert("Errore durante l'eliminazione della famiglia: " + err);
    }
  };

  // Elimina genere
  const handleRimuoviGenere = async (id: string) => {
    try {
      const docRef = doc(db, "generi", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const docToDelete = docSnap.data();
      const fotoUrl = docToDelete.data().fotoUrl;
      const fotoThumbnailUrl = docToDelete.data().fotoThumbnailUrl;

      // Se esiste una foto, eliminala prima da Storage
      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);
        await deleteObject(fotoRef).catch((err) =>
          console.warn("Foto non trovata", err)
        );
      }
      if (fotoThumbnailUrl) {
        const storage = getStorage();
        const thumbRef = ref(storage, fotoThumbnailUrl);
        await deleteObject(thumbRef).catch((err) =>
          console.warn("Miniatura non trovata", err)
        );
      }

      // Ora elimina il documento da Firestore
      await deleteDoc(docRef);
      await fetchData();
    } catch (err) {
      alert("Errore durante l'eliminazione del genere: " + err);
    }
  };

  // Eliminazione multipla
  const handleBulkDelete = async () => {
    const promises: Promise<void>[] = [];
    selectedFamiglie.forEach((id) => promises.push(handleRimuoviFamiglia(id)));
    selectedGeneri.forEach((id) => promises.push(handleRimuoviGenere(id)));

    try {
      await Promise.all(promises);
      setNotification({
        message: "Elementi selezionati eliminati con successo.",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        message: "Errore durante l'eliminazione multipla.",
        severity: "error",
      });
      console.error("Errore bulk delete:", error);
    } finally {
      setSelectedFamiglie([]);
      setSelectedGeneri([]);
      fetchData();
    }
  };

  // Modal di conferma eliminazione genere/famiglia
  const askDelete = (type: "famiglia" | "genere", id: string, name: string) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteName(name);
    setConfirmOpen(true);
  };

  const askBulkDelete = () => {
    setDeleteType("bulk");
    if (numSelected === 1) {
      setDeleteName("l'elemento");
    } else {
      setDeleteName(`${numSelected} elementi`);
    }

    setConfirmOpen(true);
  };

  // Gestisce l'eliminazione di generi/famiglie
  const handleConfirmDelete = async () => {
    if (deleteType === "famiglia" && deleteId) {
      await handleRimuoviFamiglia(deleteId);
    }
    if (deleteType === "genere" && deleteId) {
      await handleRimuoviGenere(deleteId);
    }
    if (deleteType === "bulk") {
      await handleBulkDelete();
    }
    setConfirmOpen(false);
    setDeleteType(null);
    setDeleteId(null);
    setDeleteName(null);
  };

  // Gestione selezioni per eliminazione multipla
  const handleSelectAllFamiglie = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      const allFamigliaIds = famiglie.map((f) => f.id);
      setSelectedFamiglie(allFamigliaIds);
    } else {
      setSelectedFamiglie([]);
    }
  };

  const handleSelectFamiglia = (id: string) => {
    setSelectedFamiglie((prev) =>
      prev.includes(id) ? prev.filter((famId) => famId !== id) : [...prev, id]
    );
  };

  const handleSelectGenere = (id: string) => {
    setSelectedGeneri((prev) =>
      prev.includes(id) ? prev.filter((genId) => genId !== id) : [...prev, id]
    );
  };

  const famigliaIdToNameMap = new Map(famiglie.map((f) => [f.id, f.nome]));
  console.log(famigliaIdToNameMap);

  return (
    <Box
      sx={{
        mt: "130px",
        mb: "50px",
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
        p: { xs: 2, md: 4 },
        flexGrow: 1,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Gestione categorie
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 4, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => setShowFamigliaModal(true)}
          aria-label="Aggiungi famiglia"
        >
          Aggiungi Famiglia
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowGenereModal(true)}
          aria-label="Aggiungi genere"
        >
          Aggiungi Genere
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow sx={{ background: "#f5f5f5" }}>
              {numSelected > 0 ? (
                // === VISTA QUANDO CI SONO ELEMENTI SELEZIONATI ===
                <>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedFamiglie.length > 0 &&
                        selectedFamiglie.length < famiglie.length
                      }
                      checked={
                        famiglie.length > 0 &&
                        selectedFamiglie.length === famiglie.length
                      }
                      onChange={handleSelectAllFamiglie}
                    />
                  </TableCell>
                  <TableCell sx={{ width: "5%" }} />
                  <TableCell>
                    <b>
                      {numSelected}{" "}
                      {numSelected === 1
                        ? "elemento selezionato"
                        : "elementi selezionati"}
                    </b>
                  </TableCell>
                  <TableCell />
                  <TableCell align="right">
                    <Tooltip title="Elimina selezionati">
                      <IconButton
                        onClick={askBulkDelete}
                        sx={{ padding: "0 5px" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </>
              ) : (
                // === VISTA PREDEFINITA QUANDO NON C'È SELEZIONE ===
                <>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedFamiglie.length > 0 &&
                        selectedFamiglie.length < famiglie.length
                      }
                      checked={
                        famiglie.length > 0 &&
                        selectedFamiglie.length === famiglie.length
                      }
                      onChange={handleSelectAllFamiglie}
                      inputProps={{
                        "aria-label": "seleziona tutte le famiglie",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: "5%" }} />
                  <TableCell>
                    <b>Nome</b>
                  </TableCell>
                  <TableCell>
                    <b>Descrizione</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Azioni</b>
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {famiglie.map((famiglia) => (
              <Row
                key={famiglia.id}
                famiglia={famiglia}
                generi={generi.filter((g) => g.famigliaId === famiglia.id)}
                open={openFamigliaId === famiglia.id}
                setOpen={() =>
                  setOpenFamigliaId(
                    openFamigliaId === famiglia.id ? null : famiglia.id
                  )
                }
                handleModificaFamiglia={handleModificaFamiglia}
                handleModificaGenere={handleModificaGenere}
                askDelete={askDelete}
                onSelectFamiglia={handleSelectFamiglia}
                isFamigliaSelected={selectedFamiglie.includes(famiglia.id)}
                onSelectGenere={handleSelectGenere}
                selectedGeneri={selectedGeneri}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                      : famigliaFotoThumbnailUrl || famigliaFotoUrl || ""
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
            <Select
              value={genereFamiglia}
              onChange={(e) => setGenereFamiglia(e.target.value)}
              size="small"
              fullWidth
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleziona famiglia</em>
              </MenuItem>
              {famiglie.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.nome}
                </MenuItem>
              ))}
            </Select>
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
                      : genereFotoThumbnailUrl || genereFotoUrl || ""
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetGenereForm}>Annulla</Button>
          <Button
            variant="contained"
            color="primary"
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
            {deleteType === "famiglia"
              ? "la famiglia"
              : deleteType === "genere"
              ? "il genere"
              : ""}{" "}
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
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity}
          sx={{ width: "100%" }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Componente per la singola riga della tabella (Row)
function Row(props: {
  famiglia: {
    id: string;
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  };
  generi: {
    id: string;
    nome: string;
    descrizione: string;
    famigliaId: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  }[];
  open: boolean;
  setOpen: () => void;
  handleModificaFamiglia: (famiglia: {
    id: string;
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  }) => void;
  handleModificaGenere: (genere: {
    id: string;
    nome: string;
    descrizione: string;
    famigliaId: string;
    fotoUrl?: string;
    fotoThumbnailUrl?: string;
  }) => void;
  askDelete: (type: "famiglia" | "genere", id: string, name: string) => void;
  onSelectFamiglia: (id: string) => void;
  isFamigliaSelected: boolean;
  onSelectGenere: (id: string) => void;
  selectedGeneri: string[];
}) {
  const {
    famiglia,
    generi,
    open,
    setOpen,
    handleModificaFamiglia,
    handleModificaGenere,
    askDelete,
    onSelectFamiglia,
    isFamigliaSelected,
    onSelectGenere,
    selectedGeneri,
  } = props;

  return (
    <>
      {/* Riga principale della famiglia */}
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isFamigliaSelected}
            onChange={() => onSelectFamiglia(famiglia.id)}
          />
        </TableCell>
        <TableCell sx={{ width: 60 }}>
          <IconButton aria-label="expand row" onClick={setOpen} sx={{ p: 0 }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ width: "20%" }}>
          {famiglia.nome}
        </TableCell>

        <TableCell
          sx={{
            maxWidth: 300,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {famiglia.descrizione}
        </TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={() => handleModificaFamiglia(famiglia)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => askDelete("famiglia", famiglia.id, famiglia.nome)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Riga collassabile con la sotto-tabella dei generi */}
      <TableRow>
        <TableCell style={{ padding: 0, borderBottom: "unset" }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ padding: 0, borderBottom: "unset" }}>
              <Table aria-label="purchases">
                <TableBody>
                  {generi.length > 0 ? (
                    generi.map((genere) => (
                      <TableRow
                        key={genere.id}
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={selectedGeneri.includes(genere.id)}
                            onChange={() => onSelectGenere(genere.id)}
                          />
                        </TableCell>
                        <TableCell sx={{ width: "5%" }} />
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ width: "20%" }}
                        >
                          - {genere.nome}
                        </TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {genere.descrizione}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleModificaGenere(genere)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              askDelete("genere", genere.id, genere.nome)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nessun genere in questa famiglia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default AggiungiCategoria;
