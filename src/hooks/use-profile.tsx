
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth.tsx';
import type { UserProfile } from '@/lib/types';

interface ProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({ userProfile: null, isLoading: true });

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      // Wait for auth to finish loading
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
            setUserProfile(null); // User exists in Auth, but not in Firestore
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
      // No user, so no profile
      setUserProfile(null);
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  const value = { userProfile, isLoading: isAuthLoading || isLoading };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
