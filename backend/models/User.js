const mongoose = require('mongoose');
const UserSchema = require('./schemas/UserSchema');
const { TestedSkillSchema, BadgeSchema } = require('./schemas/SkillSchema');
const ProjectSchema = require('./schemas/ProjectSchema');
const ExperienceSchema = require('./schemas/ExperienceSchema');
const EducationSchema = require('./schemas/EducationSchema');
const CertificationSchema = require('./schemas/CertificationSchema');
const { CodeChefSchema, LeetCodeSchema, GitHubSchema } = require('./schemas/PlatformSchema');

// Create a combined User Profile Schema
const ProfileSchema = new mongoose.Schema({
  // Basic user information
  ...UserSchema.obj,
  
  // Skills
  skills: {
    type: [String],
    default: [],
  },
  testedSkills: [TestedSkillSchema],
  badges: [BadgeSchema],
  
  // Education and experience
  projects: [ProjectSchema],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  certification: [CertificationSchema],
  
  // Extra-curricular activities
  extracurricular: {
    type: [String],
    default: [],
  },
  
  // External platform integration
  codeChef: CodeChefSchema,
  leetCode: LeetCodeSchema,
  github: GitHubSchema
});

// Add indexing for faster queries - We already have a unique index on profileId in UserSchema
ProfileSchema.index({ 'skills': 1 });

// Virtual property to get the full name from the name field
ProfileSchema.virtual('fullName').get(function() {
  return this.name || 'Anonymous User';
});

// Virtual property to get the active projects
ProfileSchema.virtual('activeProjects').get(function() {
  return this.projects.filter(project => project.isActive);
});

// Virtual property to get current education
ProfileSchema.virtual('currentEducation').get(function() {
  return this.education.filter(edu => edu.isCurrent);
});

// Virtual property to get current job
ProfileSchema.virtual('currentJob').get(function() {
  return this.experience.filter(exp => exp.isCurrent);
});

// Define statics for common queries
ProfileSchema.statics.findByProfileId = function(profileId) {
  return this.findOne({ profileId });
};

ProfileSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// Export the model
module.exports = mongoose.model('UserProfile', ProfileSchema); 