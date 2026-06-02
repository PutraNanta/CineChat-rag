import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMeApi } from "@/apis/auth.api";

const AuthContext = createContext();

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function getActiveStorage() {
  return localStorage.getItem("token") ? localStorage : sessionStorage;
}

function readStoredUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback((token, userData, rememberMe) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await getMeApi();
        const freshUser = res.data.user;
        setUser(freshUser);
        setIsAuthenticated(true);
        getActiveStorage().setItem("user", JSON.stringify(freshUser));
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
