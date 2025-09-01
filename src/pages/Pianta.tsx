// React
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { db } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

// Type
import type { DataSingle } from "../types/general";

// Utils
import { FALLBACK_IMAGE_URL } from "../utils/constants";
import { getResizedImageUrls } from "../utils/imageUtils";

interface FamigliaInfo {
  id: string;
  nome: string;
}
interface GenereInfo {
  id: string;
  nome: string;
}

type ProcessedImage = {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
};

const Pianta = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pianta, setPianta] = useState<DataSingle | null>(null);
  const [famiglia, setFamiglia] = useState<FamigliaInfo | null>(null);
  const [genere, setGenere] = useState<GenereInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPiantaData = async () => {
      setLoading(true);
      try {
        // 1. Recupera il documento principale della pianta
        const docRef = doc(db, "piante", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error("Pianta non trovata");
        }

        const piantaData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as DataSingle;
        setPianta(piantaData);

        if (piantaData.fotoUrls && Array.isArray(piantaData.fotoUrls)) {
          const processedImages = piantaData.fotoUrls.map((url: string) =>
            getResizedImageUrls(url)
          );
          setImages(processedImages);
        }

        // 2. Se la pianta esiste, recupera i dati di famiglia e genere in parallelo
        if (piantaData.famigliaId && piantaData.genereId) {
          const famigliaRef = doc(db, "famiglie", piantaData.famigliaId);
          const genereRef = doc(db, "generi", piantaData.genereId);

          const [famigliaSnap, genereSnap] = await Promise.all([
            getDoc(famigliaRef),
            getDoc(genereRef),
          ]);

          if (famigliaSnap.exists()) {
            setFamiglia({
              id: famigliaSnap.id,
              nome: famigliaSnap.data().nome,
            });
          }
          if (genereSnap.exists()) {
            setGenere({ id: genereSnap.id, nome: genereSnap.data().nome });
          }
        }
      } catch (error) {
        console.error("Errore nel recupero dei dati della pianta:", error);
        setPianta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPiantaData();
  }, [id]);

  const handleOpenModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <Box sx={{ width: "900px", mx: "auto", mt: "178px", px: 2 }}>
        <Skeleton variant="rounded" width={400} height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" width={650} height={58} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width={800} height={37} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={300} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={900} height={110} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" width={900} height={400} sx={{ mb: 4 }} />
        <Skeleton
          variant="rounded"
          width={568}
          height={350}
          sx={{ mx: "auto", mb: "100px" }}
        />
      </Box>
    );
  }

  if (!pianta) {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Pianta non trovata!
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate("/")}
        >
          Torna alla Home
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "130px",
        mb: "50px",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 24, md: 40 },
          left: { xs: 24, md: 60 },
          zIndex: 1201,
        }}
      >
        <Tooltip title="Torna indietro">
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate(-1)}
            sx={{
              minWidth: 0,
              width: 56,
              height: 56,
              borderRadius: "50%",
              boxShadow: 4,
              p: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, box-shadow 0.2s",
              "&:hover": {
                background: "#00b86b",
                boxShadow: 8,
              },
            }}
            aria-label="Torna indietro"
          >
            <ArrowBackIcon sx={{ fontSize: 32 }} />
          </Button>
        </Tooltip>
      </Box>

      {/* Titolo */}
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 6, px: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            sx={{ cursor: "pointer" }}
            underline="hover"
            color="inherit"
            onClick={() => navigate("/")}
          >
            Home
          </Link>
          {famiglia && (
            <Link
              sx={{ cursor: "pointer" }}
              underline="hover"
              color="inherit"
              onClick={() => navigate(`/catalogo/famiglia/${famiglia.id}`)}
            >
              {famiglia.nome}
            </Link>
          )}
          {genere && (
            <Link
              sx={{ cursor: "pointer" }}
              underline="hover"
              color="inherit"
              onClick={() => navigate(`/catalogo/genere/${genere.id}`)}
            >
              {genere.nome}
            </Link>
          )}
          <Typography color="text.primary">{pianta.specie}</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 1,
              color: "#1a2a2a",
              letterSpacing: "-1px",
              fontSize: { xs: 32, md: 48 },
              textShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {`${genere?.nome || ""} ${pianta.specie}`}
          </Typography>
          {user && (
            <Tooltip title="Modifica pianta">
              <IconButton
                aria-label="modifica pianta"
                onClick={() => navigate(`/dashboard/nuova/${id}`)}
                sx={{ mb: 1 }}
              >
                <EditIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#00b86b",
            fontSize: { xs: 20, md: 28 },
            letterSpacing: "0.5px",
            textAlign: "center",
          }}
        >
          {`${famiglia?.nome || ""} ${genere?.nome || ""} ${pianta.specie} ${
            pianta.descrittorePianta || ""
          }`}
        </Typography>
        {pianta.sinonimi && (
          <Typography
            sx={{ mb: 2, fontSize: 16, color: "#888", textAlign: "center" }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1, mb: "-3px" }} />
            <b>Sinonimi:</b> {pianta.sinonimi}
          </Typography>
        )}
        <Typography sx={{ textAlign: "center" }}>
          <b>Famiglia:</b> {famiglia?.nome || "-"}
        </Typography>
        <Typography sx={{ textAlign: "center" }}>
          <b>Genere:</b> {genere?.nome || "-"}
        </Typography>
        <Typography sx={{ textAlign: "center" }}>
          <b>Specie:</b> {pianta.specie || "-"}
        </Typography>
        {pianta.sottospecie && (
          <Typography sx={{ textAlign: "center" }}>
            <b>Sottospecie:</b> {pianta.sottospecie}
          </Typography>
        )}
        {pianta.varieta && (
          <Typography sx={{ textAlign: "center" }}>
            <b>Varietà:</b> {pianta.varieta}
          </Typography>
        )}
        {pianta.forma && (
          <Typography sx={{ textAlign: "center" }}>
            <b>Forma:</b> {pianta.forma}
          </Typography>
        )}
        {pianta.cultivar && (
          <Typography sx={{ textAlign: "center" }}>
            <b>Cultivar:</b> {pianta.cultivar}
          </Typography>
        )}
        {pianta.descrizione && (
          <Typography
            sx={{
              my: 3,
              fontSize: 18,
              color: "#333",
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {pianta.descrizione}
          </Typography>
        )}
        <Box
          sx={{
            mb: 4,
            background: "#fff",
            borderRadius: 4,
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {pianta.origine && (
            <Typography>
              <b>Origine:</b> {pianta.origine}
            </Typography>
          )}
          {pianta.habitat && (
            <Typography>
              <b>Habitat:</b> {pianta.habitat}
            </Typography>
          )}
          {pianta.esposizione && (
            <Typography>
              <b>Esposizione:</b> {pianta.esposizione}
            </Typography>
          )}
          {pianta.bagnature && (
            <Typography>
              <b>Bagnature:</b> {pianta.bagnature}
            </Typography>
          )}
          {pianta.temperaturaMinima && (
            <Typography>
              <b>Temperatura Minima:</b> {pianta.temperaturaMinima}
            </Typography>
          )}
        </Box>
      </Box>

      {images.length > 0 && (
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            mt: 6,
            mb: 6,
            p: 2,
            background: "#fff",
            borderRadius: 1,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2, // Spazio tra le immagini
              justifyContent: "center", // Centra le immagini
            }}
          >
            {images.map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  width: { xs: "100%", sm: 300, md: 350 }, // Larghezza reattiva
                  height: { xs: 250, sm: 300, md: 350 }, // Altezza reattiva
                  overflow: "hidden",
                  borderRadius: 1,
                  boxShadow: 1,
                  background: "#e0e0e0",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleOpenModal(img.large)}
              >
                <img
                  src={img.medium}
                  alt={`${pianta.specie || "Specie sconosciuta"} - foto ${
                    idx + 1
                  }`}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE_URL)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ position: "relative", outline: "none" }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              color: "white",
              background: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                background: "rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={selectedImage || ""}
            alt="Vista ingrandita"
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default Pianta;
