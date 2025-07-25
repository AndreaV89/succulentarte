// MUI
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

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
      borderRadius: 2,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      overflow: "hidden",
      p: 0,
      background: "#fafbfc",
      border: "2px solid #FFC107",
      transition: "transform 0.15s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
      },
    }}
    aria-label={`Scheda ${specie}`}
    tabIndex={0}
  >
    <CardActionArea onClick={onClick} sx={{ p: 0, height: "100%" }}>
      <CardMedia
        component="img"
        image={
          fotoUrl ||
          "https://us.123rf.com/450wm/pixora/pixora2503/pixora250322977/242679423-stylish-navelwort-houseplant-art.jpg?ver=6"
        }
        alt={specie}
        sx={{
          width: "100%",
          height: 350,
          objectFit: "cover",

          background: "#e0e0e0",
        }}
      />
      <CardContent sx={{ py: 2 }}>
        <Typography
          variant="h6"
          component="div"
          align="center"
          sx={{ fontWeight: 700, color: "#222" }}
        >
          {specie}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default CardPianta;
