import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";
import axios from "axios";

// Components
import Header from "./components/Header";
import Home from "./pages/Home";
import Indice from "./pages/Indice";
import Contatti from "./pages/Contatti";
import "./App.css";
import Footer from "./components/Footer";
import type {DataSingle} from "./types/general";




function App() {
const [data, setData] = useState<DataSingle[]>([]);
const url = "https://www.succulentarte.com/wp-json/wp/v2/pianta?per_page=100";

const getData = async () => {
  try {
    const response = await axios.get(url);
    console.log("Dati ricevuti:", response.data);
    setData(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

useEffect(() => {
  getData();
}, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home data={data}/>} />
        <Route path="/indice" element={<Indice />} />
        <Route path="/contatti" element={<Contatti />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
