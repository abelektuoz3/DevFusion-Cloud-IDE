// frontend/src/components/layout/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCode, FiMenu, FiX, FiLogOut, FiBell } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import DarkModeToggle from "../ui/DarkModeToggle";

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
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-slate-700"
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
              How It Works
            </button>

            {user ?
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
                  Dashboard
                </Link>
                
                {/* ✅ Direct Bell Icon - No component needed */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  title="Notifications"
                >
                  <FiBell className="text-gray-600 dark:text-gray-300 text-xl" />
                  {/* ✅ Show badge with number 3 for testing */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            : <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition">
                  Get Started
                </Link>
              </>
            }

            <DarkModeToggle />
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FiBell className="text-gray-600 dark:text-gray-300 text-xl" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </Link>
            )}
            <DarkModeToggle />
            <button
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ?
                <FiX size={24} />
              : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-700">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
              How It Works
            </button>
            {user ?
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
                  onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link
                  to="/notifications"
                  className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
                  onClick={() => setIsOpen(false)}>
                  Notifications 🔔
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition font-medium">
                  Logout
                </button>
              </>
            : <>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
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