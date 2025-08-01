import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#018732", // Verde principale
      contrastText: "#fff",
    },
    secondary: {
      main: "#D87A4A", // Verde chiaro per accenti
      contrastText: "#fff",
    },
    background: {
      default: "#f7f9f7", // Sfondo chiaro
      paper: "#fff",
    },
    text: {
      primary: "#222",
      secondary: "#018732",
    },
  },
  typography: {
    fontFamily: [
      '"Poppins"',
      '"Roboto"',
      '"Helvetica"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      letterSpacing: "0.1em",
    },
    h2: {
      fontWeight: 600,
      letterSpacing: "0.05em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.05em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          paddingLeft: 24,
          paddingRight: 24,
        },
        containedPrimary: {
          boxShadow: "0 2px 8px rgba(1, 135, 50, 0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;