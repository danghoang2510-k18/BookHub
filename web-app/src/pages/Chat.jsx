import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import { isAuthenticated, logOut } from "../services/authenticationService";
import { getMyInfo } from "../services/userService";
import { createChatMessage, getConversationMessages, getMyConversations } from "../services/chatService";
import Scene from "./Scene";

const getCollection = (response) => {
  const result = response?.data?.result;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.content)) return result.content;
  if (Array.isArray(result?.conversations)) return result.conversations;
  if (Array.isArray(result?.messages)) return result.messages;
  return [];
};

const conversationIdOf = (conversation) => conversation?.id ?? conversation?.conversationId ?? conversation?.conversation_id;
const conversationName = (conversation) => {
  const participants = conversation?.participants;
  const participantName = Array.isArray(participants) ? participants.map((participant) => participant?.username || participant?.name).filter(Boolean).join(", ") : "";
  return conversation?.name || conversation?.title || conversation?.recipient?.username || conversation?.user?.username || conversation?.otherUser?.username || conversation?.participantName || participantName || "Conversation";
};
const messageContent = (message) => message?.content || message?.message || message?.text || "";
const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
const initials = (value = "Reader") => value.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();

export default function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [draft, setDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const scrollRef = useRef(null);

  const notify = useCallback((message, severity = "error") => setSnackbar({ open: true, message, severity }), []);
  const selectedId = conversationIdOf(selectedConversation);

  const loadConversations = useCallback(async () => {
    setListLoading(true);
    try {
      const response = await getMyConversations();
      const result = getCollection(response);
      setConversations(result);
      setSelectedConversation((current) => {
        if (current && result.some((item) => String(conversationIdOf(item)) === String(conversationIdOf(current)))) return current;
        return result[0] || null;
      });
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
        navigate("/login", { replace: true });
      } else {
        notify(error.response?.data?.message || "Couldn't load your conversations. Check that the chat service is available.");
      }
    } finally {
      setListLoading(false);
    }
  }, [navigate, notify]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }
    loadConversations();
    getMyInfo().then((response) => setCurrentUser(response.data?.result || null)).catch(() => {});
  }, [navigate, loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    setMessagesLoading(true);
    getConversationMessages(selectedId)
      .then((response) => { if (!cancelled) setMessages(getCollection(response)); })
      .catch((error) => {
        if (!cancelled && error.response?.status === 401) {
          logOut();
          navigate("/login", { replace: true });
        } else if (!cancelled) {
          setMessages([]);
          notify(error.response?.data?.message || "Couldn't load messages for this conversation.");
        }
      })
      .finally(() => { if (!cancelled) setMessagesLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, navigate, notify]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, selectedId]);

  const filteredConversations = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => conversationName(conversation).toLowerCase().includes(query));
  }, [conversations, searchText]);

  const handleChooseConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedId || sending) return;
    setSending(true);
    try {
      const response = await createChatMessage(selectedId, content);
      const savedMessage = {
        id: `local-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        senderId: currentUser?.id,
        sender: currentUser ? { id: currentUser.id, username: currentUser.username } : undefined,
        ...(response.data?.result || {}),
      };
      setMessages((previous) => [...previous, savedMessage]);
      setDraft("");
    } catch (error) {
      notify(error.response?.data?.message || "Your message wasn't sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason !== "clickaway") setSnackbar((previous) => ({ ...previous, open: false }));
  };

  const isMine = (message) => {
    if (message?.isMine === true || message?.mine === true) return true;
    const senderId = message?.senderId ?? message?.sender?.id ?? message?.author?.id ?? message?.createdBy;
    if (currentUser?.id != null && senderId != null) return String(currentUser.id) === String(senderId);
    const senderName = message?.sender?.username ?? message?.username;
    return Boolean(currentUser?.username && senderName && currentUser.username === senderName);
  };

  return (
    <Scene>
      <Snackbar open={snackbar.open} autoHideDuration={5500} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: "76px" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>

      <Box sx={{ mb: 3 }}>
        <Typography className="bh-page-eyebrow">Stay in touch</Typography>
        <Typography component="h1" className="bh-hero-title">Your conversations</Typography>
        <Typography className="bh-hero-copy">Good book recommendations are even better when they're shared.</Typography>
      </Box>

      <Box className="bh-chat-layout">
        <Box className={`bh-chat-list${showMobileChat ? " is-hidden-mobile" : ""}`}>
          <Box sx={{ p: 2.2, pb: 1.8 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.7 }}>
              <Typography sx={{ fontWeight: 850, fontSize: 15 }}>Messages</Typography>
              <IconButton size="small" aria-label="Refresh conversations" onClick={loadConversations}><RefreshRoundedIcon sx={{ fontSize: 19, color: "#79877e" }} /></IconButton>
            </Box>
            <TextField size="small" fullWidth placeholder="Find a conversation" value={searchText} onChange={(event) => setSearchText(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 19, color: "#8d988f" }} /></InputAdornment> }} />
          </Box>
          <Divider />
          {listLoading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}><CircularProgress size={23} /></Box>
          ) : filteredConversations.length ? (
            <Box sx={{ p: 1 }}>
              {filteredConversations.map((conversation, index) => {
                const id = conversationIdOf(conversation) ?? index;
                const name = conversationName(conversation);
                const last = conversation.lastMessage?.content || conversation.lastMessage || conversation.latestMessage?.content || "Open the conversation";
                const active = String(selectedId) === String(conversationIdOf(conversation));
                return (
                  <Box
                    key={id}
                    component="button"
                    onClick={() => handleChooseConversation(conversation)}
                    sx={{ display: "flex", width: "100%", textAlign: "left", alignItems: "center", gap: 1.3, border: 0, borderRadius: 3, py: 1.4, px: 1.3, cursor: "pointer", bgcolor: active ? "#edf4ed" : "transparent", "&:hover": { bgcolor: active ? "#edf4ed" : "#f6f8f4" }, color: "inherit" }}
                  >
                    <Avatar src={conversation.avatar || conversation.user?.avatar || undefined} sx={{ width: 43, height: 43, flexShrink: 0, bgcolor: "#e1ebe1", color: "#2f6253", fontSize: 13, fontWeight: 800 }}>{initials(name)}</Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontSize: 13, fontWeight: 800 }}>{name}</Typography>
                      <Typography noWrap sx={{ fontSize: 11, color: "text.secondary", mt: .4 }}>{typeof last === "string" ? last : "Open the conversation"}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Avatar sx={{ width: 46, height: 46, bgcolor: "#eef3ed", color: "primary.main", mx: "auto", mb: 1.5 }}><ChatBubbleOutlineRoundedIcon /></Avatar>
              <Typography sx={{ fontWeight: 750, fontSize: 13 }}>{searchText ? "No matching conversations" : "No conversations yet"}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12, lineHeight: 1.65, mt: .7 }}>{searchText ? "Try another name." : "When you start chatting with a reader, your conversations will appear here."}</Typography>
            </Box>
          )}
        </Box>

        <Box className={`bh-chat-message-area${!showMobileChat ? " is-hidden-mobile" : ""}`}>
          {selectedConversation ? (
            <>
              <Box sx={{ py: 1.6, px: { xs: 1.5, sm: 2.4 }, display: "flex", alignItems: "center", gap: 1.2, bgcolor: "#fff", borderBottom: "1px solid #e8ebe5" }}>
                <IconButton className="bh-mobile-only" aria-label="Back to messages" onClick={() => setShowMobileChat(false)} size="small"><ArrowBackRoundedIcon /></IconButton>
                <Avatar src={selectedConversation.avatar || selectedConversation.user?.avatar || undefined} sx={{ width: 40, height: 40, bgcolor: "#e1ebe1", color: "#2f6253", fontSize: 13, fontWeight: 800 }}>{initials(conversationName(selectedConversation))}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 850, fontSize: 14 }} noWrap>{conversationName(selectedConversation)}</Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary", mt: .2 }}>BookHub conversation</Typography>
                </Box>
              </Box>

              <Box className="bh-chat-scroll" ref={scrollRef}>
                {messagesLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}><CircularProgress size={23} /></Box>
                ) : messages.length ? messages.map((message, index) => {
                  const mine = isMine(message);
                  const created = message.createdAt || message.created || message.timestamp || message.sentAt;
                  return (
                    <Box key={message.id ?? `${created || "message"}-${index}`} sx={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "100%" }}>
                      <Box className={`bh-chat-bubble${mine ? " mine" : ""}`}>{messageContent(message)}</Box>
                      <Typography sx={{ mt: .5, px: .5, fontSize: 10, color: "#9aa39b", textAlign: mine ? "right" : "left" }}>{formatTime(created)}</Typography>
                    </Box>
                  );
                }) : (
                  <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", py: 4 }}>
                    <Box sx={{ maxWidth: 300 }}>
                      <Avatar sx={{ width: 58, height: 58, bgcolor: "#eaf2ec", color: "primary.main", mx: "auto", mb: 1.5 }}><AutoStoriesRoundedIcon /></Avatar>
                      <Typography sx={{ fontWeight: 800 }}>Start a good conversation.</Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.7, mt: .8 }}>Ask about a favorite author, swap recommendations, or share what you're reading.</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box component="form" onSubmit={handleSend} sx={{ p: { xs: 1.4, sm: 2 }, display: "flex", gap: 1, alignItems: "flex-end", bgcolor: "#fff", borderTop: "1px solid #e8ebe5" }}>
                <TextField fullWidth multiline maxRows={4} size="small" placeholder="Write a message…" value={draft} onChange={(event) => setDraft(event.target.value)} inputProps={{ "aria-label": "Message text" }} />
                <IconButton type="submit" aria-label="Send message" disabled={!draft.trim() || sending} sx={{ width: 43, height: 43, bgcolor: "primary.main", color: "#fff", borderRadius: 3, "&:hover": { bgcolor: "primary.dark" }, "&.Mui-disabled": { bgcolor: "#e8ece7", color: "#a5ada5" } }}>
                  {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", p: 4 }}>
              <Box sx={{ maxWidth: 330 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: "#eaf2ec", color: "primary.main", mx: "auto", mb: 2 }}><ChatBubbleOutlineRoundedIcon sx={{ fontSize: 28 }} /></Avatar>
                <Typography variant="h6">A good conversation starts with hello.</Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.7, mt: 1 }}>Select a conversation to read messages and join in.</Typography>
                <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={loadConversations} sx={{ mt: 2 }}>Refresh messages</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Scene>
  );
}
