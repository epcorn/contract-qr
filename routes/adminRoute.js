const express = require("express");
const router = express.Router();
const { authorizeUser } = require("../middleware/auth");
const {
  addValues,
  allValues,
  toggleCode,
  getServicesForBilling, // <-- 1. IMPORT THE NEW FUNCTION
} = require("../controllers/adminController");

// This route now correctly handles both POST and GET for /api/admin
router.route("/").post(authorizeUser("Admin"), addValues).get(allValues);

router.post("/:id/code", toggleCode);

// 2. ADD THE NEW ROUTE FOR BILLING SERVICES
router
  .route("/billing-services")
  .get(authorizeUser("Sales", "Admin", "Back Office"), getServicesForBilling);

module.exports = router;
