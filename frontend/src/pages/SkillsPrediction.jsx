import React, { useState } from "react";
import SkillsAdd from "../components/Skillsadd";
import { motion } from "framer-motion";
import { LightbulbIcon, BrainCircuit, Sparkles, Target, Layers, Cpu, Blocks, ArrowRight, CheckCircle, Shield } from "lucide-react";

function SkillsPrediction() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 pt-8 px-4 overflow-hidden">
      <motion.div
        className="container mx-auto max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center mb-3">
            <BrainCircuit size={32} className="text-indigo-500 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">Career Prediction</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Add your skills to receive AI-powered career path predictions based on your skill set.
            Our system will analyze your skills to suggest career options and identify areas for growth.
          </p>
        </motion.div>
        
        {/* Benefits Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-indigo-500/10 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
            <div className="flex items-start mb-2">
              <Target className="text-indigo-500 mr-2 mt-1" size={20} />
              <h3 className="font-semibold">Career Matching</h3>
            </div>
            <p className="text-sm text-muted-foreground">Find career paths that align with your current skillset</p>
          </div>
          
          <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-start mb-2">
              <LightbulbIcon className="text-purple-500 mr-2 mt-1" size={20} />
              <h3 className="font-semibold">Skill Gaps</h3>
            </div>
            <p className="text-sm text-muted-foreground">Identify skills you need to acquire for career advancement</p>
          </div>
          
          <div className="bg-fuchsia-500/10 backdrop-blur-sm rounded-xl p-4 border border-fuchsia-500/20">
            <div className="flex items-start mb-2">
              <Sparkles className="text-fuchsia-500 mr-2 mt-1" size={20} />
              <h3 className="font-semibold">Achievement Badges</h3>
            </div>
            <p className="text-sm text-muted-foreground">Earn industry achievement badges based on your skill combinations</p>
          </div>
        </motion.div>
        
        {activeTab === 'predict' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-md rounded-xl border border-border/50 shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <h2 className="text-white text-xl font-semibold">Enter Your Skills</h2>
              <p className="text-white/80 text-sm">Our AI will analyze your skills and provide career recommendations</p>
            </div>
            <div className="p-1">
              <SkillsAdd />
            </div>
          </motion.div>
        )}
        
        {activeTab === 'how' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-md rounded-xl border border-border/50 shadow-xl overflow-hidden p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Layers className="text-indigo-500 mr-2" size={24} />
              How Our AI Prediction Works
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Skill Analysis",
                  description: "Our system analyzes your entered skills against a database of industry job requirements and career paths.",
                  icon: <Blocks className="text-indigo-500" size={20} />
                },
                {
                  step: "2",
                  title: "Pattern Recognition",
                  description: "The AI identifies patterns in your skill set that match established career trajectories and job roles.",
                  icon: <BrainCircuit className="text-purple-500" size={20} />
                },
                {
                  step: "3",
                  title: "Gap Identification",
                  description: "We compare your skills against requirements for your target roles to identify learning opportunities.",
                  icon: <LightbulbIcon className="text-fuchsia-500" size={20} />
                },
                {
                  step: "4",
                  title: "Recommendation Generation",
                  description: "Personalized career paths and skill development recommendations are generated based on the analysis.",
                  icon: <Target className="text-indigo-500" size={20} />
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < 3 && (
                    <div className="absolute top-10 left-5 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b from-indigo-500/50 to-purple-500/50"></div>
                  )}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 z-10">
                    {item.step}
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-border/50 flex-1">
                    <div className="flex items-center mb-2">
                      {item.icon}
                      <h3 className="font-medium text-lg ml-2">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-md rounded-xl border border-border/50 shadow-xl overflow-hidden p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Cpu className="text-indigo-500 mr-2" size={24} />
              About Our AI Model
            </h2>
            
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Our career prediction system uses a sophisticated machine learning model trained on millions of career trajectories and job requirements from across the industry.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                  <h3 className="font-medium mb-2">Training Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Our model is trained on data from job platforms, professional networks, and industry standards to ensure accurate and relevant predictions.
                  </p>
                </div>
                
                <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                  <h3 className="font-medium mb-2">Accuracy & Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    The model is regularly updated with the latest industry trends and job market data to maintain high prediction accuracy.
                  </p>
                </div>
                
                <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                  <h3 className="font-medium mb-2">Privacy Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Your skill data is processed securely, and we never store or share your personal information with third parties.
                  </p>
                </div>
                
                <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                  <h3 className="font-medium mb-2">Continuous Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI model continuously improves as more users interact with it, making its predictions more accurate over time.
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-500/10 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20">
                <h3 className="text-lg font-medium mb-3 text-indigo-700 dark:text-indigo-300">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-indigo-600 dark:text-indigo-400">Model Architecture</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>Multi-layer neural network with transformers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>TF-IDF vectorization for skill representation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>Ensemble learning for job role prediction</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-indigo-600 dark:text-indigo-400">Performance Metrics</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>93% accuracy for primary career path prediction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>89% precision in skill gap identification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>Average response time under 2 seconds</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl">
                <div>
                  <h3 className="font-semibold">Ready to see your career pathway?</h3>
                  <p className="text-sm text-muted-foreground">Add your skills to get personalized AI predictions</p>
                </div>
                <button 
                  onClick={() => setActiveTab('predict')} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                >
                  <BrainCircuit size={16} />
                  <span>Start Prediction</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Additional Info Section */}
        <motion.div
          className="mt-16 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/30 backdrop-blur-md rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <h3 className="font-semibold">100% Free</h3>
              </div>
              <p className="text-sm text-muted-foreground">All career predictions and skill analysis features are completely free to use.</p>
            </div>
            
            <div className="bg-card/30 backdrop-blur-md rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                  <Shield className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <h3 className="font-semibold">Data Privacy</h3>
              </div>
              <p className="text-sm text-muted-foreground">Your skills and career data are never shared with third parties or used for marketing.</p>
            </div>
            
            <div className="bg-card/30 backdrop-blur-md rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                  <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <h3 className="font-semibold">Continuous Improvement</h3>
              </div>
              <p className="text-sm text-muted-foreground">Our prediction algorithms improve as more people use them, providing better recommendations.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SkillsPrediction;
