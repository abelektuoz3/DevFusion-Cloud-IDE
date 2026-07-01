import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCode, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ?
          "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100"
        : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FiCode className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DevFusion
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => scrollToSection("features")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
              How It Works
            </button>

            {user ?
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition">
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            : <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition">
                  Get Started
                </Link>
              </>
            }
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ?
              <FiX size={24} />
            : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
              How It Works
            </button>
            {user ?
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-medium">
                  Logout
                </button>
              </>
            : <>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 rounded-xl text-center font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition"
                  onClick={() => setIsOpen(false)}>
                  Get Started Free
                </Link>
              </>
            }
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
