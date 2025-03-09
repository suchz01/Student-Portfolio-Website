import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setIslogged, setUser, setProfile }) => {
  const navigate = useNavigate();
  const login = useGoogleLogin({
    clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",
    onSuccess: async (codeResponse) => {
      setIslogged(true);
      localStorage.setItem("user", JSON.stringify(codeResponse));
      setUser(codeResponse);
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${codeResponse.access_token}`
          }
        });
        const profileData = await response.json();
        localStorage.setItem("profile", JSON.stringify(profileData));
        setProfile(profileData);

        navigate("/");
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    },
    onError: (error) => {
      console.error("Login Failed:", error);
    },
  });

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="bg-slate-800 p-6 shadow-3xl w-[24rem] h-[24rem] text-center flex flex-col rounded-lg justify-center">
        <p className="text-2xl font-semibold text-gray-300 mb-6">Sign In To Your Account</p>
        <button
          onClick={login}
          className="bg-gray-700 hover:bg-slate-900 text-white py-2 px-4 rounded-lg w-full flex items-center justify-center mt-2"
        >
          <span className="mr-2">Sign in with Google</span>
          🚀
        </button>
      </div>
    </div>
  );
};

export default Login;