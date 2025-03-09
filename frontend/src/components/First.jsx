import React from 'react';
import {
  Linkedin, Github, Link, Phone, Mail, Award, Album
} from 'lucide-react';
import CIcon from '@coreui/icons-react';
import { cibLeetcode } from '@coreui/icons';

function First({ profileData,profile }) {
  console.log(profile.picture)
  return (
    <div>
    <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-8 text-center border border-white/20 transition-all duration-500 
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
        hover:border-white/30">
      <div className="flex justify-center mb-6">
        <img
          src={profile.picture}
          alt="Profile"
          className="w-40 h-40 rounded-full border-4 border-white/30 object-cover shadow-lg"
        />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 tracking-wider">{profileData.name}</h2>
      {/* Social Links */}
      <div className="flex justify-center space-x-6 mt-4">
        <a
          href={profileData.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C5C5C9] hover:text-white hover:scale-125 transition-all duration-300"
        >
          <Linkedin size={28} className='text-red-200' />
        </a>
        <a
          href={profileData.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C5C5C9] hover:text-white hover:scale-125 transition-all duration-300"
        >
          <Github size={28} className='text-red-200' />
        </a>
        <a
          href={profileData.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C5C5C9] hover:text-white hover:scale-125 transition-all duration-300"
        >
          <Link size={28} className='text-red-200' />
        </a>
      </div>
      {/* About Section */}
      <div className="mt-6 text-[#C5C5C9] text-sm italic">
        <p>{profileData.aboutMe}</p>
      </div>
      {/* Contact Details */}
      <div className="mt-6 text-[#C5C5C9] text-sm space-y-3">
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-md py-2 px-4 border border-white/20">
          <Phone className="mr-2 text-white" size={18} />
          <span>{profileData.phone}</span>
        </div>
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-md py-2 px-4 border border-white/20">
          <Mail className="mr-2 text-white" size={18} />
          <span>{profileData.email}</span>
        </div>
        {/* LeetCode Problems Solved */}
        <div>
  {/* LeetCode Profile */}
  <a
    href={`https://leetcode.com/${profileData.leetCode.username}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-md py-2 px-4 border border-white/20 hover:bg-white/20 transition-all"
  >
    <img src="https://img.icons8.com/?size=100&id=S22n5FcHWTiO&format=png&color=ffffff" 
    alt="LeetCode Icon" className="mr-2 w-5 h-5"
    />
    <span>Problems Solved: {profileData.leetCode.totalSolved}</span>
  </a>

  {/* CodeChef Profile */}
  <a
    href={`https://www.codechef.com/users/${profileData.codeChef.username }`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-md py-2 px-4 border border-white/20 hover:bg-white/20 transition-all mt-2"
  >
    <img
      src="https://img.icons8.com/?size=100&id=4z2zrIWYmGqx&format=png&color=ffffff"
      alt="CodeChef Icon"
      className="mr-2 w-5 h-5"
    />
    <span>CodeChef Rating: {profileData.codeChef.rating}</span>
  </a>
</div>

      </div>
      <div>
      </div>
      
      </div>
      
        
    </div>
    
  );
}

export default First;
