const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  profilePicture:{
    type:String,
    default:"https://static.thenounproject.com/png/4154905-200.png",
  },
  role: {
    type: String,
    default: "",
  },  
  subjectOfInterest: {
    type: String,
    default: "",
  },
  profileId: {
    type: String,
    required: true,
    unique: true,
  },
  aboutMe: {
    type: String,
    default: "",
  },
  phone: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    default: "",
  },
  github: {
    type: String,
    default: "",
  },
  linkedin: {
    type: String,
    default: "",
  },
  currentGoal: {
    role: {
      type: String,
      default: "",
    },
    skill: {
      type: [String],
      default: [],
    },
  },
  // Timestamp fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = UserSchema; 