import React from 'react';
import { Rocket, User, Target, BookCheck, ArrowRight, Star, Award, CheckCircle, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const Homepage = ({ profile }) => {
  const navigate = useNavigate();
  
  const handleGetStartedClick = () => {
    navigate('/skill');
  };

  const handlePortfolioClick = () => {
    navigate('/profile');
  };

  const handleTestSkills = () => {
    navigate('/test');
  };

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1.0]
      }
    })
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3 + (i * 0.1),
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: { 
      y: -10,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const backgroundVariants = {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: [0.5, 0.7, 0.5],
      transition: { 
        duration: 6, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-background to-background/90">
      {/* Abstract Background */}
      <motion.div 
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[120px] mix-blend-multiply"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1.2 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute top-[40%] right-[15%] w-[25rem] h-[25rem] bg-purple-500/20 rounded-full blur-[100px] mix-blend-multiply"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 2 }}
            className="absolute bottom-[10%] left-[30%] w-[30rem] h-[20rem] bg-blue-500/20 rounded-full blur-[120px] mix-blend-multiply"
          />
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16 md:mb-24">
            <motion.div 
              custom={0}
              variants={fadeInUpVariant}
              initial="hidden"
              animate="visible"
              className="inline-block bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm px-5 py-1.5 rounded-full mb-6"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Career Management & Portfolio Platform
              </span>
            </motion.div>
            
            <motion.h1 
              custom={1}
              variants={fadeInUpVariant}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-indigo-600/80 via-purple-600/80 to-fuchsia-500/80 bg-clip-text text-transparent">
                Horizon
              </span>
            </motion.h1>
            
            <motion.p 
              custom={2}
              variants={fadeInUpVariant}
              initial="hidden"
              animate="visible"
              className="max-w-2xl text-xl text-muted-foreground leading-relaxed mb-8"
            >
              Showcase your skills, generate professional CVs, predict your career path with AI, 
              and test your knowledge—all in one powerful platform.
            </motion.p>
            
            <motion.div 
              custom={3}
              variants={fadeInUpVariant}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button
                onClick={handleGetStartedClick}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 px-8 rounded-xl"
              >
                Get Started <ArrowRight size={18} />
              </Button>
              
              {profile ? (
                <Button
                  onClick={handlePortfolioClick}
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-xl border-border/60"
                >
                  View Portfolio <User size={18} />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-xl border-border/60"
                >
                  Sign In <User size={18} />
                </Button>
              )}
            </motion.div>
          </div>
          
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2">
              <Star className="text-indigo-500" size={28} />
              <span>Key Features</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: <User className="text-indigo-500" size={32} />, 
                  title: 'Professional Portfolio', 
                  desc: 'Showcase your experience, education, projects, and skills in a beautiful portfolio page.',
                  color: 'from-indigo-600/10 to-indigo-500/20'
                },
                { 
                  icon: <ScrollText className="text-purple-500" size={32} />, 
                  title: 'CV Generator', 
                  desc: 'Generate professional CVs that highlight your strengths and achievements.',
                  color: 'from-purple-600/10 to-purple-500/20'
                },
                { 
                  icon: <Target className="text-fuchsia-500" size={32} />, 
                  title: 'AI Career Path', 
                  desc: 'Receive AI-powered recommendations for career paths based on your skills and experience.',
                  color: 'from-fuchsia-600/10 to-fuchsia-500/20'
                },
                { 
                  icon: <BookCheck className="text-blue-500" size={32} />, 
                  title: 'Skill Assessment', 
                  desc: 'Test and validate your skills with our interactive assessments and earn badges.',
                  color: 'from-blue-600/10 to-blue-500/20'
                }
              ].map(({ icon, title, desc, color }, index) => (
                <motion.div 
                  key={title}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Card className={`overflow-hidden border-none shadow-lg h-full backdrop-blur-sm bg-gradient-to-br ${color}`}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="rounded-full bg-background/70 backdrop-blur-sm w-14 h-14 flex items-center justify-center mb-4 shadow-sm">
                        {icon}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                      <p className="text-muted-foreground text-sm flex-grow">{desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-fuchsia-500/10 backdrop-blur-sm p-8 md:p-12 border border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 justify-center md:justify-start">
                  <Award className="text-indigo-500" size={24} />
                  <span>Advance Your Career Today</span>
                </h3>
                <p className="text-muted-foreground max-w-xl mb-0">
                  Take assessments to validate your skills and generate personalized recommendations for your career growth.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleTestSkills}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 rounded-xl"
                  size="lg"
                >
                  Test Your Skills <CheckCircle size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="border-t border-border/50 bg-muted/30 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "20+", label: "Skill Tests" },
              { value: "100+", label: "Career Paths" },
              { value: "5000+", label: "Users" },
              { value: "15+", label: "Achievement Badges" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + (index * 0.1), duration: 0.5 }}
                className="flex flex-col"
              >
                <span className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Homepage;