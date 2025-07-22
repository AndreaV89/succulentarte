import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Components
import Header from "./components/Header";
import Home from "./pages/Home";
import Indice from "./pages/Indice";
import Contatti from "./pages/Contatti";
import Footer from "./components/Footer";
import type { DataSingle } from "./types/general";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AggiungiPianta from "./pages/AggiungiPianta";
import Pianta from "./pages/Pianta";
import AggiungiCategoria from "./pages/AggiungiCategoria";

function App() {
  const [data, setData] = useState<DataSingle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "piante"));
        const piante = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(piante as DataSingle[]);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Header />
        <Routes>
          <Route
            path="/"
            element={<Home data={data} isLoading={isLoading} />}
          />
          <Route path="/indice" element={<Indice />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pianta/:id" element={<Pianta />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/nuova"
            element={
              <ProtectedRoute>
                <AggiungiPianta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/nuova/:id?"
            element={
              <ProtectedRoute>
                <AggiungiPianta />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/categorie"
            element={
              <ProtectedRoute>
                <AggiungiCategoria />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
