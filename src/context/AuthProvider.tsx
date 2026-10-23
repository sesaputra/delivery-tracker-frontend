import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import {
  AuthContext,
  type User,
} from "./AuthContext";

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/user");

        setUser(response.data.user);
      } catch (error) {
        console.error("Session tidak valid:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await api.post<LoginResponse>(
      "/login",
      {
        email,
        password,
      }
    );

    const {
      token: newToken,
      user: loggedInUser,
    } = response.data;

    localStorage.setItem("token", newToken);

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    setToken(newToken);
    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API gagal:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}