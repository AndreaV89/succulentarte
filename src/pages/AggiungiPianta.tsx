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

const storage = getStorage();

const AggiungiPianta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specie, setSpecie] = useState<string>("");
  const [famiglia, setFamiglia] = useState<string>("");
  const [genere, setGenere] = useState<string>("");
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
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [famiglie, setFamiglie] = useState<string[]>([]);
  const [tuttiIGeneri, setTuttiIGeneri] = useState<
    { nome: string; famiglia: string }[]
  >([]);
  const [generi, setGeneri] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategorie = async () => {
      const famSnap = await getDocs(collection(db, "famiglie"));
      setFamiglie(famSnap.docs.map((doc) => doc.data().nome));
      const genSnap = await getDocs(collection(db, "generi"));
      const generiArr = genSnap.docs.map((doc) => ({
        nome: doc.data().nome,
        famiglia: doc.data().famiglia,
      }));
      setTuttiIGeneri(generiArr);
    };
    fetchCategorie();
  }, []);

  useEffect(() => {
    if (famiglia) {
      setGeneri(
        tuttiIGeneri.filter((g) => g.famiglia === famiglia).map((g) => g.nome)
      );
    } else {
      setGeneri([]);
    }
  }, [famiglia, tuttiIGeneri]);

  useEffect(() => {
    if (id) {
      // Carica i dati della pianta da Firestore
      const fetchPianta = async () => {
        const docRef = doc(db, "piante", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSpecie(data.specie || "");
          setFamiglia(data.famiglia || "");
          setGenere(data.genere || "");
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
        }
      };
      fetchPianta();
    }
  }, [id]);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Carica subito ogni file su Firebase Storage
      const piantaDocId = id;
      if (!piantaDocId) {
        setError("Devi prima salvare la pianta per poter aggiungere foto.");
        setTimeout(() => setError(null), 2000);
        return;
      }

      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(
          storage,
          `piante/${piantaDocId}/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Aggiorna lo stato locale
      setFotoUrls((prev) => [...prev, ...uploadedUrls]);

      // Aggiorna subito Firestore aggiungendo le nuove foto all'array
      const docRef = doc(db, "piante", piantaDocId);
      await updateDoc(docRef, {
        fotoUrls: [...fotoUrls, ...uploadedUrls],
      });
    }
  };

  const handleRemoveFoto = async (idx: number) => {
    const urlToRemove = fotoUrls[idx];
    const piantaDocId = id;

    // 1. Rimuovi la foto da Firebase Storage
    try {
      // Ricava il path dal downloadURL
      const path = urlToRemove
        .replace(/^https:\/\/[^/]+\/o\//, "")
        .replace(/\?.*$/, "")
        .replace(/%2F/g, "/");
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
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
    setFotoUrls((prev) => prev.filter((_, i) => i !== idx));

    // 3. Aggiorna Firestore rimuovendo l'URL dall'array
    if (piantaDocId) {
      const docRef = doc(db, "piante", piantaDocId);
      const nuoveFoto = fotoUrls.filter((_, i) => i !== idx);
      try {
        await updateDoc(docRef, { fotoUrls: nuoveFoto });
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
    let piantaDocId = id;

    try {
      if (!piantaDocId) {
        const docRef = await addDoc(collection(db, "piante"), {});
        piantaDocId = docRef.id;
      }
      const piantaData = {
        specie: specie,
        famiglia: famiglia,
        genere: genere,
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
        fotoUrls: fotoUrls,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, "piante", piantaDocId), piantaData);
      setSuccess("Salvataggio avvenuto con successo!");
      setTimeout(() => setSuccess(null), 2000);
      setTimeout(() => navigate(`/dashboard/nuova/${piantaDocId}`), 1200);
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
            value={famiglia}
            label="Famiglia"
            onChange={(e) => setFamiglia(e.target.value)}
            sx={{ textAlign: "left" }}
          >
            <MenuItem disabled value="">
              <em>Seleziona famiglia</em>
            </MenuItem>
            {famiglie.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="genere-label">Genere</InputLabel>
          <Select
            labelId="genere-label"
            value={genere}
            label="Genere"
            onChange={(e) => setGenere(e.target.value)}
            sx={{ textAlign: "left" }}
          >
            <MenuItem disabled value="">
              <em>Seleziona genere</em>
            </MenuItem>
            {generi.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
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
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrizione"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          fullWidth
          required
          multiline
          rows={8}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Origine"
          value={origine}
          onChange={(e) => setOrigine(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Habitat"
          value={habitat}
          onChange={(e) => setHabitat(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Esposizione"
          value={esposizione}
          onChange={(e) => setEsposizione(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bagnature"
          value={bagnature}
          onChange={(e) => setBagnature(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Temperatura Minima"
          value={temperaturaMinima}
          onChange={(e) => setTemperaturaMinima(e.target.value)}
          fullWidth
          required
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
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
            {fotoUrls.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {fotoUrls.map((url, idx) => (
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
                      onClick={() => handleRemoveFoto(idx)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
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
            disabled={saving || !specie || !famiglia || !genere}
          >
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AggiungiPianta;
