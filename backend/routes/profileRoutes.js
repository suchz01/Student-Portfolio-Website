const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Get or create profile
router.get('/:profileId', profileController.getProfile);

// Update a specific profile field
router.post('/:field', profileController.updateProfileField);

// Add a new generic field update endpoint that supports better github handling
router.post('/update/field', profileController.updateField);

// Add badges to a profile
router.post('/badges', profileController.addBadges);

// Update tested skills
router.post('/skills/tested', profileController.updateTestedSkills);

// Delete routes
router.delete('/:profileId/project/:index', profileController.deleteProject);
router.delete('/:profileId/experience/:index', profileController.deleteExperience);
router.delete('/:profileId/education/:index', profileController.deleteEducation);
router.delete('/:profileId/:field/:index', profileController.deleteFieldItem);
router.delete('/:profileId/testedSkills/:skill', profileController.deleteTestedSkill);

module.exports = router; 