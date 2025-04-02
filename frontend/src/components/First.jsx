import React from 'react';
import {
  Linkedin, Github, Link, Phone, Mail, Globe, MapPin, Calendar, User, Code
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

function First({ profileData, profile }) {
  // Ensure profileData is never undefined when accessed
  const safeProfileData = profileData || {};
  const safePicture = profileData?.profilePicture || 'https://via.placeholder.com/200';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-indigo-500/30">
            <AvatarImage 
              src={safePicture}
              alt={safeProfileData.name || "Profile"}
              className="object-cover"
            />
            <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-4xl">
              {safeProfileData.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold text-foreground">{safeProfileData.name || 'User'}</h2>
          <p className="text-foreground/70">{safeProfileData.subject || "Software Developer"}</p>
        </div>
        
        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-4">
          {safeProfileData.linkedin && (
            <a
              href={safeProfileData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background/50 p-2 rounded-full border border-border hover:border-indigo-500/30 hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-all duration-300"
            >
              <Linkedin size={18} />
            </a>
          )}
          
          {safeProfileData.github?.username && (
            <a
              href={`https://github.com/${safeProfileData.github.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background/50 p-2 rounded-full border border-border hover:border-indigo-500/30 hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-all duration-300"
            >
              <Github size={18} />
            </a>
          )}
          
          {safeProfileData.leetCode?.username && (
            <a
              href={`https://leetcode.com/${safeProfileData.leetCode.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background/50 p-2 rounded-full border border-border hover:border-indigo-500/30 hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-all duration-300"
            >
              <Link size={18} />
            </a>
          )}
        </div>
      </div>
      
      {/* About Section */}
      {safeProfileData.aboutMe && (
        <div className="bg-background/50 rounded-xl p-4 border border-border">
          <h3 className="text-sm font-medium text-foreground/70 mb-2 flex items-center gap-2">
            <User size={14} className="text-indigo-500" />
            About Me
          </h3>
          <p className="text-foreground/80 text-sm">{safeProfileData.aboutMe}</p>
        </div>
      )}
      
      {/* Contact Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/70 mb-2">Contact Information</h3>
        
        {safeProfileData.phone && (
          <div className="flex items-center gap-3 bg-background/50 py-2 px-3 rounded-lg border border-border hover:border-indigo-500/30 transition-all duration-300 group">
            <Phone className="text-indigo-500 group-hover:text-indigo-400" size={16} />
            <span className="text-foreground/80 text-sm">{safeProfileData.phone}</span>
          </div>
        )}
        
        {safeProfileData.email && (
          <div className="flex items-center gap-3 bg-background/50 py-2 px-3 rounded-lg border border-border hover:border-indigo-500/30 transition-all duration-300 group">
            <Mail className="text-indigo-500 group-hover:text-indigo-400" size={16} />
            <span className="text-foreground/80 text-sm">{safeProfileData.email}</span>
          </div>
        )}
        
        {/* Always show at least one contact info placeholder if both are missing */}
        {!safeProfileData.phone && !safeProfileData.email && (
          <div className="flex items-center gap-3 bg-background/50 py-2 px-3 rounded-lg border border-border hover:border-indigo-500/30 transition-all duration-300 group">
            <Mail className="text-indigo-500 group-hover:text-indigo-400" size={16} />
            <span className="text-foreground/80 text-sm">No contact information</span>
          </div>
        )}
      </div>
      
      {/* Coding Profiles */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/70 mb-2">Coding Profiles</h3>
        
        {safeProfileData.leetCode?.username && (
          <a
            href={`https://leetcode.com/${safeProfileData.leetCode.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-background/50 py-2 px-3 rounded-lg border border-border hover:border-indigo-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/10 p-1 rounded-md">
                <Link className="text-yellow-500" size={14} />
              </div>
              <span className="text-foreground/80 text-sm">LeetCode</span>
            </div>
            <div className="bg-yellow-500/10 px-2 py-0.5 rounded-full text-yellow-500 text-xs font-medium">
              {safeProfileData.leetCode.totalSolved || 0} solved
            </div>
          </a>
        )}
        
        {safeProfileData.codeChef?.username && (
          <a
            href={`https://www.codechef.com/users/${safeProfileData.codeChef.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-background/50 py-2 px-3 rounded-lg border border-border hover:border-indigo-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/10 p-1 rounded-md">
                <Globe className="text-orange-500" size={14} />
              </div>
              <span className="text-foreground/80 text-sm">CodeChef</span>
            </div>
            <div className="bg-orange-500/10 px-2 py-0.5 rounded-full text-orange-500 text-xs font-medium">
              Rating: {safeProfileData.codeChef.rating || 0}
            </div>
          </a>
        )}
        
        {safeProfileData.github?.username && (
          <a
            href={`https://github.com/${safeProfileData.github.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-background/50 py-2 px-3 rounded-lg border border-border hover:border-indigo-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/10 p-1 rounded-md">
                <Github className="text-indigo-500" size={14} />
              </div>
              <span className="text-foreground/80 text-sm">GitHub</span>
            </div>
            <div className="bg-indigo-500/10 px-2 py-0.5 rounded-full text-indigo-500 text-xs font-medium">
              {safeProfileData.github.repositories > 0
                ? `${safeProfileData.github.repositories} repos`
                : "View Profile"}
            </div>
          </a>
        )}
        
        {/* Show placeholder if no coding profiles */}
        {!safeProfileData.leetCode?.username && !safeProfileData.codeChef?.username && !safeProfileData.github?.username && (
          <div className="flex items-center gap-3 bg-background/50 py-2 px-3 rounded-lg border border-border">
            <div className="bg-gray-500/10 p-1 rounded-md">
              <Code className="text-gray-500" size={14} />
            </div>
            <span className="text-foreground/80 text-sm">No coding profiles added yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default First;
