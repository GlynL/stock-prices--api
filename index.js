const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
// DB = mongodb://glyn:UPubbfH40VHn@ds051007.mlab.com:51007/stock-prices
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
// const Stocks = require("./models/stock");
// Stocks.deleteMany({}, () => console.log("all stocks removed"));
// Stocks.collection.dropIndexes();

app.use("/api/stock-prices", routes);

app.get("/", (req, res) => res.render("index"));

app.listen(PORT, () => `server listening at ${PORT}`);
