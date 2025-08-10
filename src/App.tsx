// React
import { Route, Routes } from "react-router-dom";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Indice from "./pages/Indice";
import Contatti from "./pages/Contatti";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AggiungiPianta from "./pages/AggiungiPianta";
import Pianta from "./pages/Pianta";
import AggiungiCategoria from "./pages/AggiungiCategoria";
import FamigliaCatalogo from "./pages/FamigliaCatalogo";
import GenereCatalogo from "./pages/GenereCatalogo";
import SitoInSviluppo from "./pages/SitoInSviluppo";

function App() {
  const inSviluppo = false;

  return (
    <>
      <Header />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
        {inSviluppo ? (
          <Route path="*" element={<SitoInSviluppo />} />
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/indice" element={<Indice />} />
            <Route path="/contatti" element={<Contatti />} />
            <Route path="/pianta/:id" element={<Pianta />} />
            <Route
              path="/catalogo/famiglia/:famigliaId"
              element={<FamigliaCatalogo />}
            />
            <Route
              path="/catalogo/genere/:genereId"
              element={<GenereCatalogo />}
            />

            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
      {!inSviluppo && <Footer />}
    </>
  );
}

export default App;
