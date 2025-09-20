require("dotenv").config();
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ContractSchema = new mongoose.Schema({
  contractNo: String,
  billToAddress: {
    name: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Contract = mongoose.model("Contract", ContractSchema);

const ServiceSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Types.ObjectId,
    ref: "Contract",
  },
  qr: String,
});
const Service = mongoose.model("Service", ServiceSchema);

// Main function
(async () => {
  try {
    const start = new Date("2025-07-04");
    const end = new Date("2025-07-08T23:59:59");

    const contracts = await Contract.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();

    if (contracts.length === 0) {
      console.log("No contracts found between the specified dates.");
      process.exit(0);
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Contracts with QR");

    // Add Header
    sheet.columns = [
      { header: "Contract No", key: "contractNo", width: 20 },
      { header: "Client Name", key: "clientName", width: 30 },
      { header: "QR Image", key: "qrImage", width: 50 },
    ];

    // For each contract, find the first associated service with a QR image
    for (const contract of contracts) {
      const service = await Service.findOne({
        contract: contract._id,
        qr: { $ne: null },
      }).lean();

      sheet.addRow({
        contractNo: contract.contractNo,
        clientName: contract.billToAddress?.name || "",
        qrImage: service?.qr || "",
      });
    }

    await workbook.xlsx.writeFile("contracts_with_qr.xlsx");
    console.log(
      `✅ Exported ${contracts.length} contracts to contracts_with_qr.xlsx`
    );

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.connection.close();
  }
})();
