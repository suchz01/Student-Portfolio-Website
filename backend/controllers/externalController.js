const axios = require('axios');
const cheerio = require('cheerio');
const { UserProfile } = require('../models');

// Fetch CodeChef rating and save to DB
exports.getCodeChefRating = async (req, res) => {
  const { profileId, username } = req.body;
  const url = `https://www.codechef.com/users/${username}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const ratingElement = $('.rating-number');
    const rating = ratingElement.first().text().trim();

    const profile = await UserProfile.findOneAndUpdate(
      { profileId },
      { 
        $set: { 
          'codeChef.username': username, 
          'codeChef.rating': rating || 0,
          'codeChef.lastUpdated': new Date()
        } 
      },
      { new: true, upsert: true }
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
    res.status(500).json({ error: 'Failed to fetch data from CodeChef', message: error.message });
  }
};

// Fetch LeetCode stats and save to DB
exports.getLeetCodeStats = async (req, res) => {
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

      const profile = await UserProfile.findOneAndUpdate(
        { profileId },
        {
          $set: {
            'leetCode.username': username,
            'leetCode.totalSolved': totalSolved,
            'leetCode.easySolved': easySolved,
            'leetCode.mediumSolved': mediumSolved,
            'leetCode.hardSolved': hardSolved,
            'leetCode.lastUpdated': new Date()
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
    res.status(500).json({ error: 'Failed to fetch data from LeetCode', message: error.message });
  }
};

// Add GitHub stats integration
exports.getGitHubStats = async (req, res) => {
  const { profileId, username } = req.body;
  
  // Return mock data without calling GitHub API
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { profileId },
      {
        $set: {
          'github.username': username,
          'github.repositories': 0,
          'github.followers': 0,
          'github.following': 0,
          'github.lastUpdated': new Date()
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
      platform: 'GitHub',
      stats: {
        repositories: 0,
        followers: 0,
        following: 0,
      },
      message: "GitHub statistics are temporarily disabled to avoid API rate limits. Add your GitHub token to enable.",
      profile,
    });
  } catch (error) {
    console.error('Error updating GitHub info:', error);
    res.status(500).json({ error: 'Failed to update GitHub information', message: error.message });
  }
};

// Add new endpoint to fetch all external data at once
exports.refreshAllExternalData = async (req, res) => {
  const { profileId } = req.body;
  
  try {
    // Find the profile to get all usernames
    const profile = await UserProfile.findOne({ profileId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const results = {};
    
    // Refresh CodeChef data if username exists
    if (profile.codeChef?.username) {
      try {
        const url = `https://www.codechef.com/users/${profile.codeChef.username}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        const ratingElement = $('.rating-number');
        const rating = ratingElement.first().text().trim();
        
        await UserProfile.updateOne(
          { profileId },
          { 
            $set: { 
              'codeChef.rating': rating || 0,
              'codeChef.lastUpdated': new Date()
            } 
          }
        );
        
        results.codeChef = { 
          username: profile.codeChef.username, 
          rating: rating || 0,
          success: true 
        };
      } catch (error) {
        console.error('Error refreshing CodeChef data:', error);
        results.codeChef = { error: 'Failed to refresh', success: false };
      }
    }
    
    // Refresh LeetCode data if username exists
    if (profile.leetCode?.username) {
      try {
        const url = 'https://leetcode.com/graphql';
        const headers = {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        };
        
        const graphqlData = {
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
          variables: { username: profile.leetCode.username },
        };
        
        const response = await axios.post(url, graphqlData, { headers });
        
        if (response.status === 200) {
          const userStats = response.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
          
          const totalSolved = userStats.find((item) => item.difficulty === 'All')?.count || 0;
          const easySolved = userStats.find((item) => item.difficulty === 'Easy')?.count || 0;
          const mediumSolved = userStats.find((item) => item.difficulty === 'Medium')?.count || 0;
          const hardSolved = userStats.find((item) => item.difficulty === 'Hard')?.count || 0;
          
          await UserProfile.updateOne(
            { profileId },
            {
              $set: {
                'leetCode.totalSolved': totalSolved,
                'leetCode.easySolved': easySolved,
                'leetCode.mediumSolved': mediumSolved,
                'leetCode.hardSolved': hardSolved,
                'leetCode.lastUpdated': new Date()
              }
            }
          );
          
          results.leetCode = { 
            username: profile.leetCode.username, 
            stats: { totalSolved, easySolved, mediumSolved, hardSolved },
            success: true 
          };
        } else {
          results.leetCode = { error: response.statusText, success: false };
        }
      } catch (error) {
        console.error('Error refreshing LeetCode data:', error);
        results.leetCode = { error: 'Failed to refresh', success: false };
      }
    }
    
    // Refresh GitHub data if username exists
    if (profile.github?.username) {
      // Skip GitHub API call and return mock data
      results.github = { 
        username: profile.github.username, 
        stats: {
          repositories: profile.github.repositories || 0,
          followers: profile.github.followers || 0,
          following: profile.github.following || 0,
        },
        message: "GitHub statistics are temporarily disabled to avoid API rate limits. Add your GitHub token to enable.",
        success: true 
      };
    }
    
    // Get the updated profile
    const updatedProfile = await UserProfile.findOne({ profileId });
    
    res.json({
      profileId,
      results,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error refreshing external data:', error);
    res.status(500).json({ error: 'Failed to refresh external data', message: error.message });
  }
}; 