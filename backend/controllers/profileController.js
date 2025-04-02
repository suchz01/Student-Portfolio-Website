const { UserProfile } = require('../models');

// Get or create a profile
exports.getProfile = async (req, res) => {
  const { profileId } = req.params;
  try {
    let profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      profile = new UserProfile({ profileId });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update a specific profile field
exports.updateProfileField = async (req, res) => {
  const { field } = req.params;
  const { profileId, value } = req.body;

  try {
    const allowedFields = [
      'name', 'aboutMe', 'projects', 'experience', 'certification', 'education', 'extracurricular', 'subject',
      'phone', 'email', 'skills', 'github', 'linkedin', 'currentGoal', 'badges', 'codeChef', 'leetCode','profilePicture'
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid field name' });
    }

    const update = { [field]: value };
    const profile = await UserProfile.findOneAndUpdate(
      { profileId },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    res.status(500).json({ message: `Error updating ${field}`, error: error.message });
  }
};

// Helper function for calculating badge progress - for consistent badge progress calculation
const calculateBadgeProgress = (badge, testedSkills) => {
  const badgeSkills = badge.skills || [];
  let badgeProgress = 0;
  const skillContribution = badgeSkills.length > 0 ? (100 / badgeSkills.length) : 0;
  
  badgeSkills.forEach(skill => {
    const testedSkill = testedSkills.find(ts => 
      ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
    );
    
    if (testedSkill) {
      // Normalize the level for contribution calculation
      const level = testedSkill.level?.toLowerCase();
      let normalizedLevel = level;
      
      // Map various level names to our three categories
      if (['hard', 'advanced', 'expert', 'pro', 'professional'].includes(level)) {
        // 3 stars - 100% contribution
        badgeProgress += skillContribution;
      } else if (['medium', 'intermediate', 'mid', 'moderate'].includes(level)) {
        // 2 stars - 60% contribution
        badgeProgress += skillContribution * 0.6;
      } else if (['easy', 'beginner', 'basic', 'entry', 'novice'].includes(level)) {
        // 1 star - 30% contribution  
        badgeProgress += skillContribution * 0.3;
      } else if (level) {
        // If we have a level but it doesn't match our known categories, try to guess
        if (level.includes('hard') || level.includes('adv') || level.includes('expert') || level.includes('pro')) {
          badgeProgress += skillContribution;
        } else if (level.includes('med') || level.includes('inter') || level.includes('mid')) {
          badgeProgress += skillContribution * 0.6;
        } else if (level.includes('easy') || level.includes('beg') || level.includes('bas') || level.includes('entry')) {
          badgeProgress += skillContribution * 0.3;
        } else {
          // Default to medium if we can't determine
          badgeProgress += skillContribution * 0.6;
        }
      }
    }
  });
  
  return badgeProgress;
};

// Helper function to set badge level based on progress
const setBadgeLevel = (badge, progress) => {
  if (progress >= 100 && badge.skills.length > 0) {
    badge.level = 'Platinum'; // Complete mastery
  } else if (progress >= 70) {
    badge.level = 'Gold';     // Advanced mastery
  } else if (progress >= 40) {
    badge.level = 'Silver';   // Intermediate mastery
  } else if (progress > 0) {
    badge.level = 'Bronze';   // Beginner mastery
  } else {
    badge.level = 'Bronze';   // Default to Bronze if no progress
  }
  
  return badge;
};

// Add badges to a profile
exports.addBadges = async (req, res) => {
  const { profileId, value } = req.body;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    value.forEach(badge => {
      const existingBadge = profile.badges.find(b => b.name === badge.name);
      if (!existingBadge) {
        profile.badges.push(badge);
      } else {
        existingBadge.skills = [...new Set([...existingBadge.skills, ...badge.skills])];
      }
    });

    // Calculate badge levels based on tested skills
    profile.badges.forEach(badge => {
      const badgeProgress = calculateBadgeProgress(badge, profile.testedSkills);
      setBadgeLevel(badge, badgeProgress);
    });

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error adding badges:', error);
    res.status(500).json({ message: 'Error adding badges', error: error.message });
  }
};

// Delete a specific project by index
exports.deleteProject = async (req, res) => {
  const { profileId, index } = req.params;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (index < 0 || index >= profile.projects.length) {
      return res.status(400).json({ error: 'Invalid project index' });
    }

    profile.projects.splice(index, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// Delete a specific experience by index
exports.deleteExperience = async (req, res) => {
  const { profileId, index } = req.params;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (index < 0 || index >= profile.experience.length) {
      return res.status(400).json({ error: 'Invalid experience index' });
    }

    profile.experience.splice(index, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ message: 'Error deleting experience', error: error.message });
  }
};

// Delete a specific education entry by index
exports.deleteEducation = async (req, res) => {
  const { profileId, index } = req.params;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (index < 0 || index >= profile.education.length) {
      return res.status(400).json({ error: 'Invalid education index' });
    }

    profile.education.splice(index, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ message: 'Error deleting education', error: error.message });
  }
};

// Delete a specific field item by index
exports.deleteFieldItem = async (req, res) => {
  const { profileId, field, index } = req.params;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!profile[field] || index < 0 || index >= profile[field].length) {
      return res.status(400).json({ error: 'Invalid field or index' });
    }

    profile[field].splice(index, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(`Error deleting ${field} item:`, error);
    res.status(500).json({ message: `Error deleting ${field} item`, error: error.message });
  }
};

// Update tested skills
exports.updateTestedSkills = async (req, res) => {
  const { profileId, testedSkill } = req.body;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Normalize the skill name to ensure consistent case handling
    if (testedSkill.skill) {
      testedSkill.skill = testedSkill.skill.trim();
    }
    
    // Normalize the level value based on the type of value received
    if (testedSkill.level) {
      // Map difficulty values to their normalized counterparts
      const levelMap = {
        'easy': 'easy',
        'medium': 'medium',
        'hard': 'hard',
        'beginner': 'easy',
        'intermediate': 'medium',
        'advanced': 'hard',
        'expert': 'hard'
      };
      
      const lowercaseLevel = testedSkill.level.toLowerCase();
      if (levelMap[lowercaseLevel]) {
        testedSkill.level = levelMap[lowercaseLevel];
      } else {
        // Fallback for any other values
        testedSkill.level = 'medium';
      }
    }

    // Check if this skill already exists (case-insensitive match)
    const existingSkillIndex = profile.testedSkills.findIndex(
      ts => ts.skill.toLowerCase() === testedSkill.skill.toLowerCase()
    );
    
    if (existingSkillIndex >= 0) {
      // Update the existing skill rather than adding a duplicate
      profile.testedSkills[existingSkillIndex] = testedSkill;
    } else {
      // Add new skill
      profile.testedSkills.push(testedSkill);
    }
    
    // After adding a new tested skill, recalculate badge levels
    profile.badges.forEach(badge => {
      const badgeProgress = calculateBadgeProgress(badge, profile.testedSkills);
      setBadgeLevel(badge, badgeProgress);
    });
    
    // Handle potential validation errors by using validateSync before saving
    const validationError = profile.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      
      // Create a new partial update to avoid the validation errors
      const updateResult = await UserProfile.updateOne(
        { profileId },
        { 
          $set: { 
            testedSkills: profile.testedSkills,
            badges: profile.badges
          } 
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        const updatedProfile = await UserProfile.findByProfileId(profileId);
        return res.json(updatedProfile);
      } else {
        return res.status(500).json({ 
          message: 'Failed to update profile with skills', 
          error: validationError.message 
        });
      }
    }
    
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error updating tested skills:', error);
    
    // Try using a partial update approach as fallback
    try {
      const profile = await UserProfile.findByProfileId(profileId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      const updateResult = await UserProfile.updateOne(
        { profileId },
        { 
          $push: { 
            testedSkills: testedSkill 
          } 
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        const updatedProfile = await UserProfile.findByProfileId(profileId);
        return res.json(updatedProfile);
      }
    } catch (fallbackError) {
      console.error('Fallback error update also failed:', fallbackError);
    }
    
    res.status(500).json({ message: 'Error updating tested skills', error: error.message });
  }
};

// Delete a tested skill
exports.deleteTestedSkill = async (req, res) => {
  const { profileId, skill } = req.params;

  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Find the index of the skill in testedSkills (case-insensitive)
    const skillIndex = profile.testedSkills.findIndex(
      (s) => s.skill.toLowerCase() === skill.toLowerCase()
    );

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found in testedSkills' });
    }

    // Get the skill ID before removing it
    const skillId = profile.testedSkills[skillIndex]._id;

    // Remove the skill from testedSkills array
    profile.testedSkills.splice(skillIndex, 1);

    // After removing a tested skill, recalculate badge levels
    profile.badges.forEach(badge => {
      const badgeProgress = calculateBadgeProgress(badge, profile.testedSkills);
      setBadgeLevel(badge, badgeProgress);
    });

    // Handle potential validation errors by using validateSync before saving
    const validationError = profile.validateSync();
    if (validationError) {
      console.error('Validation error during skill deletion:', validationError);
      
      // Create a new partial update to avoid the validation errors
      const updateResult = await UserProfile.updateOne(
        { profileId },
        { 
          $pull: { testedSkills: { _id: skillId } },
          $set: { badges: profile.badges }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        const updatedProfile = await UserProfile.findByProfileId(profileId);
        return res.json({ 
          message: 'Skill removed successfully using partial update', 
          profile: updatedProfile
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to remove skill with partial update', 
          message: validationError.message 
        });
      }
    }

    await profile.save(); // Save the updated profile
    res.json({ message: 'Skill removed successfully', profile });
  } catch (error) {
    console.error(error);
    
    // Try with direct MongoDB update as fallback
    try {
      const updateResult = await UserProfile.updateOne(
        { profileId },
        { $pull: { testedSkills: { skill: skill } } }
      );
      
      if (updateResult.modifiedCount > 0) {
        const updatedProfile = await UserProfile.findByProfileId(profileId);
        return res.json({ 
          message: 'Skill removed successfully using fallback update', 
          profile: updatedProfile
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error update also failed:', fallbackError);
    }
    
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Generic field update function
exports.updateField = async (req, res) => {
  const { profileId, value, field } = req.body;
  
  try {
    const profile = await UserProfile.findByProfileId(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Special handling for github field - convert string to object if needed
    if (field === 'github' && typeof value === 'string') {
      // Extract username from URL if it's a full github URL
      const username = value.replace('https://github.com/', '').replace('/', '');
      profile.github = { username };
    } else {
      profile[field] = value;
    }

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    res.status(500).json({ message: `Error updating ${field}`, error: error.message });
  }
}; 