
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const PARTNER_NAMES = ["Snow", "Shikhar"];

export function useSoulAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem("soul-user");
      if (stored) {
        const matched = PARTNER_NAMES.find(n => n.toLowerCase() === stored.toLowerCase());
        if (matched) {
          setUser(matched);
          if (!auth.currentUser) {
            try {
              await signInAnonymously(auth);
            } catch (e) {
              console.error("Silent sign-in failed", e);
            }
          }
        } else {
          localStorage.removeItem("soul-user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (name: string) => {
    const cleanName = name.trim().toLowerCase();
    const matched = PARTNER_NAMES.find(n => n.toLowerCase() === cleanName);
    
    if (matched) {
      try {
        await signInAnonymously(auth);
        
        // Ensure user profile exists in Firestore
        const userRef = doc(db, "userProfiles", matched);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            id: matched,
            name: matched,
            points: matched === "Shikhar" ? 500 : 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        localStorage.setItem("soul-user", matched);
        setUser(matched);
        return true;
      } catch (err) {
        console.error("Firebase Auth Error:", err);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("soul-user");
    setUser(null);
    auth.signOut();
    router.push("/login");
  };

  return { 
    user, 
    login, 
    logout, 
    loading, 
    partner: user === PARTNER_NAMES[0] ? PARTNER_NAMES[1] : PARTNER_NAMES[0] 
  };
}
