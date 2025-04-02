const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    default: "",
  },
  jobRole: {
    type: String,
    required: true,
    default: "",
  },
  time: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  description: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: []
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: ""
  }
});

module.exports = ExperienceSchema; 