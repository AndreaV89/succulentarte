import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Slider from "react-slick";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { DataSingle } from "../types/general";

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
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={320}
          sx={{ mb: 3 }}
        />
        <Skeleton width={300} height={50} sx={{ mx: "auto", mb: 2 }} />
        <Skeleton width={400} height={30} sx={{ mx: "auto", mb: 1 }} />
        <Skeleton width={350} height={30} sx={{ mx: "auto", mb: 1 }} />
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
      : ["/placeholder.jpg"];

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
        background: "#f8fafc",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: { xs: 140, md: 170 }, // regola in base all'altezza dell'header
          left: { xs: 40, md: 90 },
          zIndex: 1201,
        }}
      >
        <Button
          variant="contained"
          color="success"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 99,
            boxShadow: 2,
            fontWeight: 600,
            px: 2,
            py: 1,
            minWidth: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              display: { xs: "none", sm: "inline" },
            }}
          ></Box>
        </Button>
      </Box>
      {/* Titolo */}
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 6, px: 2 }}>
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
        {/* Specifiche */}
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
