import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";
import Post from "../components/Post";
import { createPost, getMyPosts } from "../services/postService";

const extractPosts = (payload) => {
  const result = payload?.data?.result;
  const items = Array.isArray(result) ? result : result?.data;
  return { items: Array.isArray(items) ? items : [], totalPages: Math.max(Number(result?.totalPages || 1), 1) };
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const observer = useRef(null);
  const lastPostElementRef = useRef(null);
  const isLoadingRef = useRef(false);
  const navigate = useNavigate();

  const notify = useCallback((message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const loadPosts = useCallback(async (requestedPage, cancelledRef) => {
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const response = await getMyPosts(requestedPage);
      if (cancelledRef.cancelled) return;
      const result = extractPosts(response);
      setTotalPages(result.totalPages);
      setPosts((previous) => {
        if (requestedPage === 1) return result.items;
        const knownIds = new Set(previous.map((item) => item.id).filter((id) => id !== undefined));
        return [...previous, ...result.items.filter((item) => item.id === undefined || !knownIds.has(item.id))];
      });
      setHasMore(requestedPage < result.totalPages && result.items.length > 0);
    } catch (error) {
      if (cancelledRef.cancelled) return;
      if (error.response?.status === 401) {
        logOut();
        navigate("/login", { replace: true });
      } else {
        notify("We couldn't load your feed. Please try again.", "error");
      }
    } finally {
      if (!cancelledRef.cancelled) {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [navigate, notify]);

  useEffect(() => {
    const cancelledRef = { cancelled: false };
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
    } else {
      loadPosts(page, cancelledRef);
    }
    return () => { cancelledRef.cancelled = true; };
  }, [navigate, page, loadPosts]);

  useEffect(() => {
    if (!hasMore || loading) return undefined;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isLoadingRef.current && page < totalPages) {
        isLoadingRef.current = true;
        setPage((current) => current + 1);
      }
    }, { rootMargin: "180px" });
    if (lastPostElementRef.current) observer.current.observe(lastPostElementRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, loading, page, totalPages, posts]);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => {
    if (isPosting) return;
    setDialogOpen(false);
  };

  const handlePostContent = async () => {
    const content = newPostContent.trim();
    if (!content || isPosting) return;
    setIsPosting(true);
    try {
      const response = await createPost(content);
      const createdPost = response?.data?.result;
      if (createdPost) setPosts((previous) => [createdPost, ...previous.filter((post) => createdPost.id == null || post.id !== createdPost.id)]);
      else if (page !== 1) setPage(1);
      else await loadPosts(1, { cancelled: false });
      setNewPostContent("");
      setDialogOpen(false);
      notify("Your post is live. Thanks for sharing!");
    } catch (error) {
      notify(error.response?.data?.message || "Couldn't publish your post. Please try again.", "error");
    } finally {
      setIsPosting(false);
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

      <Box className="bh-home-grid">
        <Box className="bh-feed-column">
          <Box sx={{ mb: 3.2 }}>
            <Typography className="bh-page-eyebrow">The BookHub feed</Typography>
            <Typography component="h1" className="bh-hero-title">Good reads bring us together.</Typography>
            <Typography className="bh-hero-copy">A space to share what you're reading, trade recommendations, and discover the stories people can't stop talking about.</Typography>
          </Box>

          <Box className="bh-compose" sx={{ mb: 3 }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: "#e3ede5", color: "#2f6253" }}><AutoStoriesRoundedIcon /></Avatar>
            <Box component="button" className="bh-compose-prompt" onClick={handleOpenDialog}>
              What's on your bookshelf lately?
            </Box>
            <Button variant="contained" onClick={handleOpenDialog} startIcon={<EditNoteRoundedIcon />} sx={{ display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }}>Write a post</Button>
            <Button aria-label="Write a post" variant="contained" onClick={handleOpenDialog} sx={{ p: 0, minWidth: 42, display: { xs: "inline-flex", sm: "none" } }}><AddRoundedIcon /></Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.6, px: .2 }}>
            <Typography component="h2" sx={{ fontSize: 17, fontWeight: 850 }}>Latest conversations</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{posts.length} {posts.length === 1 ? "post" : "posts"}</Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
            {posts.map((post, index) => {
              const key = post.id ?? `${post.username || "reader"}-${post.created || index}`;
              return index === posts.length - 1
                ? <Post ref={lastPostElementRef} key={key} post={post} />
                : <Post key={key} post={post} />;
            })}

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.2, py: 4, color: "text.secondary" }}>
                <CircularProgress size={22} thickness={4} />
                <Typography sx={{ fontSize: 13 }}>Finding your latest reads…</Typography>
              </Box>
            )}

            {!loading && posts.length === 0 && (
              <Card className="bh-surface" sx={{ textAlign: "center", p: { xs: 3, sm: 5 } }}>
                <Avatar sx={{ width: 58, height: 58, bgcolor: "#e9f0e7", color: "primary.main", mx: "auto", mb: 2 }}><AutoStoriesRoundedIcon /></Avatar>
                <Typography variant="h6">Your feed is a fresh page.</Typography>
                <Typography sx={{ mt: 1, mb: 2.5, color: "text.secondary", fontSize: 14 }}>Share a quote, a review, or the book that's been on your mind.</Typography>
                <Button variant="contained" onClick={handleOpenDialog} startIcon={<AddRoundedIcon />}>Create the first post</Button>
              </Card>
            )}
          </Box>
        </Box>

        <Box className="bh-aside">
          <Box className="bh-aside-card" sx={{ background: "linear-gradient(145deg, #315e4e, #234a3e)", color: "#fff", border: "none", p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 850, letterSpacing: 1.4, color: "#d0e0d3" }}>A NOTE FOR READERS</Typography>
              <AutoStoriesRoundedIcon sx={{ color: "#d7bd8d" }} />
            </Box>
            <Typography sx={{ fontSize: 21, fontWeight: 800, letterSpacing: -.5, lineHeight: 1.25 }}>Every book opens a door.</Typography>
            <Typography sx={{ fontSize: 13, lineHeight: 1.75, color: "#d0ddd4", mt: 1.2 }}>Tell the community where yours has taken you lately.</Typography>
            <Button onClick={handleOpenDialog} variant="contained" sx={{ mt: 2.3, color: "#24483b", bgcolor: "#f1dfbd", "&:hover": { bgcolor: "#e8d1a8" } }}>Share a thought</Button>
          </Box>

          <Box className="bh-aside-card">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.7 }}>
              <ExploreRoundedIcon sx={{ color: "#b77a43" }} />
              <Typography className="bh-aside-heading">Reading prompts</Typography>
            </Box>
            <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.7, mb: 2 }}>Not sure what to post? Start with a topic you love.</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: .8 }}>
              <span className="bh-topic-chip">A recent favorite</span>
              <span className="bh-topic-chip">Best plot twist</span>
              <span className="bh-topic-chip">On my TBR</span>
              <span className="bh-topic-chip">Book-to-screen</span>
            </Box>
          </Box>

          <Box className="bh-aside-card">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.1 }}>
              <FavoriteBorderRoundedIcon sx={{ color: "#c57a65" }} />
              <Typography className="bh-aside-heading">Community tip</Typography>
            </Box>
            <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.75 }}>A few lines about why a story mattered to you can help another reader find their next favorite.</Typography>
          </Box>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: { xs: .5, sm: 1 } } }}>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography sx={{ color: "primary.main", fontSize: 11, fontWeight: 850, letterSpacing: 1.5, textTransform: "uppercase" }}>Your reading journal</Typography>
          <Typography variant="h5" sx={{ mt: .7 }}>Share a thought</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: "12px !important" }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={5}
            maxRows={10}
            placeholder="A book you loved, a passage you saved, or an idea you can't stop thinking about…"
            value={newPostContent}
            onChange={(event) => setNewPostContent(event.target.value)}
            inputProps={{ maxLength: 2000, "aria-label": "Post content" }}
          />
          <Typography sx={{ textAlign: "right", color: "text.secondary", fontSize: 11, mt: .8 }}>{newPostContent.length}/2000</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button color="inherit" onClick={handleCloseDialog} disabled={isPosting}>Cancel</Button>
          <Button variant="contained" onClick={handlePostContent} disabled={!newPostContent.trim() || isPosting} startIcon={isPosting ? <CircularProgress size={16} color="inherit" /> : <EditNoteRoundedIcon />}>
            {isPosting ? "Publishing…" : "Publish post"}
          </Button>
        </DialogActions>
      </Dialog>
    </Scene>
  );
}
