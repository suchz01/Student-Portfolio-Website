const mongoose = require('mongoose');

const TestedSkillSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
    default: "",
  },
  dateTested: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'easy'
  },
  testType: {
    type: String,
    default: ""
  },
  certificationUrl: {
    type: String,
    default: ""
  }
});

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: ""
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze',
    // Bronze: User has the badge but no skills tested
    // Silver: At least 1/3 of the badge skills have been tested
    // Gold: At least 2/3 of the badge skills have been tested
    // Platinum: All skills in the badge have been tested
  }
});

module.exports = {
  TestedSkillSchema,
  BadgeSchema
}; 