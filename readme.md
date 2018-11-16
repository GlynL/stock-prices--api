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
    const request = await Promise.all(requests);


async function always returns a promise!
  if you return a non-promise - automatically wrapped in a resolved promise w/ that vlaue
.map() is synchronous and will just execute(call) the callback function on all array items
  if these are asyncrhonous you won't get the value - just a pending promise
  wrap in a await promise.all() to resolve all to values
   
