// React
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

// Components
import { CategoryRow } from "../components/CategoryRow";

// Firebase
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
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
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";

import imageCompression from "browser-image-compression";

type CategoriaFormData = {
  id?: string;
  nome: string;
  descrizione: string;
  fotoUrl?: string | null;
  fotoThumbnailUrl?: string | null;
  famigliaId?: string;
};

type ModalState = {
  open: boolean;
  type: "famiglia" | "genere";
  editData: CategoriaFormData | null;
};

const AggiungiCategoria = () => {
  const navigate = useNavigate();
  const { famiglie, generi, piante, loading, refetch } = useData();

  // Form
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    type: "famiglia",
    editData: null,
  });
  const [formData, setFormData] = useState<CategoriaFormData>({
    nome: "",
    descrizione: "",
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // UI
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{
    type: "famiglia" | "genere" | "bulk";
    id?: string;
    name: string;
  } | null>(null);
  const [openFamigliaId, setOpenFamigliaId] = useState<string | null>(null);
  const [selectedFamiglie, setSelectedFamiglie] = useState<string[]>([]);
  const [selectedGeneri, setSelectedGeneri] = useState<string[]>([]);

  // Calcolo conteggi famiglia
  const piantePerFamiglia = useMemo(() => {
    const counts: { [key: string]: number } = {};
    piante.forEach((p) => {
      if (p.famigliaId) {
        counts[p.famigliaId] = (counts[p.famigliaId] || 0) + 1;
      }
    });
    return counts;
  }, [piante]);

  // Calcolo conteggi genere
  const piantePerGenere = useMemo(() => {
    const counts: { [key: string]: number } = {};
    piante.forEach((p) => {
      if (p.genereId) {
        counts[p.genereId] = (counts[p.genereId] || 0) + 1;
      }
    });
    return counts;
  }, [piante]);

  const numSelected = selectedFamiglie.length + selectedGeneri.length;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Scompare dopo 5 secondi
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleOpenModal = (
    type: "famiglia" | "genere",
    editData: CategoriaFormData | null = null
  ) => {
    setModalState({ open: true, type, editData });
    if (editData) {
      setFormData(editData);
    } else {
      const defaultData: CategoriaFormData = { nome: "", descrizione: "" };
      if (type === "genere") {
        defaultData.famigliaId = "";
      }
      setFormData(defaultData);
    }
  };

  const handleCloseModal = () => {
    setModalState({ open: false, type: "famiglia", editData: null });
    setFormData({ nome: "", descrizione: "" });
    setFotoFile(null);
  };

  const handleInputChange = (field: keyof CategoriaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
      setFormData((prev) => ({
        ...prev,
        fotoUrl: null,
        fotoThumbnailUrl: null,
      }));
    }
  };

  const handleRimuoviFoto = () => {
    setFotoFile(null);
    setFormData((prev) => ({ ...prev, fotoUrl: null, fotoThumbnailUrl: null }));
  };

  const handleSalva = async () => {
    setIsSaving(true);
    try {
      const { type, editData } = modalState;
      const collectionName = type === "famiglia" ? "famiglie" : "generi";

      const capitalizedName =
        formData.nome.trim().charAt(0).toUpperCase() +
        formData.nome.trim().slice(1);

      const dataToSave: CategoriaFormData = {
        ...formData,
        nome: capitalizedName,
        descrizione: formData.descrizione.trim(),
      };

      const storage = getStorage();
      if (fotoFile) {
        if (editData?.fotoUrl) {
          await deleteObject(ref(storage, editData.fotoUrl)).catch(
            console.warn
          );
        }
        if (editData?.fotoThumbnailUrl) {
          await deleteObject(ref(storage, editData.fotoThumbnailUrl)).catch(
            console.warn
          );
        }

        const timestamp = Date.now();
        const baseFileName = `${timestamp}_${fotoFile.name}`;
        const storagePath = `categorie/${collectionName}/${baseFileName}`;
        const thumbPath = `categorie/${collectionName}/thumb_${baseFileName}`;

        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, fotoFile);
        dataToSave.fotoUrl = await getDownloadURL(storageRef);

        const compressedFile = await imageCompression(fotoFile, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 400,
        });
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, compressedFile);
        dataToSave.fotoThumbnailUrl = await getDownloadURL(thumbRef);
      } else if (editData && !formData.fotoUrl) {
        if (editData.fotoUrl) {
          await deleteObject(ref(storage, editData.fotoUrl)).catch(
            console.warn
          );
        }
        if (editData.fotoThumbnailUrl) {
          await deleteObject(ref(storage, editData.fotoThumbnailUrl)).catch(
            console.warn
          );
        }
        dataToSave.fotoUrl = "";
        dataToSave.fotoThumbnailUrl = "";
      }

      if (editData?.id) {
        await updateDoc(doc(db, collectionName, editData.id), {
          ...dataToSave,
        });
      } else {
        await addDoc(collection(db, collectionName), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      setNotification({
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} "${
          dataToSave.nome
        }" ${editData ? "aggiornata" : "aggiunta"} con successo.`,
        severity: "success",
      });

      await refetch();
      handleCloseModal();
    } catch (err) {
      console.error(`Errore salvataggio ${modalState.type}:`, err);
      setNotification({
        message: "Si è verificato un errore. Riprova.",
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const askDelete = (type: "famiglia" | "genere", id: string, name: string) => {
    setDeleteInfo({ type, id, name });
    setConfirmOpen(true);
  };

  const askBulkDelete = () => {
    const name =
      numSelected === 1
        ? "l'elemento selezionato"
        : `${numSelected} elementi selezionati`;
    setDeleteInfo({ type: "bulk", name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteInfo) return;
    setIsDeleting(true);
    const { type, id, name } = deleteInfo;

    try {
      if (type === "bulk") {
        const famigliaPromises = selectedFamiglie.map((id) =>
          deleteSingleCategory("famiglie", id)
        );
        const generePromises = selectedGeneri.map((id) =>
          deleteSingleCategory("generi", id)
        );
        await Promise.all([...famigliaPromises, ...generePromises]);
      } else if (id) {
        const collectionName = type === "famiglia" ? "famiglie" : "generi";
        await deleteSingleCategory(collectionName, id);
      }

      setNotification({
        message: `"${name}" eliminato/i con successo.`,
        severity: "success",
      });
      setSelectedFamiglie([]);
      setSelectedGeneri([]);
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      setNotification({
        message: `Errore durante l'eliminazione di "${name}".`,
        severity: "error",
      });
    } finally {
      setConfirmOpen(false);
      setDeleteInfo(null);
      await refetch();
      setIsDeleting(false);
    }
  };

  const deleteSingleCategory = async (
    collectionName: "famiglie" | "generi",
    id: string
  ) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.fotoUrl)
        await deleteObject(ref(getStorage(), data.fotoUrl)).catch(console.warn);
      if (data.fotoThumbnailUrl)
        await deleteObject(ref(getStorage(), data.fotoThumbnailUrl)).catch(
          console.warn
        );
    }
    await deleteDoc(docRef);
  };

  const handleSelectAllFamiglie = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setSelectedFamiglie(famiglie.map((f) => f.id));
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

  const rowActions = {
    onOpenModal: handleOpenModal,
    onAskDelete: askDelete,
    onSelectFamiglia: handleSelectFamiglia,
    onSelectGenere: handleSelectGenere,
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 200px)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: "130px",
        mb: "50px",
        width: "100%",
        maxWidth: "1100px",
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
            onClick={() => handleOpenModal("famiglia")}
          >
            Aggiungi Famiglia
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
            onClick={() => handleOpenModal("genere")}
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
      <Box sx={{ mt: 2, width: "100%" }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "left" }}>
          Le tue categorie:
        </Typography>
        {loading ? (
          <Typography>Caricamento...</Typography>
        ) : famiglie.length === 0 && generi.length === 0 ? (
          <Typography>Nessuna categoria trovata.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow sx={{ background: "#f5f5f5" }}>
                  {numSelected > 0 ? (
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

                      <TableCell align="center">
                        <b>Azioni</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>N. Piante</b>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {famiglie.map((famiglia) => (
                  <CategoryRow
                    key={famiglia.id}
                    famiglia={{
                      ...famiglia,
                      descrizione: famiglia.descrizione ?? "",
                    }}
                    generi={generi
                      .filter((g) => g.famigliaId === famiglia.id)
                      .map((g) => ({ ...g, descrizione: g.descrizione ?? "" }))}
                    pianteInFamigliaCount={piantePerFamiglia[famiglia.id] || 0}
                    pianteInGenereCounts={piantePerGenere}
                    open={openFamigliaId === famiglia.id}
                    setOpen={() =>
                      setOpenFamigliaId(
                        openFamigliaId === famiglia.id ? null : famiglia.id
                      )
                    }
                    isFamigliaSelected={selectedFamiglie.includes(famiglia.id)}
                    selectedGeneri={selectedGeneri}
                    actions={rowActions}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog
        maxWidth="sm"
        fullWidth
        open={modalState.open}
        onClose={handleCloseModal}
      >
        <DialogTitle>
          {modalState.editData ? "Modifica" : "Aggiungi"} {modalState.type}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label={`Nome ${modalState.type}`}
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              autoFocus
            />
            <TextField
              label="Descrizione"
              value={formData.descrizione}
              onChange={(e) => handleInputChange("descrizione", e.target.value)}
              multiline
              minRows={4}
            />
            {modalState.type === "genere" && (
              <Select
                value={formData.famigliaId || ""}
                onChange={(e) =>
                  handleInputChange("famigliaId", e.target.value)
                }
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
            )}
            <Button variant="outlined" component="label">
              Carica Foto
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFotoChange}
              />
            </Button>
            {(formData.fotoUrl || fotoFile) && (
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
                    fotoFile
                      ? URL.createObjectURL(fotoFile)
                      : formData.fotoThumbnailUrl || formData.fotoUrl || ""
                  }
                  sx={{ width: 100, height: 100, objectFit: "cover" }}
                />
                <Button size="small" color="error" onClick={handleRimuoviFoto}>
                  Rimuovi Foto
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Annulla</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSalva}
            disabled={
              !formData.nome.trim() ||
              (modalState.type === "genere" && !formData.famigliaId) ||
              isSaving
            }
          >
            {isSaving ? "Salvataggio..." : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare <b>{deleteInfo?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
            Annulla
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminazione..." : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AggiungiCategoria;
