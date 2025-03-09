const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const Profile = require('./models/Profile');
require('dotenv').config();  // To load environment variables

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection with environment variable
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/profileDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Route to fetch or create a profile
app.get('/profile/:profileId', async (req, res) => {
  const { profileId } = req.params;
  try {
    let profile = await Profile.findOne({ profileId });
    if (!profile) {
      profile = new Profile({ profileId });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Route to update a specific profile field
app.post('/profile/:field', async (req, res) => {
  const { field } = req.params;
  const { profileId, value } = req.body;

  try {
    const allowedFields = [
      'name', 'aboutMe', 'projects', 'experience', 'certification', 'education', 'extracurricular', 'subject',
      'phone', 'email', 'skills', 'github', 'linkedin', 'currentGoal', 'badges', 'codeChef', 'leetCode'
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid field name' });
    }

    const update = { [field]: value };
    const profile = await Profile.findOneAndUpdate(
      { profileId },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    res.status(500).json({ message: `Error updating ${field}` });
  }
});

// Route to add badges to a profile
app.post('/profile/badges', async (req, res) => {
  const { profileId, value } = req.body;

  try {
    const profile = await Profile.findOne({ profileId });
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

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error adding badges:', error);
    res.status(500).json({ message: 'Error adding badges' });
  }
});

// Route to delete a specific project by index
app.delete('/profile/:profileId/project/:index', async (req, res) => {
  const { profileId, index } = req.params;

  try {
    const profile = await Profile.findOne({ profileId });
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
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Route to delete a specific experience by index
app.delete('/profile/:profileId/experience/:index', async (req, res) => {
  const { profileId, index } = req.params;

  try {
    const profile = await Profile.findOne({ profileId });
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
    res.status(500).json({ message: 'Error deleting experience' });
  }
});

// Route to delete a specific education entry by index
app.delete('/profile/:profileId/education/:index', async (req, res) => {
  const { profileId, index } = req.params;

  try {
    const profile = await Profile.findOne({ profileId });
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
    res.status(500).json({ message: 'Error deleting education' });
  }
});

// Route to delete a specific field item by index
app.delete('/profile/:profileId/:field/:index', async (req, res) => {
  const { profileId, field, index } = req.params;

  try {
    const profile = await Profile.findOne({ profileId });
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
    res.status(500).json({ message: `Error deleting ${field} item` });
  }
});

// Route to fetch CodeChef rating and save to DB
app.post('/codechef', async (req, res) => {
  const { profileId, username } = req.body;
  const url = `https://www.codechef.com/users/${username}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const ratingElement = $('.rating-number');
    const rating = ratingElement.first().text().trim();

    const profile = await Profile.findOneAndUpdate(
      { profileId },
      { $set: { 'codeChef.username': username, 'codeChef.rating': rating || 0 } },
      { new: true, upsert: true } // Ensure upsert is true
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      profileId,
      username,
      platform: 'CodeChef',
      rating: rating || 0,
      profile,
    });
  } catch (error) {
    console.error('Error fetching CodeChef rating:', error);
    res.status(500).json({ error: 'Failed to fetch data from CodeChef' });
  }
});

// Route to fetch LeetCode stats and save to DB
app.post('/leetcode', async (req, res) => {
  const { profileId, username } = req.body;
  const url = 'https://leetcode.com/graphql';
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  };

  const data = {
    query: `
      query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `,
    variables: { username },
  };

  try {
    const response = await axios.post(url, data, { headers });

    if (response.status === 200) {
      const userStats = response.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;

      const totalSolved = userStats.find((item) => item.difficulty === 'All')?.count || 0;
      const easySolved = userStats.find((item) => item.difficulty === 'Easy')?.count || 0;
      const mediumSolved = userStats.find((item) => item.difficulty === 'Medium')?.count || 0;
      const hardSolved = userStats.find((item) => item.difficulty === 'Hard')?.count || 0;

      const profile = await Profile.findOneAndUpdate(
        { profileId },
        {
          $set: {
            'leetCode.username': username,
            'leetCode.totalSolved': totalSolved,
            'leetCode.easySolved': easySolved,
            'leetCode.mediumSolved': mediumSolved,
            'leetCode.hardSolved': hardSolved,
          },
        },
        { new: true }
      );

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json({
        profileId,
        username,
        platform: 'LeetCode',
        stats: {
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
        },
        profile,
      });
    } else {
      res.status(response.status).json({ error: response.statusText });
    }
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    res.status(500).json({ error: 'Failed to fetch data from LeetCode' });
  }
});

// Route to update tested skills
app.post('/profile/skills/tested', async (req, res) => {
  const { profileId, testedSkill } = req.body;

  try {
    const profile = await Profile.findOne({ profileId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.testedSkills.push(testedSkill);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error updating tested skills:', error);
    res.status(500).json({ message: 'Error updating tested skills' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.delete('/profile/:profileId/testedSkills/:skill', async (req, res) => {
  const { profileId, skill } = req.params;

  try {
    const profile = await Profile.findOne({ profileId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Find the index of the skill in testedSkills
    const skillIndex = profile.testedSkills.findIndex((s) => s.skill === skill);

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found in testedSkills' });
    }

    // Remove the skill from testedSkills array
    profile.testedSkills.splice(skillIndex, 1);

    await profile.save(); // Save the updated profile
    res.json({ message: 'Skill removed successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
