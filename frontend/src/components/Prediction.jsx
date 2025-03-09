import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function Prediction() {
  const location = useLocation();
  const { selectedSkills = [] } = location.state || {};
  const [results, setResults] = useState([]);
  const [matchedBadges, setMatchedBadges] = useState([]);
  const [skill, setSkill] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [currentGoal, setCurrentGoal] = useState(null);

  const profile = JSON.parse(localStorage.getItem('profile'));
  const profileId = profile?.id || '';

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/predict', {
        skills: selectedSkills,
        profileId,
        n: 100,
      });
      setResults(response.data.results || []);
      setMatchedBadges(response.data.matchedBadges || []);
      setSkill(response.data.matched_skill || {});
      setLoading(false);
      if (response.data.matchedBadges?.length > 0) {
        await handleSaveBadges(response.data.matchedBadges, response.data.matchedSkill);
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError('Failed to fetch prediction. Please try again later.');
      setLoading(false);
    }
  };

  const handleSaveBadges = async (badges, skillData) => {
    try {
      // console.log(badges)
      const badgeObjects = badges.length
        ? badges.map((badge) => ({
            name: badge,
            skills: skillData[badge] || [],
          }))
        : [];

      const response = await fetch(`http://localhost:8080/profile/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, value: badgeObjects }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save badges: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        badgeObjects.length > 0
          ? 'Badges saved successfully:'
          : 'Badges cleared successfully.',
        data
      );
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  };

  useEffect(() => {
    if (selectedSkills.length > 0) {
      fetchPrediction();
    }
  }, [selectedSkills]);

  const handleSaveGoal = async (jobTitle, matchedSkills, missingSkills) => {
    try {
      const response = await fetch(`http://localhost:8080/profile/currentGoal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          value: { role: jobTitle, skill: [...matchedSkills, ...missingSkills] },
        }),
      });
      if (!response.ok) throw new Error(`Failed to save current goal: ${response.statusText}`);
      const data = await response.json();
      setCurrentGoal(jobTitle);
    } catch (error) {
      console.error('Error saving current goal:', error);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  return (
    <div className="min-h-screen bg-[#1e1a2a] px-6 py-12 mt-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl text-center font-bold text-white mb-12">
          Your Career Pathways
        </h1>

        {error && (
          <motion.div
            className="bg-white/5 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <motion.div
            className="flex items-center justify-center space-x-2 text-[#45f15c]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="animate-spin" />
            <span>Analyzing your skills...</span>
          </motion.div>
        ) : (
          <>
            {selectedSkills.length === 0 ? (
              <motion.div
                className="relative bg-gradient-to-br from-[#29253b] via-[#2d2a40] to-[#342f4a] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#45f15c]/10 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Star className="text-[#45f15c]" size={24} />
                      <span className="text-[#45f15c] text-sm font-semibold">Top Match</span>
                    </div>
                  </div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    Suggested Skills
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-[#DEDEE3] font-semibold mb-3">Consider Learning Basics of</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm">
                          C++
                        </span>
                        <span className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm">
                          Java
                        </span>
                        <span className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm">
                          C
                        </span>
                        <span className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm">
                          Python
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : results.length === 0 ? (
              <p className="text-white/70 text-center">No predictions available. Please try again.</p>
            ) : (
              <div className="space-y-6">
                {results.length > 0 && (
                  <motion.div
                    className="relative bg-gradient-to-br from-[#29253b] via-[#2d2a40] to-[#342f4a] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#45f15c]/10 to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <Star className="text-[#45f15c]" size={24} />
                          <span className="text-[#45f15c] text-sm font-semibold">Top Match</span>
                        </div>
                        <button
                          onClick={() => handleSaveGoal(results[0].jobTitle, results[0].matchedSkills, results[0].missingSkills)}
                          className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                            currentGoal === results[0].jobTitle
                              ? 'bg-[#ffffff] text-black'
                              : 'bg-white/10 text-[#DEDEE3] hover:bg-white/20'
                          }`}
                        >
                          {currentGoal === results[0].jobTitle ? 'Goal Set' : 'Set as Goal'}
                        </button>
                      </div>
                      <motion.h2
                        className="text-4xl font-bold text-white mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        {results[0].jobTitle}
                      </motion.h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-[#DEDEE3] font-semibold mb-3">Current Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {results[0].matchedSkills.length === 0 ? (
                              <span className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm">
                                Consider learning basics of C++, Java, C, or Python.
                              </span>
                            ) : (
                              results[0].matchedSkills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-[#DEDEE3] font-semibold mb-3">Skills to Acquire</h3>
                          <div className="flex flex-wrap gap-2">
                            {results[0].missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.slice(1, visibleCount).map((result, index) => (
                    <motion.div
                      key={index}
                      className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-semibold text-white">{result.jobTitle}</h3>
                        <button
                          onClick={() => handleSaveGoal(result.jobTitle, result.matchedSkills, result.missingSkills)}
                          className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                            currentGoal === result.jobTitle
                              ? 'bg-[#ffffff] text-black'
                              : 'bg-white/10 text-[#DEDEE3] hover:bg-white/20'
                          }`}
                        >
                          {currentGoal === result.jobTitle ? 'Goal Set' : 'Set as Goal'}
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[#DEDEE3] text-sm mb-2">Current Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.matchedSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[#DEDEE3] text-sm mb-2">Skills to Acquire</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {visibleCount < results.length && (
                  <motion.div
                    className="flex justify-center mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <button
                      onClick={handleLoadMore}
                      className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-[#DEDEE3] px-6 py-3 rounded-full transition-all duration-300"
                    >
                      <span>Load More</span>
                      <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={18} />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Prediction;
