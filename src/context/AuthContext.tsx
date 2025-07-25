// React
import { createContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
