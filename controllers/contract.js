const Contract = require("../models/contract");
const Service = require("../models/service"); // <-- IMPORT THE SERVICE MODEL
const { BadRequestError } = require("../errors");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { Parser } = require("json2csv");
const moment = require("moment");
const ExcelJS = require("exceljs");
const path = require("path");

const getAllContracts = async (req, res) => {
  const { search, searchSD, searchED } = req.query;
  console.log("Request received");

  try {
    console.time("getAllContracts");

    let contracts;
    console.time("find-all-contracts");
    contracts = await Contract.find({}).sort("-createdAt").limit(100);
    console.timeEnd("find-all-contracts");

    if (search) {
      console.time("find-with-search");
      contracts = await Contract.find({
        $or: [
          { contractNo: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
          { "shipToAddress.name": { $regex: search, $options: "i" } },
          { "billToAddress.name": { $regex: search, $options: "i" } },
        ],
      }).sort("-createdAt");
      console.timeEnd("find-with-search");
    }

    let renewalLink;

    if (searchSD && searchED) {
      console.time("find-with-date-range");
      contracts = await Contract.find({
        endDate: {
          $gte: new Date(searchSD),
          $lte: new Date(searchED),
        },
      }).sort("-createdAt");
      console.timeEnd("find-with-date-range");

      console.log("Generating Renewal File");
      console.time("generate-renewal-file");
      renewalLink = await generateRenewalFile(contracts);
      console.timeEnd("generate-renewal-file");
    }

    contracts = contracts.slice(0, 100);
    console.timeEnd("getAllContracts");

    res.status(200).json({ contracts, len: contracts.length, renewalLink });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const createContract = async (req, res) => {
  const { contractNo, type, startDate } = req.body;

  try {
    if (type === "NC") {
      const contractAlreadyExists = await Contract.findOne({ contractNo });
      if (contractAlreadyExists) {
        throw new BadRequestError("Contract Number Already Exists");
      }
    }

    if (type === "RC") {
      const existingContracts = await Contract.find({ contractNo });

      const overlap = existingContracts.some((contract) => {
        return new Date(startDate) <= new Date(contract.endDate);
      });

      if (overlap) {
        throw new BadRequestError(
          "RC contract overlaps with an existing contract having the same number"
        );
      }
    }

    const contract = await Contract.create({ ...req.body });
    res.status(201).json({ contract });
  } catch (error) {
    res.status(500).json({ msg: error.message || "Something went wrong" });
    console.log(error);
  }
};

const generateRenewalFile = async (contracts) => {
  const month = moment(contracts.endDate).format("MMMM YYYY");
  const fileName = `Renewal report of ${month}.csv`;

  const fields = [
    { label: "Contract Number", value: "contractNo" },
    { label: "Contractee Name", value: "billToAddress.name" },
    { label: "Sales Associate", value: "sales" },
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(contracts);

  fs.writeFileSync(path.resolve(__dirname, "../files/", fileName), csv);
  const result = await cloudinary.uploader.upload(`files/${fileName}`, {
    resource_type: "raw",
    use_filename: true,
    folder: "service-reports",
  });
  fs.unlinkSync(`./files/${fileName}`);
  return result.secure_url;
};

const fileUpload = async (req, res) => {
  const { id } = req.params;
  const { date, fileName, description } = req.body;
  try {
    if (!req.files) {
      return res.status(400).json({ msg: "No file found" });
    }

    const docFile = req.files.doc;
    const docPath = path.join(__dirname, "../files/" + `${docFile.name}`);
    await docFile.mv(docPath);

    const result = await cloudinary.uploader.upload(`files/${docFile.name}`, {
      resource_type: "raw",
      use_filename: true,
      folder: "mcd",
    });

    const contact = await Contract.findOne({ _id: id });

    contact.document.push({
      date: date,
      fileName: fileName,
      description: description,
      file: result.secure_url,
    });

    await contact.save();

    fs.unlinkSync(`./files/${docFile.name}`);
    return res.status(200).json({ msg: "File has been uploaded" });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const deleteFile = async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await Contract.findOne({ _id: id });
    contact.document = req.body;

    await contact.save();
    return res.status(200).json({ msg: "File has been deleted" });
  } catch (error) {
    console.log(error);
  }
};

const getContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findOne({ _id: id }).populate("services");
    if (!contract) {
      return res.status(400).json({ msg: "no contract found" });
    }

    res.status(200).json({ contract, len: contract.services.length });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ contract });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findOne({ _id: id });
    if (!contract) {
      return res.status(400).json({ msg: "no contract found" });
    }
    await contract.remove();
    res.status(200).json({ msg: "Success! Contract removed." });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const testingReportBLR = async (req, res) => {
  try {
    // Populate contract -> services -> serviceReports
    const contracts = await Contract.find({ branch: "BLR - 1" }).populate({
      path: "services", // Populate the services related to the contract
      populate: {
        path: "serviceReports", // Populate the service reports related to each service
      },
    });
    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ msg: "No contracts found for BLR - 1" });
    }
    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Service Reports");

    // Define headers
    worksheet.columns = [
      { header: "Contract No", key: "contractNo", width: 15 },
      { header: "Bill To Name", key: "billToName", width: 20 },
      { header: "Bill To Address", key: "billToAddress", width: 30 },
      { header: "Ship To Name", key: "shipToName", width: 20 },
      { header: "Ship To Address", key: "shipToAddress", width: 30 },
      { header: "Service Name", key: "serviceName", width: 25 },
      { header: "Service Frequency", key: "serviceFrequency", width: 15 },
      { header: "Due Dates", key: "dueDates", width: 25 },
      { header: "Service Report Date", key: "serviceReportDate", width: 15 },
    ];

    // Populate rows
    contracts.forEach((contract) => {
      contract.services.forEach((service) => {
        service.serviceReports.forEach((report) => {
          worksheet.addRow({
            contractNo: contract?.contractNo,
            billToName: contract?.billToAddress?.name || "N/A",
            billToAddress: contract?.billToAddress
              ? `${contract?.billToAddress?.address1}, ${contract?.billToAddress.city}, ${contract.billToAddress.pincode}`
              : "N/A",
            shipToName: contract?.shipToAddress?.name || "N/A",
            shipToAddress: contract?.shipToAddress
              ? `${contract.shipToAddress?.address1}, ${contract.shipToAddress.city}, ${contract.shipToAddress.pincode}`
              : "N/A",
            serviceName: service?.service.join(", "),
            serviceFrequency: service?.frequency,
            dueDates: service?.serviceDue.join(", "),
            serviceReportDate: report?.serviceDate
              ? report?.serviceDate
              : "N/A",
          });
        });
      });
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Service_Reports.xlsx"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const updateBillingConfig = async (req, res) => {
  const { id: contractId } = req.params;
  const { billingType, singleBillingConfig, multiBillingConfig } = req.body;

  console.log("updateBillingConfig called with:", {
    contractId,
    billingType,
    singleBillingConfig,
    multiBillingConfig,
  });

  try {
    // Step 1: Validate input data
    if (!billingType || !["single", "multi"].includes(billingType)) {
      throw new BadRequestError("Invalid or missing billingType");
    }

    if (
      billingType === "single" &&
      (!singleBillingConfig || !singleBillingConfig.frequencyType)
    ) {
      throw new BadRequestError("singleBillingConfig is missing or invalid");
    }

    if (
      billingType === "multi" &&
      multiBillingConfig &&
      !Array.isArray(multiBillingConfig)
    ) {
      throw new BadRequestError("multiBillingConfig must be an array");
    }

    // Step 2: Find and update the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      console.log("Contract not found:", contractId);
      return res
        .status(404)
        .json({ msg: `No contract with id: ${contractId}` });
    }

    contract.billingType = billingType;
    contract.singleBillingConfig =
      billingType === "single" ? singleBillingConfig : {};
    contract.multiBillingConfig =
      billingType === "multi" ? multiBillingConfig : [];

    await contract.save();
    console.log("Contract saved with updated billing config:", {
      billingType: contract.billingType,
      singleBillingConfig: contract.singleBillingConfig,
      multiBillingConfig: contract.multiBillingConfig,
    });

    // Step 3: Update service billing months
    if (billingType === "single") {
      const finalMonths =
        singleBillingConfig.frequencyType === "Manual"
          ? singleBillingConfig.selectedManualMonths || []
          : singleBillingConfig.calculatedBillingMonths || [];

      if (!finalMonths.length) {
        console.warn(
          "No billing months provided for single billing:",
          singleBillingConfig
        );
      }

      const updateResult = await Service.updateMany(
        { contract: contractId },
        { $set: { billingMonths: finalMonths } }
      );
      console.log("Service update result for single billing:", updateResult);
    } else if (billingType === "multi") {
      if (!multiBillingConfig || multiBillingConfig.length === 0) {
        console.log("No multiBillingConfig provided, clearing billing months");
        const updateResult = await Service.updateMany(
          { contract: contractId },
          { $set: { billingMonths: [] } }
        );
        console.log(
          "Service update result for empty multi billing:",
          updateResult
        );
      } else {
        // Validate service IDs
        const serviceIds = multiBillingConfig.map((config) => config.serviceId);
        const validServices = await Service.find({
          _id: { $in: serviceIds },
          contract: contractId,
        });
        const validServiceIds = validServices.map((s) => s._id.toString());
        const invalidServiceIds = serviceIds.filter(
          (id) => !validServiceIds.includes(id)
        );

        if (invalidServiceIds.length > 0) {
          console.warn(
            "Invalid service IDs in multiBillingConfig:",
            invalidServiceIds
          );
          throw new BadRequestError(
            `Invalid service IDs: ${invalidServiceIds.join(", ")}`
          );
        }

        const bulkOps = multiBillingConfig.map((config) => {
          const finalMonths =
            config.frequencyType === "Manual"
              ? config.selectedManualMonths || []
              : config.calculatedBillingMonths || [];
          console.log(
            `Preparing bulk update for service ${config.serviceId}:`,
            finalMonths
          );
          return {
            updateOne: {
              filter: { _id: config.serviceId, contract: contractId },
              update: { $set: { billingMonths: finalMonths } },
            },
          };
        });

        if (bulkOps.length > 0) {
          const bulkResult = await Service.bulkWrite(bulkOps);
          console.log("Bulk write result for multi billing:", bulkResult);
        } else {
          console.log("No bulk operations to execute for multi billing");
        }
      }
    }

    // Step 4: Return updated contract for verification
    const updatedContract = await Contract.findById(contractId).populate(
      "services"
    );
    res.status(200).json({
      msg: "Billing configuration saved successfully.",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Error updating billing config:", error);
    res.status(error.statusCode || 500).json({
      msg: error.message || "Server error while saving billing configuration.",
    });
  }
};
module.exports = {
  getAllContracts,
  createContract,
  getContract,
  deleteContract,
  updateContract,
  fileUpload,
  deleteFile,
  testingReportBLR,
  updateBillingConfig, // <-- EXPORT THE NEW FUNCTION
};
