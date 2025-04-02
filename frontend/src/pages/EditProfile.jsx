import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Briefcase,
  Award,
  BookOpen,
  Activity,
  Phone,
  Code,
  Loader2,
  Save,
  Trash2,
  PlusCircle,
  Github,
  Linkedin,
  Mail,
  Link,
  Building2,
  FolderGit2,
  GraduationCap,
  Code2
} from "lucide-react";
import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

const EditProfile = ({ profile }) => {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState({});
  const [codechefUsername, setCodechefUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [rawInputs, setRawInputs] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/profile/${profileId}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setCodechefUsername(data.codeChef.username || "");
          setLeetcodeUsername(data.leetCode.username || "");
          
          // Initialize rawInputs state with loaded data
          const initialRawInputs = {};
          
          // Projects technologies
          if (data.projects && data.projects.length > 0) {
            data.projects.forEach((project, index) => {
              if (project.technologies && Array.isArray(project.technologies)) {
                initialRawInputs[`projects_${index}_technologies`] = project.technologies.join(', ');
              }
            });
          }
          
          // Experience skills
          if (data.experience && data.experience.length > 0) {
            data.experience.forEach((exp, index) => {
              if (exp.skills && Array.isArray(exp.skills)) {
                initialRawInputs[`experience_${index}_skills`] = exp.skills.join(', ');
              }
            });
          }
          
          // Certification skills
          if (data.certification && data.certification.length > 0) {
            data.certification.forEach((cert, index) => {
              if (cert.skills && Array.isArray(cert.skills)) {
                initialRawInputs[`certification_${index}_skills`] = cert.skills.join(', ');
              }
            });
          }
          
          setRawInputs(initialRawInputs);
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Error fetching profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    toast.info("Saving profile changes...");

    // Process any remaining raw inputs before submitting
    const updatedProfileData = { ...profileData };
    
    // Process projects technologies
    if (updatedProfileData.projects) {
      updatedProfileData.projects.forEach((project, index) => {
        const key = `projects_${index}_technologies`;
        if (rawInputs[key] !== undefined) {
          const technologies = rawInputs[key]
            .split(',')
            .map(tech => tech.trim())
            .filter(Boolean);
          project.technologies = technologies;
        }
      });
    }
    
    // Process experience skills
    if (updatedProfileData.experience) {
      updatedProfileData.experience.forEach((experience, index) => {
        const key = `experience_${index}_skills`;
        if (rawInputs[key] !== undefined) {
          const skills = rawInputs[key]
            .split(',')
            .map(skill => skill.trim())
            .filter(Boolean);
          experience.skills = skills;
        }
      });
    }
    
    // Process certification skills
    if (updatedProfileData.certification) {
      updatedProfileData.certification.forEach((cert, index) => {
        const key = `certification_${index}_skills`;
        if (rawInputs[key] !== undefined) {
          const skills = rawInputs[key]
            .split(',')
            .map(skill => skill.trim())
            .filter(Boolean);
          cert.skills = skills;
        }
      });
    }

    const fields = [
      "name",
      "aboutMe",
      "projects",
      "experience",
      "certification",
      "education",
      "extracurricular",
      "subject",
      "profilePicture",
      "phone",
      "email",
      "linkedin",
    ];

    try {
      // Validate projects to ensure required fields are present
      const validatedProjects = (updatedProfileData.projects || []).filter(project => project.name?.trim());
      updatedProfileData.projects = validatedProjects;

      // Handle regular fields
      for (const field of fields) {
        const valueToSend = field === 'projects' ? validatedProjects : updatedProfileData[field];
        const response = await fetch(`http://localhost:8080/profile/${field}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, value: valueToSend }),
        });
        if (!response.ok) throw new Error(`Failed to update ${field}`);
      }

      // Handle github using new endpoint
      if (updatedProfileData.github) {
        const response = await fetch(`http://localhost:8080/profile/update/field`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            profileId, 
            field: 'github',
            value: updatedProfileData.github 
          }),
        });
        if (!response.ok) throw new Error(`Failed to update github`);
      }

      await handleCodechefSubmit();
      await handleLeetcodeSubmit();
      await handleGithubSubmit();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (event, field) => {
    const { value } = event.target;
    
    // Special handling for LinkedIn URL
    if (field === "linkedin" && value) {
      // Store the complete LinkedIn URL, including https://linkedin.com/in/ if not present
      let processedValue = value.trim();
      
      // If user just entered username without the URL, add the prefix
      if (!processedValue.includes("linkedin.com")) {
        processedValue = `https://linkedin.com/in/${processedValue}`;
      }
      
      // If missing https:// prefix, add it
      if (!processedValue.startsWith("http")) {
        processedValue = `https://${processedValue}`;
      }
      
      setProfileData((prev) => ({ ...prev, [field]: processedValue }));
    } else {
      setProfileData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleItemChange = (index, field, itemField, value) => {
    const updatedItems = [...(profileData[field] || [])];
    
    // For array fields, ensure we always have an array, even if empty
    if ((itemField === 'skills' || itemField === 'technologies')) {
      // Make sure value is always an array
      const arrayValue = Array.isArray(value) ? value : [];
      updatedItems[index] = { ...updatedItems[index], [itemField]: arrayValue };
    } else {
      updatedItems[index] = { ...updatedItems[index], [itemField]: value };
    }
    
    setProfileData((prev) => ({ ...prev, [field]: updatedItems }));
  };

  const handleRawInputChange = (index, field, itemField, value) => {
    setRawInputs(prev => ({
      ...prev,
      [`${field}_${index}_${itemField}`]: value
    }));
  };

  const processRawInput = (index, field, itemField) => {
    const key = `${field}_${index}_${itemField}`;
    const rawValue = rawInputs[key];
    
    if (rawValue !== undefined) {
      const processedArray = rawValue.split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      handleItemChange(index, field, itemField, processedArray);
    }
  };

  const handleAddItem = (section) => {
    console.log(`Adding new item to ${section}`);
    
    let newItem = {};
    
    if (section === "projects") {
      newItem = {
        name: "",
        description: "",
        link: "",
        technologies: [],
        startDate: "",
        endDate: "",
        isActive: false
      };
    } else if (section === "experience") {
      newItem = {
        companyName: "",
        jobRole: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        skills: [],
        description: ""
      };
    } else if (section === "certification") {
      newItem = {
        certificateName: "",
        instituteName: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialURL: "",
        skills: [],
        desc: ""
      };
    } else if (section === "education") {
      newItem = {
        instituteName: "",
        degree: "",
        stream: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        marks: ""
      };
    }
    
    console.log('New item to add:', newItem);
    console.log('Current items:', profileData[section]);
    
    setProfileData((prev) => {
      const updated = {
        ...prev,
        [section]: [...(prev[section] || []), newItem],
      };
      console.log('Updated state:', updated[section]);
      
      // Initialize rawInputs for the new item if it has array fields
      const newIndex = (prev[section] || []).length;
      if (section === "projects") {
        setRawInputs(prevRawInputs => ({
          ...prevRawInputs,
          [`projects_${newIndex}_technologies`]: ""
        }));
      } else if (section === "experience") {
        setRawInputs(prevRawInputs => ({
          ...prevRawInputs,
          [`experience_${newIndex}_skills`]: ""
        }));
      } else if (section === "certification") {
        setRawInputs(prevRawInputs => ({
          ...prevRawInputs,
          [`certification_${newIndex}_skills`]: ""
        }));
      }
      
      return updated;
    });
  };

  const handleDeleteItem = async (field, index) => {
    try {
      toast.info("Deleting item...");
      const response = await fetch(
        `http://localhost:8080/profile/${profileId}/${field}/${index}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        toast.success("Item deleted successfully");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error(`Error deleting ${field}:`, error);
      toast.error(`Error deleting ${field}`);
    }
  };

  const handleCodechefSubmit = async () => {
    if (!codechefUsername) return;
    try {
      const response = await fetch("http://localhost:8080/codechef", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, username: codechefUsername }),
      });
      if (!response.ok) setError("Error updating CodeChef profile.");
    } catch (error) {
      setError("Error submitting CodeChef data.");
    }
  };

  const handleLeetcodeSubmit = async () => {
    if (!leetcodeUsername) return;
    try {
      const response = await fetch("http://localhost:8080/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, username: leetcodeUsername }),
      });
      if (!response.ok) setError("Error updating LeetCode profile.");
    } catch (error) {
      setError("Error submitting LeetCode data.");
    }
  };

  const handleGithubSubmit = async () => {
    if (!profileData.github?.username) return;
    try {
      const response = await fetch("http://localhost:8080/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, username: profileData.github.username }),
      });
      if (!response.ok) setError("Error updating GitHub profile.");
    } catch (error) {
      setError("Error submitting GitHub data.");
    }
  };

  const handleAddExtracurricular = () => {
    console.log("Adding new extracurricular activity");
    console.log("Current extracurricular activities:", profileData.extracurricular);
    
    setProfileData((prev) => {
      const updated = {
        ...prev,
        extracurricular: [...(prev.extracurricular || []), ""]
      };
      console.log("Updated extracurricular activities:", updated.extracurricular);
      return updated;
    });
  };

  const handleExtracurricularChange = (index, value) => {
    const updatedExtracurricular = [...(profileData.extracurricular || [])];
    updatedExtracurricular[index] = value;
    
    setProfileData((prev) => ({
      ...prev,
      extracurricular: updatedExtracurricular,
    }));
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: UserCircle },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "experience", label: "Experience", icon: Activity },
    { id: "certification", label: "Certificates", icon: Award },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "coding", label: "Coding Profiles", icon: Code },
    {
      id: "extracurricular",
      label: "Extracurricular Activities",
      icon: Activity,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <UserCircle className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Update your personal details and bio</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium flex items-center gap-2">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.name || ""}
                      onChange={(e) => handleChange(e, "name")}
                      className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium flex items-center gap-2">
                      <span>Professional Title</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.subject || ""}
                      onChange={(e) => handleChange(e, "subject")}
                      className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                transition-all duration-200"
                      placeholder="e.g., Frontend Developer, UX Designer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium flex items-center gap-2">
                      <span>Update you profile picture</span>
                    </label>
                    <input
                      type="text"
                      onChange={(e) => handleChange(e, "profilePicture")}
                      className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                transition-all duration-200"
                      placeholder="e.g., https://example.com/profile.jpg"
                    />
                  </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">About Me</label>
                  <TextareaAutosize
                    value={profileData.aboutMe || ""}
                    onChange={(e) => handleChange(e, "aboutMe")}
                    className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                              border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                              transition-all duration-200 min-h-[120px] resize-none"
                    placeholder="Write a short professional bio about yourself, your skills, and career goals..."
                    minRows={4}
                    maxRows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A well-written bio helps employers understand your background and expertise.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("projects")}
                  >
                    Continue to Projects
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "projects":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Projects</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Add your projects to showcase your work</p>
              </div>
              
              <div className="p-6 space-y-4">
                {profileData.projects?.map((project, index) => (
                  <div 
                    key={index}
                    className="bg-background/50 rounded-xl p-5 border border-border/50 transition-all hover:shadow-md hover:border-indigo-500/20"
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <Code2 className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="Project Name *"
                          value={project.name || ""}
                          onChange={(e) => handleItemChange(index, "projects", "name", e.target.value)}
                          required
                          className="font-medium text-lg bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Project URL</label>
                        <input
                          type="url"
                          placeholder="e.g., https://github.com/yourusername/project"
                          value={project.link || ""}
                          onChange={(e) => handleItemChange(index, "projects", "link", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Technologies Used (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g., React, Node.js, MongoDB"
                          value={rawInputs[`projects_${index}_technologies`] !== undefined 
                            ? rawInputs[`projects_${index}_technologies`]
                            : project.technologies ? project.technologies.join(", ") : ""}
                          onChange={(e) => {
                            handleRawInputChange(index, "projects", "technologies", e.target.value);
                          }}
                          onBlur={() => processRawInput(index, "projects", "technologies")}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                          <input
                            type="date"
                            placeholder="Start date"
                            value={project.startDate ? new Date(project.startDate).toISOString().substring(0, 10) : ""}
                            onChange={(e) => handleItemChange(index, "projects", "startDate", e.target.value)}
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                          <div className="space-y-2">
                            <input
                              type="date"
                              placeholder="End date"
                              value={project.endDate ? new Date(project.endDate).toISOString().substring(0, 10) : ""}
                              onChange={(e) => handleItemChange(index, "projects", "endDate", e.target.value)}
                              disabled={project.isActive}
                              className={`w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                        border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                        transition-all duration-200 ${project.isActive ? 'opacity-50' : ''}`}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`active-project-${index}`}
                                checked={project.isActive || false}
                                onChange={(e) => handleItemChange(index, "projects", "isActive", e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                              />
                              <label htmlFor={`active-project-${index}`} className="text-sm text-muted-foreground">
                                Active project
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <TextareaAutosize
                          placeholder="Describe your project, its features, and your role..."
                          value={project.description || ""}
                          onChange={(e) => handleItemChange(index, "projects", "description", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200 min-h-[80px] resize-none"
                          minRows={3}
                          maxRows={5}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem("projects", index)}
                        className="text-xs gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handleAddItem("projects")}
                  className="w-full justify-center gap-2 p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30 text-foreground hover:text-indigo-600 transition-all"
                  type="button"
                >
                  <PlusCircle size={16} />
                  <span>Add Project</span>
                </Button>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("personal")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("experience")}
                  >
                    Continue to Experience
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "experience":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Experience</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Add your work experience</p>
              </div>
              
              <div className="p-6 space-y-4">
                {profileData.experience?.map((experience, index) => (
                  <div 
                    key={index}
                    className="bg-background/50 rounded-xl p-5 border border-border/50 transition-all hover:shadow-md hover:border-indigo-500/20"
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <Building2 className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="Company Name *"
                          value={experience.companyName || ""}
                          onChange={(e) => handleItemChange(index, "experience", "companyName", e.target.value)}
                          required
                          className="font-medium text-lg bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Job Title *</label>
                        <input
                          type="text"
                          placeholder="e.g., Frontend Developer"
                          value={experience.jobRole || ""}
                          onChange={(e) => handleItemChange(index, "experience", "jobRole", e.target.value)}
                          required
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="e.g., New York, NY or Remote"
                          value={experience.location || ""}
                          onChange={(e) => handleItemChange(index, "experience", "location", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                          <input
                            type="date"
                            placeholder="Start date"
                            value={experience.startDate ? new Date(experience.startDate).toISOString().substring(0, 10) : ""}
                            onChange={(e) => handleItemChange(index, "experience", "startDate", e.target.value)}
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                          <div className="space-y-2">
                            <input
                              type="date"
                              placeholder="End date"
                              value={experience.endDate ? new Date(experience.endDate).toISOString().substring(0, 10) : ""}
                              onChange={(e) => handleItemChange(index, "experience", "endDate", e.target.value)}
                              disabled={experience.isCurrent}
                              className={`w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                        border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                        transition-all duration-200 ${experience.isCurrent ? 'opacity-50' : ''}`}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`current-position-${index}`}
                                checked={experience.isCurrent || false}
                                onChange={(e) => handleItemChange(index, "experience", "isCurrent", e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                              />
                              <label htmlFor={`current-position-${index}`} className="text-sm text-muted-foreground">
                                Current position
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Skills Used (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g., React, Node.js, Project Management"
                          value={rawInputs[`experience_${index}_skills`] !== undefined 
                            ? rawInputs[`experience_${index}_skills`]
                            : experience.skills ? experience.skills.join(", ") : ""}
                          onChange={(e) => {
                            handleRawInputChange(index, "experience", "skills", e.target.value);
                          }}
                          onBlur={() => processRawInput(index, "experience", "skills")}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <TextareaAutosize
                          placeholder="Describe your role and responsibilities..."
                          value={experience.description || ""}
                          onChange={(e) => handleItemChange(index, "experience", "description", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200 min-h-[80px] resize-none"
                          minRows={3}
                          maxRows={5}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem("experience", index)}
                        className="text-xs gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handleAddItem("experience")}
                  className="w-full justify-center gap-2 p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30 text-foreground hover:text-indigo-600 transition-all"
                  type="button"
                >
                  <PlusCircle size={16} />
                  <span>Add Experience</span>
                </Button>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("projects")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("certification")}
                  >
                    Continue to Certifications
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "certification":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <Award className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Certifications</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Add your certifications and achievements</p>
              </div>
              
              <div className="p-6 space-y-4">
                {profileData.certification?.map((cert, index) => (
                  <div 
                    key={index}
                    className="bg-background/50 rounded-xl p-5 border border-border/50 transition-all hover:shadow-md hover:border-indigo-500/20"
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <Award className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="Certificate Name *"
                          value={cert.certificateName || ""}
                          onChange={(e) => handleItemChange(index, "certification", "certificateName", e.target.value)}
                          required
                          className="font-medium text-lg bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Issuing Organization *</label>
                        <input
                          type="text"
                          placeholder="e.g., Microsoft, AWS, Google"
                          value={cert.instituteName || ""}
                          onChange={(e) => handleItemChange(index, "certification", "instituteName", e.target.value)}
                          required
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Issue Date</label>
                          <input
                            type="date"
                            placeholder="Issue date"
                            value={cert.issueDate ? new Date(cert.issueDate).toISOString().substring(0, 10) : ""}
                            onChange={(e) => handleItemChange(index, "certification", "issueDate", e.target.value)}
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Expiry Date</label>
                          <input
                            type="date"
                            placeholder="Expiry date"
                            value={cert.expiryDate ? new Date(cert.expiryDate).toISOString().substring(0, 10) : ""}
                            onChange={(e) => handleItemChange(index, "certification", "expiryDate", e.target.value)}
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                     
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Skills (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g., Cloud Computing, Machine Learning"
                          value={rawInputs[`certification_${index}_skills`] !== undefined 
                            ? rawInputs[`certification_${index}_skills`]
                            : cert.skills ? cert.skills.join(", ") : ""}
                          onChange={(e) => {
                            handleRawInputChange(index, "certification", "skills", e.target.value);
                          }}
                          onBlur={() => processRawInput(index, "certification", "skills")}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <TextareaAutosize
                          placeholder="Describe what this certification covers..."
                          value={cert.desc || ""}
                          onChange={(e) => handleItemChange(index, "certification", "desc", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200 min-h-[80px] resize-none"
                          minRows={3}
                          maxRows={5}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem("certification", index)}
                        className="text-xs gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handleAddItem("certification")}
                  className="w-full justify-center gap-2 p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30 text-foreground hover:text-indigo-600 transition-all"
                  type="button"
                >
                  <PlusCircle size={16} />
                  <span>Add Certification</span>
                </Button>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("experience")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("education")}
                  >
                    Continue to Education
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "education":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Education</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Add your educational background</p>
              </div>
              
              <div className="p-6 space-y-4">
                {profileData.education?.map((edu, index) => (
                  <div 
                    key={index}
                    className="bg-background/50 rounded-xl p-5 border border-border/50 transition-all hover:shadow-md hover:border-indigo-500/20"
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="Institution Name *"
                          value={edu.instituteName || ""}
                          onChange={(e) => handleItemChange(index, "education", "instituteName", e.target.value)}
                          required
                          className="font-medium text-lg bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Degree *</label>
                          <input
                            type="text"
                            placeholder="e.g., Bachelor of Technology"
                            value={edu.degree || ""}
                            onChange={(e) => handleItemChange(index, "education", "degree", e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Stream/Specialization</label>
                          <input
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={edu.stream || ""}
                            onChange={(e) => handleItemChange(index, "education", "stream", e.target.value)}
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="e.g., New Delhi, India"
                          value={edu.location || ""}
                          onChange={(e) => handleItemChange(index, "education", "location", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                          <input
                            type="date"
                            placeholder="Start date"
                            value={edu.startDate ? new Date(edu.startDate).toISOString().substring(0, 10) : ""}
                            onChange={(e) => handleItemChange(index, "education", "startDate", e.target.value)}
                            className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                      border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                      transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                          <div className="space-y-2">
                            <input
                              type="date"
                              placeholder="End date"
                              value={edu.endDate ? new Date(edu.endDate).toISOString().substring(0, 10) : ""}
                              onChange={(e) => handleItemChange(index, "education", "endDate", e.target.value)}
                              disabled={edu.isCurrent}
                              className={`w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                        border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                        transition-all duration-200 ${edu.isCurrent ? 'opacity-50' : ''}`}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`currently-studying-${index}`}
                                checked={edu.isCurrent || false}
                                onChange={(e) => handleItemChange(index, "education", "isCurrent", e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                              />
                              <label htmlFor={`currently-studying-${index}`} className="text-sm text-muted-foreground">
                                Currently studying
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Marks/CGPA</label>
                        <input
                          type="text"
                          placeholder="e.g., 8.5 CGPA or 85%"
                          value={edu.marks || ""}
                          onChange={(e) => handleItemChange(index, "education", "marks", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                    border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                    transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem("education", index)}
                        className="text-xs gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handleAddItem("education")}
                  className="w-full justify-center gap-2 p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30 text-foreground hover:text-indigo-600 transition-all"
                  type="button"
                >
                  <PlusCircle size={16} />
                  <span>Add Education</span>
                </Button>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("certification")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("contact")}
                  >
                    Continue to Contact
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "contact":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <Phone className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Update your contact details</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground" size={18} />
                    <input
                      type="email"
                      value={profileData.email || ""}
                      onChange={(e) => handleChange(e, "email")}
                      className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={profileData.phone || ""}
                      onChange={(e) => handleChange(e, "phone")}
                      className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                                border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                                transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">GitHub Profile</label>
                  <div className="flex items-center gap-2">
                    <Github className="text-muted-foreground" size={18} />
                    <div className="flex-1 flex items-center gap-2 w-full p-3 rounded-lg bg-background/50 border border-border focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all duration-200">
                      <span className="text-muted-foreground">github.com/</span>
                      <input
                        type="text"
                        value={profileData.github?.username || ""}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          github: {
                            ...prev.github,
                            username: e.target.value
                          }
                        }))}
                        className="flex-1 bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-muted-foreground/60"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  {profileData.github?.repositories > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-2">
                        <span>Repositories: {profileData.github.repositories}</span>
                        <span>•</span>
                        <span>Followers: {profileData.github.followers || 0}</span>
                        <span>•</span>
                        <span>Following: {profileData.github.following || 0}</span>
                      </div>
                      <div className="mt-1">
                        <span>Last updated: {profileData.github.lastUpdated ? new Date(profileData.github.lastUpdated).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">LinkedIn Profile</label>
                  <div className="flex items-center gap-2">
                    <Linkedin className="text-muted-foreground" size={18} />
                    <div className="w-full p-3 rounded-lg bg-background/50 border border-border focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all duration-200">
                      <input
                        type="text"
                        value={profileData.linkedin || ""}
                        onChange={(e) => handleChange(e, "linkedin")}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-muted-foreground/60"
                        placeholder="https://linkedin.com/in/your-username"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("education")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("coding")}
                  >
                    Continue to Coding Profiles
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "coding":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <Code className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Coding Profiles</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Connect your coding platform accounts</p>
              </div>
              
              <div className="p-6 space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium">CodeChef Username</label>
                  <input
                    type="text"
                    value={codechefUsername}
                    onChange={(e) => setCodechefUsername(e.target.value)}
                    className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                              border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                              transition-all duration-200"
                    placeholder="Enter your CodeChef username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">LeetCode Username</label>
                  <input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    className="w-full p-3 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground/60 
                              border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none
                              transition-all duration-200"
                    placeholder="Enter your LeetCode username"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("contact")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab("extracurricular")}
                  >
                    Continue to Extracurricular Activities
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "extracurricular":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border shadow-md">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="text-white" size={22} />
                  <h3 className="text-lg font-semibold text-white">Extracurricular Activities</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">Add your extracurricular activities and achievements</p>
              </div>
              
              <div className="p-6 space-y-4">
                {profileData.extracurricular?.map((activity, index) => (
                  <div
                    key={index}
                    className="bg-background/50 rounded-xl p-5 border border-border/50 transition-all hover:shadow-md hover:border-indigo-500/20"
                  >
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <Activity className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => handleExtracurricularChange(index, e.target.value)}
                          placeholder="Activity or Achievement"
                          className="font-medium text-lg bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem("extracurricular", index)}
                        className="text-xs gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={handleAddExtracurricular}
                  className="w-full justify-center gap-2 p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30 text-foreground hover:text-indigo-600 transition-all"
                  type="button"
                >
                  <PlusCircle size={16} />
                  <span>Add Activity</span>
                </Button>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("coding")}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="default" 
                   className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={handleSubmit}
                  >
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 pt-6 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text mb-2">
            Edit Your Profile
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Update your profile information to showcase your skills, experience, and achievements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tabs Navigation */}
          <div className="md:col-span-3">
            <motion.div 
              className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-1 md:p-3 md:sticky md:top-20 shadow-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 p-2 md:p-3 text-sm md:text-base rounded-lg transition-all duration-200 hover:bg-background/70 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-l-2 border-indigo-500 text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Add Save button to sidebar */}
              <div className="mt-6 px-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            {renderTabContent()}
            
            {/* Save button (fixed at bottom for mobile) */}
            <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-50">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
