import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "../utils/supabase/client";

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    username?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch and listen to auth changes
  useEffect(() => {
    // Load mock user if present
    const mock = localStorage.getItem("kolamcraft_mock_user");
    if (mock) {
      try {
        setUser(JSON.parse(mock));
      } catch {}
    }

    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u)
        setUser({
          id: u.id,
          email: u.email || "",
          username: (u.user_metadata as any)?.username,
        });
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user;
        setUser(
          u
            ? {
                id: u.id,
                email: u.email || "",
                username: (u.user_metadata as any)?.username,
              }
            : null
        );
      }
    );
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Login user
  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<boolean> => {
    // Support username with password (mock login)
    const looksLikeEmail = /@/.test(emailOrUsername);
    if (!looksLikeEmail) {
      // Username-based login (always mock)
      const mockUser: User = {
        id: `local_${emailOrUsername}`,
        email: `${emailOrUsername}@local`,
        username: emailOrUsername,
      };
      setUser(mockUser);
      localStorage.setItem("kolamcraft_mock_user", JSON.stringify(mockUser));
      return true;
    }
    
    if (!isSupabaseConfigured) {
      // If configured off, treat any email as mock too
      const mockUser: User = {
        id: `local_${emailOrUsername}`,
        email: emailOrUsername,
        username: emailOrUsername.split("@")[0],
      };
      setUser(mockUser);
      localStorage.setItem("kolamcraft_mock_user", JSON.stringify(mockUser));
      return true;
    }
    
    const supabase = getSupabase();
    const { error, data } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });
    if (error) {
      console.error(error.message);
      return false;
    }
    const u = data.user;
    setUser({
      id: u.id,
      email: u.email || "",
      username: (u.user_metadata as any)?.username,
    });
    localStorage.removeItem("kolamcraft_mock_user");
    return true;
  };

  // Register user
  const register = async (
    email: string,
    password: string,
    username?: string
  ): Promise<boolean> => {
    // Allow username-only quick registration (mock)
    if (!/@/.test(email) && !username) {
      const uname = email;
      const mockUser: User = {
        id: `local_${uname}`,
        email: `${uname}@local`,
        username: uname,
      };
      setUser(mockUser);
      localStorage.setItem("kolamcraft_mock_user", JSON.stringify(mockUser));
      return true;
    }

    if (!isSupabaseConfigured) {
      const uname = username || email.split("@")[0];
      const mockUser: User = { id: `local_${uname}`, email, username: uname };
      setUser(mockUser);
      localStorage.setItem("kolamcraft_mock_user", JSON.stringify(mockUser));
      return true;
    }

    const supabase = getSupabase();
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) {
      console.error(error.message);
      return false;
    }
    const u = data.user;
    if (u) setUser({ id: u.id, email: u.email || email, username });
    try {
      // Best-effort profile upsert
      await supabase.from("profiles").upsert({ id: u?.id, username });
    } catch {}
    localStorage.removeItem("kolamcraft_mock_user");
    return true;
  };

  // Logout user
  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await getSupabase().auth.signOut();
      } catch {}
    }
    setUser(null);
    localStorage.removeItem("kolamcraft_mock_user");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
