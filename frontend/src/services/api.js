import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Generic fetch API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "An unknown error occurred",
      }));
      
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    toast.error(error.message || "Failed to connect to the server");
    throw error;
  }
}

// Profile API Services
export const profileApi = {
  // Get profile by ID
  getProfile: (profileId) => fetchApi(`/profile/${profileId}`),

  // Update profile field
  updateProfileField: (field, profileId, value) => 
    fetchApi(`/profile/${field}`, {
      method: "POST",
      body: JSON.stringify({ profileId, value }),
    }),

  // Add badges
  addBadges: (profileId, badges) => 
    fetchApi(`/profile/badges`, {
      method: "POST",
      body: JSON.stringify({ profileId, value: badges }),
    }),

  // Update tested skills
  updateTestedSkill: (profileId, testedSkill) => 
    fetchApi(`/profile/skills/tested`, {
      method: "POST",
      body: JSON.stringify({ profileId, testedSkill }),
    }),

  // Delete project
  deleteProject: (profileId, index) => 
    fetchApi(`/profile/${profileId}/project/${index}`, {
      method: "DELETE",
    }),

  // Delete experience
  deleteExperience: (profileId, index) => 
    fetchApi(`/profile/${profileId}/experience/${index}`, {
      method: "DELETE",
    }),

  // Delete education
  deleteEducation: (profileId, index) => 
    fetchApi(`/profile/${profileId}/education/${index}`, {
      method: "DELETE",
    }),

  // Delete field item
  deleteFieldItem: (profileId, field, index) => 
    fetchApi(`/profile/${profileId}/${field}/${index}`, {
      method: "DELETE",
    }),

  // Delete tested skill
  deleteTestedSkill: (profileId, skill) => 
    fetchApi(`/profile/${profileId}/testedSkills/${skill}`, {
      method: "DELETE",
    }),
};

// External Services API
export const externalApi = {
  // Get CodeChef rating
  getCodeChefRating: (profileId, username) => 
    fetchApi(`/codechef`, {
      method: "POST",
      body: JSON.stringify({ profileId, username }),
    }),

  // Get LeetCode stats
  getLeetCodeStats: (profileId, username) => 
    fetchApi(`/leetcode`, {
      method: "POST",
      body: JSON.stringify({ profileId, username }),
    }),
    
  // Get GitHub stats
  getGitHubStats: (profileId, username) => 
    fetchApi(`/github`, {
      method: "POST",
      body: JSON.stringify({ profileId, username }),
    }),
    
  // Refresh all external platform data at once
  refreshAllPlatforms: (profileId) => 
    fetchApi(`/refresh-all`, {
      method: "POST",
      body: JSON.stringify({ profileId }),
    }),
};

export default {
  profileApi,
  externalApi,
}; 