
"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function GalleryPage() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const q = query(collection(db, "galleryImages"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(docs.length > 0 ? docs : PlaceHolderImages.map(p => ({ url: p.imageUrl, ...p })));
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => prev - 0.2); 
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    if (!isDragging) animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  const handlePan = (_: any, info: PanInfo) => {
    setRotation(prev => prev + info.delta.x * 0.5);
  };

  const isMobile = windowWidth < 768;
  const radius = isMobile ? 180 : 280;
  const cardWidth = isMobile ? 160 : 220;
  const cardHeight = isMobile ? 240 : 320;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden w-full relative">
        <h2 className="text-2xl md:text-3xl font-serif text-rose-800 mb-8 z-10 font-bold">My Heart Gallery</h2>
        
        <div 
          className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            className="relative w-0 h-0"
            style={{
              transformStyle: "preserve-3d",
              rotateY: rotation, 
            }}
            onPanStart={() => setIsDragging(true)}
            onPan={handlePan}
            onPanEnd={() => setIsDragging(false)}
          >
            {images.map((img, i) => {
              const angle = (360 / images.length) * i;
              return (
                <motion.div
                  key={img.id || i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    marginLeft: `-${cardWidth / 2}px`, 
                    marginTop: `-${cardHeight / 2}px`, 
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="w-full h-full rounded-xl bg-white p-1 shadow-lg border border-rose-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={img.url || img.imageUrl}
                      alt=""
                      className="max-w-full max-h-full object-cover rounded-lg pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 to-transparent pointer-events-none rounded-lg" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <p className="text-rose-400 mt-8 text-sm animate-pulse flex items-center gap-2 z-10 bg-white/50 px-3 py-1 rounded-full">
          <span>👈</span> Swipe to spin <span>👉</span>
        </p>
      </div>
    </div>
  );
}
