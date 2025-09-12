
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/lib/types';

interface ProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  revalidate: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({ userProfile: null, isLoading: true, revalidate: async () => {} });

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const userDocRef = doc(db, "users", uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  }, []);


  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    
    if (user) {
      setIsLoading(true);
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, 
        (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setUserProfile(null);
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  const revalidate = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      await fetchProfile(user.uid);
      setIsLoading(false);
    }
  }, [user, fetchProfile]);

  const value = { userProfile, isLoading: isAuthLoading || isLoading, revalidate };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
