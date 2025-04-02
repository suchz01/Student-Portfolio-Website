const express = require('express');
const router = express.Router();
const externalController = require('../controllers/externalController');

// CodeChef route
router.post('/codechef', externalController.getCodeChefRating);

// LeetCode route
router.post('/leetcode', externalController.getLeetCodeStats);

// GitHub route
router.post('/github', externalController.getGitHubStats);

// Refresh all external platform data at once
router.post('/refresh-all', externalController.refreshAllExternalData);

module.exports = router; 