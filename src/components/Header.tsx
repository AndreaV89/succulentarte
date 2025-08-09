// React
import { useState, useEffect, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

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
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Utils
import { getResizedImageUrls } from "../utils/imageUtils";

type SearchResult = {
  id: string;
  label: string;
  type: "pianta" | "genere" | "famiglia";
  subtitle: string;
  imageUrl?: string;
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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { famiglieMap, generiMap, loading: dataLoading } = useData();

  // Ricerca
  useEffect(() => {
    if (searchValue.length < 2 || dataLoading) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);

    const fetch = setTimeout(async () => {
      const searchLower = searchValue.toLowerCase();
      const searchCapitalized =
        searchLower.charAt(0).toUpperCase() + searchLower.slice(1);

      const [pianteSnap, generiSnap, famiglieSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "piante"),
            where("specie", ">=", searchLower),
            where("specie", "<=", searchLower + "\uf8ff")
          )
        ),
        getDocs(
          query(
            collection(db, "generi"),
            where("nome", ">=", searchCapitalized),
            where("nome", "<=", searchCapitalized + "\uf8ff")
          )
        ),
        getDocs(
          query(
            collection(db, "famiglie"),
            where("nome", ">=", searchCapitalized),
            where("nome", "<=", searchCapitalized + "\uf8ff")
          )
        ),
      ]);

      // 3. Formattiamo i risultati per ogni tipo
      const pianteResults: SearchResult[] = pianteSnap.docs.map((doc) => {
        const data = doc.data();
        let copertinaUrl: string | undefined;
        if (data.fotoUrls && data.fotoUrls.length > 0) {
          const coverIndex = data.fotoCopertinaIndex ?? 0;
          copertinaUrl = data.fotoUrls[coverIndex] || data.fotoUrls[0];
        }
        const imageUrls = getResizedImageUrls(copertinaUrl);
        return {
          id: doc.id,
          label: data.specie,
          type: "pianta",
          subtitle: `${generiMap.get(data.genereId) || "Genere"} – ${
            famiglieMap.get(data.famigliaId) || "Famiglia"
          }`,
          imageUrl: imageUrls.thumbnail,
        };
      });

      const generiResults: SearchResult[] = generiSnap.docs.map((doc) => {
        const data = doc.data();
        const fotoUrl = data.fotoUrl || data.fotoThumbnailUrl;
        let thumbnailUrl: string | undefined;
        if (fotoUrl) {
          const imageUrls = getResizedImageUrls(fotoUrl);
          thumbnailUrl = imageUrls.thumbnail;
        }
        return {
          id: doc.id,
          label: data.nome,
          type: "genere",
          subtitle: "Genere",
          imageUrl: thumbnailUrl,
        };
      });

      const famiglieResults: SearchResult[] = famiglieSnap.docs.map((doc) => {
        const data = doc.data();
        const fotoUrl = data.fotoUrl || data.fotoThumbnailUrl;
        let thumbnailUrl: string | undefined;
        if (fotoUrl) {
          const imageUrls = getResizedImageUrls(fotoUrl);
          thumbnailUrl = imageUrls.thumbnail;
        }
        return {
          id: doc.id,
          label: data.nome,
          type: "famiglia",
          subtitle: "Famiglia",
          imageUrl: thumbnailUrl,
        };
      });

      const combinedResults = [
        ...famiglieResults,
        ...generiResults,
        ...pianteResults,
      ];

      setResults(combinedResults.slice(0, 8));
      setSearching(false);
    }, 300);

    return () => clearTimeout(fetch);
  }, [searchValue, dataLoading, famiglieMap, generiMap]);

  // Gestisce il click su un risultato
  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "pianta":
        navigate(`/pianta/${result.id}`);
        break;
      case "genere":
        navigate(`/catalogo/genere/${result.id}`);
        break;
      case "famiglia":
        navigate(`/catalogo/famiglia/${result.id}`);
        break;
      default:
        break;
    }
    // Pulisci la ricerca dopo il click
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
              display: "none",
              "@media (min-width: 1400px)": {
                display: "flex",
              },
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
                  handleResultClick(value);
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Avatar
                      src={option.imageUrl}
                      sx={{ mr: 2, width: 40, height: 40 }}
                    >
                      <ImageIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.subtitle}
                      </Typography>
                    </Box>
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
