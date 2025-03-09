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
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

const EditProfile = ({ profile }) => {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState({});
  const [codechefUsername, setCodechefUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/profile/${profileId}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true); // Set loading state

    const fields = [
      "name",
      "aboutMe",
      "projects",
      "experience",
      "certification",
      "education",
      "extracurricular",
      "subject",
      "phone",
      "email",
      "github",
      "linkedin",
    ];

    try {
      for (const field of fields) {
        const response = await fetch(`http://localhost:8080/profile/${field}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, value: profileData[field] }),
        });
        if (!response.ok) throw new Error(`Failed to update ${field}`);
      }
      await handleCodechefSubmit();
      await handleLeetcodeSubmit();
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false); // Reset loading state
    }
  };

  const handleChange = (event, field) => {
    const { value } = event.target;
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, itemField, value) => {
    const updatedItems = [...(profileData[field] || [])];
    updatedItems[index] = { ...updatedItems[index], [itemField]: value };
    setProfileData((prev) => ({ ...prev, [field]: updatedItems }));
  };

  const handleAddItem = (field) => {
    const newItems = {
      projects: { name: "", description: "", link: "" },
      experience: { companyName: "", jobRole: "", time: "", description: "" },
      certification: { instituteName: "", time: "", desc: "" },
      education: { instituteName: "", time: "", marks: "", stream: "" },
    };

    setProfileData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), newItems[field]],
    }));
  };

  const handleDeleteItem = async (field, index) => {
    try {
      const response = await fetch(
        `http://localhost:8080/profile/${profileId}/${field}/${index}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
      }
    } catch (error) {
      console.error(`Error deleting ${field}:`, error);
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

  const handleAddExtracurricular = () => {
    setProfileData((prev) => ({
      ...prev,
      extracurricular: [...(prev.extracurricular || []), ""],
    }));
  };

  const handleExtracurricularChange = (index, value) => {
    const updatedExtracurricular = [...profileData.extracurricular];
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
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "coding", label: "Coding Profiles", icon: Code },
    {
      id: "extracurricular",
      label: "Extracurricular Activities",
      icon: Activity,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-6">
            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">Name</span>
                <input
                  type="text"
                  value={profileData.name || ""}
                  onChange={(e) => handleChange(e, "name")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your name"
                />
              </label>
            </div>

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">About Me</span>
                <TextareaAutosize
                  value={profileData.aboutMe || ""}
                  onChange={(e) => handleChange(e, "aboutMe")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Write something about yourself..."
                  minRows={4}
                />
              </label>
            </div>

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">Subject of Interest</span>
                <input
                  type="text"
                  value={profileData.subject || ""}
                  onChange={(e) => handleChange(e, "subject")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your subjects of interest"
                />
              </label>
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-6">
            {profileData.projects?.map((project, index) => (
              <div
                key={index}
                className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 space-y-4"
              >
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) =>
                    handleItemChange(index, "projects", "name", e.target.value)
                  }
                  placeholder="Project Name"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <TextareaAutosize
                  value={project.description}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "projects",
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Project Description"
                  minRows={2}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={project.link}
                  onChange={(e) =>
                    handleItemChange(index, "projects", "link", e.target.value)
                  }
                  placeholder="Project Link"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem("projects", index)}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/30 transition-all"
                >
                  Delete Project
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("projects")}
              className="w-full bg-[#45f15c]/20 text-[#45f15c] py-2 rounded-md hover:bg-[#45f15c]/30 transition-all"
            >
              Add Project
            </button>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-6">
            {profileData.experience?.map((exp, index) => (
              <div
                key={index}
                className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 space-y-4"
              >
                <input
                  type="text"
                  value={exp.companyName}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "experience",
                      "companyName",
                      e.target.value
                    )
                  }
                  placeholder="Company Name"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={exp.jobRole}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "experience",
                      "jobRole",
                      e.target.value
                    )
                  }
                  placeholder="Job Role"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={exp.time}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "experience",
                      "time",
                      e.target.value
                    )
                  }
                  placeholder="Time Period"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <TextareaAutosize
                  value={exp.description}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "experience",
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Job Description"
                  minRows={2}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem("experience", index)}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/30 transition-all"
                >
                  Delete Experience
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("experience")}
              className="w-full bg-[#45f15c]/20 text-[#45f15c] py-2 rounded-md hover:bg-[#45f15c]/30 transition-all"
            >
              Add Experience
            </button>
          </div>
        );

      case "certificates":
        return (
          <div className="space-y-6">
            {profileData.certification?.map((cert, index) => (
              <div
                key={index}
                className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 space-y-4"
              >
                <input
                  type="text"
                  value={cert.instituteName}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "certification",
                      "instituteName",
                      e.target.value
                    )
                  }
                  placeholder="Institute Name"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={cert.time}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "certification",
                      "time",
                      e.target.value
                    )
                  }
                  placeholder="Time Period"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <TextareaAutosize
                  value={cert.desc}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "certification",
                      "desc",
                      e.target.value
                    )
                  }
                  placeholder="Description"
                  minRows={2}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem("certification", index)}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/30 transition-all"
                >
                  Delete Certificate
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("certification")}
              className="w-full bg-[#45f15c]/20 text-[#45f15c] py-2 rounded-md hover:bg-[#45f15c]/30 transition-all"
            >
              Add Certificate
            </button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-6">
            {profileData.education?.map((edu, index) => (
              <div
                key={index}
                className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 space-y-4"
              >
                <input
                  type="text"
                  value={edu.instituteName}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "education",
                      "instituteName",
                      e.target.value
                    )
                  }
                  placeholder="Institute Name"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={edu.time}
                  onChange={(e) =>
                    handleItemChange(index, "education", "time", e.target.value)
                  }
                  placeholder="Time Period"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={edu.marks}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "education",
                      "marks",
                      e.target.value
                    )
                  }
                  placeholder="Marks"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <input
                  type="text"
                  value={edu.stream}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "education",
                      "stream",
                      e.target.value
                    )
                  }
                  placeholder="Stream"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem("education", index)}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/30 transition-all"
                >
                  Delete Education
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("education")}
              className="w-full bg-[#45f15c]/20 text-[#45f15c] py-2 rounded-md hover:bg-[#45f15c]/30 transition-all"
            >
              Add Education
            </button>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">Email</span>
                <input
                  type="email"
                  value={profileData.email || ""}
                  onChange={(e) => handleChange(e, "email")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your email"
                />
              </label>
            </div>

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">Phone Number</span>
                <input
                  type="text"
                  value={profileData.phone || ""}
                  onChange={(e) => handleChange(e, "phone")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your phone number"
                />
              </label>
            </div>

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">GitHub Profile</span>
                <input
                  type="text"
                  value={profileData.github || ""}
                  onChange={(e) => handleChange(e, "github")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your GitHub profile URL"
                />
              </label>
            </div>

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">LinkedIn Profile</span>
                <input
                  type="text"
                  value={profileData.linkedin || ""}
                  onChange={(e) => handleChange(e, "linkedin")}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your LinkedIn profile URL"
                />
              </label>
            </div>
          </div>
        );

      case "coding":
        return (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 text-red-400 p-4 rounded-md">
                {error}
              </div>
            )}

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20  hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">CodeChef Username</span>
                <input
                  type="text"
                  value={codechefUsername}
                  onChange={(e) => setCodechefUsername(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your CodeChef username"
                />
              </label>
            </div>

            <div className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20  hover:border-white/30">
              <label className="block space-y-2">
                <span className="text-lg text-white">LeetCode Username</span>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                  placeholder="Enter your LeetCode username"
                />
              </label>
            </div>
          </div>
        );

      case "extracurricular":
        return (
          <div className="space-y-6">
            {profileData.extracurricular?.map((activity, index) => (
              <div
                key={index}
                className="bg-[#29253b] backdrop-blur-lg rounded-md p-6 border border-white/20 transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:border-white/30 space-y-4"
              >
                <input
                  type="text"
                  value={activity}
                  onChange={(e) =>
                    handleExtracurricularChange(index, e.target.value)
                  }
                  placeholder="Activity"
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-[#45f15c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem("extracurricular", index)}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-md hover:bg-red-500/30 transition-all"
                >
                  Delete Activity
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddExtracurricular}
              className="w-full bg-[#45f15c]/20 text-[#45f15c] py-2 rounded-md hover:bg-[#45f15c]/30 transition-all"
            >
              Add Another Activity
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className=" bg-[#1a1726] py-10 px-5 text-white mt-12">
      <div className="max-w-6xl mx-auto">
        <div className=" space-y-2 fixed">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-[#45f15c]/20 text-[#45f15c] border border-[#45f15c]/30"
                    : "bg-[#29253b] text-white hover:bg-white/10 border border-white/20"
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 ml-64 ">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderTabContent()}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#45f15c] py-3 rounded-md text-black font-semibold hover:bg-[#45f15c]/90 transition-all flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
