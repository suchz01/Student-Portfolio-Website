import React, { useState } from 'react';
import { Home, Cpu, Code, User, Menu, X, Contact } from 'lucide-react';
import { Link } from 'react-router-dom';
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { title: 'Home', icon: <Home size={20} />, path: '/' },
    { title: 'Skills', icon: <Code size={20} />, path: '/skill' },
    { title: 'Test', icon: <Cpu size={20} />, path: '/test' },
    { title: 'Portfolio', icon: <User size={20} />, path: '/profile' },
    { title: 'Edit Profile', icon: <User size={20} />, path: '/edit' },
    { title: 'Contact Us', icon: <Contact size={20} />, path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#29253b] shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl">
              Horizon
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="text-white/70 hover:text-white flex items-center space-x-2 text-sm font-medium 
                  px-3 py-2 rounded-md hover:bg-white/10 transition duration-300"
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/70 hover:text-white p-2 rounded-md hover:bg-white/10 transition duration-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#29253b] border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="text-white/70 hover:text-white flex items-center space-x-2 text-base font-medium 
                  px-3 py-2 rounded-md hover:bg-white/10 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
