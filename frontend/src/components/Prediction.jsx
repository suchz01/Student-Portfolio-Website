import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowRight, Loader2, CheckCircle, BookOpen, BadgeCheck, Brain, Target, Trophy, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
      // console.log(
      //   badgeObjects.length > 0
      //     ? 'Badges saved successfully:'
      //     : 'Badges cleared successfully.',
      //   data
      // );
      
      if (badgeObjects.length > 0) {
        toast.success(`${badgeObjects.length} career badges earned!`);
      }
    } catch (error) {
      console.error('Error saving badges:', error);
      toast.error('Failed to save career badges');
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
      toast.success(`Career goal set: ${jobTitle}`);
    } catch (error) {
      console.error('Error saving current goal:', error);
      toast.error('Failed to set career goal');
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  const handleExportReport = () => {
    if (!results.length) return;
    
    try {
      // Create report content
      const reportContent = {
        generatedDate: new Date().toLocaleDateString(),
        userSkills: selectedSkills,
        careerMatches: results.map(result => ({
          role: result.jobTitle,
          matchedSkills: result.matchedSkills,
          skillsToAcquire: result.missingSkills
        })),
        badges: matchedBadges
      };
      
      // Convert to a formatted string for text file
      let textContent = `CAREER PATHWAY ANALYSIS REPORT\n`;
      textContent += `Generated on: ${reportContent.generatedDate}\n\n`;
      
      textContent += `YOUR SKILLS:\n`;
      textContent += reportContent.userSkills.join(', ') + '\n\n';
      
      if (matchedBadges.length) {
        textContent += `EARNED CAREER BADGES:\n`;
        textContent += matchedBadges.join(', ') + '\n\n';
      }
      
      textContent += `CAREER MATCHES:\n\n`;
      reportContent.careerMatches.forEach((match, index) => {
        textContent += `${index + 1}. ${match.role}\n`;
        textContent += `   Skills You Have: ${match.matchedSkills.join(', ') || 'None'}\n`;
        textContent += `   Skills to Acquire: ${match.skillsToAcquire.join(', ') || 'None'}\n\n`;
      });
      
      textContent += `Report generated by Horizon Platform`;
      
      // Create a blob and download link
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Career_Pathway_Report.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 pt-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Career Pathway Analysis
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on your skills, we've identified potential career paths that match your profile. Each suggestion includes skills you already have and those you might want to acquire.
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/30 text-red-500 p-5 rounded-xl mb-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            <p>{error}</p>
          </motion.div>
        )}

        {loading ? (
          <motion.div
            className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-md p-12 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="animate-spin text-primary" size={48} />
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Analyzing Your Skills</h3>
              <p className="text-muted-foreground">We're matching your skills with career paths and identifying growth opportunities...</p>
            </div>
          </motion.div>
        ) : (
          <>
            {selectedSkills.length === 0 ? (
              <motion.div
                className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-md p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-6">
                  <BookOpen className="mx-auto text-primary mb-4" size={48} />
                  <h2 className="text-2xl font-semibold mb-2">No Skills Selected</h2>
                  <p className="text-muted-foreground">Please go back and select your skills to get personalized career predictions.</p>
                </div>
                
                <div className="bg-background/50 rounded-lg p-6 border border-border/50">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Brain className="text-indigo-500" size={20} />
                    <span>Suggested Popular Skills</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["JavaScript", "Python", "React", "Node.js", "SQL", "Data Science", "Cloud Computing", "UI/UX Design"].map((skill, i) => (
                      <div key={i} className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg text-sm text-center">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Badges Section */}
                {matchedBadges.length > 0 && (
                  <motion.div
                    className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-md p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <BadgeCheck className="text-amber-500" size={24} />
                      <h2 className="text-xl font-semibold">Earned Career Badges</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {matchedBadges.map((badge, index) => (
                        <motion.div
                          key={index}
                          className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 dark:from-amber-950/30 dark:to-amber-900/10 rounded-lg p-4 border border-amber-200/30 dark:border-amber-800/30 flex items-center gap-3"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                        >
                          <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                            <Trophy className="text-amber-600 dark:text-amber-400" size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium">{badge}</h3>
                            <p className="text-xs text-muted-foreground">Skill match achieved</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Top Match */}
                {results.length > 0 && (
                  <motion.div
                    className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="text-amber-300" size={20} />
                          <h2 className="text-white font-semibold">Top Career Match</h2>
                        </div>
                        <button
                          onClick={() => handleSaveGoal(results[0].jobTitle, results[0].matchedSkills, results[0].missingSkills)}
                          className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 flex items-center gap-1.5 ${
                            currentGoal === results[0].jobTitle
                              ? 'bg-white text-indigo-700 font-medium'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {currentGoal === results[0].jobTitle ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Goal Set</span>
                            </>
                          ) : (
                            <>
                              <Target size={14} />
                              <span>Set as Goal</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-6">{results[0].jobTitle}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span>Skills You Have</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {results[0].matchedSkills.length === 0 ? (
                              <span className="text-muted-foreground text-sm">No matching skills found.</span>
                            ) : (
                              results[0].matchedSkills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-500" />
                            <span>Skills to Acquire</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {results[0].missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm"
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

                {/* Other Career Matches */}
                {results.length > 1 && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold px-2">Other Career Matches</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.slice(1, visibleCount).map((result, index) => (
                        <motion.div
                          key={index}
                          className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-md overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                        >
                          <div className="border-b border-border p-4 flex justify-between items-center">
                            <h3 className="font-semibold">{result.jobTitle}</h3>
                            <button
                              onClick={() => handleSaveGoal(result.jobTitle, result.matchedSkills, result.missingSkills)}
                              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 flex items-center gap-1 ${
                                currentGoal === result.jobTitle
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-background hover:bg-background/80 text-muted-foreground'
                              }`}
                            >
                              {currentGoal === result.jobTitle ? (
                                <>
                                  <CheckCircle size={12} />
                                  <span>Goal Set</span>
                                </>
                              ) : (
                                <>
                                  <Target size={12} />
                                  <span>Set as Goal</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CheckCircle size={14} className="text-green-500" />
                                <span>Skills You Have</span>
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {result.matchedSkills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <BookOpen size={14} className="text-indigo-500" />
                                <span>Skills to Acquire</span>
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {result.missingSkills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs"
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
                  </motion.div>
                )}

                {visibleCount < results.length && (
                  <motion.div
                    className="flex justify-center mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <button
                      onClick={handleLoadMore}
                      className="group bg-card hover:bg-card/80 text-sm font-medium px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-sm border border-border/50"
                    >
                      <span>Load More Career Matches</span>
                      <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={16} />
                    </button>
                  </motion.div>
                )}
                
                {/* Export or Download Section */}
                {results.length > 0 && (
                  <motion.div
                    className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/50 shadow-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div>
                      <h3 className="font-semibold">Save Your Career Pathways</h3>
                      <p className="text-sm text-muted-foreground">Download your personalized career report with detailed skill recommendations</p>
                    </div>
                    <button 
                      onClick={handleExportReport}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md"
                    >
                      <Download size={16} />
                      <span>Export Report</span>
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
