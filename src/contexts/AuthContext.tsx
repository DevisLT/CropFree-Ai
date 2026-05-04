import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { addDays } from "date-fns";
import { OperationType, handleFirestoreError } from "../lib/errorHandlers";

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: "trial" | "active" | "expired" | "cancelled";
  language: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Initialize trial for new user
        const start = new Date();
        const end = addDays(start, 60);
        const newProfile: UserProfile = {
          uid,
          email: auth.currentUser?.email || "",
          fullName: auth.currentUser?.displayName || "Farmer",
          trialStartDate: start.toISOString(),
          trialEndDate: end.toISOString(),
          subscriptionStatus: "trial",
          language: "en",
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, auth);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
