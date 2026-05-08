import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { upsertIdentity, fetchProfile } from '../services/identityApi';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load local identity as immediate state
  const getLocalProfile = () => {
    try {
      return JSON.parse(localStorage.getItem('tripclaw_identity') || 'null');
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        syncProfile(session.user);
      } else {
        const local = getLocalProfile();
        if (local) setUser(local);
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const syncProfile = async (supabaseUser) => {
    setLoading(true);
    // Fetch profile from our 'users' table using metadata or email
    const { data } = await fetchProfile(supabaseUser.user_metadata?.nickname || supabaseUser.email);
    if (data) {
      setUser(data);
    } else {
      // Fallback to metadata if table entry not yet created
      setUser({
        nickname: supabaseUser.user_metadata?.nickname,
        email: supabaseUser.email,
        level: 1,
        xp: 0
      });
    }
    setLoading(false);
  };

  const updateProfile = useCallback(async (updates) => {
    const newProfile = { ...user, ...updates };
    setUser(newProfile);
    await upsertIdentity(newProfile);
  }, [user]);

  const signOut = async () => {
    await supabase?.auth.signOut();
    localStorage.removeItem('tripclaw_identity');
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    updateProfile,
    signOut,
    isAuthenticated: !!session?.user
  };
}
