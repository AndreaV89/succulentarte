// React
import { useState, useEffect, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";

// Firestore
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// MUI
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";

type PlantResult = {
  id: string;
  specie: string;
  genere: string;
  famiglia: string;
  label: string;
};

const pages = [
  { label: "Catalogo", to: "/" },
  { label: "Indice", to: "/indice" },
  { label: "Contatti", to: "/contatti" },
];

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.common.white, 0.95),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 1),
    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  },
  marginLeft: 0,
  width: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  border: "1.5px solid #e0e0e0",
  [theme.breakpoints.up("sm")]: {
    width: 320,
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#00b86b",
}));

const Header = (): JSX.Element => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<PlantResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  // Ricerca
  useEffect(() => {
    if (searchValue.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);

    const fetch = setTimeout(async () => {
      const col = collection(db, "piante");
      const searchLower = searchValue.toLowerCase();

      const q1 = query(
        col,
        where("specie", ">=", searchValue),
        where("specie", "<=", searchValue + "\uf8ff")
      );

      const q2 = query(
        col,
        where("genere", ">=", searchValue),
        where("genere", "<=", searchValue + "\uf8ff")
      );

      const q3 = query(
        col,
        where("famiglia", ">=", searchValue),
        where("famiglia", "<=", searchValue + "\uf8ff")
      );

      const [snap1, snap2, snap3] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
        getDocs(q3),
      ]);

      const allDocs = [...snap1.docs, ...snap2.docs, ...snap3.docs];

      const unique = Array.from(
        new Map(allDocs.map((doc) => [doc.id, doc])).values()
      );

      // 1. Se abbiamo trovato delle piante, recuperiamo le tabelle di conversione (generi e famiglie)
      let generiMap = new Map();
      let famiglieMap = new Map();

      if (unique.length > 0) {
        const [allGeneriSnap, allFamiglieSnap] = await Promise.all([
          getDocs(collection(db, "generi")),
          getDocs(collection(db, "famiglie")),
        ]);
        // 2. Creiamo delle "mappe" per una ricerca super-veloce (ID -> Nome)
        generiMap = new Map(
          allGeneriSnap.docs.map((doc) => [doc.id, doc.data().nome])
        );
        famiglieMap = new Map(
          allFamiglieSnap.docs.map((doc) => [doc.id, doc.data().nome])
        );
      }

      // 3. Mappiamo i risultati finali, usando le mappe per tradurre gli ID in nomi
      const arr = unique
        .map((doc) => {
          const piantaData = doc.data();
          return {
            id: doc.id,
            specie: piantaData.specie,
            genere: generiMap.get(piantaData.genereId) || "", // Traduzione
            famiglia: famiglieMap.get(piantaData.famigliaId) || "", // Traduzione
            label: piantaData.specie || "",
          };
        })
        .filter(
          (p) =>
            (p.specie && p.specie.toLowerCase().includes(searchLower)) ||
            (p.genere && p.genere.toLowerCase().includes(searchLower)) ||
            (p.famiglia && p.famiglia.toLowerCase().includes(searchLower))
        );
      console.log(arr[0]);

      setResults(arr.slice(0, 8));
      setSearching(false);
    }, 300);

    return () => clearTimeout(fetch);
  }, [searchValue]);

  // Gestisce il click su un risultato
  const handleResultClick = (id: string) => {
    navigate(`/pianta/${id}`);
    setTimeout(() => {
      setSearchValue("");
      setResults([]);
    }, 100);
  };

  // Gestisce lo scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gestisce l'apertura del menu su mobile
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  // Gestisce la chiusura del menu su mobile
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: scrolled ? 0 : "30px",
        width: scrolled ? "100%" : "90%",
        left: "50%",
        transform: "translate(-50%, 0)",
        borderRadius: scrolled ? 0 : "10px",
        background: "linear-gradient(90deg, #018732 0%, #00b86b 100%)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
        transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
        zIndex: 1300,
      }}
    >
      <Container maxWidth={false}>
        <Toolbar
          disableGutters
          sx={{ position: "relative", minHeight: "70px" }}
        >
          {/* Menu mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  component={Link}
                  key={page.label}
                  to={page.to}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 1,
                    color: "black",
                    display: "block",
                    "&:hover": { color: "#FFC107" },
                  }}
                >
                  {page.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Menu desktop */}
          <Box
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 3 }}
          >
            {pages.map((page) => (
              <Button
                component={Link}
                to={page.to}
                key={page.label}
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  "&:hover": { color: "secondary.main" },
                }}
                aria-label={page.label}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* Titolo Centrale */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "white",
              textDecoration: "none",
              zIndex: 10,
              display: { xs: "none", lg: "flex" },
              pointerEvents: "auto",
            }}
          >
            SucculentArte
          </Typography>
          {/* Search Input */}
          <Search sx={{ width: 280, minWidth: 200, maxWidth: 350, ml: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <Autocomplete
              clearOnBlur
              freeSolo
              options={results}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label || ""
              }
              loading={searching}
              inputValue={searchValue}
              onInputChange={(_, value) => setSearchValue(value)}
              onChange={(_, value) => {
                if (value && typeof value !== "string" && value.id)
                  handleResultClick(value.id);
              }}
              open={
                searchValue.length >= 2 && (results.length > 0 || searching)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Cerca…"
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    sx: {
                      pl: 5,
                      py: 0.5,
                      borderRadius: 3,
                      backgroundColor: "transparent",
                      fontSize: 17,
                      fontWeight: 500,
                      color: "#1a2a2a",
                    },
                    "aria-label": "search",
                    autoComplete: "off",
                    onBlur: (e) => {
                      setTimeout(() => {
                        setSearchValue("");
                        setResults([]);
                      }, 100);
                      if (params.inputProps.onBlur)
                        params.inputProps.onBlur(
                          e as React.FocusEvent<HTMLInputElement, Element>
                        );
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-input": {
                      pl: 0,
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="subtitle2">{option.specie}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.genere} – {option.famiglia}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText={
                searching ? <CircularProgress size={20} /> : "Nessun risultato"
              }
            />
          </Search>
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{
              backgroundColor: "white",
              marginLeft: "20px",
              marginRight: "20px",
            }}
          />

          {/* Dashboard */}
          <Button
            component={Link}
            to="/dashboard"
            sx={{
              my: 2,
              color: "white",
              display: "block",
              "&:hover": { color: "secondary.main" },
            }}
            aria-label="Dashboard"
          >
            Dashboard
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
