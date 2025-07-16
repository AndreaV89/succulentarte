import { useState, type JSX } from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  Container,
  Button,
  MenuItem,
  Divider,
  InputBase,
  Modal,
  TextField,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";

const pages = ["Catalogo", "Indice", "Contatti"];

const ModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  color: "black",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
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
    // vertical padding + font size from searchIcon
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

const ResponsiveAppBar = (): JSX.Element => {
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [auth, setAuth] = useState(true);

  const userProva = "userProva";
  const pswProva = "pswProva";

  const handleOpenModal = () => {
    setOpenModal(true);
    handleCloseLoginMenu();
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleLogout = () => {
    handleCloseLoginMenu();
    setAuth(false);
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (event) => {
    setAnchorElNav(null);
  };

  const handleOpenLoginMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseLoginMenu = () => {
    setAnchorEl(null);
  };

  const handleSubmit = () => {
    if (user === userProva && password === pswProva) {
      setAuth(true);
      setUser("");
      setPassword("");
    }
    handleCloseModal();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: "30px",
        width: "90%",
        left: "50%",
        transform: "translate(-50%, 0)",
        borderRadius: "10px",
        backgroundColor: "#018732",
      }}
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {/* Menu meno di 900px wide */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
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
                  component="a"
                  key={page}
                  href={page === "Catalogo" ? "/" : page}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 1,
                    color: "black",
                    display: "block",
                  }}
                >
                  {page}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Menu oltre 900px wide */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                href={page === "Catalogo" ? "/" : page}
                key={page}
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  marginRight: "50px",
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Search Input */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
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
          {
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenLoginMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseLoginMenu}
              >
                {/* Menu Icona Profilo */}
                {auth ? (
                  <div>
                    <MenuItem component="a" href="/dashboard">
                      Dashboard
                    </MenuItem>
                    <MenuItem component="a" onClick={handleLogout}>
                      Logout
                    </MenuItem>
                  </div>
                ) : (
                  <MenuItem onClick={handleOpenModal}>Login</MenuItem>
                )}

                {/* Modal Login */}
                <Modal open={openModal} onClose={handleCloseModal}>
                  <Box sx={ModalStyle}>
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      noValidate
                      sx={{ mt: 1 }}
                    >
                      <TextField
                        value={user}
                        name="username"
                        type="email"
                        onChange={(e) => setUser(e.target.value)}
                        placeholder="Enter username"
                        label="username"
                        fullWidth
                        required
                        autoFocus
                        sx={{ mb: 2 }}
                      ></TextField>
                      <TextField
                        value={password}
                        name="password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        label="password"
                        fullWidth
                        required
                      ></TextField>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        Sign In
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Menu>
            </div>
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
