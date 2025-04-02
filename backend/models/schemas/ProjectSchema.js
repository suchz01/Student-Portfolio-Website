const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  link: {
    type: String,
    default: "",
  },
  technologies: {
    type: [String],
    default: [],
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

module.exports = ProjectSchema; 