import React, { useState, useEffect } from 'react';
import { Home, Cpu, Code, User, Menu, X, Contact, Moon, Sun, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../components/ui/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { profileApi,externalApi } from "../services/api";
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const Navbar = ({ profile }) => {
  const profileId = profile?.id;
  // console.log(profileId)
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;
  
      try {
        const data = await profileApi.getProfile(profileId);
        setProfileData(data);
  
        if (data) {
          try {
            const refreshData = await externalApi.refreshAllPlatforms(profileId);
            if (refreshData?.profile) {
              setProfileData(refreshData.profile);
            }
          } catch (refreshError) {
            console.error("Error refreshing platform data:", refreshError);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
  
    fetchProfile();
  }, [profileId]);
  

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { title: 'Home', icon: <Home size={18} />, path: '/' },
    { title: 'Skills Prediction', icon: <Code size={18} />, path: '/skill' },
    { title: 'Test Skills', icon: <Cpu size={18} />, path: '/test' },
    { title: 'Portfolio', icon: <User size={18} />, path: '/profile' },
    { title: 'Contact', icon: <Contact size={18} />, path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    window.location.href = "/login";
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/90 backdrop-blur-md shadow-lg border-b border-border/30' 
          : 'bg-background/70 backdrop-blur-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-foreground font-bold text-xl flex items-center gap-2">
              <motion.div
                className="inline-block"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text font-extrabold">Horizon</span>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={`flex items-center space-x-2 text-sm font-medium 
                  px-3 py-2 rounded-md transition duration-300 relative
                  ${isActive(item.path) 
                    ? 'text-foreground bg-accent/50' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                  }`}
              >
                <span className="flex items-center gap-1.5">{item.icon} <span>{item.title}</span></span>
                {isActive(item.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    layoutId="navbar-active-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side - Theme and Profile */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent/50 rounded-full text-foreground"
              aria-label="Toggle theme"
            >
              <motion.div
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </Button>

            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <div className="flex items-center gap-2 p-1 hover:bg-accent/30 rounded-full px-2">
                      <Avatar className="h-8 w-8 border-2 border-border">
                        <AvatarImage src={profileData?.profilePicture} alt={profile.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/edit" className="cursor-pointer flex items-center gap-2">
                      <Settings size={16} />
                      <span>Edit Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive text-red-600">
                    <LogOut size={16} className="mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                <Link to="/login">Sign in</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 text-base font-medium 
                      px-3 py-2.5 rounded-md transition duration-300 ${
                        isActive(item.path) 
                          ? 'bg-accent text-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
              
              {profile && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: menuItems.length * 0.05 }}
                >
                  <div className="border-t border-border/50 my-3 pt-3">
                    <Link
                      to="/edit"
                      className="flex items-center space-x-3 text-base font-medium 
                        px-3 py-2.5 rounded-md transition duration-300 text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-3 text-base font-medium 
                        px-3 py-2.5 rounded-md transition duration-300 text-destructive hover:bg-destructive/10"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
