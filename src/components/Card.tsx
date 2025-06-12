import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface CardProps {
  id: number;
  name: string;
}

const MediaCard = (props: CardProps) => {
  return (
    <Card sx={{ width: 345 }}>
      <CardMedia
        sx={{ height: 268 }}
        image="https://www.succulentarte.com/wp-content/uploads/2024/11/Conophytum-meyerae-4.11.24-1132x1200.jpg"
        title={props.name}
      />
      <CardContent>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          sx={{ textAlign: "center" }}
        >
          <Button href={props.name} size="small">
            {props.name}
          </Button>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
