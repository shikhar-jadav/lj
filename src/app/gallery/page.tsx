"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Music, Volume2, VolumeX, Sparkles, Play } from "lucide-react";

// Replace this URL with your Firebase Storage Download URL
const SONG_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

// Precisely timed lyrics for "With You" by AP Dhillon
const WITH_YOU_LYRICS = [
  { time: 0, text: "♪" },
  { time: 2, text: "Mainu tere naal rehna" },
  { time: 6, text: "Mere dil di tu rani" },
  { time: 10, text: "Har pal teri yaad" },
  { time: 14, text: "Satave ni deewani" },
  { time: 18, text: "Door kade na jaavin" },
  { time: 22, text: "Metho door na tu jaavin" },
  { time: 26, text: "Mere saahan vich tu ae" },
  { time: 30, text: "Meri rooh vich tu ae" },
  { time: 34, text: "Tu hi mera jahan ae" },
  { time: 38, text: "Mainu tere naal rehna..." },
  { time: 42, text: "Tere naal hi marna" },
  { time: 46, text: "Har janam vich tenu" },
  { time: 50, text: "Apna bana ke rakhna" },
  { time: 54, text: "♪" },
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
  const [activeLine, setActiveLine] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "galleryImages"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(docs.length > 0 ? docs : PlaceHolderImages.map(p => ({ url: p.imageUrl, ...p })));
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Attempt autoplay (most browsers block this, so we need the play button fallback)
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.log("Autoplay blocked"));
    }

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
    const currentLine = WITH_YOU_LYRICS.reduce((prev, curr) => {
      if (currentTime >= curr.time) return curr;
      return prev;
    }, WITH_YOU_LYRICS[0]);
    
    if (currentLine.text !== activeLine) {
      setActiveLine(currentLine.text);
    }
  }, [currentTime, activeLine]);

  const handlePan = (_: any, info: PanInfo) => {
    setRotation(prev => prev + info.delta.x * 0.5);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const isMobile = windowWidth < 768;
  const radius = isMobile ? 180 : 280;
  const cardWidth = isMobile ? 160 : 220;
  const cardHeight = isMobile ? 240 : 320;

  return (
    <div className="min-h-screen bg-transparent pt-16 relative overflow-hidden">
      <Navigation />

      <audio 
        ref={audioRef}
        src={SONG_URL} 
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        loop
      />
      
      {/* Cinematic Spawning Lyrics */}
      <div className="fixed top-24 left-8 z-50 max-w-[350px] pointer-events-none select-none h-40 flex items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLine}
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-2"
          >
            <span className="text-primary/40 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
              {isPlaying ? "Now Playing: With You" : "Music Paused"}
            </span>
            <h2 className="text-white text-3xl md:text-5xl font-headline font-bold leading-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {activeLine}
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-0.5 bg-gradient-to-r from-primary/40 to-transparent rounded-full mt-2"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Music Control / Start Button */}
      <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-3">
        {!isPlaying ? (
          <motion.button 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startMusic}
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_15px_35px_rgba(204,51,153,0.4)] border border-white/20"
          >
            <Play size={18} fill="currentColor" /> Start the Vibe
          </motion.button>
        ) : (
          <button 
            onClick={toggleMute}
            className="p-5 glass rounded-full text-rose-400 hover:text-white transition-all shadow-2xl border-white/5 active:scale-90"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden w-full relative z-10 px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-4">
            <Sparkles size={12} /> Our Shared Moments
          </span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tighter">Heart Gallery</h1>
        </motion.div>
        
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
                  <div className="w-full h-full rounded-[2.5rem] glass p-2 shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center group relative">
                    <img
                      src={img.url || img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-[2rem] pointer-events-none transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none rounded-[2rem]" />
                    {img.caption && (
                      <div className="absolute bottom-6 left-6 right-6 z-10">
                        <p className="text-white text-sm font-medium italic opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 tracking-wide font-serif">
                          "{img.caption}"
                        </p>
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
          transition={{ delay: 0.8 }}
          className="text-rose-300/20 mt-16 text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-4 z-10 glass px-8 py-3 rounded-full border-white/5"
        >
          <span>swipe to travel through time</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
