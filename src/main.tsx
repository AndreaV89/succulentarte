// React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@emotion/react";
import { AuthProvider } from "./context/AuthProvider.tsx";

// Components
import App from "./App.tsx";
import theme from "./theme.ts";
import AppGlobalStyles from "./styles/GlobalStyles.tsx";

// Firebase
import "../firebaseConfig.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AppGlobalStyles />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
