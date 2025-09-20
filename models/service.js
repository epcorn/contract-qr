const mongoose = require("mongoose");

// Define a separate schema for the counter
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

const ServiceSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      required: [true, "Please select frequency"],
    },
    service: {
      type: [String],
      required: [true, "Please provide service name"],
    },
    serviceDue: [String],
    image: {
      type: String,
    },
    card: {
      type: String,
    },
    qr: {
      type: String,
    },
    chemicals: [String],
    area: {
      type: String,
    },
    business: {
      type: String,
    },
    serviceReport: {
      type: Boolean,
      default: false,
    },
    treatmentLocation: {
      type: String,
      required: [true, "Please provide treatment location"],
    },
    contract: {
      type: mongoose.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    serviceCardNumber: {
      type: Number,
      required: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// We will no longer use a pre('save') hook. Instead, we'll use a static method
// to create a new service and handle the numbering safely.
ServiceSchema.statics.createServiceWithNumber = async function (serviceData) {
  // Find the counter document for this contract. If it doesn't exist, create it.
  const counter = await Counter.findOneAndUpdate(
    { _id: serviceData.contract.toString() },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Assign the new, unique serviceCardNumber to the service data.
  serviceData.serviceCardNumber = counter.seq;

  // Create and return the new service document.
  return this.create(serviceData);
};

ServiceSchema.virtual("serviceReports", {
  ref: "ServiceReport",
  localField: "_id",
  foreignField: "service",
  justOne: false,
});

module.exports = mongoose.model("Service", ServiceSchema);
