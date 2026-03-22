"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Music, Volume2, VolumeX } from "lucide-react";

// Lyrics for "With You" by AP Dhillon with approximate timestamps
const WITH_YOU_LYRICS = [
  { time: 0, text: "♪ (Music playing...)" },
  { time: 5, text: "Mainu tere naal rehna" },
  { time: 9, text: "Mere dil di tu rani" },
  { time: 13, text: "Har pal teri yaad" },
  { time: 17, text: "Satave ni deewani" },
  { time: 21, text: "Door kade na jaavin" },
  { time: 25, text: "Metho door na tu jaavin" },
  { time: 29, text: "Mere saahan vich tu ae" },
  { time: 33, text: "Meri rooh vich tu ae" },
  { time: 37, text: "Tu hi mera jahan ae" },
  { time: 41, text: "Mainu tere naal rehna..." },
  { time: 45, text: "Tere naal hi marna" },
  { time: 49, text: "Har janam vich tenu" },
  { time: 53, text: "Apna bana ke rakhna" },
  { time: 57, text: "♪ (Musical Break)" },
];

export default function GalleryPage() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Audio & Lyrics State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  useEffect(() => {
    const q = query(collection(db, "galleryImages"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(docs.length > 0 ? docs : PlaceHolderImages.map(p => ({ url: p.imageUrl, ...p })));
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Attempt to autoplay (browsers usually block this without interaction)
    const playMusic = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn("Autoplay blocked. User needs to interact first.");
        }
      }
    };
    playMusic();

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

  // Sync lyrics with audio
  useEffect(() => {
    const index = WITH_YOU_LYRICS.findIndex((line, i) => {
      const nextLine = WITH_YOU_LYRICS[i + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
    if (index !== activeLineIndex) {
      setActiveLineIndex(index);
    }
  }, [currentTime, activeLineIndex]);

  const handlePan = (_: any, info: PanInfo) => {
    setRotation(prev => prev + info.delta.x * 0.5);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const isMobile = windowWidth < 768;
  const radius = isMobile ? 180 : 280;
  const cardWidth = isMobile ? 160 : 220;
  const cardHeight = isMobile ? 240 : 320;

  return (
    <div className="min-h-screen bg-transparent pt-16 relative overflow-hidden">
      <Navigation />

      {/* Audio Element - Update 'src' with your AP Dhillon MP3 file */}
      <audio 
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        loop
      />
      
      {/* Lyrics Display - Top Left */}
      <div className="fixed top-24 left-8 z-50 max-w-[280px] md:max-w-[400px] pointer-events-none select-none">
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {WITH_YOU_LYRICS.map((line, i) => {
              const isActive = i === activeLineIndex;
              const isPast = i < activeLineIndex;
              const isUpcoming = i > activeLineIndex && i <= activeLineIndex + 3;

              if (!isActive && !isPast && !isUpcoming) return null;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isActive ? 1 : (isPast ? 0.3 : 0.2), 
                    x: isActive ? 10 : 0,
                    scale: isActive ? 1.1 : 0.9,
                    filter: isActive ? "blur(0px)" : "blur(1px)"
                  }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.5 }}
                  className={`font-headline font-bold leading-tight ${
                    isActive ? "text-white text-2xl md:text-3xl" : "text-rose-300 text-lg md:text-xl"
                  }`}
                >
                  {line.text}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Music Controls */}
      <div className="fixed bottom-24 right-8 z-50 flex items-center gap-3">
        <button 
          onClick={toggleMute}
          className="p-3 glass rounded-full text-rose-400 hover:text-white transition-all shadow-xl"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        {!isPlaying && (
          <button 
            onClick={() => audioRef.current?.play()}
            className="px-4 py-2 glass rounded-full text-rose-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse"
          >
            <Music size={14} /> Play With You
          </button>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden w-full relative z-10 px-6"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-headline text-white mb-4 z-10 font-bold tracking-tight text-center"
        >
          Heart Gallery
        </motion.h2>
        <p className="text-rose-300/40 text-xs font-bold uppercase tracking-[0.2em] mb-12 text-center">Our frozen moments in time</p>
        
        <div 
          className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: '2000px' }}
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
                  <div className="w-full h-full rounded-2xl glass p-1.5 shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center group">
                    <img
                      src={img.url || img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-xl" />
                    {img.caption && (
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <p className="text-white text-xs font-medium italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.caption}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-rose-300/30 mt-12 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-4 z-10 glass px-6 py-2 rounded-full border-white/5"
        >
          <span>swipe to explore</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
