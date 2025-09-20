require("dotenv").config();
const mongoose = require("mongoose");
const Contract = require("./models/contract"); // Adjust path
const Service = require("./models/service"); // Adjust path

// Main function to connect to DB and fix data
const fixServiceCardNumbers = async () => {
  try {
    // Connect to the database using the URI from the .env file
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully. Starting data fix...");

    const contracts = await Contract.find().select("_id");
    console.log(`Found ${contracts.length} contracts to process.`);

    for (const contract of contracts) {
      let counter = 1;
      const services = await Service.find({ contract: contract._id }).sort({
        _id: 1,
      });

      if (services.length > 0) {
        console.log(`\nProcessing contract ID: ${contract._id}`);
        for (const service of services) {
          const result = await Service.updateOne(
            { _id: service._id },
            { $set: { serviceCardNumber: counter } }
          );
          if (result.modifiedCount > 0) {
            console.log(
              ` - Updated service ${service._id}: set serviceCardNumber to ${counter}`
            );
          }
          counter++;
        }
      }
    }

    console.log(
      "\nData fix complete. All serviceCardNumbers have been updated."
    );
  } catch (error) {
    console.error("An error occurred during the data fix:", error);
    process.exit(1);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

fixServiceCardNumbers();
