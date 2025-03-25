const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  commentsList: {
    type: String,
  },
  sales: {
    type: String,
  },
  business: {
    type: String,
  },
  serviceChemicals: {
    label: String,
    value: String,
    chemical: String,
  },
  contractCode: {
    name: String,
    active: {
      type: Boolean,
    },
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
