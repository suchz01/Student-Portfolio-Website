import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "sonner";
import PropTypes from "prop-types";

// Import components
import Login from "./components/Login";
import SkillsPrediction from "./pages/SkillsPrediction";
import Questions from "./components/Questions";
import Prediction from "./components/Prediction";
import TestPage from "./components/TestPage";
import Profile from "./pages/Profile";
import Homepage from "./components/Homepage";
import EditProfile from "./pages/EditProfile";
import CV from "./components/CV";
import Navbar from "./components/Navbar";
import ContactUs from "./components/ContactUs";

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
      
      {/* Animated mesh elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl animate-blob animation-delay-3000"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
    </div>
  );
};

function App() {
  const [isLogged, setIslogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user data exists in localStorage
      if (user) {
        setIslogged(true);
      }
      // Finish loading regardless of authentication status
      setLoading(false);
    };

    checkAuth();
  }, [user]);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-background rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!isLogged) {
      return <Navigate to="/login" />;
    }
    return children;
  };
  
  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
  };
  
  // Show loading state for the entire app when checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-500 border-background rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <AnimatedBackground />
      <Navbar profile={profile} isLogged={isLogged} />
      <main className="pt-16 relative z-10"> {/* Add padding to avoid navbar overlap */}
        <Routes>
          <Route path="/" element={<Homepage profile={profile || {}}/>} />
          <Route
            path="/login"
            element={
              <Login
                setIslogged={setIslogged}
                setUser={setUser}
                setProfile={setProfile}
              />
            }
          />
          <Route path="/contact" element={<ContactUs />} />
          
          {/* Protected routes */}
          <Route path="/skill" element={
            <ProtectedRoute>
              <SkillsPrediction profile={profile} />
            </ProtectedRoute>
          } />
          <Route path="/cv" element={
            <ProtectedRoute>
              <CV profile={profile} />
            </ProtectedRoute>
          } />
          <Route path="/questions" element={
            <ProtectedRoute>
              <Questions />
            </ProtectedRoute>
          } />
          <Route path="/edit" element={
            <ProtectedRoute>
              <EditProfile profile={profile || {}} />
            </ProtectedRoute>
          } />
          <Route path="/Prediction" element={
            <ProtectedRoute>
              <Prediction />
            </ProtectedRoute>
          } />
          <Route path="Test" element={
            <ProtectedRoute>
              <TestPage profile={profile} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile profile={profile} />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Toaster position="bottom-right" />
    </>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <div className="min-h-screen bg-background text-foreground">
          <App />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default Root;
