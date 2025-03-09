import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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

function App() {
  const [isLogged, setIslogged] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setIslogged(true);
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar profile={profile} />
      <main>
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
          <Route path="/skill" element={<SkillsPrediction profile={profile} />} />
          <Route path="/cv" element={<CV profile={profile} />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/edit" element={<EditProfile profile={profile || {}} />} />
          <Route path="/Prediction" element={<Prediction />} />
          <Route path="Test" element={<TestPage profile={profile} />} />
          <Route path="contact" element={<ContactUs />} />
          <Route
            path="/profile"
            element={isLogged ? <Profile profile={profile} /> : <Login />}
          />
        </Routes>
      </main>
    </>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen ">
        <App />
      </div>
    </BrowserRouter>
  );
}

export default Root;
