const express = require("express");
const router = express.Router();
const { authorizeUser } = require("../middleware/auth");
const {
  addValues,
  allValues,
  toggleCode,
} = require("../controllers/adminController");

// Define routes separately for better readability
router.post("/", authorizeUser("Admin"), addValues);
router.get("/", allValues);
router.post("/:id/code", toggleCode);

module.exports = router;
