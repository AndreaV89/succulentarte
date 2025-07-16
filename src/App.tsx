import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";
import axios from "axios";

// Components
import Header from "./components/Header";
import Home from "./pages/Home";
import Indice from "./pages/Indice";
import Contatti from "./pages/Contatti";
import Footer from "./components/Footer";
import type { DataSingle } from "./types/general";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function App() {
  const [data, setData] = useState<DataSingle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const url = "https://www.succulentarte.com/wp-json/wp/v2/pianta?per_page=100";

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    console.log(isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log("App.tsx");
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home data={data} isLoading={isLoading} />} />
        <Route path="/indice" element={<Indice />} />
        <Route path="/contatti" element={<Contatti />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
