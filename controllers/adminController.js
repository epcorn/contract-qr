const Admin = require("../models/admin");
const ServiceReport = require("../models/serviceReport");
const Contract = require("../models/contract");
const Service = require("../models/service");

const addValues = async (req, res) => {
  try {
    const newData = await Admin.create(req.body);
    res.status(201).json({ msg: "Added successfully", data: newData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

const allValues = async (req, res) => {
  try {
    const allValues = await Admin.find({});
    res.status(200).json({ allValues });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

const serviceCards = async (req, res) => {
  const { contract } = req.query;
  try {
    const cont = await ServiceReport.find({ contract }).select(
      "contract serviceName image serviceDate"
    );
    if (cont.length <= 0)
      return res.status(404).json({ msg: "No Contract Found" });

    const cards = [];

    for (let i = cont.length - 1; i >= 0; i--) {
      if (cards.length > 0 && cont[i].image.length > 0) {
        let temp = cards.filter(
          (item) => item.serviceName === cont[i].serviceName
        );
        if (temp.length === 0) cards.push(cont[i]);
      } else {
        cards.push(cont[i]);
      }
    }
    res.status(200).json({ cards });
  } catch (error) {
    console.log(error);
  }
};

const contractDetails = async (req, res) => {
  const { search } = req.query;
  try {
    const contract = await Contract.findOne({ contractNo: search })
      .sort("-createdAt")
      .select(
        "contractNo billToAddress billToContact1 billToContact2 billToContact3 shipToAddress shipToContact1 shipToContact2 shipToContact3"
      );
    if (!contract) return res.status(404).json({ msg: "No Contract Found" });

    let billEmail = [],
      shipEmail = [];
    if (contract.billToContact1.email)
      billEmail.push(contract.billToContact1.email);
    if (contract.billToContact2.email)
      billEmail.push(contract.billToContact2.email);
    if (contract.billToContact3.email)
      billEmail.push(contract.billToContact3.email);

    if (contract.shipToContact1.email)
      shipEmail.push(contract.shipToContact1.email);
    if (contract.shipToContact2.email)
      shipEmail.push(contract.shipToContact2.email);
    if (contract.shipToContact3.email)
      shipEmail.push(contract.shipToContact3.email);

    const details = {
      number: contract.contractNo,
      billToName: contract.billToAddress.name,
      billToAddress: `${contract.billToAddress.address1},${contract.billToAddress.address2},${contract.billToAddress.address3},${contract.billToAddress.address4},${contract.billToAddress.nearBy},${contract.billToAddress.city},${contract.billToAddress.pincode}`,
      billToEmails: billEmail,
      shipToName: contract.shipToAddress.name,
      shipToAddress: `${contract.shipToAddress.address1},${contract.shipToAddress.address2},${contract.shipToAddress.address3},${contract.shipToAddress.address4},${contract.shipToAddress.nearBy},${contract.shipToAddress.city},${contract.shipToAddress.pincode}`,
      shipToEmails: shipEmail,
    };

    res.status(200).json({ details });
  } catch (error) {
    console.log(error);
  }
};

const contractServices = async (req, res) => {
  const { search } = req.query;
  try {
    const contracT = await Contract.findOne({ contractNo: search })
      .sort("-createdAt")
      .populate("services");

    if (!contracT) {
      return res.status(404).json({ msg: "No Contract Found" });
    }

    // Safely collect emails, removing any that are null or undefined
    const billEmail = [
      contracT.billToContact1?.email,
      contracT.billToContact2?.email,
      contracT.billToContact3?.email,
    ].filter(Boolean);

    const shipEmail = [
      contracT.shipToContact1?.email,
      contracT.shipToContact2?.email,
      contracT.shipToContact3?.email,
    ].filter(Boolean);

    // Helper function to safely construct the address string
    const formatAddress = (addr) => {
      if (!addr) return "";
      return [
        addr.address1,
        addr.address2,
        addr.address3,
        addr.address4,
        addr.nearBy,
        addr.city,
        addr.pincode,
      ]
        .filter(Boolean) // Remove any empty or null parts
        .join(", ");
    };

    // Safely construct the details object
    const details = {
      number: contracT.contractNo,
      billToName: contracT.billToAddress?.name,
      billToAddress: formatAddress(contracT.billToAddress),
      billToEmails: billEmail,
      shipToName: contracT.shipToAddress?.name,
      shipToAddress: formatAddress(contracT.shipToAddress),
      shipToEmails: shipEmail,
    };

    // Correctly transform the services array into the flat structure the frontend needs
    const services = contracT.services.flatMap((serviceDoc) =>
      serviceDoc.service
        .filter(Boolean) // Filter out any empty strings
        .map((serviceName) => ({
          name: serviceName,
          serviceId: serviceDoc._id,
        }))
    );

    res.status(200).json({ details, services });
  } catch (error) {
    console.error("Error fetching contract services:", error);
    // Send a meaningful error response
    res
      .status(500)
      .json({
        msg: "An unexpected server error occurred.",
        error: error.message,
      });
  }
};

// --- NEW, DEDICATED FUNCTION FOR THE BILLING PAGE ---
// --- FINAL, CORRECTED FUNCTION ---
const getServicesForBilling = async (req, res) => {
  try {
    const { search: contractNo } = req.query;

    if (!contractNo) {
      return res.status(400).json({ msg: "Contract number is required." });
    }

    // Step 1: Find the contract by its number just to get its unique _id.
    // Using a case-insensitive regex makes the search more reliable.
    const contract = await Contract.findOne({
      contractNo: { $regex: `^${contractNo}$`, $options: "i" },
    }).select("_id");

    // If no contract matches the number, it's not an error, just return an empty array.
    if (!contract) {
      return res.status(200).json({ services: [] });
    }

    // Step 2: Use the found contract's unique _id to find all associated services.
    // This is the most direct and reliable way to get the related documents.
    const services = await Service.find({ contract: contract._id });

    res.status(200).json({ services });
  } catch (error) {
    console.error("Error in getServicesForBilling:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};
const createServiceReport = async (req, res) => {
  const {
    params: { id: serviceId },
    body: { image, comments, completion, serviceDate },
  } = req;
  try {
    const service = await Service.findOne({ _id: serviceId }).populate({
      path: "contract",
      select:
        "billToContact1 billToContact2 billToContact3 shipToContact1 shipToContact2 shipToContact3 contractNo shipToAddress branch",
    });

    if (!service) {
      return res.status(404).json({ msg: "Service Card Not Found" });
    }
    service.serviceReport = true;

    await service.save();

    req.body.service = serviceId;
    const branch = service.contract.branch;
    req.body.branch = branch || "MUM - 1";

    const report = await ServiceReport.create({ ...req.body });
    res.status(200).json({ msg: report });
  } catch (error) {
    res.status(400).json({ msg: "There is some error" });
  }
};

const toggleCode = async (req, res) => {
  try {
    const { id } = req.params;
    const code = await Admin.findById(id);
    code.contractCode.active = !code.contractCode.active;
    code.save();
    res.status(200).json({ data: code });
  } catch (error) {
    res.status(400).json({ msg: "There is some error" });
  }
};

module.exports = {
  addValues,
  allValues,
  serviceCards,
  contractDetails,
  contractServices,
  getServicesForBilling, // <-- EXPORT THE NEW FUNCTION
  createServiceReport,
  toggleCode,
};
