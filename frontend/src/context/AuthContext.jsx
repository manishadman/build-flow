import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        return;
      }

      try {
        const response = await api.get("/users/me");

        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    }

    loadUser();
  }, [token]);

  function login(userData, newToken) {
    localStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  }

  function updateUser(userData) {
    setUser(userData);
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
