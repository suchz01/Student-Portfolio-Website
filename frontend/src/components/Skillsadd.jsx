import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, Scan } from 'lucide-react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { motion } from 'framer-motion';

function SkillsAdd() {
  // Fetch profile from localStorage or navigate to login page if missing
  const profile = JSON.parse(localStorage.getItem('profile'));
  const profileId = profile?.id || '';

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStrings, setSelectedStrings] = useState([]);
  const [availableStrings, setAvailableStrings] = useState([]);
  const [filteredStrings, setFilteredStrings] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(10); // Number of items to show initially
  const listRef = useRef(null); // Reference to the list element

  // If no profile, navigate away or show an error
  useEffect(() => {
    if (!profileId) {
      setError('Profile not found. Please log in.');
      return;
    }
  }, [profileId]);

  // Fetch skills for the user's profile
  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedStrings(data.skills || []);
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Error fetching skills. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchSkills();
    }
  }, [profileId]);

  // Fetch available skills from the CSV file
  useEffect(() => {
    Papa.parse('/skills.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const skills = results.data.reduce((acc, row) => {
          if (row['Skills_Required']) {
            acc.push(...row['Skills_Required'].split(',').map(skill => skill.trim()));
          }
          return acc;
        }, []);
        const uniqueSkills = [...new Set(skills)];
        setAvailableStrings(uniqueSkills);
        setFilteredStrings(uniqueSkills.filter(skill => !selectedStrings.includes(skill)));
      },
      error: (error) => {
        console.error('Error fetching CSV:', error);
        setError('Error fetching skills list. Please try again later.');
      }
    });
  }, [selectedStrings]);

  // Debounced search logic
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (!term) {
        setFilteredStrings(availableStrings.filter(skill => !selectedStrings.includes(skill)));
        return;
      }

      const lowerTerm = term.toLowerCase();
      const matchScore = (str) => {
        const lowerStr = str.toLowerCase();
        return lowerStr.startsWith(lowerTerm) ? 3 : lowerStr.includes(lowerTerm) ? 2 : 1;
      };

      const matches = availableStrings
        .map(string => ({ string, score: matchScore(string) }))
        .filter(({ score, string }) => score > 1 && !selectedStrings.includes(string))
        .sort((a, b) => b.score - a.score || a.string.localeCompare(b.string))
        .map(({ string }) => string);

      setFilteredStrings(matches);
    }, 300),
    [availableStrings, selectedStrings]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % filteredStrings.length;
        if (newIndex >= visibleCount - 1) {
          setVisibleCount((prevCount) => prevCount + 10); // Load more items
        }
        scrollToItem(newIndex);
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + filteredStrings.length) % filteredStrings.length;
        scrollToItem(newIndex);
        return newIndex;
      });
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      handleSelect(filteredStrings[highlightedIndex]);
    }
  };

  const scrollToItem = (index) => {
    if (listRef.current) {
      const listItem = listRef.current.children[index];
      if (listItem) {
        listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Update the database with new skills
  const updateDatabase = async (updatedSkills, removedSkill = null) => {
    if (!profileId) {
      console.error('Profile ID is missing');
      return null;
    }
  
    try {
      setIsLoading(true);
      
      // Update the selected skills in the database
      const response = await fetch(`http://localhost:8080/profile/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, value: updatedSkills }),
      });
  
      if (!response.ok) throw new Error(`Failed to update skills: ${response.statusText}`);
      const data = await response.json();
      console.log('Skills updated successfully:', data);
  
      // Only delete the removed skill from testedSkills if it exists
      if (removedSkill) {
        const profileResponse = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (!profileResponse.ok) throw new Error('Failed to fetch profile data');
        const profileData = await profileResponse.json();
  
        const testedSkills = profileData.testedSkills || [];
        const isAlreadyTested = testedSkills.some(skill => skill.skill === removedSkill);
  
        if (isAlreadyTested) {
          // Remove skill from testedSkills
          const deleteResponse = await fetch(`http://localhost:8080/profile/${profileId}/testedSkills/${removedSkill}`, {
            method: 'DELETE',
          });
  
          if (!deleteResponse.ok) throw new Error('Failed to remove skill from testedSkills');
          console.log(`Skill "${removedSkill}" removed from testedSkills.`);
        }
      }
  
      // Fetch and update badges after skills update
      const badgesResponse = await fetch(`http://localhost:5000/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: updatedSkills, profileId, n: 200 }),
      });
  
      if (!badgesResponse.ok) throw new Error(`Failed to fetch badges: ${badgesResponse.statusText}`);
      const badgesData = await badgesResponse.json();
      console.log('Fetched badges:', badgesData);
  
      const formattedBadges = badgesData.matchedBadges.map((badge) => ({
        name: badge,
        skills: badgesData.matchedSkill[badge] || [],
      }));
  
      const saveBadgesResponse = await fetch(`http://localhost:8080/profile/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, value: formattedBadges }),
      });
  
      if (!saveBadgesResponse.ok) throw new Error(`Failed to save badges: ${saveBadgesResponse.statusText}`);
      const saveBadgesData = await saveBadgesResponse.json();
      console.log('Badges saved successfully:', saveBadgesData);
  
      return data;
    } catch (error) {
      console.error('Error updating skills and badges:', error);
      setError('Error updating skills or fetching badges.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  


  const handleSelect = async (string) => {
    if (!selectedStrings.includes(string)) {
      const updatedSkills = [...selectedStrings, string];
      setSelectedStrings(updatedSkills);
      const data = await updateDatabase(updatedSkills);
      if (!data) {
        console.error('Error updating skills and badges in the database.');
      }
    }
    setSearchTerm('');
    setFilteredStrings(availableStrings.filter(skill => !selectedStrings.includes(skill)));
    setIsFocused(false);
  };

 const handleDeselect = async (string) => {
  const updatedSkills = selectedStrings.filter((s) => s !== string);
  setSelectedStrings(updatedSkills);
  const data = await updateDatabase(updatedSkills, string);
  if (!data) {
    console.error('Error updating skills and badges in the database.');
  }
};

  const handleContinue = async () => {
    if (selectedStrings.length === 0) {
      alert('Please select at least one skill');
      return;
    }

    const data = await updateDatabase(selectedStrings);
    if (data) {
      navigate('/Prediction', { state: { selectedSkills: selectedStrings } });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1e1a2a] p-8">
        <div className="max-w-4xl mx-auto space-y-8 mt-60">
          <div className="bg-[#29253b] p-8 border border-white/20 rounded-md">
            <p className="text-white">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1a2a] p-8">
      <div className="max-w-4xl mx-auto space-y-8 mt-60">
        <motion.div
          className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <h2 className="text-2xl font-semibold mb-8 text-white flex items-center">
            <Scan className="mr-3 text-[#45f15c]" size={24} />
            Enter Your Skills
          </h2>
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/10 text-white rounded-md px-4 py-3 
                border border-white/20 focus:outline-none focus:border-white/30
                backdrop-blur-lg transition-all duration-300"
            />
            {(searchTerm || isFocused) && (
              <motion.div
                className="absolute z-10 w-full mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ul ref={listRef} className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg max-h-60 overflow-y-auto border border-white/20">
                  {filteredStrings.slice(0, visibleCount).map((string, index) => (
                    <motion.li
                      key={index}
                      onMouseDown={() => handleSelect(string)}
                      className={`px-4 py-2 hover:bg-white/10 cursor-pointer transition-all duration-300 
                        text-white/80 hover:text-white ${highlightedIndex === index ? 'bg-white/20' : ''}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {string}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            className="flex flex-wrap gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {selectedStrings.map((string, index) => (
              <motion.div
                key={index}
                className="bg-white/10 text-[#DEDEE3] px-4 py-2 rounded-full text-sm 
                  hover:bg-white/20 transition-all duration-300 hover:scale-105
                  flex items-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => handleDeselect(string)}
              >
                <span>{string}</span>
                <button
                  className="ml-2 hover:text-white transition-all duration-300"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
          <motion.button
            onClick={handleContinue}
            className="w-full bg-white/10 hover:bg-white/20 text-white rounded-md py-3 px-6 
              flex items-center justify-center space-x-2 transition-all duration-300 
              border border-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span>Continue</span>
            <ChevronRight size={20} className="text-[#45f15c]" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default SkillsAdd;
