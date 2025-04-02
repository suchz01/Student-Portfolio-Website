import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, Scan, Check, AlertCircle, Search } from 'lucide-react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
        toast.error('Error updating skills and badges in the database.');
      } else {
        toast.success(`Skill "${string}" added`);
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
      toast.error('Error updating skills and badges in the database.');
    } else {
      toast.success(`Skill "${string}" removed`);
    }
  };

  const handleContinue = async () => {
    if (selectedStrings.length === 0) {
      toast.warning('Please select at least one skill');
      return;
    }

    const data = await updateDatabase(selectedStrings);
    if (data) {
      toast.success('Skills updated successfully!');
      navigate('/Prediction', { state: { selectedSkills: selectedStrings } });
    }
  };

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-red-500/10 text-red-500 p-6 rounded-xl border border-red-500/20 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4" size={32} />
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.href = "/login"} 
            className="mt-4 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search for skills... (e.g. React, Python, Machine Learning)"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full bg-background/50 text-foreground rounded-lg pl-10 pr-4 py-3 
            border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Dropdown List */}
        {(searchTerm || isFocused) && filteredStrings.length > 0 && (
          <motion.div
            className="absolute z-10 w-full mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul 
              ref={listRef} 
              className="bg-card/95 backdrop-blur-md rounded-lg shadow-lg max-h-60 overflow-y-auto border border-border"
            >
              {filteredStrings.slice(0, visibleCount).map((string, index) => (
                <motion.li
                  key={index}
                  onMouseDown={() => handleSelect(string)}
                  className={`px-4 py-2.5 hover:bg-accent cursor-pointer transition-all duration-200 
                    flex items-center justify-between ${highlightedIndex === index ? 'bg-accent' : ''}`}
                >
                  <span>{string}</span>
                  <Check size={16} className="text-muted-foreground/50" />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
      
      {/* Selected Skills */}
      <div>
        <div className="mb-2 text-sm text-muted-foreground flex items-center">
          <span className="mr-2">Selected Skills</span>
          <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full text-xs font-medium">
            {selectedStrings.length}
          </span>
        </div>
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selectedStrings.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3">
              No skills selected yet. Search and select skills above.
            </p>
          ) : (
            selectedStrings.map((string, index) => (
              <motion.div
                key={index}
                className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm 
                  flex items-center group hover:bg-indigo-500/20 transition-all duration-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <span>{string}</span>
                <button
                  onClick={() => handleDeselect(string)}
                  className="ml-2 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
      
      {/* Continue Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={handleContinue}
          disabled={selectedStrings.length === 0 || isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
            text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all duration-300
            shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ChevronRight size={18} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default SkillsAdd;
