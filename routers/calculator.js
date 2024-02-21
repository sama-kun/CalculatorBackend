const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    res.send("Hello world!!!");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
