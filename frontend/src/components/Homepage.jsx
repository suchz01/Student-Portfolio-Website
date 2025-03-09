import React from 'react';
import { Rocket, User, Target, BookCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Homepage = ({}) => {
  const navigate = useNavigate();
  const handleGetStartedClick = () => {
    navigate('/Skill');
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 120
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 15px rgba(69, 241, 92, 0.3)",
      transition: { duration: 0.3 }
    }
  };

  const backgroundVariants = {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: [0.6, 0.8, 0.6],
      transition: { 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#101020] to-[#05050a] flex flex-col justify-center items-center overflow-hidden relative"
    >
      <motion.div 
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          className="absolute top-10 left-20 w-72 h-72 bg-[#45f15c]/10 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse",
            delay: 1
          }}
          className="absolute bottom-10 right-20 w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl"
        />
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 py-16 text-center relative z-10">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-[#45f15c] via-[#00d4ff] to-[#8A2BE2] bg-clip-text text-transparent">
            Horizon
          </h1>
          <p className="text-2xl text-gray-300 max-w-2xl mx-auto tracking-wide">
            An Onestop Portfolio Solution
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Rocket, color: '#45f15c', title: 'Portfolio', desc: 'Showcase your skills professionally' },
            { icon: User, color: '#00d4ff', title: 'CV Generator', desc: 'Craft professional resumes' },
            { icon: Target, color: '#caace7', title: 'Career AI', desc: 'Predict your career based on your skills' },
            { icon: BookCheck, color: '#ee8888', title: 'Skill Tests', desc: 'Tests to check your strength' }
          ].map(({ icon: Icon, color, title, desc }, index) => (
            <motion.div 
              key={title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.2 }}
              className={`bg-[#1a1a2e] border border-[${color}]/20 rounded-xl p-6 text-center`}
            >
              <Icon className="mx-auto mb-4" color={color} size={48} />
              <h3 className={`text-xl font-semibold text-white mb-3`}>{title}</h3>
              <p className="text-gray-300">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-12"
        >
          <motion.button
            onClick={handleGetStartedClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#45f15c] to-[#00d4ff] px-8 py-3 rounded-md text-black font-bold"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Homepage;