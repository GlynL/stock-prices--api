const express = require("express");
const router = express.Router();
const { getPrice } = require("../controllers");

router.get("/", getPrice);

module.exports = router;
