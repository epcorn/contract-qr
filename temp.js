require("dotenv").config();
const mongoose = require("mongoose");
const ServiceReport = require("./models/serviceReport"); // Adjust path as needed

/**
 * Fetches all unique contract numbers from service reports created between
 * September 1st and September 15th for the current year.
 * @returns {Promise<Array>} - An array of unique contract numbers.
 */
const getContractNumbersInSeptember = async () => {
  try {
    // 1. Connect to the MongoDB database
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully!");

    // Set the start and end dates for the query
    const year = new Date().getFullYear();
    const startDate = new Date(`${year}-09-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-09-15T23:59:59.999Z`);

    // 2. Find all service reports within the specified date range and select only the 'contract' field
    const reports = await ServiceReport.find(
      {
        serviceDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      { contract: 1, _id: 0 } // Projection to include only the 'contract' field and exclude '_id'
    ).exec();

    // 3. Extract and get unique contract numbers
    const contractNumbers = reports.map((report) => report.contract);
    const uniqueContractNumbers = [...new Set(contractNumbers)];

    console.log(
      `Found ${uniqueContractNumbers.length} unique contract numbers for service reports between September 1st and 15th, ${year}.`
    );

    return uniqueContractNumbers;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  } finally {
    // 4. Disconnect from the database
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

// Example usage:
getContractNumbersInSeptember().then((contractNumbers) => {
  // Use JSON.stringify to print the entire array without truncation
  console.log(
    "Unique Contract Numbers:",
    JSON.stringify(contractNumbers, null, 2)
  );
});
