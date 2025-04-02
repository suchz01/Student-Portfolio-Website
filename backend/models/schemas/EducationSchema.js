const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: true,
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
  marks: {
    type: String,
    default: "",
  },
  gpa: {
    type: Number,
    default: null,
  },
  percentage: {
    type: Number,
    default: null,
  },
  stream: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
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

module.exports = EducationSchema; 