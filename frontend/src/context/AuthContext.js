import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context object
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  // Initialize state by trying to load from localStorage on component mount
  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      // If user info exists in localStorage, parse it, otherwise return null
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage:", error);
      // If parsing fails (e.g., invalid JSON), return null
      return null;
    }
  });

  // Optional: Log state changes for debugging
  useEffect(() => {
    console.log("Auth State Changed:", user);
  }, [user]);

  // Login function: Saves user data to state and localStorage
  const login = (userData) => {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userData)); // Save to localStorage
      setUser(userData); // Update component state
      console.log("User logged in:", userData?.email, "Role:", userData?.role);
    } catch (error) {
      console.error("Failed to save userInfo to localStorage:", error);
    }
  };

  // Logout function: Clears user data from state and localStorage
  const logout = () => {
    try {
      localStorage.removeItem('userInfo'); // Remove from localStorage
      setUser(null); // Update component state to null
      console.log("User logged out");
    } catch (error) {
      console.error("Failed to remove userInfo from localStorage:", error);
    }
  };

  // Provide the user state and login/logout functions to children components
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};