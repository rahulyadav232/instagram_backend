const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const origin = ["http://localhost:5173"];

const PORT = 3001;

//   --------------DATABASE CONNECTION----------------
const connect = require("./config/database");
connect
  .then(() => {
    console.log("Successfully Connected to Database");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
//   --------------DATABASE CONNECTION----------------

// -------------------ROUTES-------------------------

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");

app.use(cors({ origin, credentials: true }));
app.use(cookieParser());

app.use(express.json()); // for parsing application/json

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);

app.get("/check", (req, res) => {
  console.log(req.cookies);
  res.send("ok");
});

// -------------------ROUTES-------------------------

app.get("/", (req, res) => {
  res.send("Instagram Clone API");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
