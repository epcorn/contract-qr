const express = require("express");
const router = express.Router();
const { authorizeUser } = require("../middleware/auth");
const {
  addValues,
  allValues, // <-- Import allValues
  toggleCode,
} = require("../controllers/adminController");

// This route now correctly handles both POST and GET for /api/admin
router.route("/").post(authorizeUser("Admin"), addValues).get(allValues);

router.post("/:id/code", toggleCode);

module.exports = router;
