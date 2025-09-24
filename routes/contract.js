const express = require("express");
const router = express.Router();
const { authorizeUser } = require("../middleware/auth");
const contractController = require("../controllers/contract");

const {
  getAllContracts,
  getContract,
  createContract,
  deleteContract,
  updateContract,
  fileUpload,
  deleteFile,
  testingReportBLR,
  updateBillingConfig, // <-- IMPORT THE NEW CONTROLLER
} = contractController;

// Contract Routes
router.get("/", getAllContracts);
router.post(
  "/",
  authorizeUser("Sales", "Admin", "Back Office"),
  createContract
);
router.get("/:id", getContract);
router.delete("/:id", authorizeUser("Admin"), deleteContract);
router.patch("/:id", authorizeUser("Admin", "Sales"), updateContract);

// File Upload Routes
router.post("/uploadDoc/:id", authorizeUser("Sales", "Admin"), fileUpload);
router.patch("/uploadDoc/:id", authorizeUser("Admin"), deleteFile);

// --- NEW ROUTE FOR BILLING CONFIGURATION ADDED ---
router.patch(
  "/:id/billing",
  authorizeUser("Sales", "Admin", "Back Office"),
  updateBillingConfig
);
// --- END NEW ROUTE ---

//New Routes
router.get("/test/:id", authorizeUser("Admin"), testingReportBLR);

module.exports = router;
