import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { logIn, isAuthenticated } from "../services/authenticationService";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("error");

  useEffect(() => {
    if (isAuthenticated()) navigate("/", { replace: true });
  }, [navigate]);

  const showMessage = (message, severity = "info") => {
    setSnackBarMessage(message);
    setSnackBarSeverity(severity);
    setSnackBarOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await logIn(username.trim(), password);
      navigate("/", { replace: true });
    } catch (error) {
      showMessage(error.response?.data?.message || "We couldn't sign you in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="bh-login-page">
      <Snackbar open={snackBarOpen} onClose={(event, reason) => reason !== "clickaway" && setSnackBarOpen(false)} autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setSnackBarOpen(false)} severity={snackBarSeverity} variant="filled" sx={{ width: "100%" }}>{snackBarMessage}</Alert>
      </Snackbar>

      <Box className="bh-login-art">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 3, bgcolor: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.19)" }}><AutoStoriesRoundedIcon sx={{ fontSize: 25 }} /></Box>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 850, letterSpacing: -.7, lineHeight: 1 }}>BookHub</Typography>
            <Typography sx={{ mt: .5, fontSize: 10, letterSpacing: 1.6, color: "rgba(255,255,255,.65)", fontWeight: 800 }}>READ · SHARE · CONNECT</Typography>
          </Box>
        </Box>

        <Box className="bh-login-copy">
          <Typography sx={{ fontSize: 11, fontWeight: 850, letterSpacing: 2.2, color: "#e9c99d" }}>YOUR NEXT CHAPTER STARTS HERE</Typography>
          <Box component="h1">Every reader has a story to share.</Box>
          <Typography>Find your people, collect fresh perspectives, and make room for the books that stay with you long after the last page.</Typography>
          <Box className="bh-book-stack" aria-hidden="true">
            <Box className="bh-book">THE QUIET HOURS</Box>
            <Box className="bh-book">WILD GARDENS</Box>
            <Box className="bh-book">SMALL WORLDS</Box>
            <Box className="bh-book">A NEW CHAPTER</Box>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,.58)", position: "relative", zIndex: 1 }}>A welcoming corner of the internet for people who love books.</Typography>
      </Box>

      <Box className="bh-login-panel">
        <Box className="bh-login-form">
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 5, color: "primary.main" }}>
            <AutoStoriesRoundedIcon />
            <Typography sx={{ fontWeight: 850, fontSize: 21 }}>BookHub</Typography>
          </Box>
          <Typography sx={{ color: "primary.main", fontSize: 11, letterSpacing: 1.7, fontWeight: 850, textTransform: "uppercase" }}>Welcome back</Typography>
          <Typography component="h2" sx={{ fontSize: 33, fontWeight: 850, letterSpacing: -1.2, mt: 1, mb: 1 }}>Sign in to BookHub</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.7, mb: 3.8 }}>Your bookshelf, conversations, and reading community are waiting for you.</Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography className="bh-form-label" sx={{ mb: .8 }}>Username</Typography>
            <TextField
              placeholder="Enter your username"
              fullWidth
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              inputProps={{ "aria-label": "Username" }}
              InputProps={{ startAdornment: <InputAdornment position="start"><AlternateEmailRoundedIcon sx={{ color: "#8b978f", fontSize: 20 }} /></InputAdornment> }}
              sx={{ mb: 2.3 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: .8 }}>
              <Typography className="bh-form-label">Password</Typography>
            </Box>
            <TextField
              placeholder="Enter your password"
              type="password"
              fullWidth
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              inputProps={{ "aria-label": "Password" }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#8b978f", fontSize: 20 }} /></InputAdornment> }}
              sx={{ mb: 2.4 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={!username.trim() || !password || isSubmitting} endIcon={!isSubmitting && <ArrowForwardRoundedIcon />} sx={{ minHeight: 49 }}>
              {isSubmitting ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> Signing in…</> : "Sign in"}
            </Button>
          </Box>

          <Divider sx={{ my: 2.6, color: "#a0aaa2", fontSize: 12 }}>or continue with</Divider>
          <Button type="button" variant="outlined" fullWidth startIcon={<GoogleIcon />} onClick={() => showMessage("Google sign-in has not been configured for this frontend yet.", "info")} sx={{ minHeight: 47, color: "#4d5c53", borderColor: "#e1e7e1", bgcolor: "#fff", "&:hover": { borderColor: "#bdcfc1", bgcolor: "#fafbf9" } }}>
            Google
          </Button>

          <Typography sx={{ fontSize: 12, color: "#9aa39c", lineHeight: 1.7, mt: 3.5, textAlign: "center" }}>
            By signing in, you're joining a community built around curiosity, kindness, and good books.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
