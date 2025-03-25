import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({ origin: process.env.ORIGIN_NAMES }));

import { userRoute } from "./routes/user.route.js";
import { videoRoute } from "./routes/video.route.js";
import { tweetRouter } from "./routes/tweet.route.js";
import { playlistRoute } from "./routes/playlist.route.js";
import { CommentRouter } from "./routes/comment.route.js";
import { likeRoute } from "./routes/like.route.js";
import { subscribeRoute } from "./routes/subscribe.route.js";

app.use("/api/v1/user", userRoute);
app.use("/api/v1/video", videoRoute);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/playlist", playlistRoute);
app.use("/api/v1/comment", CommentRouter);
app.use("/api/v1/like", likeRoute);
app.use("/api/v1/subscribe", subscribeRoute);

export { app };
