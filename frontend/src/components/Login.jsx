import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { toast } from "sonner";

const Login = ({ setIslogged, setUser, setProfile }) => {
  const navigate = useNavigate();
  const login = useGoogleLogin({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    onSuccess: async (codeResponse) => {
      setIslogged(true);
      localStorage.setItem("user", JSON.stringify(codeResponse));
      setUser(codeResponse);
      try {
        // Get user profile data from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${codeResponse.access_token}`
          }
        });
        const profileData = await response.json();
        localStorage.setItem("profile", JSON.stringify(profileData));
        setProfile(profileData);
        // console.log(profileData);
        

        // Create or update user profile with Google data
        if (profileData) {
          try {
            // Get existing profile or create new one
            const profileResponse = await fetch(`http://localhost:8080/profile/${profileData.id}`);
            const userProfileData = await profileResponse.json();
            
            // If profile is empty or new, populate with Google data
            if (!userProfileData.name) {
              // Update profile with Google profile data
              const updateResponse = await fetch(`http://localhost:8080/profile/name`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profileId: profileData.id,
                  value: profileData.name,
                }),
              });
              
              // Set email if available
              if (profileData.email) {
                await fetch(`http://localhost:8080/profile/email`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profileId: profileData.id,
                    value: profileData.email
                  }),
                });
              }
              if (profileData.picture) {
                await fetch(`http://localhost:8080/profile/profilePicture`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profileId: profileData.id,
                    value: profileData.picture,  // Changed from profilePicture to value to match other endpoints
                  }),
                });
              }
            }
          } catch (profileError) {
            console.error("Error setting up user profile:", profileError);
            // Still continue with login even if profile setup fails
          }
        }

        navigate("/");
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Login successful but had trouble loading your profile data");
        navigate("/");
      }
    },
    onError: (error) => {
      console.error("Login Failed:", error);
      toast.error("Login failed. Please try again.");
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3,
        duration: 0.6
      }
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        variants={cardVariants}
        className="w-full max-w-md px-4"
      >
        <Card className="border border-border/40 bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#45f15c] to-[#00d4ff] bg-clip-text text-transparent">
              Welcome to Horizon
            </CardTitle>
            <CardDescription>
              Sign in to access your portfolio and career tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 bg-card hover:bg-accent border border-border"
                variant="outline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970244 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                <span>Sign in with Google</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Login;