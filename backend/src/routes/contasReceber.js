const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Contas Receber endpoint" });
});

module.exports = router;
