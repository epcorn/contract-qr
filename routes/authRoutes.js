const express = require("express");
const router = express.Router();
const { authorizeUser, authenticateUser } = require("../middleware/auth");

const { register, login } = require("../controllers/authController");
const {
  serviceCards,
  contractDetails,
  contractServices,
  createServiceReport,
  getServicesForBilling, // <-- Important: Import the new function
} = require("../controllers/adminController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/serviceCard").get(serviceCards);
router.route("/contractDetails").get(contractDetails);
router.route("/contractServices").get(contractServices);

// The new, dedicated route for the billing page belongs here
router.route("/billing-services").get(getServicesForBilling);

router
  .route("/ticketReport/:id")
  .post(authenticateUser, authorizeUser("Admin"), createServiceReport);

module.exports = router;
