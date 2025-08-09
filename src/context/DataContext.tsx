import { createContext, useContext } from "react";

// 1. Definisci i tipi per i tuoi dati
export interface Famiglia {
  id: string;
  nome: string;
  descrizione: string;
  fotoUrl?: string;
}

export interface Genere {
  id: string;
  nome: string;
  famigliaId: string;
  descrizione: string;
  fotoUrl?: string;
}

export interface Pianta {
  id: string;
  famigliaId: string;
  genereId: string;
}

// 2. Definisci il tipo per il valore del contesto
export interface DataContextType {
  famiglie: Famiglia[];
  generi: Genere[];
  piante: Pianta[];
  famiglieMap: Map<string, string>;
  generiMap: Map<string, string>;
  loading: boolean;
  refetch: () => void;
  error: string | null;
}

// 3. Crea ed esporta il contesto
export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData deve essere usato all'interno di un DataProvider");
  }
  return context;
};
