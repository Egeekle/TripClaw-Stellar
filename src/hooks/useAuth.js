import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { upsertIdentity, fetchProfile } from '../services/identityApi';
import { STORAGE_KEYS } from '../config/constants';
import { logger } from '../services/logger';

/**
 * @typedef {import('../services/identityApi').TripClawProfile} TripClawProfile
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {TripClawProfile|null} user
 * @property {any} session
 * @property {boolean} loading
 * @property {boolean} isAuthenticated
 * @property {(profile: Partial<TripClawProfile>) => Promise<void>} updateProfile
 * @property {() => Promise<void>} signOut
 */

/**
 * Global authentication and identity hook.
 * @returns {AuthContextValue}
 */
export function useAuth() {

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load local identity as immediate state
  const getLocalProfile = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.IDENTITY) || 'null');
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // 1. Get initial session
    if (!supabase) {
      // Fallback mode: load from localStorage
      const local = getLocalProfile();
      if (local) setUser(local);
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          syncProfile(session.user);
        } else {
          const local = getLocalProfile();
          if (local) setUser(local);
          setLoading(false);
        }
      });
    }

    // 2. Listen for auth changes
    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          syncProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      subscription = data?.subscription;
    }

    return () => subscription?.unsubscribe();
  }, []);

  const syncProfile = async (supabaseUser) => {
    setLoading(true);
    try {
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
    } catch (error) {
      logger.error('Failed to sync profile from cloud', error);
      setUser(getLocalProfile());
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = useCallback(async (updates) => {
    try {
      const newProfile = { ...user, ...updates };
      setUser(newProfile);
      await upsertIdentity(newProfile);
    } catch (error) {
      logger.error('Profile update failed', error);
      throw error;
    }
  }, [user]);

  const signOut = async () => {
    try {
      await supabase?.auth.signOut();
      localStorage.removeItem(STORAGE_KEYS.IDENTITY);
      setUser(null);
      setSession(null);
    } catch (error) {
      logger.error('Sign out failed', error);
    }
  };

  return {
    user,
    session,
    loading,
    updateProfile,
    signOut,
    isAuthenticated: !!session?.user || (!supabase && !!user)
  };

}
