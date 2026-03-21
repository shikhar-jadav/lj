
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

const PARTNER_NAMES = ["Snow", "Shikhar"];

export function useSoulAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("soul-user");
    if (stored) {
      const matched = PARTNER_NAMES.find(n => n.toLowerCase() === stored.toLowerCase());
      if (matched) {
        setUser(matched);
        // Ensure Firebase Auth is synced if we have a local session
        if (!auth.currentUser) {
          signInAnonymously(auth).catch(console.error);
        }
      } else {
        localStorage.removeItem("soul-user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string) => {
    const cleanName = name.trim().toLowerCase();
    const matched = PARTNER_NAMES.find(n => n.toLowerCase() === cleanName);
    
    if (matched) {
      try {
        await signInAnonymously(auth);
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
