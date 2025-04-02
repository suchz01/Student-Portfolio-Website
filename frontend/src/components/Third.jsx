import PropTypes from 'prop-types';
import { Code, Award, Medal, Target, Zap, Clock, CheckCircle, AlertCircle, Plus, ChevronRight, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

// Restore the level calculation function
const getNumericLevel = (level) => {
  switch(level) {
    case 'Beginner': return 1;
    case 'Intermediate': return 2;
    case 'Advanced': return 3;
    case 'Expert': return 3; // Cap at 3
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 0; // Test not given
  }
};

function Third({ profileData }) {
  const navigate = useNavigate();
  const safeProfileData = profileData || {};
  
  // Check if sections have data
  const hasGoals = safeProfileData.currentGoals && safeProfileData.currentGoals.length > 0;
  const hasTestedSkills = safeProfileData.testedSkills && safeProfileData.testedSkills.length > 0;
  const hasPlainSkills = safeProfileData.skills && safeProfileData.skills.length > 0;
  const hasSkills = hasTestedSkills || hasPlainSkills;
  
  // Check if we need to display an empty state
  const isEmpty = !hasGoals && !hasSkills;
  
  // Get combined skills from both arrays
  const getAllSkills = () => {
    const testedSkills = safeProfileData.testedSkills?.map(ts => ({
      name: ts.skill,
      level: getNumericLevel(ts.level),
      description: `Tested on ${formatDate(ts.dateTested)} with a score of ${ts.score}/100`,
      tested: true,
      score: ts.score,
      dateTested: ts.dateTested,
      difficulty: ts.level
    })) || [];
    
    const plainSkills = (safeProfileData.skills || []).filter(skill => {
      // Check if this skill already exists in testedSkills (case-insensitive match)
      return !testedSkills.some(ts => 
        ts.name.trim().toLowerCase() === skill.trim().toLowerCase()
      );
    }).map(skill => ({
      name: skill,
      level: 0, // Level 0 for untested skills (no stars)
      description: '',
      tested: false
    }));
    
    return [...testedSkills, ...plainSkills];
  };
  
  // Function to calculate missing skills
  const calculateMissingSkills = (goal) => {
    if (!goal || !goal.requiredSkills) return [];
    const goalSkills = goal.requiredSkills || [];
    const userSkills = [...(safeProfileData.skills || []), 
                          ...(safeProfileData.testedSkills?.map(ts => ts.skill) || [])];
    return goalSkills.filter(skill => !userSkills.includes(skill));
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Goals Section */}
      {hasGoals && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Target className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Current Goals</h2>
            </div>
            <span className="text-xs text-muted-foreground">{safeProfileData.currentGoals?.length || 0} entries</span>
          </div>
          
          <div className="space-y-4">
            {safeProfileData.currentGoals?.map((goal, index) => {
              const missingSkills = calculateMissingSkills(goal);
              
              return (
                <div 
                  key={index}
                  className="bg-background/50 rounded-xl p-4 border border-border hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-foreground">{goal.title || 'Untitled Goal'}</h3>
                    <div className="bg-indigo-500/10 px-2 py-1 rounded-md text-xs text-indigo-500">
                      {formatDate(goal.targetDate)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/70 mt-1">{goal.description || 'No description provided'}</p>
                  
                  {/* Required Skills */}
                  {goal.requiredSkills && goal.requiredSkills.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-foreground/70 flex items-center mb-2">
                        <Code size={12} className="mr-1 text-indigo-500" />
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {goal.requiredSkills.map((skill, skillIndex) => (
                          <span 
                            key={skillIndex}
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              missingSkills.includes(skill)
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-green-500/10 text-green-500'
                            }`}
                          >
                            {skill}
                            {missingSkills.includes(skill) ? (
                              <AlertCircle size={10} className="inline ml-1" />
                            ) : (
                              <CheckCircle size={10} className="inline ml-1" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Missing Skills Alert */}
                  {missingSkills.length > 0 && (
                    <div className="mt-3 bg-amber-500/10 p-2 rounded-md">
                      <p className="text-xs text-amber-500 flex items-center">
                        <Zap size={12} className="mr-1" />
                        You need to acquire {missingSkills.length} more skill{missingSkills.length !== 1 ? 's' : ''} to achieve this goal
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {hasSkills && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Code className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Skill Set</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {getAllSkills().length} entries
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getAllSkills().map((skill, index) => {
              // Get tested skill data if it exists
              const testedSkill = safeProfileData.testedSkills?.find(ts => 
                ts.skill.toLowerCase().trim() === skill.name.toLowerCase().trim()
              );
              const isTested = !!testedSkill;

              return (
                <div
                  key={index}
                  className={`bg-background/50 rounded-xl p-4 border ${
                    isTested 
                      ? "border-green-500/30 hover:border-green-500/50" 
                      : "border-border hover:border-indigo-500/30"
                  } transition-all duration-300 hover:shadow-md`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {isTested ? (
                        <div className="bg-green-500/10 p-1.5 rounded-full">
                          <CheckCircle size={16} className="text-green-500" />
                        </div>
                      ) : (
                        <div className="bg-indigo-500/10 p-1.5 rounded-full">
                          <Code size={16} className="text-indigo-500" />
                        </div>
                      )}
                      <span className={`font-medium ${isTested ? "text-green-500" : ""}`}>{skill.name}</span>
                    </div>
                    
                    <div className="flex">
                      {[...Array(3)].map((_, i) => (
                        <Star 
                          key={i}
                          size={16}
                          className={i < (skill.level || 0) ? "text-yellow-500 fill-yellow-500" : "text-foreground/20"}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {isTested ? (
                    <div className="mt-2 bg-green-500/10 px-2 py-1 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle size={12} className="text-green-500 mr-1" />
                        <span className="text-xs text-green-500">Verified ({testedSkill.score}%)</span>
                      </div>
                      <span className="text-xs text-green-500 font-medium capitalize">{testedSkill.level} level</span>
                    </div>
                  ) : (
                    <div className="mt-2 bg-amber-500/10 px-2 py-1 rounded-md flex items-center">
                      <AlertCircle size={12} className="text-amber-500 mr-1" />
                      <span className="text-xs text-amber-500">Test not taken</span>
                    </div>
                  )}
                  
                  {skill.description && (
                    <p className="text-sm text-foreground/70 mt-2">{skill.description}</p>
                  )}
                  
                  {isTested && (
                    <div className="mt-2 text-xs text-foreground/60">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(new Date(testedSkill.dateTested))}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State - Show this if there's no data to display */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-indigo-500 hover:scale-110 cursor-pointer" size={24} onClick={()=>navigate("/skill")} />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Skills or Goals Available</h3>
          <p className="text-foreground/70 mb-4 max-w-md mx-auto">
            Your skills and goals section is currently empty. Add skills and set goals to track your progress and showcase your expertise.
          </p>
        </div>
      )}
    </div>
  );
}

Third.propTypes = {
  profileData: PropTypes.object
};

export default Third;
