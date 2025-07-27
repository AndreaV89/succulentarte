// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Inserisci email e password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Email o password errati.");
      } else {
        setError("Errore sconosciuto");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "calc(100vh - 180px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 370,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
          Accedi alla Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Inserisci le tue credenziali per continuare
        </Typography>
        <Box
          component="form"
          onSubmit={handleLogin}
          noValidate
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci email"
            label="Email"
            fullWidth
            required
            autoFocus
            inputProps={{ "aria-label": "Email" }}
          />
          <TextField
            margin="normal"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci password"
            label="Password"
            fullWidth
            required
            inputProps={{ "aria-label": "Password" }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2, fontWeight: 600 }}
            disabled={loading}
            aria-label="Accedi"
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
