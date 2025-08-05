// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";

import imageCompression from "browser-image-compression";

const AggiungiCategoria = () => {
  const navigate = useNavigate();
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

  // Stato per il feedback di salvataggio
  const [isSaving, setIsSaving] = useState(false);

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

  // Salva Categoria
  type FamigliaFormData = {
    nome: string;
    descrizione: string;
    fotoUrl?: string | null;
    fotoThumbnailUrl?: string | null;
  };

  type GenereFormData = {
    nome: string;
    descrizione: string;
    famigliaId: string;
    fotoUrl?: string | null;
    fotoThumbnailUrl?: string | null;
  };

  const handleSalvaCategoria = async (
    type: "famiglia" | "genere",
    formData: FamigliaFormData | GenereFormData,
    editData:
      | (FamigliaFormData & { id: string })
      | (GenereFormData & { id: string })
      | null,
    fotoFile: File | null
  ) => {
    setIsSaving(true);
    try {
      const collectionName = type === "famiglia" ? "famiglie" : "generi";
      let { fotoUrl, fotoThumbnailUrl } = formData;
      const storage = getStorage();

      // 1. Gestione foto rimossa dall'utente
      if (editData?.fotoUrl && !fotoUrl && !fotoFile) {
        await deleteObject(ref(storage, editData.fotoUrl)).catch((err) =>
          console.warn("Foto non trovata", err)
        );
        if (editData.fotoThumbnailUrl) {
          await deleteObject(ref(storage, editData.fotoThumbnailUrl)).catch(
            (err) => console.warn("Miniatura non trovata", err)
          );
        }
        fotoUrl = "";
        fotoThumbnailUrl = "";
      }

      // 2. Gestione nuova foto caricata
      if (fotoFile) {
        if (editData?.fotoUrl) {
          await deleteObject(ref(storage, editData.fotoUrl)).catch((err) =>
            console.warn("Vecchia foto non trovata", err)
          );
        }
        if (editData?.fotoThumbnailUrl) {
          await deleteObject(ref(storage, editData.fotoThumbnailUrl)).catch(
            (err) => console.warn("Vecchia miniatura non trovata", err)
          );
        }

        const timestamp = Date.now();
        const baseFileName = `${timestamp}_${fotoFile.name}`;
        const storagePath = `categorie/${collectionName}/${baseFileName}`;
        const thumbPath = `categorie/${collectionName}/thumb_${baseFileName}`;

        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, fotoFile);
        fotoUrl = await getDownloadURL(storageRef);

        const compressedFile = await imageCompression(fotoFile, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        });
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, compressedFile);
        fotoThumbnailUrl = await getDownloadURL(thumbRef);
      }

      const dataToSave = { ...formData, fotoUrl, fotoThumbnailUrl };

      // 3. Salvataggio su Firestore
      if (editData) {
        await updateDoc(doc(db, collectionName, editData.id), dataToSave);
      } else {
        await addDoc(collection(db, collectionName), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      const successMessage = `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } "${formData.nome}" ${
        editData ? "aggiornata" : "aggiunta"
      } con successo.`;
      setNotification({ message: successMessage, severity: "success" });

      await fetchData();
      if (type === "famiglia") {
        resetFamigliaForm();
      } else {
        resetGenereForm();
      }
    } catch (err) {
      console.error(`Errore salvataggio ${type}:`, err);
      setNotification({
        message: "Si è verificato un errore. Riprova.",
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Rimuovi foto famiglia
  const handleRimuoviFotoFamiglia = () => {
    setFamigliaFotoFile(null);
    setFamigliaFotoUrl(null);
    setFamigliaFotoThumbnailUrl(null);
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
    const docRef = doc(db, "famiglie", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const docData = docSnap.data();
    const fotoUrl = docData.fotoUrl;
    const fotoThumbnailUrl = docData.fotoThumbnailUrl;

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
  };

  // Elimina genere
  const handleRimuoviGenere = async (id: string) => {
    const docRef = doc(db, "generi", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const docData = docSnap.data();
    const fotoUrl = docData.fotoUrl;
    const fotoThumbnailUrl = docData.fotoThumbnailUrl;

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
  };

  // Eliminazione multipla
  const handleBulkDelete = async () => {
    const famigliaPromises = selectedFamiglie.map((id) =>
      handleRimuoviFamiglia(id)
    );
    const generePromises = selectedGeneri.map((id) => handleRimuoviGenere(id));

    const results = await Promise.allSettled([
      ...famigliaPromises,
      ...generePromises,
    ]);

    const failedDeletes = results.filter((r) => r.status === "rejected");
    if (failedDeletes.length > 0) {
      console.error("Alcune eliminazioni sono fallite:", failedDeletes);
      throw new Error("Errore durante l'eliminazione multipla.");
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
    const itemNameToDelete = deleteName;
    try {
      if (deleteType === "famiglia" && deleteId) {
        await handleRimuoviFamiglia(deleteId);
      }
      if (deleteType === "genere" && deleteId) {
        await handleRimuoviGenere(deleteId);
      }
      if (deleteType === "bulk") {
        await handleBulkDelete();
      }

      setNotification({
        message: `"${itemNameToDelete}" eliminato/i con successo.`,
        severity: "success",
      });
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      setNotification({
        message: `Errore durante l'eliminazione di "${itemNameToDelete}".`,
        severity: "error",
      });
    } finally {
      setConfirmOpen(false);
      setDeleteType(null);
      setDeleteId(null);
      setDeleteName(null);
      fetchData();
    }
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
          Gestione categorie
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
            onClick={() => setShowFamigliaModal(true)}
          >
            Aggiungi Famiglia
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
            onClick={() => setShowGenereModal(true)}
          >
            Aggiungi Genere
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard")}
          >
            Indietro
          </Button>
        </Box>
      </Paper>

      {notification && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification(null)}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}

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
            onClick={() =>
              handleSalvaCategoria(
                "famiglia",
                {
                  nome: famigliaNome.trim(),
                  descrizione: famigliaDescrizione.trim(),
                  fotoUrl: famigliaFotoUrl,
                  fotoThumbnailUrl: famigliaFotoThumbnailUrl,
                },
                famigliaEdit,
                famigliaFotoFile
              )
            }
            disabled={!famigliaNome.trim() || isSaving}
          >
            {isSaving ? "Salvataggio..." : "Salva"}
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
            onClick={() =>
              handleSalvaCategoria(
                "genere",
                {
                  nome: genereNome.trim(),
                  descrizione: genereDescrizione.trim(),
                  famigliaId: genereFamiglia,
                  fotoUrl: genereFotoUrl,
                  fotoThumbnailUrl: genereFotoThumbnailUrl,
                },
                genereEdit,
                genereFotoFile
              )
            }
            disabled={!genereNome.trim() || !genereFamiglia || isSaving}
          >
            {isSaving ? "Salvataggio..." : "Salva"}
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
      <TableRow
        sx={{
          borderBottom: "1px solid #f5f5f5",
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isFamigliaSelected}
            onChange={() => onSelectFamiglia(famiglia.id)}
          />
        </TableCell>
        <TableCell sx={{ width: 60 }}>
          {generi.length > 0 && (
            <IconButton aria-label="expand row" onClick={setOpen} sx={{ p: 0 }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
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
          <Tooltip title="Modifica famiglia">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleModificaFamiglia(famiglia)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Elimina famiglia">
            <IconButton
              size="small"
              color="error"
              onClick={() => askDelete("famiglia", famiglia.id, famiglia.nome)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
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
                          <Tooltip title="Modifica genere">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleModificaGenere(genere)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Elimina genere">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                askDelete("genere", genere.id, genere.nome)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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
