import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, Download, Star, BarChart3, Award, Share2, 
  Check, AlertCircle, ChevronRight, Loader2, BookOpen,
  Briefcase, GraduationCap, Code, Calendar, CheckCircle, Edit, Plus
} from "lucide-react";
import First from "../components/First";
import Second from "../components/Second";
import Third from "../components/Third";
import CV from "../components/CV";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { profileApi, externalApi } from "../services/api";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const Profile = ({ profile }) => {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const navigate = useNavigate();

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
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (data) => {
    if (!data) return 0;
    
    const fields = [
      data.name, data.subject, data.aboutMe, data.phone, data.email,
      data.linkedin, data.github
    ];
    
    const collections = [
      (data.skills?.length > 0 || data.testedSkills?.length > 0),
      data.education?.length > 0,
      data.projects?.length > 0,
      data.experience?.length > 0,
      data.certification?.length > 0
    ];
    
    const filledFields = fields.filter(field => field && field.toString().trim() !== "").length;
    const filledCollections = collections.filter(Boolean).length;
    
    // Calculate percentage based on basic fields (70% weight) and collections (30% weight)
    return Math.round((filledFields / fields.length * 0.7 + filledCollections / collections.length * 0.3) * 100);
  };

  // Calculate badge stars based on badge progress
  const getBadgeStars = (badge, testedSkills) => {
    // Calculate progress percentage
    let totalProgress = 0;
    const skillContribution = badge.skills?.length > 0 ? (100 / badge.skills.length) : 0;
    
    badge.skills?.forEach(skill => {
      const testedSkill = testedSkills?.find(ts => 
        ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
      );
      
      if (testedSkill) {
        const level = testedSkill.level?.toLowerCase();
        if (level === 'hard' || level === 'advanced' || level === 'expert') {
          totalProgress += skillContribution;
        } else if (level === 'medium' || level === 'intermediate') {
          totalProgress += skillContribution * 0.6;
        } else if (level === 'easy' || level === 'beginner') {
          totalProgress += skillContribution * 0.3;
        }
      }
    });
    
    // Return star count (1-4) based on progress
    if (totalProgress >= 100) return 4; // Platinum
    if (totalProgress >= 70) return 3;  // Gold
    if (totalProgress >= 40) return 2;  // Silver
    if (totalProgress > 0) return 1;    // Bronze
    return 1; // Default to Bronze
  };

  // Render badge stars based on star count
  const renderBadgeStars = (badgeStarCount, size = 16) => {
    return (
      <>
        {badgeStarCount >= 1 ? (
          <Star size={size} className="text-amber-700 fill-amber-700" />
        ) : (
          <Star size={size} className="text-foreground/20" />
        )}
        
        {badgeStarCount >= 2 ? (
          <Star size={size} className="text-gray-400 fill-gray-400" />
        ) : (
          <Star size={size} className="text-foreground/20" />
        )}
        
        {badgeStarCount >= 3 ? (
          <Star size={size} className="text-yellow-500 fill-yellow-500" />
        ) : (
          <Star size={size} className="text-foreground/20" />
        )}
        
        {badgeStarCount >= 4 ? (
          <Star size={size} className="text-purple-500 fill-purple-500" />
        ) : (
          <Star size={size} className="text-foreground/20" />
        )}
      </>
    );
  };

  // Get badge color classes based on badge progress
  const getBadgeColorClasses = (badge, testedSkills) => {
    const starCount = getBadgeStars(badge, testedSkills);
    
    // Background color for the badge icon
    let bgClass = 'bg-amber-700/10'; // Bronze (default)
    if (starCount === 4) bgClass = 'bg-purple-500/10'; // Platinum
    else if (starCount === 3) bgClass = 'bg-yellow-500/10'; // Gold
    else if (starCount === 2) bgClass = 'bg-gray-400/10'; // Silver
    
    // Text color for the badge icon
    let textClass = 'text-amber-700'; // Bronze (default)
    if (starCount === 4) textClass = 'text-purple-500'; // Platinum
    else if (starCount === 3) textClass = 'text-yellow-500'; // Gold
    else if (starCount === 2) textClass = 'text-gray-400'; // Silver
    
    // Border color for the badge card
    let borderClass = 'border-amber-700/30 hover:border-amber-700/50'; // Bronze (default)
    if (starCount === 4) borderClass = 'border-purple-500/30 hover:border-purple-500/50'; // Platinum
    else if (starCount === 3) borderClass = 'border-yellow-500/30 hover:border-yellow-500/50'; // Gold
    else if (starCount === 2) borderClass = 'border-gray-400/30 hover:border-gray-400/50'; // Silver
    
    // Pill background and text for badge level
    let pillClass = 'bg-amber-700/10 text-amber-700'; // Bronze (default)
    if (starCount === 4) pillClass = 'bg-purple-500/10 text-purple-500'; // Platinum
    else if (starCount === 3) pillClass = 'bg-yellow-500/10 text-yellow-500'; // Gold
    else if (starCount === 2) pillClass = 'bg-gray-400/10 text-gray-400'; // Silver
    
    return { bgClass, textClass, borderClass, pillClass };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError("Profile ID is missing.");
        toast.error("Profile ID is missing. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        const data = await profileApi.getProfile(profileId);
        setProfileData(data);
        // console.log("Profile data:", data); // Log the data to debug
        
        // Refresh external platform data once profile is loaded
        if (data) {
          try {
            const refreshData = await externalApi.refreshAllPlatforms(profileId);
            // Update the profile data with the latest external data
            if (refreshData?.profile) {
              setProfileData(refreshData.profile);
            }
          } catch (refreshError) {
            console.error("Error refreshing platform data:", refreshError);
            // Don't show error to user, just log it - profile data is still displayed
          }
        }
      } catch (error) {
        setError("Error fetching profile data.");
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileData._id}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile URL copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleDownloadCV = () => {
    if (!profileData) {
      toast.error('Profile data not available');
      return;
    }
    // We're using the CV component instead of this function
    toast.info('Using CV component to download');
  };

  // Get all unique skills (both tested and non-tested)
  const getAllUniqueSkills = () => {
    if (!profileData) return [];
    
    // Extract all skills
    const testedSkills = profileData.testedSkills?.map(ts => ts.skill.toLowerCase().trim()) || [];
    const regularSkills = profileData.skills?.map(skill => skill.toLowerCase().trim()) || [];
    
    // Combine and remove duplicates
    const allSkills = [...new Set([...testedSkills, ...regularSkills])];
    return allSkills;
  };

  // Calculate summary stats
  const getProfileStats = () => {
    if (!profileData) return {};
    
    const uniqueSkillsCount = getAllUniqueSkills().length;
    
    return {
      skills: uniqueSkillsCount,
      projects: profileData.projects?.length || 0,
      education: profileData.education?.length || 0,
      experience: profileData.experience?.length || 0,
      certification: profileData.certification?.length || 0,
      completionPercentage: calculateProfileCompletion(profileData)
    };
  };

  const stats = getProfileStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-500 border-background rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-background/50 backdrop-blur-md p-8 rounded-xl border border-border max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Error Loading Profile</h2>
            <p className="text-foreground/70">{error}</p>
            <Button onClick={() => navigate('/')} variant="default">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-muted/30 p-6 rounded-xl border border-border max-w-md text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-xl font-medium mb-2">Profile not found</p>
          <p className="text-muted-foreground mb-4">We couldn't find the profile you're looking for.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href="/login"}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground/90">My Profile</h1>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleShareProfile}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Copied!' : 'Share Profile'}
              </Button>
              
              <CV 
                profileData={profileData} 
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              />
            </div>
          </div>
          
          {/* Enhanced Profile Banner with mesh gradient */}
          <div className="w-full rounded-xl mb-8 overflow-hidden">
            {/* Background with mesh gradient */}
            <div className="relative">
              {/* Mesh gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">
                {/* Mesh circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
              </div>
              
              {/* Content */}
              <div className="relative p-6 sm:p-8 z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white/20">
                      <AvatarImage 
                        src={profileData?.profilePicture} 
                        alt={profileData.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-500/10 text-white text-2xl">
                        {profileData.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white mb-1">{profileData.name || "My Profile"}</h2>
                    <p className="text-white/80 mb-3">{profileData.subject || "Software Developer"}</p>
                    
                    {/* Bio excerpt */}
                    {profileData.aboutMe ? (
                      <p className="text-white/80 max-w-xl line-clamp-2 mb-4">{profileData.aboutMe}</p>
                    ) : (
                      <div className="flex sm:justify-start justify-center mb-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                          onClick={() => navigate('/edit')}
                        >
                          <Edit size={14} className="mr-1" />
                          Add About Me
                        </Button>
                      </div>
                    )}
                    
                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-full">
                          <Code size={14} className="text-white" />
                        </div>
                        <span className="text-white">{stats.skills} Skills</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-full">
                          <BookOpen size={14} className="text-white" />
                        </div>
                        <span className="text-white">{stats.projects} Projects</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-full">
                          <GraduationCap size={14} className="text-white" />
                        </div>
                        <span className="text-white">{stats.education} Education</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-full">
                          <Briefcase size={14} className="text-white" />
                        </div>
                        <span className="text-white">{stats.experience} Experience</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="hidden md:block">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => navigate('/edit')}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="w-full">
          {/* Custom Tabs Implementation */}
          <div className="mb-8">
            <div className="bg-background/50 p-1 border border-border rounded-lg flex flex-wrap">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-indigo-500/10 text-indigo-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User size={16} className="mr-2" />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab("skills")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "skills"
                    ? "bg-indigo-500/10 text-indigo-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 size={16} className="mr-2" />
                Skills & Stats
              </button>
              
              <button
                onClick={() => setActiveTab("badges")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "badges"
                    ? "bg-indigo-500/10 text-indigo-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Award size={16} className="mr-2" />
                Badges
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activeTab === "profile" && (
              <>
                <div className="col-span-1 space-y-8">
                  <div className="bg-background/50 backdrop-blur-md rounded-xl border border-border p-6 shadow-sm">
                    <First profileData={profileData} profile={profile} />
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-background/50 backdrop-blur-md rounded-xl border border-border p-6 shadow-sm">
                    <Second profileData={profileData} />
                  </div>
                </div>
              </>
            )}
            
            {activeTab === "skills" && (
              <div className="col-span-1 lg:col-span-3">
                <div className="bg-background/50 backdrop-blur-md rounded-xl border border-border p-6 shadow-sm">
                  <Third profileData={profileData} />
                </div>
              </div>
            )}
            
            {activeTab === "badges" && (
              <div className="col-span-1 lg:col-span-3">
                <div className="bg-background/50 backdrop-blur-md rounded-xl border border-border p-6 shadow-sm">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground/90 flex items-center gap-2">
                      <Award className="text-indigo-500" size={24} />
                      Your Badges
                    </h2>
                    
                    {profileData.badges && profileData.badges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profileData.badges.map((badge, index) => (
                          <motion.div
                            key={index}
                            className={`bg-background/60 rounded-xl border p-6 flex flex-col items-center text-center
                              ${getBadgeColorClasses(badge, profileData.testedSkills).borderClass}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4
                              ${getBadgeColorClasses(badge, profileData.testedSkills).bgClass}`}>
                              <Award size={40} className={getBadgeColorClasses(badge, profileData.testedSkills).textClass} />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">{badge.name}</h3>
                            
                            {/* Badge progress bar */}
                            <div className="w-full mt-3 mb-1">
                              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${getBadgeColorClasses(badge, profileData.testedSkills).textClass}`}
                                  style={{
                                    width: (() => {
                                      // Calculate overall badge progress percentage
                                      let totalProgress = 0;
                                      const skillContribution = badge.skills?.length > 0 ? (100 / badge.skills.length) : 0;
                                      
                                      badge.skills?.forEach(skill => {
                                        const testedSkill = profileData.testedSkills?.find(ts => 
                                          ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
                                        );
                                        
                                        if (testedSkill) {
                                          const level = testedSkill.level?.toLowerCase();
                                          if (level === 'hard' || level === 'advanced' || level === 'expert') {
                                            totalProgress += skillContribution;
                                          } else if (level === 'medium' || level === 'intermediate') {
                                            totalProgress += skillContribution * 0.6;
                                          } else if (level === 'easy' || level === 'beginner') {
                                            totalProgress += skillContribution * 0.3;
                                          }
                                        }
                                      });
                                      
                                      return `${totalProgress}%`;
                                    })()
                                  }}
                                />
                              </div>
                            </div>
                            
                            {badge.level && (
                              <div className="flex flex-col items-center gap-1 mt-2">
                                <div className="flex items-center gap-1">
                                  {renderBadgeStars(getBadgeStars(badge, profileData.testedSkills))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColorClasses(badge, profileData.testedSkills).pillClass}`} 
                                  title={
                                    getBadgeStars(badge, profileData.testedSkills) === 4 ? 'All skills for this badge have been mastered (100% completion)' : 
                                    getBadgeStars(badge, profileData.testedSkills) === 3 ? 'Advanced mastery of badge skills (70%+ completion)' : 
                                    getBadgeStars(badge, profileData.testedSkills) === 2 ? 'Intermediate mastery of badge skills (40%+ completion)' : 
                                    'Beginner mastery of badge skills (skills are contributing based on their test level)'
                                  }>
                                    {getBadgeStars(badge, profileData.testedSkills) === 4 ? 'Platinum' : 
                                     getBadgeStars(badge, profileData.testedSkills) === 3 ? 'Gold' : 
                                     getBadgeStars(badge, profileData.testedSkills) === 2 ? 'Silver' : 
                                     'Bronze'}
                                  </span>
                                  
                                  <span className="text-xs text-foreground/60">
                                    {(() => {
                                      // Calculate overall badge progress percentage
                                      let totalProgress = 0;
                                      const skillContribution = badge.skills?.length > 0 ? (100 / badge.skills.length) : 0;
                                      
                                      badge.skills?.forEach(skill => {
                                        const testedSkill = profileData.testedSkills?.find(ts => 
                                          ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
                                        );
                                        
                                        if (testedSkill) {
                                          const level = testedSkill.level?.toLowerCase();
                                          if (level === 'hard' || level === 'advanced' || level === 'expert') {
                                            totalProgress += skillContribution;
                                          } else if (level === 'medium' || level === 'intermediate') {
                                            totalProgress += skillContribution * 0.6;
                                          } else if (level === 'easy' || level === 'beginner') {
                                            totalProgress += skillContribution * 0.3;
                                          }
                                        }
                                      });
                                      
                                      return `${Math.round(totalProgress)}% complete`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Badge date earned */}
                            {(badge.dateEarned || badge.issuedDate) && (
                              <div className="flex items-center mt-3 text-xs text-foreground/60">
                                <Calendar size={12} className="mr-1" />
                                <span>{formatDate(badge.dateEarned || badge.issuedDate)}</span>
                              </div>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-4"
                                >
                                  Show Details
                                  <ChevronRight size={16} className="ml-1" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center justify-center gap-2 mb-2">
                                    <Award size={24} className={`${getBadgeColorClasses(badge, profileData.testedSkills).textClass}`} />
                                    <span>{badge.name}</span>
                                    
                                    <div className="bg-background/40 px-2 py-0.5 rounded-full text-xs ml-2 whitespace-nowrap flex items-center gap-1">
                                      {getBadgeStars(badge, profileData.testedSkills) === 4 ? 'Platinum' : 
                                       getBadgeStars(badge, profileData.testedSkills) === 3 ? 'Gold' : 
                                       getBadgeStars(badge, profileData.testedSkills) === 2 ? 'Silver' : 
                                       'Bronze'} Badge
                                      <div className="flex items-center ml-1">
                                        {renderBadgeStars(getBadgeStars(badge, profileData.testedSkills), 12)}
                                      </div>
                                    </div>
                                  </DialogTitle>
                                </DialogHeader>
                                
                                {badge.skills && badge.skills.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-foreground">Skills Required</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {badge.skills.map((skill, skillIndex) => {
                                        // More explicit testing of whether the skill is in testedSkills
                                        const testedSkill = profileData.testedSkills?.find(ts => 
                                          ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
                                        );
                                        const isTested = !!testedSkill;
                                        
                                        // Determine skill level and color
                                        let levelClass = "bg-amber-700/10 text-amber-700 border-amber-700/30"; // Bronze by default
                                        let contribution = 0;
                                        
                                        if (isTested) {
                                          const level = testedSkill.level?.toLowerCase();
                                          if (level === 'hard' || level === 'advanced' || level === 'expert') {
                                            // 3 stars - 100% contribution
                                            levelClass = "bg-purple-500/10 text-purple-500 border-purple-500/30"; // Platinum
                                            contribution = 100;
                                          } else if (level === 'medium' || level === 'intermediate') {
                                            // 2 stars - 60% contribution
                                            levelClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"; // Gold
                                            contribution = 60;
                                          } else if (level === 'easy' || level === 'beginner') {
                                            // 1 star - 30% contribution
                                            levelClass = "bg-gray-400/10 text-gray-400 border-gray-400/30"; // Silver
                                            contribution = 30;
                                          }
                                        }
                                        
                                        return (
                                          <div
                                            key={skillIndex}
                                            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border ${levelClass}`}
                                            title={isTested ? `Contributes ${contribution}% of skill weight` : 'Not tested yet'}
                                          >
                                            {skill}
                                            {isTested && (
                                              <>
                                                <CheckCircle size={12} className="ml-1" />
                                                <span className="ml-1 text-xs opacity-80">{contribution}%</span>
                                              </>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    
                                    {/* Add progress bar to show badge completion percentage */}
                                    <div className="mt-4">
                                      <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-xs font-medium text-foreground">Badge Completion</h4>
                                        <span 
                                          className={`text-xs ${
                                            getBadgeColorClasses(badge, profileData.testedSkills).textClass
                                          }`}
                                        >
                                          {(() => {
                                            // Calculate overall badge progress percentage
                                            let totalProgress = 0;
                                            const skillContribution = badge.skills.length > 0 ? (100 / badge.skills.length) : 0;
                                            
                                            badge.skills.forEach(skill => {
                                              const testedSkill = profileData.testedSkills?.find(ts => 
                                                ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
                                              );
                                              
                                              if (testedSkill) {
                                                const level = testedSkill.level?.toLowerCase();
                                                if (level === 'hard' || level === 'advanced' || level === 'expert') {
                                                  totalProgress += skillContribution;
                                                } else if (level === 'medium' || level === 'intermediate') {
                                                  totalProgress += skillContribution * 0.6;
                                                } else if (level === 'easy' || level === 'beginner') {
                                                  totalProgress += skillContribution * 0.3;
                                                }
                                              }
                                            });
                                            
                                            return `${Math.round(totalProgress)}%`;
                                          })()}
                                        </span>
                                      </div>
                                      <div className="h-2 bg-background rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            getBadgeColorClasses(badge, profileData.testedSkills).textClass
                                          }`}
                                          style={{
                                            width: (() => {
                                              // Calculate overall badge progress percentage
                                              let totalProgress = 0;
                                              const skillContribution = badge.skills.length > 0 ? (100 / badge.skills.length) : 0;
                                              
                                              badge.skills.forEach(skill => {
                                                const testedSkill = profileData.testedSkills?.find(ts => 
                                                  ts.skill.toLowerCase().trim() === skill.toLowerCase().trim()
                                                );
                                                
                                                if (testedSkill) {
                                                  const level = testedSkill.level?.toLowerCase();
                                                  if (level === 'hard' || level === 'advanced' || level === 'expert') {
                                                    totalProgress += skillContribution;
                                                  } else if (level === 'medium' || level === 'intermediate') {
                                                    totalProgress += skillContribution * 0.6;
                                                  } else if (level === 'easy' || level === 'beginner') {
                                                    totalProgress += skillContribution * 0.3;
                                                  }
                                                }
                                              });
                                              
                                              return `${totalProgress}%`;
                                            })()
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Badge date earned (in dialog) */}
                                {(badge.dateEarned || badge.issuedDate) && (
                                  <div className="flex items-center mt-4 text-sm text-foreground/60">
                                    <Calendar size={14} className="mr-2" />
                                    <span>Earned on {formatDate(badge.dateEarned || badge.issuedDate)}</span>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-background/60 rounded-xl border border-border p-8 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                          <Award size={32} className="text-amber-500" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No Badges Yet</h3>
                        <p className="text-foreground/70 mb-6">Complete skill tests to earn badges and showcase your expertise</p>
                        <Button onClick={() => navigate('/test')}>
                          Take a Skill Test
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Badge FAQ Section */}
                  <div className="mt-10 bg-background/70 rounded-xl border border-border/50 p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="text-indigo-500" size={20} />
                      Badge System FAQ
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">What are badges?</h4>
                        <p className="text-sm text-muted-foreground">
                          Badges represent your mastery of skill combinations related to specific job roles or technical domains.
                          Each badge requires proficiency in a set of related skills.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">How do I earn badges?</h4>
                        <p className="text-sm text-muted-foreground">
                          Badges are earned by testing your skills through our assessment system. 
                          When you test a skill that's part of a badge, you contribute toward completing that badge.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">What do the badge levels mean?</h4>
                        <p className="text-sm text-muted-foreground">
                          Badges have four levels of achievement based on your skill proficiency:
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-4 mt-2">
                          <li className="flex items-center gap-2">
                            <div className="flex">
                              <Star size={14} className="text-amber-700 fill-amber-700" />
                              <Star size={14} className="text-foreground/20" />
                              <Star size={14} className="text-foreground/20" />
                              <Star size={14} className="text-foreground/20" />
                            </div>
                            <span><strong>Bronze:</strong> Basic progress (1-39% completion)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="flex">
                              <Star size={14} className="text-amber-700 fill-amber-700" />
                              <Star size={14} className="text-gray-400 fill-gray-400" />
                              <Star size={14} className="text-foreground/20" />
                              <Star size={14} className="text-foreground/20" />
                            </div>
                            <span><strong>Silver:</strong> Intermediate mastery (40-69% completion)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="flex">
                              <Star size={14} className="text-amber-700 fill-amber-700" />
                              <Star size={14} className="text-gray-400 fill-gray-400" />
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <Star size={14} className="text-foreground/20" />
                            </div>
                            <span><strong>Gold:</strong> Advanced mastery (70-99% completion)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="flex">
                              <Star size={14} className="text-amber-700 fill-amber-700" />
                              <Star size={14} className="text-gray-400 fill-gray-400" />
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <Star size={14} className="text-purple-500 fill-purple-500" />
                            </div>
                            <span><strong>Platinum:</strong> Complete mastery (100% completion)</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">How is badge progress calculated?</h4>
                        <p className="text-sm text-muted-foreground">
                          Each skill in a badge contributes equally to its completion, with the contribution level determined by your skill test performance:
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                          <li>• <strong>Easy/Beginner:</strong> 30% contribution</li>
                          <li>• <strong>Medium/Intermediate:</strong> 60% contribution</li>
                          <li>• <strong>Hard/Advanced/Expert:</strong> 100% contribution</li>
                          <li>• <strong>Not tested:</strong> 0% contribution</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Can I lose a badge?</h4>
                        <p className="text-sm text-muted-foreground">
                          No, once you earn a badge it's yours to keep. However, the level of the badge can change 
                          if you retest skills with a different difficulty level.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
