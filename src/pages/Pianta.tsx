// React
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Firebase
import { doc, getDoc } from "firebase/firestore";
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

// Type
import type { DataSingle } from "../types/general";

// Fallback image
import { FALLBACK_IMAGE_URL } from "../utils/constants";

const Pianta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pianta, setPianta] = useState<DataSingle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPianta = async () => {
      if (!id) return;
      setLoading(true);
      const docRef = doc(db, "piante", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPianta({
          id: docSnap.id,
          ...(docSnap.data() as Omit<DataSingle, "id">),
        });
      }
      setLoading(false);
    };
    fetchPianta();
  }, [id]);

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

  const fotoList =
    pianta.fotoUrls && pianta.fotoUrls.length > 0
      ? pianta.fotoUrls
      : [FALLBACK_IMAGE_URL];

  const sliderSettings = {
    dots: fotoList.length > 1,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

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
            aria-label="Vai alla Home"
          >
            Home
          </Link>
          <Link
            sx={{ cursor: "pointer" }}
            underline="hover"
            color="inherit"
            onClick={() => navigate(`/catalogo/famiglia/${pianta.famiglia}`)}
            aria-label={`Vai alla famiglia ${pianta.famiglia}`}
          >
            {pianta.famiglia}
          </Link>
          <Link
            sx={{ cursor: "pointer" }}
            underline="hover"
            color="inherit"
            onClick={() => navigate(`/catalogo/genere/${pianta.genere}`)}
            aria-label={`Vai al genere ${pianta.genere}`}
          >
            {pianta.genere}
          </Link>
          <Typography color="text.primary">{pianta.specie}</Typography>
        </Breadcrumbs>

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
          {pianta.genere + " " + pianta.specie}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#00b86b",
            fontSize: { xs: 20, md: 28 },
            letterSpacing: "0.5px",
          }}
        >
          {pianta.famiglia +
            " " +
            pianta.genere +
            " " +
            pianta.specie +
            " " +
            pianta.descrittorePianta}
        </Typography>
        {pianta.sinonimi && (
          <Typography sx={{ mb: 2, fontSize: 16, color: "#888" }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1, mb: "-3px" }} />
            <b>Sinonimi:</b> {pianta.sinonimi}
          </Typography>
        )}
        {pianta.descrizione && (
          <Typography sx={{ mb: 3, fontSize: 18, color: "#333" }}>
            {pianta.descrizione}
          </Typography>
        )}
        <Box
          sx={{
            mb: 4,
            background: "#fff",
            borderRadius: 4,
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Typography>
            <b>Famiglia:</b> {pianta.famiglia || "-"}
          </Typography>
          <Typography>
            <b>Genere:</b> {pianta.genere || "-"}
          </Typography>
          <Typography>
            <b>Specie:</b> {pianta.specie || "-"}
          </Typography>
          {pianta.sottospecie && (
            <Typography>
              <b>Sottospecie:</b> {pianta.sottospecie}
            </Typography>
          )}
          {pianta.varieta && (
            <Typography>
              <b>Varietà:</b> {pianta.varieta}
            </Typography>
          )}
          {pianta.forma && (
            <Typography>
              <b>Forma:</b> {pianta.forma}
            </Typography>
          )}
          {pianta.cultivar && (
            <Typography>
              <b>Cultivar:</b> {pianta.cultivar}
            </Typography>
          )}
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

      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 6,
          mb: 6,
          p: 2,
          background: "#fff",
          borderRadius: 4,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <Slider {...sliderSettings}>
          {fotoList.map((foto, idx) => (
            <Box
              key={idx}
              sx={{
                width: "100%",
                height: { xs: 220, md: 340 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: 4,
                boxShadow: 1,
                background: "#e0e0e0",
              }}
            >
              <img
                src={foto}
                alt={pianta.specie || "Specie sconosciuta"}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE_URL)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  borderRadius: 8,
                  transition: "all 0.3s",
                }}
              />
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
};

export default Pianta;
