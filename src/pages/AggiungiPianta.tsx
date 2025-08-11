// React
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";

// Components
import PhotoGallery from "../components/PhotoGallery";

// Firebase
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  serverTimestamp,
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
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type PiantaFormData = {
  specie: string;
  famigliaId: string;
  genereId: string;
  sinonimi: string;
  sottospecie: string;
  varieta: string;
  forma: string;
  cultivar: string;
  descrittorePianta: string;
  descrizione: string;
  origine: string;
  habitat: string;
  esposizione: string;
  bagnature: string;
  temperaturaMinima: string;
  fotoUrls: string[];
  fotoCopertinaIndex: number;
};

const initialState: PiantaFormData = {
  specie: "",
  famigliaId: "",
  genereId: "",
  sinonimi: "",
  sottospecie: "",
  varieta: "",
  forma: "",
  cultivar: "",
  descrittorePianta: "",
  descrizione: "",
  origine: "",
  habitat: "",
  esposizione: "",
  bagnature: "",
  temperaturaMinima: "",
  fotoUrls: [],
  fotoCopertinaIndex: 0,
};

const storage = getStorage();

const textFormFields = [
  { name: "sinonimi", label: "Sinonimi" },
  { name: "sottospecie", label: "Sottospecie" },
  { name: "varieta", label: "Varietà" },
  { name: "forma", label: "Forma" },
  { name: "cultivar", label: "Cultivar" },
  { name: "descrittorePianta", label: "Descrittore Pianta" },
  {
    name: "descrizione",
    label: "Descrizione",
    multiline: true,
    rows: 8,
  },
  { name: "origine", label: "Origine" },
  { name: "habitat", label: "Habitat" },
  { name: "esposizione", label: "Esposizione" },
  { name: "bagnature", label: "Bagnature" },
  { name: "temperaturaMinima", label: "Temperatura Minima" },
];

const AggiungiPianta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { famiglie, generi, loading: dataLoading } = useData();

  const [formData, setFormData] = useState<PiantaFormData>(initialState);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [photoIndexToDelete, setPhotoIndexToDelete] = useState<number | null>(
    null
  );
  const [uploadingPhotosCount, setUploadingPhotosCount] = useState(0);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const handleInputChange = (
    field: keyof PiantaFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (id) {
      const fetchPianta = async () => {
        const docRef = doc(db, "piante", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Sovrascrive l'intero stato con i dati da Firestore
          const firestoreData = docSnap.data();
          setFormData({ ...initialState, ...firestoreData });
        }
      };
      fetchPianta();
    } else {
      setFormData(initialState);
    }
  }, [id]);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      setUploadingPhotosCount(files.length);

      const piantaDocId = id;
      if (!piantaDocId) {
        setError("Devi prima salvare la pianta per poter aggiungere foto.");
        setTimeout(() => setError(null), 2000);
        setUploadingPhotosCount(0);
        return;
      }

      try {
        const uploadPromises = files.map(async (file) => {
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const fileName = `${timestamp}_${randomSuffix}_${file.name}`;
          const storageRef = ref(storage, `piante/${piantaDocId}/${fileName}`);

          // Carica solo l'immagine originale. L'estensione farà il resto.
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });

        const newUrls = await Promise.all(uploadPromises);
        const updatedUrls = [...formData.fotoUrls, ...newUrls];
        handleInputChange("fotoUrls", updatedUrls);

        await updateDoc(doc(db, "piante", piantaDocId), {
          fotoUrls: updatedUrls,
        });
      } catch (err) {
        console.error("Errore durante l'upload delle foto:", err);
        setError(
          "Si è verificato un errore durante il caricamento delle foto."
        );
      } finally {
        setUploadingPhotosCount(0);
      }
    }
  };

  const handleAskRemovePhoto = (idx: number) => {
    setPhotoIndexToDelete(idx);
    setConfirmOpen(true);
  };

  // Gestisce la rimozione delle foto
  const handleRemoveFoto = async (idx: number) => {
    const urlToRemove = formData.fotoUrls[idx];
    const piantaDocId = id;
    if (!piantaDocId) return;

    const nuoveFoto = formData.fotoUrls.filter((_, i) => i !== idx); // MODIFICATO
    let newCoverIndex = formData.fotoCopertinaIndex; // MODIFICATO

    if (idx === formData.fotoCopertinaIndex) {
      newCoverIndex = nuoveFoto.length > 0 ? 0 : -1;
    } else if (idx < formData.fotoCopertinaIndex) {
      newCoverIndex -= 1;
    }

    try {
      await updateDoc(doc(db, "piante", piantaDocId), {
        fotoUrls: nuoveFoto,
        fotoCopertinaIndex: newCoverIndex,
      });
      handleInputChange("fotoUrls", nuoveFoto);
      handleInputChange("fotoCopertinaIndex", newCoverIndex);
      await deleteObject(ref(storage, urlToRemove)).catch((err) => {
        console.warn("Pulizia file da Storage fallita (non bloccante):", err);
      });
    } catch (err) {
      console.error("Errore durante l'aggiornamento di Firestore:", err);
      setError(
        "Errore durante l'aggiornamento del database. La foto non è stata rimossa."
      );
    }
  };

  const handleSetCopertina = async (idx: number) => {
    // Non fare nulla se è già la copertina o se non c'è un ID

    if (formData.fotoCopertinaIndex === idx || !id) {
      return;
    }

    // Aggiorna prima lo stato locale per una UI reattiva
    handleInputChange("fotoCopertinaIndex", idx);

    try {
      // Poi, salva la modifica in background
      const docRef = doc(db, "piante", id);
      await updateDoc(docRef, { fotoCopertinaIndex: idx });
    } catch (err) {
      console.error("Errore durante l'impostazione della copertina:", err);
      // Opzionale: ripristina lo stato precedente in caso di errore
      handleInputChange("fotoCopertinaIndex", formData.fotoCopertinaIndex);
      setError("Impossibile impostare la foto di copertina. Riprova.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      // Dati base della pianta (senza foto)
      const piantaData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (id) {
        const docRef = doc(db, "piante", id);
        await updateDoc(docRef, piantaData);
        setSuccess("Salvataggio avvenuto con successo!");
        setTimeout(() => setSuccess(null), 2000);
      } else {
        const newData: Partial<PiantaFormData> = { ...piantaData };

        const docRef = await addDoc(collection(db, "piante"), {
          ...newData,
          createdAt: serverTimestamp(),
        });
        setSuccess("Pianta creata! Ora puoi aggiungere le foto.");
        setTimeout(() => navigate(`/dashboard/nuova/${docRef.id}`), 1500);
      }
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "message" in err
          ? `Errore durante il salvataggio: ${
              (err as { message?: string }).message
            }`
          : "Errore durante il salvataggio. Riprova."
      );
      setTimeout(() => setError(null), 3000);
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // Filtra i generi in base alla famiglia selezionata
  const filteredGeneri = formData.famigliaId
    ? generi.filter((g) => g.famigliaId === formData.famigliaId)
    : [];

  return (
    <Box
      sx={{
        mt: "130px",
        mb: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Aggiungi una nuova pianta
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ flexGrow: 1, maxWidth: "1100px" }}
      >
        <TextField
          label="Specie"
          value={formData.specie}
          onChange={(e) => handleInputChange("specie", e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
          autoFocus
        />

        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="famiglia-label">Famiglia</InputLabel>
          <Select
            labelId="famiglia-label"
            value={formData.famigliaId}
            label="Famiglia"
            onChange={(e) => {
              handleInputChange("famigliaId", e.target.value);
              handleInputChange("genereId", "");
            }}
            sx={{ textAlign: "left" }}
            disabled={dataLoading}
          >
            <MenuItem disabled value="">
              <em>{dataLoading ? "Caricamento..." : "Seleziona famiglia"}</em>
            </MenuItem>
            {famiglie.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="genere-label">Genere</InputLabel>
          <Select
            labelId="genere-label"
            value={formData.genereId}
            label="Genere"
            onChange={(e) => handleInputChange("genereId", e.target.value)}
            disabled={!formData.famigliaId || dataLoading}
            sx={{ textAlign: "left" }}
          >
            <MenuItem disabled value="">
              <em>Seleziona genere</em>
            </MenuItem>
            {filteredGeneri.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {textFormFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            value={formData[field.name as keyof PiantaFormData]}
            onChange={(e) =>
              handleInputChange(
                field.name as keyof PiantaFormData,
                e.target.value
              )
            }
            fullWidth
            multiline={field.multiline || false}
            rows={field.rows}
            sx={{ mb: 2 }}
          />
        ))}
        <PhotoGallery
          id={id}
          fotoUrls={formData.fotoUrls}
          fotoCopertinaIndex={formData.fotoCopertinaIndex}
          handleFotoChange={handleFotoChange}
          handleAskRemovePhoto={handleAskRemovePhoto}
          handleSetCopertina={handleSetCopertina}
          uploadingPhotosCount={uploadingPhotosCount}
        />
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ width: "30%" }}
            onClick={() => navigate("/dashboard")}
            disabled={saving}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              width: "30%",
            }}
            disabled={
              saving ||
              !formData.specie ||
              !formData.famigliaId ||
              !formData.genereId
            }
          >
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </Box>
      </Box>
      <Dialog
        open={confirmOpen}
        onClose={() => !isDeletingPhoto && setConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Conferma eliminazione foto"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Sei sicuro di voler eliminare questa foto? L'azione è irreversibile.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={isDeletingPhoto}
          >
            Annulla
          </Button>
          <Button
            onClick={async () => {
              if (photoIndexToDelete !== null) {
                setIsDeletingPhoto(true);
                await handleRemoveFoto(photoIndexToDelete);
                setIsDeletingPhoto(false);
              }
              setConfirmOpen(false);
              setPhotoIndexToDelete(null);
            }}
            color="error"
            autoFocus
            disabled={isDeletingPhoto}
          >
            {isDeletingPhoto ? "Eliminazione..." : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AggiungiPianta;
