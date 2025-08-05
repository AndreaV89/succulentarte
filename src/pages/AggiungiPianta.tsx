// React
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Firebase
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteObject } from "firebase/storage";

// MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Skeleton from "@mui/material/Skeleton";

import imageCompression from "browser-image-compression";

const storage = getStorage();

const AggiungiPianta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specie, setSpecie] = useState<string>("");
  const [famigliaId, setFamigliaId] = useState<string>("");
  const [genereId, setGenereId] = useState<string>("");
  const [sinonimi, setSinonimi] = useState<string>("");
  const [sottospecie, setSottospecie] = useState<string>("");
  const [varieta, setVarieta] = useState<string>("");
  const [forma, setForma] = useState<string>("");
  const [cultivar, setCultivar] = useState<string>("");
  const [descrittorePianta, setDescrittorePianta] = useState<string>("");
  const [descrizione, setDescrizione] = useState<string>("");
  const [origine, setOrigine] = useState<string>("");
  const [habitat, setHabitat] = useState<string>("");
  const [esposizione, setEsposizione] = useState<string>("");
  const [bagnature, setBagnature] = useState<string>("");
  const [temperaturaMinima, setTemperaturaMinima] = useState<string>("");
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [fotoThumbnailUrls, setFotoThumbnailUrls] = useState<string[]>([]);
  const [fotoGalleryUrls, setFotoGalleryUrls] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [photoIndexToDelete, setPhotoIndexToDelete] = useState<number | null>(
    null
  );
  const [uploadingPhotosCount, setUploadingPhotosCount] = useState(0);
  const [allFamiglie, setAllFamiglie] = useState<
    { id: string; nome: string }[]
  >([]);
  const [allGeneri, setAllGeneri] = useState<
    { id: string; nome: string; famigliaId: string }[]
  >([]);
  const [filteredGeneri, setFilteredGeneri] = useState<
    { id: string; nome: string }[]
  >([]);

  useEffect(() => {
    const fetchCategorie = async () => {
      const famSnap = await getDocs(collection(db, "famiglie"));
      setAllFamiglie(
        famSnap.docs.map((doc) => ({ id: doc.id, nome: doc.data().nome }))
      );
      const genSnap = await getDocs(collection(db, "generi"));
      setAllGeneri(
        genSnap.docs.map(
          (doc) =>
            ({ id: doc.id, ...doc.data() } as {
              id: string;
              nome: string;
              famigliaId: string;
            })
        )
      );
    };

    fetchCategorie();
  }, []);

  useEffect(() => {
    if (famigliaId) {
      setFilteredGeneri(allGeneri.filter((g) => g.famigliaId === famigliaId));
    } else {
      setFilteredGeneri([]);
    }
  }, [famigliaId, allGeneri]);

  useEffect(() => {
    if (id) {
      // Carica i dati della pianta da Firestore
      const fetchPianta = async () => {
        const docRef = doc(db, "piante", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSpecie(data.specie || "");
          setFamigliaId(data.famigliaId || "");
          setGenereId(data.genereId || "");
          setSinonimi(data.sinonimi || "");
          setSottospecie(data.sottospecie || "");
          setVarieta(data.varieta || "");
          setForma(data.forma || "");
          setCultivar(data.cultivar || "");
          setDescrittorePianta(data.descrittorePianta || "");
          setDescrizione(data.descrizione || "");
          setOrigine(data.origine || "");
          setHabitat(data.habitat || "");
          setEsposizione(data.esposizione || "");
          setBagnature(data.bagnature || "");
          setTemperaturaMinima(data.temperaturaMinima || "");
          setFotoUrls(data.fotoUrls || []);
          setFotoThumbnailUrls(data.fotoThumbnailUrls || []);
          setFotoGalleryUrls(data.fotoGalleryUrls || []);
        }
      };
      fetchPianta();
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
          const baseFileName = `${timestamp}_${randomSuffix}_${file.name}`;

          // 1. Upload immagine originale
          const storageRef = ref(
            storage,
            `piante/${piantaDocId}/${baseFileName}`
          );
          await uploadBytes(storageRef, file);
          const originalUrl = await getDownloadURL(storageRef);

          // 2. Crea e upload miniatura per catalogo (piccola)
          const thumbOptions = {
            maxSizeMB: 0.1, // 100KB
            maxWidthOrHeight: 400,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, thumbOptions);
          const thumbRef = ref(
            storage,
            `piante/${piantaDocId}/thumb_${baseFileName}`
          );
          await uploadBytes(thumbRef, compressedFile);
          const thumbnailUrl = await getDownloadURL(thumbRef);

          // 3. Crea e upload miniatura per galleria (media)
          const galleryOptions = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          };
          const compressedGalleryFile = await imageCompression(
            file,
            galleryOptions
          );
          const galleryRef = ref(
            storage,
            `piante/${piantaDocId}/gallery_${baseFileName}`
          );
          await uploadBytes(galleryRef, compressedGalleryFile);
          const galleryUrl = await getDownloadURL(galleryRef);

          return { originalUrl, thumbnailUrl, galleryUrl };
        });

        const uploadedSets = await Promise.all(uploadPromises);

        const updatedOriginalUrls = [
          ...fotoUrls,
          ...uploadedSets.map((p) => p.originalUrl),
        ];
        const updatedThumbnailUrls = [
          ...fotoThumbnailUrls,
          ...uploadedSets.map((p) => p.thumbnailUrl),
        ];
        const updatedGalleryUrls = [
          ...fotoGalleryUrls,
          ...uploadedSets.map((p) => p.galleryUrl),
        ];

        // Aggiorna lo stato locale
        setFotoUrls(updatedOriginalUrls);
        setFotoThumbnailUrls(updatedThumbnailUrls);
        setFotoGalleryUrls(updatedGalleryUrls);

        // Aggiorna subito Firestore aggiungendo le nuove foto all'array
        const docRef = doc(db, "piante", piantaDocId);
        await updateDoc(docRef, {
          fotoUrls: updatedOriginalUrls,
          fotoThumbnailUrls: updatedThumbnailUrls,
          fotoGalleryUrls: updatedGalleryUrls,
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
    const urlToRemove = fotoUrls[idx];
    const thumbUrlToRemove = fotoThumbnailUrls?.[idx];
    const galleryUrlToRemove = fotoGalleryUrls?.[idx];
    const piantaDocId = id;

    // 1. Rimuovi la foto da Firebase Storage
    try {
      // Rimuovi originale
      const originalPath = urlToRemove
        .replace(/^https:\/\/[^/]+\/o\//, "")
        .replace(/\?.*$/, "")
        .replace(/%2F/g, "/");
      const originalStorageRef = ref(storage, originalPath);
      await deleteObject(originalStorageRef);

      // Rimuovi miniatura catalogo (se esiste)
      if (thumbUrlToRemove) {
        const thumbPath = thumbUrlToRemove
          .replace(/^https:\/\/[^/]+\/o\//, "")
          .replace(/\?.*$/, "")
          .replace(/%2F/g, "/");
        const thumbStorageRef = ref(storage, thumbPath);
        await deleteObject(thumbStorageRef);
      }
      // Rimuovi miniatura galleria (se esiste)
      if (galleryUrlToRemove) {
        const galleryRef = ref(storage, galleryUrlToRemove);
        await deleteObject(galleryRef);
      }
    } catch (err: unknown) {
      console.log(err);
      setError(
        err && typeof err === "object" && "message" in err
          ? `Errore durante l'eliminazione della foto da Storage: ${
              (err as { message?: string }).message
            }`
          : "Errore durante l'eliminazione della foto da Storage."
      );
      setTimeout(() => setError(null), 3000);
      return;
    }

    // 2. Aggiorna lo stato locale
    const nuoveFoto = fotoUrls.filter((_, i) => i !== idx);
    const nuoveThumb = fotoThumbnailUrls.filter((_, i) => i !== idx);
    const nuoveGallery = fotoGalleryUrls.filter((_, i) => i !== idx);

    setFotoUrls(nuoveFoto);
    setFotoThumbnailUrls(nuoveThumb);
    setFotoGalleryUrls(nuoveGallery);

    // 3. Aggiorna Firestore rimuovendo l'URL dall'array
    if (piantaDocId) {
      const docRef = doc(db, "piante", piantaDocId);
      try {
        await updateDoc(docRef, {
          fotoUrls: nuoveFoto,
          fotoThumbnailUrls: nuoveThumb,
          fotoGalleryUrls: nuoveGallery,
        });
      } catch (err: unknown) {
        setError(
          err && typeof err === "object" && "message" in err
            ? `Errore durante l'aggiornamento delle foto in Firestore: ${
                (err as { message?: string }).message
              }`
            : "Errore durante l'aggiornamento delle foto in Firestore."
        );
        setTimeout(() => setError(null), 3000);
        return;
      }
    }
    setSuccess("Foto eliminata con successo!");
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      // Dati base della pianta (senza foto)
      const piantaData = {
        specie: specie,
        famigliaId: famigliaId,
        genereId: genereId,
        sinonimi: sinonimi,
        sottospecie: sottospecie,
        varieta: varieta,
        forma: forma,
        cultivar: cultivar,
        descrittorePianta: descrittorePianta,
        descrizione: descrizione,
        origine: origine,
        habitat: habitat,
        esposizione: esposizione,
        bagnature: bagnature,
        temperaturaMinima: temperaturaMinima,
        updatedAt: serverTimestamp(),
      };

      if (id) {
        // --- MODALITÀ MODIFICA ---
        // Aggiorna il documento esistente con tutti i dati, incluse le foto
        const docRef = doc(db, "piante", id);
        await updateDoc(docRef, {
          ...piantaData,
          fotoUrls: fotoUrls,
          fotoThumbnailUrls: fotoThumbnailUrls,
          fotoGalleryUrls: fotoGalleryUrls,
        });
        setSuccess("Salvataggio avvenuto con successo!");
        setTimeout(() => setSuccess(null), 2000);
      } else {
        // --- MODALITÀ CREAZIONE ---
        // Crea un nuovo documento solo con i dati testuali
        const docRef = await addDoc(collection(db, "piante"), piantaData);
        setSuccess("Pianta creata! Ora puoi aggiungere le foto.");
        // Reindirizza alla pagina di modifica della pianta appena creata
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
        sx={{ flexGrow: 1, maxWidth: "1200px" }}
      >
        <TextField
          label="Specie"
          value={specie}
          onChange={(e) => setSpecie(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
          autoFocus
        />

        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="famiglia-label">Famiglia</InputLabel>
          <Select
            labelId="famiglia-label"
            value={famigliaId}
            label="Famiglia"
            onChange={(e) => setFamigliaId(e.target.value)}
            sx={{ textAlign: "left" }}
          >
            <MenuItem disabled value="">
              <em>Seleziona famiglia</em>
            </MenuItem>
            {allFamiglie.map((f) => (
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
            value={genereId}
            label="Genere"
            onChange={(e) => setGenereId(e.target.value)}
            disabled={!famigliaId}
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

        <TextField
          label="Sinonimi"
          value={sinonimi}
          onChange={(e) => setSinonimi(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Sottospecie"
          value={sottospecie}
          onChange={(e) => setSottospecie(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Varietà"
          value={varieta}
          onChange={(e) => setVarieta(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Forma"
          value={forma}
          onChange={(e) => setForma(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Cultivar"
          value={cultivar}
          onChange={(e) => setCultivar(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrittore Pianta"
          value={descrittorePianta}
          onChange={(e) => setDescrittorePianta(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrizione"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          fullWidth
          multiline
          rows={8}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Origine"
          value={origine}
          onChange={(e) => setOrigine(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Habitat"
          value={habitat}
          onChange={(e) => setHabitat(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Esposizione"
          value={esposizione}
          onChange={(e) => setEsposizione(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bagnature"
          value={bagnature}
          onChange={(e) => setBagnature(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Temperatura Minima"
          value={temperaturaMinima}
          onChange={(e) => setTemperaturaMinima(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box
          sx={{
            background: "#fff",
            borderRadius: 1,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            p: { xs: 2, md: 3 },
            mb: 3,
            mt: 2,
            width: "100%",
            textAlign: "left",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2, textAlign: "left" }}
          >
            Galleria
          </Typography>
          {!id && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Salva la pianta per poter aggiungere le foto.
            </Alert>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-start",
              mt:
                fotoThumbnailUrls.length > 0 || uploadingPhotosCount > 0
                  ? 2
                  : 0,
            }}
          >
            {/* 1. Renderizza le foto già caricate */}
            {fotoThumbnailUrls.map((url, idx) => (
              <Box
                key={idx}
                sx={{ position: "relative", display: "inline-block" }}
              >
                <img
                  src={url}
                  alt={`Foto pianta ${idx + 1}`}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "2px solid #eee",
                  }}
                />
                <IconButton
                  size="small"
                  aria-label={`Rimuovi foto ${idx + 1}`}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(255,255,255,0.7)",
                    "&:hover": { background: "rgba(255,255,255,1)" },
                  }}
                  onClick={() => handleAskRemovePhoto(idx)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            {/* 2. Renderizza gli Skeleton per le foto in caricamento */}
            {uploadingPhotosCount > 0 &&
              Array.from(new Array(uploadingPhotosCount)).map((_, index) => (
                <Skeleton
                  key={`skeleton-${index}`}
                  variant="rectangular"
                  width={200}
                  height={200}
                  sx={{ borderRadius: "8px" }}
                />
              ))}
          </Box>
          <Button
            variant="contained"
            startIcon={<PhotoCameraIcon />}
            component="label"
            sx={{
              background: "#FFC107",
              color: "#222",
              "&:hover": { background: "#ffb300" },
              mt: 3,
              alignSelf: "flex-start",
            }}
            disabled={!id}
          >
            Carica foto
            <input
              type="file"
              accept="image/*"
              hidden
              multiple
              onChange={handleFotoChange}
            />
          </Button>
        </Box>
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
            disabled={saving || !specie || !famigliaId || !genereId}
          >
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </Box>
      </Box>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Conferma eliminazione foto"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Sei sicuro di voler eliminare questa foto? L'azione è irreversibile
            e la foto verrà rimossa definitivamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Annulla
          </Button>
          <Button
            onClick={() => {
              if (photoIndexToDelete !== null) {
                handleRemoveFoto(photoIndexToDelete);
              }
              setConfirmOpen(false);
              setPhotoIndexToDelete(null);
            }}
            color="error"
            autoFocus
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AggiungiPianta;
