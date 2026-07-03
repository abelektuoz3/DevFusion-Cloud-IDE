import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [pendingEmail, setPendingEmail] = useState(
    localStorage.getItem("pendingEmail") || ""
  );

  // Set token on login/register
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      setToken(token);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  // Set pending email for verification persistence
  const setPendingEmailPersist = (email) => {
    if (email) {
      localStorage.setItem("pendingEmail", email);
      setPendingEmail(email);
    } else {
      localStorage.removeItem("pendingEmail");
      setPendingEmail("");
    }
  };

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Load user error:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      
      if (user && !user.isVerified) {
        setPendingEmailPersist(email);
      } else {
        setPendingEmailPersist("");
      }

      toast.success("Welcome back! 🎉");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setPendingEmailPersist(email);

      toast.success("Account created! 🚀");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setPendingEmailPersist("");

      toast.success("Email verified successfully! 🎉");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "OTP verification failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email });
      toast.success("Verification code resent! ✉️");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to resend OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setPendingEmailPersist("");
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        api,
        verifyOTP,
        resendOTP,
        pendingEmail,
        setPendingEmail: setPendingEmailPersist
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
