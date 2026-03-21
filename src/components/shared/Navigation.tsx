
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  BookHeart, 
  CheckCircle, 
  Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/tasks", label: "Tasks", icon: CheckCircle },
    { href: "/gallery", label: "Gallery", icon: Heart },
    { href: "/diary", label: "Diary", icon: BookHeart },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-rose-100 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)} 
            className="p-2 -ml-2 rounded-xl text-rose-500 hover:bg-rose-50"
          >
            <Menu size={28} />
          </button>
          <span className="font-bold text-rose-900 capitalize text-lg">
            {pathname === "/" ? "Love Hub" : pathname.replace("/", "")}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400">
          <Heart size={16} fill="currentColor" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 pt-12 bg-rose-50 border-b border-rose-100">
                <h3 className="text-2xl font-bold text-rose-600">Love Hub</h3>
                <p className="text-rose-400 text-sm">Our private space</p>
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-rose-300">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                      pathname === item.href 
                        ? "bg-rose-500 text-white shadow-lg" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon size={24} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
