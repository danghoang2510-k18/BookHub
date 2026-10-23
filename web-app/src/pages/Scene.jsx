import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Toolbar from "@mui/material/Toolbar";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";

const drawerWidth = 254;
const headerHeight = 76;

function Scene({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleDrawer = () => setMobileOpen((open) => !open);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="fixed" elevation={0} className="bh-appbar" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar className="bh-toolbar">
          <IconButton
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={toggleDrawer}
            sx={{ display: { xs: "inline-flex", sm: "none" }, color: "#52675b", p: 1 }}
          >
            {mobileOpen ? <CloseRoundedIcon /> : <MenuIcon />}
          </IconButton>
          <Header />
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Main navigation" sx={{ position: { sm: "fixed" }, top: { sm: `${headerHeight}px` }, left: 0, width: { sm: drawerWidth }, flexShrink: { sm: 0 }, zIndex: (theme) => theme.zIndex.drawer }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          className="bh-drawer"
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, top: { xs: "66px", sm: `${headerHeight}px` }, height: { xs: "calc(100% - 66px)", sm: `calc(100% - ${headerHeight}px)` } } }}
        >
          <SideMenu onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          className="bh-drawer"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, top: `${headerHeight}px`, height: `calc(100% - ${headerHeight}px)` } }}
        >
          <SideMenu onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      </Box>

      <Box component="main" className="bh-main" sx={{ ml: { sm: `${drawerWidth}px` }, pt: { xs: "66px", sm: `${headerHeight}px` } }}>
        <Box className="bh-content">{children}</Box>
      </Box>
    </Box>
  );
}

export default Scene;
