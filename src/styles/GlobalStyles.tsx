import GlobalStyles from "@mui/material/GlobalStyles";
import CssBaseline from "@mui/material/CssBaseline";

const AppGlobalStyles = () => (
  <>
    <CssBaseline />
    <GlobalStyles
      styles={{
        body: {
          fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
          lineHeight: 1.5,
          fontWeight: 400,
          color: "black",
          backgroundColor: "#f7f4f2",
        },
        "#root": {
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
        },
        // Stili per lo slider Slick
        ".slick-prev:before, .slick-next:before": {
          color: "#388e3c !important",
          fontSize: "36px !important",
          opacity: "1 !important",
        },
        ".slick-prev, .slick-next": {
          zIndex: 2,
          top: "50% !important",
          transform: "translateY(-50%)",
          width: "unset !important",
        },
        ".slick-prev": {
          left: "-60px !important",
        },
        ".slick-next": {
          right: "-60px !important",
        },
        ".slick-slider": {
          position: "relative",
        },
        ".slick-dots": {
          bottom: "-50px !important",
        },
      }}
    />
  </>
);

export default AppGlobalStyles;
