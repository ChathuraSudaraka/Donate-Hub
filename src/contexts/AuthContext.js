import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signUp: async (email, password, userData) => {
      try {
        // First, create the auth user
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: { data: userData },
          }
        );

        if (authError) return { data: authData, error: authError };

        // If user was created successfully, create profile
        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              email: email,
              full_name: userData.full_name,
              phone: userData.phone_number,
              location: userData.location,
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            // Note: We don't return the profile error as auth user was created successfully
          }
        }

        return { data: authData, error: authError };
      } catch (error) {
        console.error("SignUp error:", error);
        return { data: null, error };
      }
    },
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      }),
    updatePassword: async (password) => {
      try {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) {
          console.error("Password update error:", error);
          return { error };
        }
        return { data, error: null };
      } catch (err) {
        console.error("Password update exception:", err);
        return { error: { message: "An unexpected error occurred" } };
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
