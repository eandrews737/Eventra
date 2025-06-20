import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up a listener for authentication failures
    const handleAuthError = () => {
      setUser(null);
    };
    window.addEventListener("auth-error", handleAuthError);

    // Check authentication status on initial load
    checkAuth();

    // Clean up the listener on component unmount
    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      await checkAuth();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      await checkAuth();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
