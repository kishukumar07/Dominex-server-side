import express from "express";
import cors from "cors";
import env from "dotenv";
import cookieParser from "cookie-parser";
env.config();

import http from "http";
import connectDB from "./src/config/db.config.js";

import authRoute from "./src/routes/authRoute.js";
import userRoute from "./src/routes/userRoute.js";
import postRoute from "./src/routes/postRoute.js";
import commentRoute from "./src/routes/commentRoute.js";
import storyRoute from "./src/routes/StoryRoute.js";
import followRoute from "./src/routes/followRoutes.js";
import msgRoute from "./src/routes/msgRoute.js";

import { setupSocket } from "./src/sockets/socket.js";

const app = express();

const server = http.createServer(app);
setupSocket(server);

app.get("/", (req, res) => {
  res.status(200).send("talking with Server...");
});

const PORT = process.env.PORT || 5000; // Good fallback practice
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:3000"];

app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use("/api/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/stories", storyRoute);
app.use("/comments", commentRoute);
app.use("/follow", followRoute);
app.use("/msg", msgRoute);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON received:", err.message);
    return res
      .status(400)
      .json({ message: "Invalid JSON format in request body" });
  }
  next(err);
});

// Server boot
server.listen(PORT, () => {
  console.log(`Server is running at PORT : ${PORT}`);
  connectDB();
});
