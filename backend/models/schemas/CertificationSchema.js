const mongoose = require('mongoose');

const CertificationSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: true,
    default: "",
  },
  certificateName: {
    type: String,
    default: ""
  },
  issueDate: {
    type: Date,
    default: null,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  credentialId: {
    type: String,
    default: "",
  },
  credentialURL: {
    type: String,
    default: "",
  },
  desc: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: []
  }
});

module.exports = CertificationSchema; 