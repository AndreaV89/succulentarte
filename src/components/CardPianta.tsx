// MUI
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

// Fallback image
import { FALLBACK_IMAGE_URL } from "../utils/constants";

interface CardPiantaProps {
  id: string;
  specie: string;
  fotoUrl?: string;
  onClick: () => void;
}

const CardPianta = ({ specie, fotoUrl, onClick }: CardPiantaProps) => (
  <Card
    sx={{
      width: 320,
      borderRadius: 4,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
      },
    }}
  >
    <CardActionArea onClick={onClick} aria-label={`Scheda ${specie}`}>
      <CardMedia
        component="img"
        height="320" // Altezza fissa per l'immagine
        image={fotoUrl || FALLBACK_IMAGE_URL}
        alt={specie}
        sx={{ objectFit: "cover" }}
      />
      <CardContent
        sx={{
          textAlign: "center",
          backgroundColor: "#fff", // Sfondo bianco per il contenuto
        }}
      >
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: 600 }}
        >
          {specie}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default CardPianta;
