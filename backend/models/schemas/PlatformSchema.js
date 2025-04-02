const mongoose = require('mongoose');

const CodeChefSchema = new mongoose.Schema({
  username: { 
    type: String, 
    default: "" 
  },
  rating: {
    type: Number,
    default: 0,
  },
  stars: {
    type: Number,
    default: 0
  },
  globalRank: {
    type: Number,
    default: null
  },
  countryRank: {
    type: Number,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const LeetCodeSchema = new mongoose.Schema({
  username: {
    type: String,
    default: "",
  },
  totalSolved: {
    type: Number,
    default: 0,
  },
  easySolved: {
    type: Number,
    default: 0,
  },
  mediumSolved: {
    type: Number,
    default: 0,
  },
  hardSolved: {
    type: Number,
    default: 0,
  },
  ranking: {
    type: Number,
    default: null
  },
  contributionPoints: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Schema for GitHub stats
const GitHubSchema = new mongoose.Schema({
  username: {
    type: String,
    default: ""
  },
  repositories: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  stars: {
    type: Number,
    default: 0
  },
  contributions: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  CodeChefSchema,
  LeetCodeSchema,
  GitHubSchema
}; 