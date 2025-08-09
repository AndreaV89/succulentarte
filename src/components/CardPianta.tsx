// MUI
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

// Utils
import { FALLBACK_IMAGE_URL } from "../utils/constants";
import { getResizedImageUrls } from "../utils/imageUtils";

const styles = {
  card: {
    width: 320,
    flexShrink: 0,
    borderRadius: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
    },
  },
  cardMedia: {
    objectFit: "cover",
  },
  cardContent: {
    textAlign: "center",
    backgroundColor: "#fff",
    minHeight: 100,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  specieText: {
    fontWeight: 600,
    lineHeight: 1.2,
  },
  skeletonImage: {
    borderRadius: "16px 16px 0 0",
  },
  skeletonContent: {
    pt: 2,
    pb: 2,
    px: 2,
    backgroundColor: "#fff",
    borderRadius: "0 0 16px 16px",
  },
  skeletonText: {
    mx: "auto",
  },
};

interface PiantaData {
  id: string;
  specie: string;
  fotoUrls?: string[];
  fotoCopertinaIndex?: number;
}

interface CardPiantaProps {
  pianta: PiantaData;
  onClick: (id: string) => void;
}

const CardPianta = ({ pianta, onClick }: CardPiantaProps) => {
  let copertinaUrl: string | undefined;
  if (pianta.fotoUrls && pianta.fotoUrls.length > 0) {
    const coverIndex = pianta.fotoCopertinaIndex ?? 0;
    copertinaUrl = pianta.fotoUrls[coverIndex] || pianta.fotoUrls[0];
  }

  const imageUrls = getResizedImageUrls(copertinaUrl);

  return (
    <Card sx={styles.card}>
      <CardActionArea
        onClick={() => onClick(pianta.id)}
        aria-label={`Scheda ${pianta.specie}`}
      >
        <CardMedia
          component="img"
          height="320"
          image={imageUrls.medium || FALLBACK_IMAGE_URL}
          alt={pianta.specie}
          sx={styles.cardMedia}
        />
        <CardContent sx={styles.cardContent}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={styles.specieText}
          >
            {pianta.specie}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const CardPiantaSkeleton = () => {
  return (
    <Box sx={styles.card}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={320}
        sx={styles.skeletonImage}
      />
      <Box sx={styles.skeletonContent}>
        <Skeleton variant="text" width="80%" sx={styles.skeletonText} />
        <Skeleton variant="text" width="50%" sx={styles.skeletonText} />
      </Box>
    </Box>
  );
};

export default CardPianta;
