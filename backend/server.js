const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Example route
app.get("/", (req, res) => res.send("API Running"));
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

app.listen(process.env.PORT, () => console.log(`Server on ${process.env.PORT}`));
