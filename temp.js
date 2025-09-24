const mongoose = require("mongoose");
const moment = require("moment");
require("dotenv").config();

// Adjust the paths to your model files as needed
const Contract = require("./models/contract");
const Service = require("./models/service");

/**
 * Fetches all service cards and the complete billing configuration for a specific contract number.
 * @param {string} contractNo - The contract number to search for (e.g., "A/17311").
 */
const getServicesForContract = async (contractNo) => {
  if (!contractNo) {
    throw new Error("Contract number is required.");
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected...");

    console.log(`\nSearching for contract: ${contractNo}`);

    // 1. Find the contract and select all necessary billing fields
    const contract = await Contract.findOne({ contractNo: contractNo }).select(
      "contractNo billingType singleBillingConfig multiBillingConfig"
    );

    if (!contract) {
      console.log(`Contract "${contractNo}" not found.`);
      return null;
    }
    console.log(
      `Found contract with ID: ${contract._id}. Fetching associated services...`
    );

    // 2. Find all services linked to that contract's _id
    const services = await Service.find({ contract: contract._id })
      .select("serviceCardNumber billingMonths")
      .sort({ serviceCardNumber: 1 });

    console.log(
      `Found ${services.length} service card(s) for ${contractNo}. Formatting output...`
    );

    // 3. Format the service-specific details
    const serviceDetails = services.map((service) => {
      return {
        serviceCardNumber: service.serviceCardNumber || "N/A",
        calculatedBillingMonths:
          service.billingMonths && service.billingMonths.length > 0
            ? service.billingMonths.join(", ")
            : "No specific billing months assigned.",
      };
    });

    // 4. Structure the final comprehensive response object
    const responseData = {
      contractNo: contract.contractNo,
      billingSetup: {
        type: contract.billingType || "Not Specified",
        // Conditionally show the relevant config based on the billing type
        singleBillingConfig:
          contract.billingType === "single"
            ? contract.singleBillingConfig
            : "N/A (Billing type is not 'single')",
        multiBillingConfig:
          contract.billingType === "multi"
            ? contract.multiBillingConfig
            : "N/A (Billing type is not 'multi')",
      },
      serviceCards: serviceDetails,
    };

    return responseData;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// --- Script Runner ---
const run = async () => {
  const contractToFind = "A/17311";
  const result = await getServicesForContract(contractToFind);

  if (result) {
    console.log(
      `\n--- Full Billing Report for Contract: ${result.contractNo} ---`
    );
    console.log(JSON.stringify(result, null, 2));
    console.log("--- End of Report ---\n");
  }
};

run();
