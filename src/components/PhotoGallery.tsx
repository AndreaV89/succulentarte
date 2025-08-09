// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

import { getResizedImageUrls } from "../utils/imageUtils";

interface PhotoGalleryProps {
  id: string | undefined;
  fotoUrls: string[];
  fotoCopertinaIndex: number;
  uploadingPhotosCount: number;
  handleFotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAskRemovePhoto: (idx: number) => void;
  handleSetCopertina: (idx: number) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  id,
  fotoUrls,
  fotoCopertinaIndex,
  uploadingPhotosCount,
  handleFotoChange,
  handleAskRemovePhoto,
  handleSetCopertina,
}) => {
  return (
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
          mt: fotoUrls.length > 0 || uploadingPhotosCount > 0 ? 2 : 0,
        }}
      >
        {/* 1. Renderizza le foto già caricate */}
        {fotoUrls.map((url, idx) => {
          const isCover = fotoCopertinaIndex === idx;
          const imageUrls = getResizedImageUrls(url);
          return (
            <Box
              key={url}
              sx={{ position: "relative", display: "inline-block" }}
            >
              <img
                src={imageUrls.thumbnail}
                alt={`Foto pianta ${idx + 1}`}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 8,
                  objectFit: "cover",
                  border: isCover ? "3px solid #FFC107" : "2px solid #eee",
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
              <IconButton
                onClick={() => handleSetCopertina(idx)}
                size="small"
                aria-label={`Imposta come copertina ${idx + 1}`}
                sx={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: "rgba(255,255,255,0.7)",
                  "&:hover": { background: "rgba(255,255,255,1)" },
                }}
              >
                {isCover ? <StarIcon color="primary" /> : <StarBorderIcon />}
              </IconButton>
            </Box>
          );
        })}

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
  );
};

export default PhotoGallery;
