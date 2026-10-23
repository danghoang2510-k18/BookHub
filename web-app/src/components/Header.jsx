import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  OutlinedInput,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { logOut } from "../services/authenticationService";

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchText, setSearchText] = React.useState("");
  const menuOpen = Boolean(anchorEl);

  const handleLogout = () => {
    setAnchorEl(null);
    logOut();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%", minWidth: 0, gap: { xs: 1, md: 2 } }}>
      <Box
        className="bh-brand"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/")}
        onKeyDown={(event) => event.key === "Enter" && navigate("/")}
        sx={{ cursor: "pointer", flexShrink: 0 }}
      >
        <Box className="bh-brand-mark"><AutoStoriesRoundedIcon sx={{ fontSize: 23 }} /></Box>
        <Box>
          <Box className="bh-brand-name">BookHub</Box>
          <Box className="bh-brand-subtitle">Read · Share · Connect</Box>
        </Box>
      </Box>

      <OutlinedInput
        className="bh-search"
        size="small"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Search your reading community"
        startAdornment={<InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#8a968e", fontSize: 21 }} /></InputAdornment>}
        inputProps={{ "aria-label": "Search your reading community" }}
      />

      <Box className="bh-header-actions">
        <Tooltip title="Messages">
          <IconButton className="bh-icon-button" aria-label="Open messages" onClick={() => navigate("/chat")}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 21 }} />
          </IconButton>
        </Tooltip>
        <Box
          onClick={(event) => setAnchorEl(event.currentTarget)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === "Enter" && setAnchorEl(event.currentTarget)}
          sx={{ display: "flex", alignItems: "center", gap: .7, cursor: "pointer", ml: .5, pl: .3 }}
          aria-label="Open account menu"
          aria-haspopup="true"
          aria-expanded={menuOpen ? "true" : undefined}
        >
          <Avatar sx={{ width: 37, height: 37, bgcolor: "#e4eee7", color: "#2f6253" }}><AccountCircleOutlinedIcon /></Avatar>
          <KeyboardArrowDownRoundedIcon sx={{ color: "#75817b", display: { xs: "none", sm: "block" } }} />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1, minWidth: 190, border: "1px solid #e8ebe5", boxShadow: "0 12px 35px rgba(34,48,39,.12)" } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }}>
          <AccountCircleOutlinedIcon sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={650}>My profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutRoundedIcon sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={650}>Log out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
