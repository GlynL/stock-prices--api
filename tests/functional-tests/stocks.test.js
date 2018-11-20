// https://github.com/freeCodeCamp/boilerplate-project-stockchecker/blob/gomix/tests/2_functional-tests.js

const axios = require("axios");

const URL = "http://localhost:8080/api/stock-prices";

describe(`GET /api/stock-prices`, () => {
  test("1 stock", async () => {
    expect.assertions(2);
    const response = await axios.get(`${URL}`, { params: { stock: "goog" } });
    expect(response.status).toBe(200);
    expect(response.data.stock).toBe("GOOG");
  });

  test("1 stock with like", async () => {
    expect.assertions(1);
    const response = await axios.get(`${URL}`, {
      params: { stock: "goog", like: "true" }
    });
    expect(response.status).toBe(200);
  });

  test("2 stocks", async () => {
    expect.assertions(4);
    const response = await axios.get(`${URL}`, {
      params: { stock: "goog", stock: "msft" }
    });
    expect(response.status).toBe(200);
    expect(typeof response.data.comparison).toBe("array");
    expect(response.data.comparison[0].stock).toBe("GOOG");
    expect(response.data.comparison[1].stock).toBe("MSFT");
  });
});
