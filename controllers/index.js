// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
const axios = require("axios");
const ROOT_URL = "https://www.alphavantage.co/query?";
const API_KEY = "7OAJN4O8XTRU7MBG";

exports.getPrice = async function(req, res, next) {
  const data = await axios.get(
    `${ROOT_URL}function=GLOBAL_QUOTE&symbold=${
      req.params.stock
    }&apikey=${API_KEY}`
  );
};
