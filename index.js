const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

const routes = require("./routes");

app.use(helmet());
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "html");
app.use(express.static(__dirname + "/views"));

mongoose.set("debug", true);
mongoose.connect(
  process.env.DB || "mongodb://localhost/stock-prices",
  { useNewUrlParser: true }
);

mongoose.Promise = Promise;

// clear db for testing

app.get("/", (req, res) => res.render("index"));

app.use("/api", routes);

app.listen(PORT, () => `server listening at ${PORT}`);
