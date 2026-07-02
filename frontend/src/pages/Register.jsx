import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import Navbar from "../components/layout/Navbar";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4 pt-20 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 shadow-xl dark:shadow-black/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Start your coding journey today
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Username
              </label>
              <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:focus-within:ring-indigo-500/30 transition bg-white dark:bg-slate-700">
                <FiUser className="text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent text-gray-900 dark:text-white p-3 w-full focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Email
              </label>
              <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:focus-within:ring-indigo-500/30 transition bg-white dark:bg-slate-700">
                <FiMail className="text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-gray-900 dark:text-white p-3 w-full focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Password
              </label>
              <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-xl px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:focus-within:ring-indigo-500/30 transition bg-white dark:bg-slate-700">
                <FiLock className="text-gray-400 dark:text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-gray-900 dark:text-white p-3 w-full focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-indigo-500/25">
              {loading ? "Loading..." : "Create Account"}
            </button>
          </form>

          <p className="text-gray-500 dark:text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
