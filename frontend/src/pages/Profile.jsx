import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import First from "../components/First";
import Second from "../components/Second";
import Third from "../components/Third";
import CV from "../components/CV";

const Profile = ({ profile }) => {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError("Failed to fetch profile data.");
        }
      } catch (error) {
        setError("Error fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    } else {
      setError("Profile ID is missing.");
      setLoading(false);
    }
  }, [profileId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profileData) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className=" bg-[#1e1a2a] text-[#C5C5C9] font-inter overflow-hidden mt-20 h-[calc(100vh-5rem)] ">
      {/* Main Content Container */}
      <motion.div
        className="container mx-auto h-full flex flex-col lg:flex-row gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* First Component (Sticky) */}
        <motion.div
          className="bg-[#29253b] rounded-lg shadow-lg p-6 flex-1 lg:w-auto sticky  h-fit"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <First profileData={profileData} profile={profile} />
        </motion.div>

        {/* Second Component (Scrollable) */}
        <motion.div
          className="bg-[#29253b] rounded-lg shadow-lg p-6 flex-[2] lg:w-auto h-full overflow-y-auto scrollbar-hide"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            type: "spring",
            stiffness: 100,
          }}
        >
          <Second profileData={profileData} />
        </motion.div>

        {/* Third Component (Sticky) */}
        <motion.div
          className="overflow-y-auto scrollbar-hide flex-[1.5] lg:w-auto"
          
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.6,
            type: "spring",
            stiffness: 120,
          }}
        >
          <Third profileData={profileData} />
        </motion.div>
        
      </motion.div>
      <div className="relative right-10 bottom-10">
        <CV profile={profile} /> 
      </div>
    </div>
  );
};

export default Profile;
