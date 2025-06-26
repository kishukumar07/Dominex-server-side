import express from "express";
import cors from "cors";
import env from "dotenv";
env.config();
import connectDB from "./src/config/db.config.js";

import authRoute from "./src/routes/authRoute.js";
import userRoute from "./src/routes/userRoute.js";
import postRoute from "./src/routes/postRoute.js";
import commentRoute from "./src/routes/commentRoute.js";
import storyRoute from "./src/routes/StoryRoute.js";
//instance of express
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("talking with Server...");
});

const PORT = process.env.PORT;

const allowedOrigins = [
  "http://localhost:4500",
  "http://localhost:4600",
  "http://127.0.0.1:5500", //view file url
];

//middlewares
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
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ encoded: true, limit: "5mb" }));

//Routes
app.use("/api/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/stories", storyRoute);
app.use("/comments", commentRoute);

//Handle invalid JSON error // ✅ Error handler is last
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON received:", err.message);
    return res
      .status(400)
      .json({ message: "Invalid JSON format in request body" });
  }

  next(err); // pass to next error handler
});

//server
app.listen(PORT, () => {
  console.log(`Server is running at PORT : ${PORT}`);

  connectDB();
});
