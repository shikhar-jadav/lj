
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      } else {
        localStorage.removeItem("soul-user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string) => {
    const cleanName = name.trim().toLowerCase();
    const matched = PARTNER_NAMES.find(n => n.toLowerCase() === cleanName);
    
    if (matched) {
      localStorage.setItem("soul-user", matched);
      setUser(matched);
      // Initialize local profile if it doesn't exist
      const profiles = JSON.parse(localStorage.getItem("soul-profiles") || "{}");
      if (!profiles[matched]) {
        profiles[matched] = {
          id: matched,
          name: matched,
          points: matched === "Shikhar" ? 500 : 0,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem("soul-profiles", JSON.stringify(profiles));
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("soul-user");
    setUser(null);
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
