import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import { useState } from "react";

const mainItems = [
  { label: "My feed", icon: HomeRoundedIcon, path: "/" },
  { label: "Messages", icon: ChatBubbleRoundedIcon, path: "/chat" },
  { label: "Friends", icon: PeopleAltRoundedIcon, path: null },
  { label: "Reading circles", icon: GroupsRoundedIcon, path: null },
];

function SideMenu({ onNavigate = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState("");

  const handleItemClick = (item) => {
    if (item.path) { navigate(item.path); onNavigate(); }
    else setSelectedItem(item.label);
  };

  return (
    <Box className="bh-side-wrap">
      <Box className="bh-side-label">Your space</Box>
      <List disablePadding>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = item.path ? location.pathname === item.path : selectedItem === item.label;
          return (
            <ListItemButton key={item.label} className={`bh-nav-item${active ? " active" : ""}`} onClick={() => handleItemClick(item)}>
              <ListItemIcon><Icon sx={{ fontSize: 21 }} /></ListItemIcon>
              <ListItemText primary={item.label} />
              {!item.path && selectedItem === item.label && <Typography variant="caption" sx={{ color: "text.secondary" }}>Soon</Typography>}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ my: 2.2, borderColor: "#edf0ea" }} />
      <Box className="bh-side-label">Discover</Box>
      <List disablePadding>
        <ListItemButton className="bh-nav-item" onClick={() => setSelectedItem("Bookmarked reads")}>
          <ListItemIcon><BookmarkBorderRoundedIcon sx={{ fontSize: 21 }} /></ListItemIcon>
          <ListItemText primary="Bookmarked reads" />
        </ListItemButton>
        <ListItemButton className="bh-nav-item" onClick={() => { navigate("/profile"); onNavigate(); }}>
          <ListItemIcon><AutoStoriesRoundedIcon sx={{ fontSize: 21 }} /></ListItemIcon>
          <ListItemText primary="My reading profile" />
        </ListItemButton>
      </List>

      <Box className="bh-reading-note">
        <Avatar sx={{ width: 34, height: 34, bgcolor: "#dfe8d7", color: "#426a4d", mb: 1.4 }}>
          <AutoStoriesRoundedIcon sx={{ fontSize: 19 }} />
        </Avatar>
        <Typography className="bh-reading-note-title">A little reading goes a long way.</Typography>
        <Typography className="bh-reading-note-copy">Share a thought, trade recommendations, and find your next favorite book.</Typography>
      </Box>
      <Typography sx={{ mt: 3, px: 1.5, color: "#a0a8a0", fontSize: 10, lineHeight: 1.8 }}>
        BOOKHUB · A COMMUNITY FOR READERS
      </Typography>
    </Box>
  );
}

export default SideMenu;
