// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
const axios = require("axios");
const ROOT_URL = "https://www.alphavantage.co/query?";
// 7OAJN4O8XTRU7MBG
const API_KEY = "7OAJN4O8XTRU7MBG";
const Stock = require("../models/stock");

function checkValidity(data) {
  // check if api has been overloaded and throw error if so.
  if (
    data.Note &&
    data.Note ===
      "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency."
  ) {
    throw new Error("Currently over allocated api calls. Try again soon.");
  }
  const stockData = data["Global Quote"];
  if (Object.keys(stockData).length === 0 && stockData.constructor === Object) {
    throw new Error("Invalid stock");
  }
}

async function compareStocks(stocks, res, next) {
  const requests = stocks.map(async stock => {
    try {
      const response = await axios.get(
        `${ROOT_URL}function=GLOBAL_QUOTE&symbol=${stock}&apikey=${API_KEY}`
      );
      checkValidity(response.data);
      const { ["01. symbol"]: symbol, ["05. price"]: price } = response.data[
        "Global Quote"
      ];
      const foundStock = await Stock.findOne({ stock: symbol });
      const likes = foundStock.likes.length;
      return {
        symbol,
        price,
        likes
      };
    } catch (err) {
      if (err.message === "Invalid stock") return { message: "Invalid stock" };
      if (
        (err.message = "Currently over allocated api calls. Try again soon.")
      ) {
        return {
          message: "Currently over allocated api calls. Try again soon."
        };
      }
      next(err);
    }
  });
  try {
    const comparison = await Promise.all(requests);
    return res.json({ comparison });
  } catch (err) {
    return next(err);
  }
}

async function addStock(symbol, ip, likes, price) {
  const addStock = {
    stock: symbol
  };
  if (likes) addStock.likes = { ip };

  const newStock = await Stock.create({ ...addStock });
  return {
    stock: newStock.stock,
    price,
    likes: newStock.likes.length
  };
}

function updateStock(likes, lookup, price) {
  // if user has liked in query
  if (likes) {
    // check if ip is already in likes & add if not
    const ipCheck = lookup.likes.some(like => like.ip === ip);
    if (!ipCheck) {
      lookup.likes.push({ ip: ip });
      lookup.save();
    }
  }
  // grab info from stock lookup
  return { stock: lookup.stock, price, likes: lookup.likes.length };
}

exports.getPrice = async function(req, res, next) {
  // check if multiple stocks inputted for comparison
  if (Array.isArray(req.query.stock)) {
    // returns res.json w/ info
    return compareStocks(req.query.stock, res, next);
  }

  try {
    // make request for current stock value
    const request = await axios.get(
      `${ROOT_URL}function=GLOBAL_QUOTE&symbol=${
        req.query.stock
      }&apikey=${API_KEY}`
    );

    // check request & stocks are valid
    checkValidity(request.data);

    // get info from response data
    const { ["01. symbol"]: symbol, ["05. price"]: price } = request.data[
      "Global Quote"
    ];
    // users ip
    const ip = req.ip;
    // search db if stock already added
    const lookup = await Stock.findOne({ stock: symbol });
    // check if like wanting to be added
    const likes = req.query.like === "true" ? 1 : 0;
    // if stock not in db yet - create an entry. otherwise update
    const response = lookup
      ? updateStock(likes, lookup, price)
      : await addStock(symbol, ip, likes, price);
    return res.json(response);
  } catch (err) {
    next(err);
    return res.json({ message: err.message });
  }
};
