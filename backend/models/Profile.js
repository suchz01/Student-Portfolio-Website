const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  subject: {
    type: String,
    default: "",
  },
  profileId: {
    type: String,
    unique: true,
    default: "",
  },
  aboutMe: {
    type: String,
    default: "",
  },
  projects: [
    {
      name: {
        type: String,
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
    },
  ],
  experience: [
    {
      companyName: {
        type: String,
        default: "",
      },
      jobRole: {
        type: String,
        default: "",
      },
      time: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
    },
  ],
  certification: [
    {
      instituteName: {
        type: String,
        default: "",
      },
      time: {
        type: String,
        default: "",
      },
      desc: {
        type: String,
        default: "",
      },
    },
  ],
  education: [
    {
      instituteName: {
        type: String,
        default: "",
      },
      time: {
        type: String,
        default: "",
      },
      marks: {
        type: String,
        default: "",
      },
      stream: {
        type: String,
        default: "",
      },
    },
  ],
  extracurricular: {
    type: [String],
    default: [],
  },
  phone: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  testedSkills: [
    {
      skill: {
        type: String,
        default: "",
      },
      dateTested: {
        type: Date,
        default: null,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
  ],
  codeChef: {
    username: { type: String, default: "" },
    rating: {
      type: Number,
      default: 0,
    },
  },
  leetCode: {
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
  badges: [
    {
      name: {
        type: String,
        default: "",
      },
      skills: {
        type: [String],
        default: [],
      },
    },
  ],
});

module.exports = mongoose.model("UserProfile", schema);
