import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import dayjs from "dayjs";
import { getMyInfo, updateProfile, uploadAvatar } from "../services/userService";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";

const getInitials = (firstName, lastName, username) => {
  const value = `${firstName || ""} ${lastName || ""}`.trim() || username || "Reader";
  return value.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
};

export default function Profile() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const fileInputRef = useRef(null);

  const notify = useCallback((message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const getUserDetails = useCallback(async () => {
    try {
      const response = await getMyInfo();
      const details = response.data?.result || {};
      setUserDetails(details);
      setFirstName(details.firstName || "");
      setLastName(details.lastName || "");
      setEmail(details.email || "");
      setCity(details.city || "");
      setDob(details.dob ? dayjs(details.dob) : null);
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
        navigate("/login", { replace: true });
      } else {
        notify("Couldn't load your profile. Please refresh and try again.", "error");
      }
    } finally {
      setPageLoading(false);
    }
  }, [navigate, notify]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }
    getUserDetails();
  }, [navigate, getUserDetails]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        city: city.trim(),
        dob: dob && dob.isValid() ? dob.format("YYYY-MM-DD") : null,
      };
      await updateProfile(profileData);
      setUserDetails((previous) => ({ ...previous, ...profileData }));
      notify("Your profile has been updated.");
    } catch (error) {
      notify(error.response?.data?.message || "Couldn't save your changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Choose an image file to update your avatar.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify("Please choose an image smaller than 5 MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadAvatar(formData);
      const avatar = response.data?.result?.avatar;
      if (avatar) setUserDetails((previous) => ({ ...previous, avatar }));
      notify("Your profile photo has been updated.");
    } catch (error) {
      notify(error.response?.data?.message || "Couldn't upload your photo. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason !== "clickaway") setSnackbarOpen(false);
  };

  return (
    <Scene>
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: "76px" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled" sx={{ width: "100%" }}>{snackbarMessage}</Alert>
      </Snackbar>

      <Box sx={{ maxWidth: 1080, mx: "auto" }}>
        <Box sx={{ mb: 3.2 }}>
          <Typography className="bh-page-eyebrow">Your corner of BookHub</Typography>
          <Typography component="h1" className="bh-hero-title">Reader profile</Typography>
          <Typography className="bh-hero-copy">A little about you helps your reading community get to know you.</Typography>
        </Box>

        {pageLoading ? (
          <Box sx={{ minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, color: "text.secondary" }}>
            <CircularProgress size={25} />
            <Typography>Getting your profile ready…</Typography>
          </Box>
        ) : userDetails ? (
          <Box className="bh-profile-grid">
            <Card className="bh-surface" sx={{ overflow: "hidden", alignSelf: "start" }}>
              <Box className="bh-profile-banner" />
              <CardContent sx={{ px: { xs: 2.5, sm: 3 }, pb: 3, pt: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -6.5, mb: 2.2 }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar src={userDetails.avatar || undefined} sx={{ width: 106, height: 106, border: "5px solid #fff", bgcolor: "#dce9df", color: "#2f6253", fontWeight: 850, fontSize: 30 }}>
                      {getInitials(userDetails.firstName, userDetails.lastName, userDetails.username)}
                    </Avatar>
                    {uploading && <CircularProgress size={32} sx={{ position: "absolute", left: 37, top: 37, color: "primary.main" }} />}
                    <Tooltip title="Change profile photo">
                      <Box component="button" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Change profile photo" sx={{ display: "grid", placeItems: "center", position: "absolute", right: 1, bottom: 4, width: 32, height: 32, border: "3px solid #fff", borderRadius: "50%", bgcolor: "primary.main", color: "#fff", cursor: "pointer", "&:hover": { bgcolor: "primary.dark" } }}>
                        <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
                      </Box>
                    </Tooltip>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
                  </Box>
                  <Box sx={{ mb: .6, borderRadius: 2, px: 1.1, py: .6, bgcolor: "#edf4ed", color: "#477253", display: "flex", alignItems: "center", gap: .6 }}>
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 15 }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 800 }}>MEMBER</Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ overflowWrap: "anywhere" }}>{`${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() || userDetails.username || "BookHub reader"}</Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mt: .5 }}>@{userDetails.username || "reader"}</Typography>
                {city && <Box sx={{ display: "flex", alignItems: "center", gap: .6, mt: 1.8, color: "text.secondary" }}><PlaceOutlinedIcon sx={{ fontSize: 17 }} /><Typography sx={{ fontSize: 13 }}>{city}</Typography></Box>}
                <Divider sx={{ my: 2.5 }} />
                <Typography sx={{ fontSize: 11, letterSpacing: 1.3, color: "#98a198", fontWeight: 850, textTransform: "uppercase" }}>Your reader ID</Typography>
                <Typography sx={{ fontSize: 13, mt: .7, color: "#647269", overflowWrap: "anywhere" }}>{userDetails.id || "—"}</Typography>
                <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: "#f7f8f4", border: "1px solid #edf0e9" }}>
                  <AutoStoriesMessage />
                </Box>
              </CardContent>
            </Card>

            <Card className="bh-surface">
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Typography variant="h6">Personal details</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 13, mt: .6, mb: 3 }}>Keep your information up to date.</Typography>
                <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2,minmax(0,1fr))" }, gap: 2 }}>
                    <Box><Typography className="bh-form-label" sx={{ mb: .8 }}>First name</Typography><TextField fullWidth size="small" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></Box>
                    <Box><Typography className="bh-form-label" sx={{ mb: .8 }}>Last name</Typography><TextField fullWidth size="small" placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></Box>
                  </Box>
                  <Box><Typography className="bh-form-label" sx={{ mb: .8 }}>Email address</Typography><TextField fullWidth size="small" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></Box>
                  <Box><Typography className="bh-form-label" sx={{ mb: .8 }}>City</Typography><TextField fullWidth size="small" placeholder="Where are you reading from?" value={city} onChange={(event) => setCity(event.target.value)} /></Box>
                  <Box>
                    <Typography className="bh-form-label" sx={{ mb: .8 }}>Date of birth</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker value={dob} onChange={setDob} format="DD MMM YYYY" maxDate={dayjs()} slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "Select date" } }} />
                    </LocalizationProvider>
                  </Box>
                  <Divider sx={{ my: .3 }} />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button type="button" variant="text" color="inherit" onClick={() => { setFirstName(userDetails.firstName || ""); setLastName(userDetails.lastName || ""); setEmail(userDetails.email || ""); setCity(userDetails.city || ""); setDob(userDetails.dob ? dayjs(userDetails.dob) : null); }}>Discard changes</Button>
                    <Button type="submit" variant="contained" disabled={saving || uploading} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>{saving ? "Saving…" : "Save changes"}</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Card className="bh-surface" sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">Your profile isn't available right now.</Typography>
            <Typography sx={{ color: "text.secondary", mt: 1, mb: 2 }}>Please refresh the page and try again.</Typography>
            <Button variant="contained" onClick={() => { setPageLoading(true); getUserDetails(); }}>Try again</Button>
          </Card>
        )}
      </Box>
    </Scene>
  );
}

function AutoStoriesMessage() {
  return (
    <>
      <Typography sx={{ fontSize: 12, color: "#607364", fontWeight: 800, mb: .5 }}>Make yourself at home.</Typography>
      <Typography sx={{ fontSize: 12, lineHeight: 1.7, color: "#879187" }}>Your profile is a place to keep your details current while you connect with other readers.</Typography>
    </>
  );
}
