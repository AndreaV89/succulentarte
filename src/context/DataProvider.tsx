import { useState, useEffect, type ReactNode, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { DataContext } from "../context/DataContext";
import type { Famiglia, Genere, Pianta } from "../context/DataContext";

// 4. Creiamo il componente "Provider" che fornirà i dati
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [famiglie, setFamiglie] = useState<Famiglia[]>([]);
  const [generi, setGeneri] = useState<Genere[]>([]);
  const [piante, setPiante] = useState<Pianta[]>([]);
  const [famiglieMap, setFamiglieMap] = useState<Map<string, string>>(
    new Map()
  );
  const [generiMap, setGeneriMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Carichiamo famiglie e generi in parallelo per massima efficienza
      const [famiglieSnap, generiSnap, pianteSnap] = await Promise.all([
        getDocs(collection(db, "famiglie")),
        getDocs(collection(db, "generi")),
        getDocs(collection(db, "piante")),
      ]);

      // Processiamo le famiglie
      const famiglieData = famiglieSnap.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        descrizione: doc.data().descrizione || "",
        fotoUrl: doc.data().fotoThumbnailUrl || doc.data().fotoUrl,
      }));
      const newFamiglieMap = new Map(famiglieData.map((f) => [f.id, f.nome]));

      // Processiamo i generi
      const generiData = generiSnap.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        famigliaId: doc.data().famigliaId,
        descrizione: doc.data().descrizione || "",
        fotoUrl: doc.data().fotoThumbnailUrl || doc.data().fotoUrl,
      }));
      const newGeneriMap = new Map(generiData.map((g) => [g.id, g.nome]));

      // Processiamo le piante
      const pianteData = pianteSnap.docs.map((doc) => ({
        id: doc.id,
        famigliaId: doc.data().famigliaId,
        genereId: doc.data().genereId,
      })) as Pianta[];

      // Aggiorniamo tutti gli stati
      setFamiglie(famiglieData);
      setGeneri(generiData);
      setPiante(pianteData);
      setFamiglieMap(newFamiglieMap);
      setGeneriMap(newGeneriMap);
    } catch (err) {
      console.error("Errore nel caricamento dei dati globali:", err);
      setError("Impossibile caricare i dati. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    famiglie,
    generi,
    piante,
    famiglieMap,
    generiMap,
    loading,
    error,
    refetch: fetchData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
