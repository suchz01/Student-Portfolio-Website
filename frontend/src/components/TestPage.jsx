import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "framer-motion";
import { 
  Target, 
  Loader, 
  AlertCircle, 
  CheckCircle2, 
  Book, 
  Send, 
  Code, 
  ChevronRight, 
  ArrowRight, 
  Star, 
  Timer,
  Award,
  LucideCheck,
  LucideX
} from 'lucide-react';
import { toast } from "sonner";

function TestPage({ profile }) {
  const [untestedSkills, setUntestedSkills] = useState([]);
  const [testedSkills, setTestedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [previousTestData, setPreviousTestData] = useState(null);
  const maxRetries = 3;

  if (!profile) profile = JSON.parse(localStorage.getItem("profile"));
  const profileId = profile?.id || "";

  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          // Separate tested and untested skills
          setTestedSkills(data.testedSkills || []);
          setUntestedSkills(data.skills.filter(skill => 
            !data.testedSkills.some(tested => 
              tested.skill.toLowerCase() === skill.toLowerCase())
          ));
        } else {
          console.error("Failed to fetch skills");
          toast.error("Failed to fetch skills");
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        setError("Error fetching skills.");
        toast.error("Error fetching skills");
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchAllSkills();
    }
  }, [profileId]);

  useEffect(() => {
    let timer;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      calculateScore();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  const geminiApiKey = import.meta.env.VITE_GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const handleSkillChange = (skill, existingSkillData = null) => {
    setSelectedSkill(skill);
    setQuestions([]);
    setAnswers({});
    setScore(null);
    setShowResults(false);
    setTimeRemaining(null);
    setPreviousTestData(existingSkillData);
    
    // Set difficulty based on previous test if retesting
    if (existingSkillData) {
      const difficultyMap = {
        'easy': 'beginner',
        'medium': 'intermediate',
        'hard': 'advanced'
      };
      setDifficulty(difficultyMap[existingSkillData.level] || 'intermediate');
    }
  };

  const handleDifficultyChange = (level) => {
    setDifficulty(level);
  };

  const fetchQuestions = async () => {
    if (!selectedSkill) {
      setError("Please select a skill.");
      toast.error("Please select a skill");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setScore(null);
    setShowResults(false);

    try {
      toast.info(`Generating ${difficulty} level questions for ${selectedSkill}...`);
      
      const prompt = `Generate 5 ${difficulty} level multiple choice questions on ${selectedSkill} as a JSON object. 
      The response should be valid JSON with the following structure:
      {
        "questions": [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A",
            "explanation": "Brief explanation why Option A is correct"
          },
          ...
        ]
      }
      Make sure the answer is exactly one of the options. Return ONLY valid JSON with no extra text, no markdown formatting, and no code blocks.`;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        
        processQuestionResponse(text);
      } catch (primaryError) {
        console.error("Primary model error:", primaryError);
        toast.warning("Trying alternative model...");
        
        try {
          const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
          const fallbackResult = await fallbackModel.generateContent(prompt);
          const fallbackText = await fallbackResult.response.text();
          
          processQuestionResponse(fallbackText);
        } catch (fallbackError) {
          console.error("Fallback model error:", fallbackError);
          throw new Error(`API model error: ${primaryError.message}. Fallback also failed.`);
        }
      }
      
      function processQuestionResponse(text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Invalid JSON format in response");
        }
  
        let data;
        try {
          data = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("JSON parsing failed:", e);
          console.log("Raw text:", text);
          throw new Error("Failed to parse JSON response");
        }
  
        if (!data || !data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error("Invalid data structure received from API");
        }
  
        let timeLimit;
        switch(difficulty) {
          case "beginner": timeLimit = 300; break; // 5 minutes
          case "intermediate": timeLimit = 450; break; // 7.5 minutes
          case "advanced": timeLimit = 600; break; // 10 minutes
          default: timeLimit = 450;
        }
        
        setQuestions(data.questions);
        setTimeRemaining(timeLimit);
        setRetryCount(0);
        toast.success("Test generated successfully!");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(`Failed to fetch questions: ${error.message}`);
      toast.error("Failed to generate questions. Retrying...");
      
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchQuestions, 1000);
      } else {
        toast.error("Max retries reached. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedOption,
    }));
  };

  const calculateScore = async () => {
    if (!questions.length) return;
    
    setIsLoading(true);
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctCount++;
      }
    });
    
    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    setScore(scorePercentage);
    setShowResults(true);
    setTimeRemaining(null);

    // Only attempt to update testedSkills if score is >= 80%
    if (scorePercentage >= 80) {
      try {
        // Convert difficulty to match backend enum values
        const difficultyMap = {
          "beginner": "easy",
          "intermediate": "medium",
          "advanced": "hard"
        };
        
        const mappedDifficulty = difficultyMap[difficulty] || "medium";
        
        // Determine if we should update the database
        let shouldUpdate = true;
        
        // If this is a retest, only update if the difficulty is higher or score is better at same difficulty
        if (previousTestData) {
          const previousDifficultyValue = {
            "easy": 1,
            "medium": 2,
            "hard": 3
          };
          
          const newDifficultyValue = previousDifficultyValue[mappedDifficulty] || 2;
          const oldDifficultyValue = previousDifficultyValue[previousTestData.level] || 1;
          
          // Only update if new difficulty is higher or same difficulty with better score
          if (newDifficultyValue < oldDifficultyValue || 
              (newDifficultyValue === oldDifficultyValue && scorePercentage <= previousTestData.score)) {
            shouldUpdate = false;
            toast.success(`Congratulations! You passed with ${scorePercentage}%. Your previous score of ${previousTestData.score}% at ${previousTestData.level} level was retained.`);
          }
        }
        
        if (shouldUpdate) {
          // First get the latest profile data to check for any validation issues
          const profileResponse = await fetch(`http://localhost:8080/profile/${profileId}`);
          if (!profileResponse.ok) {
            console.error("Failed to fetch profile data before updating skills");
            toast.success(`You passed with ${scorePercentage}%! We couldn't update your profile right now, but your score has been recorded.`);
            setIsLoading(false);
            return;
          }
          
          // Normalize the skill name
          const normalizedSkill = selectedSkill.trim();
          
          const response = await fetch(`http://localhost:8080/profile/skills/tested`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profileId,
              testedSkill: {
                skill: normalizedSkill,
                dateTested: new Date(),
                score: scorePercentage,
                level: mappedDifficulty,
                testType: "online"
              },
            }),
          });

          if (!response.ok) {
            console.error(`Failed to update tested skill: ${response.statusText}`);
            // Show success message to user but note the profile update issue
            toast.success(`You passed with ${scorePercentage}%! We couldn't update your profile right now, but your score has been recorded.`);
          } else {
            // Success - update the skills lists
            const data = await response.json();
            
            // Refresh the tested and untested skills lists
            if (previousTestData) {
              // Update the existing skill in testedSkills list
              setTestedSkills(prev => 
                prev.map(ts => 
                  ts.skill.toLowerCase() === normalizedSkill.toLowerCase() 
                    ? {...ts, score: scorePercentage, level: mappedDifficulty, dateTested: new Date()}
                    : ts
                )
              );
            } else {
              // Move skill from untested to tested list
              setTestedSkills(prev => [
                ...prev, 
                {
                  skill: normalizedSkill,
                  score: scorePercentage,
                  level: mappedDifficulty,
                  dateTested: new Date()
                }
              ]);
              setUntestedSkills(prev => 
                prev.filter(skill => 
                  skill.toLowerCase() !== normalizedSkill.toLowerCase()
                )
              );
            }
            
            toast.success(`Congratulations! You passed with ${scorePercentage}%. Skill ${previousTestData ? 'updated' : 'added'} to your profile.`);
          }
        }
      } catch (error) {
        console.error("Error in test submission:", error);
        // Show success message anyway so user knows they passed
        toast.success(`You passed with ${scorePercentage}%! We couldn't update your profile right now, but you can try again later.`);
      }
    } else {
      toast.error(`You scored ${scorePercentage}%. A score of at least 80% is required to pass. Please retry or lower the difficulty.`);
    }
    
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! You've mastered this skill and it has been added to your profile.";
    if (score >= 60) return "Good effort, but you need at least 80% to pass. Try again!";
    return "Keep learning! Practice more and try again when you're ready.";
  };

  // Scroll to top after test completion
  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showResults]);

  if (!profileId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md p-8">
          <p className="text-foreground">Error: Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 pt-6 pb-20">
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <motion.div
          className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <div className="flex items-center gap-2">
              <Target className="text-white" size={22} />
              <h3 className="text-lg font-semibold text-white">Skill Assessment</h3>
            </div>
            <p className="text-white/70 text-sm mt-1">Test your programming knowledge and track your progress</p>
          </div>
          
          <div className="p-6">
            {isLoading && !questions.length ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin text-indigo-500 mb-4" size={40} />
                <p className="text-foreground text-lg">Loading skills...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {!selectedSkill ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-medium text-foreground flex items-center gap-2 mb-4">
                        <Book className="text-indigo-500" size={24} />
                        Select a skill to test your knowledge:
                      </h3>
                      <p className="text-foreground/80">Choose from your untested skills below or retest your existing skills.</p>
                    </div>
                    
                    {/* Untested Skills Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
                        <Code className="text-indigo-500" size={20} />
                        Untested Skills
                      </h4>
                      
                      {untestedSkills.length === 0 ? (
                        <div className="bg-indigo-500/10 rounded-xl p-6 text-center border border-indigo-500/20">
                          <Award className="mx-auto text-indigo-500 mb-3" size={32} />
                          <p className="text-foreground/80">You've tested all your skills! Add new skills to your profile to test them.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {untestedSkills.map((skill) => (
                            <motion.button
                              key={skill}
                              onClick={() => handleSkillChange(skill)}
                              className="group bg-background/50 border border-border rounded-xl p-5
                                hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300
                                transform hover:-translate-y-1"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Code className="text-indigo-500" size={22} />
                                  <span className="text-lg font-medium text-foreground">{skill}</span>
                                </div>
                                <ChevronRight 
                                  className="text-foreground/50 group-hover:text-indigo-500 transform 
                                    group-hover:translate-x-1 transition-all duration-300" 
                                  size={18} 
                                />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Already Tested Skills Section */}
                    {testedSkills.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
                          <CheckCircle2 className="text-green-500" size={20} />
                          Already Tested Skills
                          <span className="text-xs text-muted-foreground ml-2">(Retest to improve your score or level)</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {testedSkills.map((skill, index) => {
                            // Map the difficulty level to display text
                            const levelMap = {
                              'easy': 'Beginner',
                              'medium': 'Intermediate',
                              'hard': 'Advanced',
                              'beginner': 'Beginner',
                              'intermediate': 'Intermediate',
                              'advanced': 'Advanced'
                            };
                            
                            const levelColor = {
                              'easy': 'text-green-400',
                              'medium': 'text-yellow-500',
                              'hard': 'text-red-500',
                              'beginner': 'text-green-400',
                              'intermediate': 'text-yellow-500',
                              'advanced': 'text-red-500'
                            };
                            
                            return (
                              <motion.button
                                key={index}
                                onClick={() => handleSkillChange(skill.skill, skill)}
                                className="group bg-green-500/5 border border-green-500/30 rounded-xl p-5
                                  hover:bg-green-500/10 hover:border-green-500/50 transition-all duration-300
                                  transform hover:-translate-y-1"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-green-500/20 p-1.5 rounded-full">
                                        <CheckCircle2 className="text-green-500" size={18} />
                                      </div>
                                      <span className="text-lg font-medium text-foreground">{skill.skill}</span>
                                    </div>
                                    <ChevronRight 
                                      className="text-green-500/70 group-hover:text-green-500 transform 
                                        group-hover:translate-x-1 transition-all duration-300" 
                                      size={18} 
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-1 text-sm">
                                    <span className={`${levelColor[skill.level]} font-medium`}>
                                      {levelMap[skill.level] || 'Intermediate'}
                                    </span>
                                    <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                                      {skill.score}%
                                    </span>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-background/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                          <Code className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-medium text-foreground">{selectedSkill}</h3>
                          <p className="text-foreground/70 text-sm">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level test</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSkillChange("")}
                        className="text-foreground/70 hover:text-foreground px-4 py-2 rounded-lg
                          hover:bg-background/80 transition-all duration-300 text-sm flex items-center gap-2"
                      >
                        <ArrowRight size={16} className="rotate-180" />
                        Change Skill
                      </button>
                    </div>
                    
                    {!questions.length && (
                      <>
                        <div className="bg-background/50 rounded-xl p-6 border border-border">
                          <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                            <Star className="text-indigo-500" size={20} />
                            Select Difficulty Level
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {["beginner", "intermediate", "advanced"].map((level) => (
                              <button
                                key={level}
                                onClick={() => handleDifficultyChange(level)}
                                className={`p-4 rounded-xl border transition-all duration-300
                                  ${difficulty === level 
                                    ? 'bg-indigo-500/10 border-indigo-500' 
                                    : 'bg-background/50 border-border hover:bg-background/80'}`}
                              >
                                <div className="text-center">
                                  <div className={`font-medium text-lg mb-1 ${difficulty === level ? 'text-indigo-500' : 'text-foreground'}`}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </div>
                                  <p className="text-foreground/70 text-sm">
                                    {level === "beginner" && "Basic concepts and knowledge"}
                                    {level === "intermediate" && "Applied knowledge and skills"}
                                    {level === "advanced" && "Deep expertise and complex problems"}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={fetchQuestions}
                          disabled={isLoading}
                          className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl
                            hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50
                            disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <>
                              <Loader className="animate-spin" size={20} />
                              Generating Your Test...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={20} />
                              Start Assessment
                            </>
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                    <p className="text-destructive flex items-center gap-2">
                      <AlertCircle size={20} />
                      {error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* API Status Notification */}
        {!questions.length && !isLoading && (
          <motion.div
            className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 text-amber-500 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>
              <p className="text-sm">
                Our test API service may experience occasional delays. If a test fails to generate, please try again or choose a different skill.
              </p>
            </div>
          </motion.div>
        )}

        {questions.length > 0 && !showResults && (
          <motion.div 
            className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">{selectedSkill} Assessment</h3>
                </div>
                
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${timeRemaining < 60 ? 'bg-red-500/20 text-red-100' : 'bg-white/20 text-white'}`}>
                    <Timer size={16} />
                    <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {questions.map((question, index) => (
                <motion.div 
                  key={index} 
                  className="bg-background/50 p-6 rounded-xl border border-border
                    transition-all duration-300 hover:border-indigo-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <p className="text-lg font-medium text-foreground mb-4">
                    <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-lg mr-3">{index + 1}</span>
                    {question.question}
                  </p>
                  <div className="space-y-3 ml-4">
                    {question.options.map((option, optionIndex) => (
                      <label 
                        key={optionIndex} 
                        className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg text-foreground
                          hover:bg-background/80 transition-colors duration-200"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          className="w-5 h-5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        <span className="hover:text-indigo-400 transition-colors duration-300">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}

              <motion.button
                onClick={calculateScore}
                className="w-full mt-8 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl
                  hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={20} />
                Submit Assessment
              </motion.button>
            </div>
          </motion.div>
        )}

        {showResults && (
          <motion.div 
            className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-white" size={22} />
                <h3 className="text-lg font-semibold text-white">Assessment Results</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                  {score >= 80 ? (
                    <CheckCircle2 className="text-green-500" size={48} />
                  ) : (
                    <AlertCircle className="text-red-500" size={48} />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {score >= 80 ? "Assessment Passed!" : "Assessment Failed!"}
                </h3>
                <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}%
                </div>
                <p className="text-foreground/80 text-lg">
                  {getScoreMessage(score)}
                </p>
                {score < 80 && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-500 text-sm">
                    <p>You need to score at least 80% to pass this assessment and add this skill to your profile.</p>
                    <p className="mt-1">You can retry the test or choose a different difficulty level.</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-medium text-foreground mb-4 flex items-center gap-2">
                  <Book className="text-indigo-500" size={20} />
                  Review Your Answers
                </h4>

                {questions.map((question, index) => (
                  <div 
                    key={index} 
                    className={`bg-background/50 p-6 rounded-xl border 
                      ${answers[index] === question.answer 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-red-500/30 bg-red-500/5'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 rounded-full p-1 
                        ${answers[index] === question.answer ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {answers[index] === question.answer ? 
                          <LucideCheck className="text-green-500" size={16} /> : 
                          <LucideX className="text-red-500" size={16} />}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground mb-3">
                          {question.question}
                        </p>
                        <div className="space-y-2 ml-1 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className={`py-2 px-3 rounded-lg ${
                                option === question.answer
                                  ? 'bg-green-500/20 text-green-500'
                                  : option === answers[index] && option !== question.answer
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'text-foreground/80'
                              }`}
                            >
                              {option}
                              {option === question.answer && ' ✓'}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/30">
                            <p className="text-indigo-500 text-sm">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <motion.button
                  onClick={() => {
                    handleSkillChange("");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 p-4 bg-background/80 border border-border text-foreground font-semibold rounded-xl
                    hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRight size={20} className="rotate-180" />
                  Test Another Skill
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setQuestions([]);
                    setShowResults(false);
                    if (score < 80) {
                      // Keep same difficulty if failed
                      setTimeout(() => fetchQuestions(), 500);
                    } else {
                      // Offer a different difficulty if passed
                      setDifficulty(difficulty === "advanced" ? "intermediate" : difficulty === "intermediate" ? "advanced" : "beginner");
                      setTimeout(() => fetchQuestions(), 500);
                    }
                  }}
                  className="flex-1 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl
                    hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target size={20} />
                  {score < 80 ? "Retry Test" : 
                    `Try ${difficulty === "beginner" ? "Intermediate" : difficulty === "intermediate" ? "Advanced" : "Beginner"} Difficulty`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        {!questions.length && !isLoading && (
          <motion.div 
            className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-white" size={22} />
                <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h4 className="text-lg font-medium text-foreground mb-2">How does skill testing work?</h4>
                  <p className="text-foreground/80">
                    Our skill testing system generates 5 questions based on your chosen skill and difficulty level. 
                    You need to score at least 80% (4 out of 5 questions correct) to pass the test and have the skill 
                    added to your profile as a verified skill.
                  </p>
                </div>
                
                <div className="border-b border-border pb-4">
                  <h4 className="text-lg font-medium text-foreground mb-2">What are the difficulty levels?</h4>
                  <p className="text-foreground/80">
                    <span className="font-medium block mb-1">Beginner:</span> Basic concepts and foundational knowledge about the skill.
                    <span className="font-medium block mb-1 mt-2">Intermediate:</span> Applied knowledge and moderate complexity questions.
                    <span className="font-medium block mb-1 mt-2">Advanced:</span> Deep expertise and complex problem-solving questions.
                  </p>
                </div>
                
                <div className="border-b border-border pb-4">
                  <h4 className="text-lg font-medium text-foreground mb-2">What are Badge levels and how do I earn them?</h4>
                  <p className="text-foreground/80">
                    Badges represent groups of related skills. They have 4 levels based on how many skills in the badge you've tested:
                  </p>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-700/30 flex-shrink-0"></div>
                      <span><strong>Bronze:</strong> You've added the badge to your profile but haven't tested any skills (or less than 1/3).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-400/30 flex-shrink-0"></div>
                      <span><strong>Silver:</strong> You've tested at least 1/3 of the skills in the badge.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500/30 flex-shrink-0"></div>
                      <span><strong>Gold:</strong> You've tested at least 2/3 of the skills in the badge.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500/30 flex-shrink-0"></div>
                      <span><strong>Platinum:</strong> You've tested ALL skills in the badge (100%).</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-b border-border pb-4">
                  <h4 className="text-lg font-medium text-foreground mb-2">What if I don't pass a skill test?</h4>
                  <p className="text-foreground/80">
                    If you don't achieve at least 80% score, the skill won't be added to your verified skills. 
                    You can retry the test with the same difficulty or choose an easier difficulty level to increase 
                    your chances of passing. There's no limit to how many times you can attempt a test.
                  </p>
                </div>
                
                <div className="border-b border-border pb-4">
                  <h4 className="text-lg font-medium text-foreground mb-2">Can I re-test skills I've already passed?</h4>
                  <p className="text-foreground/80">
                    Yes! You can!
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-foreground mb-2">How are the questions generated?</h4>
                  <p className="text-foreground/80">
                    Questions are generated using AI technology that customizes content based on your selected 
                    skill and difficulty level. The system ensures questions are relevant, accurate, and 
                    appropriate for the chosen difficulty level. If you encounter any issues with question 
                    generation, you can try refreshing or selecting a different skill.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TestPage;