import React, { forwardRef } from "react";
import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

const getInitials = (name = "Reader") =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();

const Post = forwardRef(({ post = {} }, ref) => {
  const username = post.username || post.author?.username || "BookHub reader";
  const timestamp = post.created || post.createdAt || post.createdDate;
  let displayTime = timestamp || "Recently";
  if (timestamp) {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      displayTime = parsed.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    }
  }

  return (
    <Card ref={ref} className="bh-post-card">
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Avatar src={post.avatar || post.author?.avatar || undefined} sx={{ width: 44, height: 44, bgcolor: "#e3ede5", color: "#2f6253", fontWeight: 800, fontSize: 14 }}>
            {getInitials(username)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0, pt: .2 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#293b32" }}>{username}</Typography>
            <Typography className="bh-meta">{displayTime}</Typography>
          </Box>
          <MoreHorizRoundedIcon sx={{ fontSize: 22, color: "#9aa39c" }} />
        </Box>

        <Box sx={{ pl: { xs: 0, sm: "59px" }, pt: 1.6 }}>
          <Typography className="bh-post-content">{post.content || ""}</Typography>
          {(post.bookTitle || post.book?.title) && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: .8, mt: 1.8, px: 1.3, py: .8, borderRadius: 2.5, bgcolor: "#f2f5ef", color: "#476b57" }}>
              <AutoStoriesOutlinedIcon sx={{ fontSize: 17 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 750 }}>{post.bookTitle || post.book?.title}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

Post.displayName = "Post";
export default Post;
