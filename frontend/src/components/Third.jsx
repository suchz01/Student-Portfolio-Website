import React from 'react';
import { Target, Scan, Award } from 'lucide-react';

function Third({ profileData }) {
  const calculateMissingSkills = (requiredSkills, currentSkills) => {
    if (!Array.isArray(requiredSkills) || !Array.isArray(currentSkills)) {
      return [];
    }
    const lowerCaseCurrentSkills = currentSkills.map(skill => skill.toLowerCase());
    return requiredSkills.filter(skill => !lowerCaseCurrentSkills.includes(skill.toLowerCase()));
  };

  const formatDateToIndian = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <div className='bg-[#29253b] rounded-lg shadow-lg p-6  '>
      {/* Third Column: Goals & Skills */}
      <div className="space-y-8">
        {/* Current Goals Section */}
        <div
          className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
          transition-all duration-500 
          hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
          hover:border-white/30"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-white">
            <Target className="mr-3 text-[#45f15c]" size={24} />
            Current Goals
          </h3>
          <ul className="space-y-4">
            {profileData.currentGoal && (
              <li
                className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                <p className="text-white group-hover:text-[#DEDEE3] text-2xl transition-colors">{profileData.currentGoal.role}</p>
                <p className="text-white mt-2">Missing Skills:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {calculateMissingSkills(profileData.currentGoal.skill, profileData.skills).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-white/20 hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Skill Sets Section */}
        <div
          className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
          transition-all duration-500 
          hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
          hover:border-white/30"
        >
          <h3 className="text-xl font-semibold flex items-center mb-6 text-white">
            <Scan className="mr-3 text-[#45f15c]" size={24} />
            Skill Sets
          </h3>
          <div className="flex flex-wrap gap-3">
            {profileData.skills.map((skill, index) => (
              <div key={index} className="relative group p-1">
                <span
                  className="bg-white/10 text-[#DEDEE3] px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  {skill}
                </span>
                {profileData.testedSkills && profileData.testedSkills.some(testedSkill => testedSkill.skill.toLowerCase() === skill.toLowerCase()) ? (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col 
                    bg-[#29253b] backdrop-blur-lg text-[#DEDEE3] text-sm rounded-lg border border-[#97d8a0] p-4 shadow-lg w-56 space-y-2">
                    <p className="font-semibold text-white">Tested Skill Info:</p>
                    {profileData.testedSkills.filter(testedSkill => testedSkill.skill.toLowerCase() === skill.toLowerCase()).map((testedSkill, testedIndex) => (
                      <div key={testedIndex} className="flex flex-col space-y-1">
                        <span>Score: {testedSkill.score}</span>
                        <span>Tested On: {formatDateToIndian(testedSkill.dateTested)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col 
                    bg-[#29253b] backdrop-blur-lg text-[#DEDEE3] text-sm rounded-lg border border-[#97d8a0] p-4 shadow-lg w-56 space-y-2">
                    <p className="font-semibold text-white">Tested Skill Info:</p>
                    <span>Test Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Badges Section */}
        <div
          className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
          transition-all duration-500 
          hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
          hover:border-white/30"
        >
          <h3 className="text-xl font-semibold flex items-center mb-6 text-white">
            <Award className="mr-3 text-[#45f15c]" size={24} />
            Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {profileData.badges.map((badge, index) => (
              <div key={index} className="relative group p-1">
                <span
                  className="bg-white/10 text-[#DEDEE3] px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  {badge.name}
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col 
              bg-[#29253b] backdrop-blur-lg text-[#DEDEE3] text-sm rounded-lg border border-[#97d8a0] p-4 shadow-lg w-56 space-y-2">
              <p className="font-semibold text-white">Required Skills:</p>
              <div className="flex flex-wrap gap-2">
              {badge.skills.map((skill, skillIndex) => (
              <span
              key={skillIndex} className="bg-white/10 text-[#DEDEE3] px-3 py-1 rounded-full text-xs hover:bg-white/20 transition-all duration-300">
        {skill}
      </span>
    ))}
  </div>
</div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Third;
