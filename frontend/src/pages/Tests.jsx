import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Book, 
  Code, 
  Database, 
  Network, 
  Shield, 
  Clock, 
  Trophy, 
  ChevronRight,
  User,
  Loader2,
  Sparkles,
  Pencil,
  BookOpen,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { toast } from "sonner";

const Tests = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showGenerateTest, setShowGenerateTest] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTestName, setCustomTestName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Sample user test progress data
  const testProgress = {
    completedTests: 8,
    totalTests: 18,
    testScores: {
      7: 92, // HTML & CSS
      8: 78, // JavaScript
      10: 85, // SQL Basics
      13: 90, // Cloud Fundamentals
      16: 72, // Security Basics
      4: 88, // Statistical Analysis
      1: 95, // ML Fundamentals
      11: 82, // Database Design
    },
    badges: ["Web Fundamentals", "Database Expert", "ML Beginner"]
  };

  const testCategories = [
    {
      id: "ml",
      name: "Machine Learning",
      icon: <Brain size={22} />,
      color: "from-purple-600 to-indigo-600",
      bgLight: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Test your knowledge in machine learning algorithms, techniques, and applications.",
      tests: [
        { id: 1, title: "ML Fundamentals", questions: 25, time: 30, difficulty: "Beginner" },
        { id: 2, title: "Neural Networks", questions: 20, time: 25, difficulty: "Intermediate" },
        { id: 3, title: "Deep Learning", questions: 30, time: 45, difficulty: "Advanced" }
      ]
    },
    {
      id: "ds",
      name: "Data Science",
      icon: <Database size={22} />,
      color: "from-blue-600 to-cyan-600",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Evaluate your data science skills including statistics, visualization, and analysis.",
      tests: [
        { id: 4, title: "Statistical Analysis", questions: 20, time: 25, difficulty: "Beginner" },
        { id: 5, title: "Data Visualization", questions: 15, time: 20, difficulty: "Intermediate" },
        { id: 6, title: "Predictive Modeling", questions: 25, time: 35, difficulty: "Advanced" }
      ]
    },
    {
      id: "web",
      name: "Web Development",
      icon: <Code size={22} />,
      color: "from-amber-600 to-orange-600",
      bgLight: "bg-amber-50",
      iconColor: "text-amber-600",
      description: "Test your frontend and backend development skills across various technologies.",
      tests: [
        { id: 7, title: "HTML & CSS", questions: 30, time: 30, difficulty: "Beginner" },
        { id: 8, title: "JavaScript", questions: 25, time: 30, difficulty: "Intermediate" },
        { id: 9, title: "React & Node.js", questions: 20, time: 35, difficulty: "Advanced" }
      ]
    },
    {
      id: "db",
      name: "Databases",
      icon: <Database size={22} />,
      color: "from-emerald-600 to-green-600",
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description: "Evaluate your database design, SQL, and NoSQL knowledge.",
      tests: [
        { id: 10, title: "SQL Basics", questions: 20, time: 25, difficulty: "Beginner" },
        { id: 11, title: "Database Design", questions: 15, time: 20, difficulty: "Intermediate" },
        { id: 12, title: "NoSQL Databases", questions: 20, time: 30, difficulty: "Advanced" }
      ]
    },
    {
      id: "cloud",
      name: "Cloud Computing",
      icon: <Network size={22} />,
      color: "from-sky-600 to-blue-600",
      bgLight: "bg-sky-50",
      iconColor: "text-sky-600",
      description: "Test your knowledge of cloud platforms, services, and architecture.",
      tests: [
        { id: 13, title: "Cloud Fundamentals", questions: 20, time: 25, difficulty: "Beginner" },
        { id: 14, title: "AWS Services", questions: 25, time: 35, difficulty: "Intermediate" },
        { id: 15, title: "Cloud Architecture", questions: 15, time: 30, difficulty: "Advanced" }
      ]
    },
    {
      id: "security",
      name: "Cybersecurity",
      icon: <Shield size={22} />,
      color: "from-red-600 to-rose-600",
      bgLight: "bg-red-50",
      iconColor: "text-red-600",
      description: "Evaluate your cybersecurity knowledge and threat mitigation skills.",
      tests: [
        { id: 16, title: "Security Basics", questions: 25, time: 30, difficulty: "Beginner" },
        { id: 17, title: "Network Security", questions: 20, time: 25, difficulty: "Intermediate" },
        { id: 18, title: "Penetration Testing", questions: 15, time: 35, difficulty: "Advanced" }
      ]
    }
  ];

  const popularSkills = [
    "JavaScript", "Python", "React", "SQL", "Machine Learning",
    "Docker", "AWS", "Git", "Node.js", "REST API"
  ];

  const startTest = (testId) => {
    toast.info("Test starting soon...");
    // In a real app, would navigate to test page with the test ID
    navigate(`/test/${testId}`);
  };

  const handleGenerateTest = () => {
    if (generatedSkills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }
    
    if (!customTestName.trim()) {
      toast.error("Please provide a test name");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call to generate test
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Custom test generated successfully!");
      setShowGenerateTest(false);
      setGeneratedSkills([]);
      setCustomTestName("");
      
      // In a real app, would navigate to the generated test
      // navigate(`/test/custom-${Date.now()}`);
    }, 2000);
  };

  const toggleSkill = (skill) => {
    if (generatedSkills.includes(skill)) {
      setGeneratedSkills(generatedSkills.filter(s => s !== skill));
    } else {
      if (generatedSkills.length < 5) {
        setGeneratedSkills([...generatedSkills, skill]);
      } else {
        toast.error("Maximum 5 skills allowed for a custom test");
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Beginner": return "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400";
      case "Intermediate": return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400";
      case "Advanced": return "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400";
    }
  };

  const getCompletionStatus = (testId) => {
    if (testProgress.testScores[testId]) {
      return {
        completed: true,
        score: testProgress.testScores[testId]
      };
    }
    return { completed: false };
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 pt-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Skill Assessment Tests
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test your skills, find your strengths and areas for improvement. Take our specialized assessment tests to gauge your proficiency in various technical domains.
          </p>
        </motion.div>

        {/* Progress Summary Card */}
        <motion.div
          className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-md mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Your Test Progress
              </h3>
              <p className="text-muted-foreground mb-4">
                Completed {testProgress.completedTests} of {testProgress.totalTests} tests
              </p>
              
              <div className="w-full bg-background/70 rounded-full h-2.5 mb-6">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full" 
                  style={{ width: `${(testProgress.completedTests / testProgress.totalTests) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="bg-background/70 rounded-xl p-3 border border-border/50">
                <h4 className="font-medium mb-2">Earned Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {testProgress.badges.map((badge, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                      <Trophy size={10} className="mr-1" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Custom Test Generation Option */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {!showGenerateTest ? (
            <button
              onClick={() => setShowGenerateTest(true)}
              className="w-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 hover:from-indigo-600/20 hover:to-purple-600/20 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                  <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Generate Custom Test</h3>
                  <p className="text-sm text-muted-foreground">Create a personalized test based on specific skills</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Pencil className="text-indigo-500" size={20} />
                  Create Custom Test
                </h3>
                <button 
                  onClick={() => setShowGenerateTest(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="testName">
                  Test Name
                </label>
                <input
                  type="text"
                  id="testName"
                  value={customTestName}
                  onChange={(e) => setCustomTestName(e.target.value)}
                  placeholder="e.g., Advanced JavaScript Development"
                  className="w-full p-2.5 bg-background border border-border rounded-lg"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Select Skills (max 5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        generatedSkills.includes(skill)
                          ? "bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "bg-background border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {skill}
                      {generatedSkills.includes(skill) && (
                        <CheckCircle size={12} className="ml-1 inline-block" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateTest}
                  disabled={isGenerating || generatedSkills.length === 0 || !customTestName.trim()}
                  className={`bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 ${
                    (isGenerating || generatedSkills.length === 0 || !customTestName.trim()) 
                      ? "opacity-70 cursor-not-allowed" 
                      : ""
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Test</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* API Status Banner - This would be conditional based on API health */}
        <motion.div
          className="bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 rounded-xl p-4 mb-8 flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              Our test generation service is experiencing intermittent issues. Some custom tests may take longer to generate.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${selectedCategory === category.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className={`bg-gradient-to-r ${category.color} p-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-white text-lg">{category.name}</h3>
                </div>
                <div className="bg-white/20 rounded-full h-7 w-7 flex items-center justify-center backdrop-blur-sm">
                  <ChevronRight size={16} className="text-white" />
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-muted-foreground text-sm mb-5">{category.description}</p>
                <div className="space-y-2.5">
                  {category.tests.map(test => {
                    const completionStatus = getCompletionStatus(test.id);
                    
                    return (
                      <div 
                        key={test.id}
                        className={`relative flex justify-between items-center p-3 ${
                          completionStatus.completed 
                            ? "bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30" 
                            : "bg-background/50 hover:bg-background/80"
                        } rounded-lg border border-border/50 transition-colors cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startTest(test.id);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-medium text-sm">{test.title}</p>
                            {completionStatus.completed && (
                              <div className="ml-2 flex items-center">
                                <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                                <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                                  {completionStatus.score}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BookOpen size={12} />
                              <span>{test.questions} Questions</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={12} />
                              <span>{test.time} min</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(test.difficulty)}`}>
                          {test.difficulty}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-md mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full">
                <Trophy className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Leaderboard & Certificates</h3>
                <p className="text-muted-foreground">Complete tests to earn certificates and climb the leaderboard</p>
              </div>
            </div>
            <button 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard
            </button>
          </div>
        </motion.div>

        {/* Test & Badge FAQ Section */}
        <motion.div
          className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-md mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Skill Testing & Badge System FAQ</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-lg">Test System FAQ</h4>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">How do skill tests work?</h5>
                  <p className="text-sm text-muted-foreground">
                    Our skill tests are adaptive assessments that gauge your proficiency level in specific technical domains.
                    Each test includes questions of varying difficulty and updates your skill profile upon completion.
                  </p>
                </div>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">What difficulty levels are available?</h5>
                  <p className="text-sm text-muted-foreground">
                    Tests are available in three difficulty levels: Beginner, Intermediate, and Advanced.
                    The system adapts to your performance and awards skill levels accordingly.
                  </p>
                </div>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">Can I retake tests?</h5>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can retake any test after a 7-day cooling period. Your highest score will be kept,
                    but your skill level will reflect your most recent test performance.
                  </p>
                </div>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">How are test scores calculated?</h5>
                  <p className="text-sm text-muted-foreground">
                    Test scores are calculated based on correct answers, question difficulty, and completion time.
                    Higher scores are awarded for correctly answering difficult questions within the time limit.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-lg">Badge System FAQ</h4>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">What are badges?</h5>
                  <p className="text-sm text-muted-foreground">
                    Badges represent your mastery of skill combinations related to specific job roles or technical domains.
                    Each badge requires proficiency in multiple related skills.
                  </p>
                </div>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">How is badge progress calculated?</h5>
                  <p className="text-sm text-muted-foreground">
                    Each skill in a badge contributes equally to its completion percentage. Your contribution level
                    is determined by your skill test difficulty level:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Easy/Beginner: 30% contribution</li>
                    <li>• Medium/Intermediate: 60% contribution</li>
                    <li>• Hard/Advanced/Expert: 100% contribution</li>
                  </ul>
                </div>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">What do badge levels mean?</h5>
                  <p className="text-sm text-muted-foreground">
                    Badges have four progress levels:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Bronze: 1-39% completion</li>
                    <li>• Silver: 40-69% completion</li>
                    <li>• Gold: 70-99% completion</li>
                    <li>• Platinum: 100% completion</li>
                  </ul>
                </div>
                
                <div className="space-y-1 border-l-2 border-indigo-500/20 pl-4">
                  <h5 className="font-medium">Where can I see my badges?</h5>
                  <p className="text-sm text-muted-foreground">
                    Your earned badges are displayed on your profile page in the Badges tab. You can view detailed
                    information about each badge, including your progress and the skills required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tests;