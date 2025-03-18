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

app.use("/api/v1/user", userRoute);
app.use("/api/v1/video", videoRoute);

export { app };
