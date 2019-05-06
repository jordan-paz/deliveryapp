const express = require("express");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Connect database
connectDB();

// init middleware
app.use(express.json({ extended: false }));

// Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/orders", require("./routes/api/orders"));
app.use("/api/products", require("./routes/api/products"));
app.use("/api/drivers", require("./routes/api/drivers"));
app.use("/api/auth", require("./routes/api/auth"));

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server started. Listening on port ${PORT}`)
);
