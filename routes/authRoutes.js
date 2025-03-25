const express = require("express");
const router = express.Router();
const { authorizeUser, authenticateUser } = require("../middleware/auth");

const { register, login } = require("../controllers/authController");
const {
  serviceCards,
  contractDetails,
  contractServices,
  createServiceReport,
} = require("../controllers/adminController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/serviceCard").get(serviceCards);
router.route("/contractDetails").get(contractDetails);

//this for ticketNest
router.route("/contractServices").get(contractServices);
router
  .route("/ticketReport/:id")
  .post(authenticateUser, authorizeUser("Admin"), createServiceReport);
module.exports = router;
