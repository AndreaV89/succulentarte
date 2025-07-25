// React
import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";

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
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";

const pages = [
  { label: "Catalogo", to: "/" },
  { label: "Indice", to: "/indice" },
  { label: "Contatti", to: "/contatti" },
];

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 30,
  backgroundColor: alpha(theme.palette.common.white, 0.18),
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.28),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
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
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const Header = (): JSX.Element => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElNav(event.currentTarget);
  };

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
                  "&:hover": { color: "#FFC107" },
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
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Cerca…"
              inputProps={{ "aria-label": "search" }}
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

          {/* Icona Profilo */}
          <Button
            component={Link}
            to="/dashboard"
            sx={{
              my: 2,
              color: "white",
              display: "block",
              "&:hover": { color: "#FFC107" },
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
