"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PARTNER_NAMES = ["Leo", "Mia"]; // Hardcoded for this private app as per requirements

export function useSoulAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("soul-user");
    if (stored && PARTNER_NAMES.includes(stored)) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = (name: string) => {
    if (PARTNER_NAMES.includes(name)) {
      localStorage.setItem("soul-user", name);
      setUser(name);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("soul-user");
    setUser(null);
    router.push("/login");
  };

  return { user, login, logout, loading, partner: user === PARTNER_NAMES[0] ? PARTNER_NAMES[1] : PARTNER_NAMES[0] };
}
