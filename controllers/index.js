// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
const axios = require("axios");
const ROOT_URL = "https://www.alphavantage.co/query?";
// 7OAJN4O8XTRU7MBG
const API_KEY = "7OAJN4O8XTRU7MBG";
const Stock = require("../models/stock");

exports.getPrice = async function(req, res, next) {
  async function compareStocks(stocks) {
    const requests = stocks.map(async stock => {
      const response = await axios.get(
        `${ROOT_URL}function=GLOBAL_QUOTE&symbol=${stock}&apikey=${API_KEY}`
      );
      const { ["01. symbol"]: symbol, ["05. price"]: price } = response.data[
        "Global Quote"
      ];
      const foundStock = await Stock.find({ stock: symbol }).populate("likes");
      const likes = foundStock.length > 0 ? foundStock[0].likes.length : 0;
      return {
        symbol,
        price,
        likes
      };
    });
    console.log(requests);
    const comparison = await Promise.all(requests);
    return res.json({ comparison });
  }

  // check if multiple stocks inputted for comparison
  if (Array.isArray(req.query.stock)) {
    return compareStocks(req.query.stock);
  }

  // make request for current stock value
  const request = await axios.get(
    `${ROOT_URL}function=GLOBAL_QUOTE&symbol=${
      req.query.stock
    }&apikey=${API_KEY}`
  );
  if (
    request.data.Note &&
    request.data.Note ===
      "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency."
  ) {
    next(new Error("Currently over allocated api calls. Try again soon."));
  }
  // get info from data
  const price = request.data["Global Quote"]["05. price"];
  const symbol = request.data["Global Quote"]["01. symbol"];
  const ip = req.ip;
  // search db if stock already added
  const lookup = await Stock.find({ stock: symbol });
  // check if like wanting to be added
  const likes = req.query.like === "true" ? 1 : 0;
  // if stock not in db yet - create an entry
  let response;
  if (lookup.length === 0) {
    const addStock = {
      stock: symbol
    };
    if (likes) addStock.likes = { ip };

    const newStock = await Stock.create({ ...addStock });
    response = {
      stock: newStock.stock,
      price,
      likes: newStock.likes.length
    };
  } else {
    // if user has liked in query
    let newLikes = lookup[0].likes.length;
    if (likes) {
      const stockPop = await Stock.find({ stock: symbol }).populate("likes");
      const stockLikes = stockPop[0].likes;
      // check if ip is already in likes & add if not
      const ipCheck = stockLikes.some(like => like.ip === ip);
      if (!ipCheck) {
        stockPop[0].likes.push({ ip: ip });
        stockPop[0].save();
        newLikes++;
      }
    }
    // grab info from stock lookup
    response = {
      stock: lookup[0].stock,
      price,
      likes: newLikes
    };
  }
  return res.json(response);
};
