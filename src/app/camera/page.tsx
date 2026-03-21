
"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { storage, db } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { CameraOff, Heart, Camera } from "lucide-react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const router = useRouter();
  const { user } = useSoulAuth();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(false);
    } catch (err) {
      console.warn("Camera access denied or unavailable", err);
      setCameraError(true);
    }
  };

  const captureImage = () => {
    if (cameraError) {
      // Fallback: Create a blank/placeholder image using canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fff1f2'; // rose-50
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#fb7185'; // rose-400
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', 200, 200);
      }
      setCaptured(canvas.toDataURL('image/jpeg'));
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.translate(canvas.width, 0);
      context?.scale(-1, 1);
      context?.drawImage(video, 0, 0);
      setCaptured(canvas.toDataURL('image/jpeg'));
    }
  };

  const handleSave = async () => {
    if (!captured || !user) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `profiles/${user}.jpg`);
      await uploadString(storageRef, captured, 'data_url');
      const url = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, "userProfiles", user), {
        id: user,
        name: user,
        profileImageUrl: url,
        updatedAt: serverTimestamp()
      }, { merge: true });

      router.push("/");
    } catch (err) {
      console.error("Failed to save profile image:", err);
      // Even if upload fails, we should let them in to the app
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen flex flex-col p-4 bg-black"
    >
      <div className="flex-1 relative rounded-3xl overflow-hidden bg-gray-900 border border-white/20 shadow-2xl mb-6">
        {captured ? (
          <img src={captured} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <canvas ref={canvasRef} className="hidden" />
            {!cameraError ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transform -scale-x-100" 
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-rose-50 to-pink-100">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-rose-400">
                  <Heart size={48} fill="currentColor" />
                </div>
                <h3 className="text-rose-800 font-bold text-xl mb-2">Camera Unavailable</h3>
                <p className="text-rose-600/70 text-sm max-w-[200px]">
                  No camera detected, but you can still continue with a heart!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pb-8 px-4 flex flex-col gap-4">
        {!captured ? (
          <div className="flex flex-col items-center gap-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={captureImage}
              className="w-20 h-20 bg-white rounded-full border-4 border-rose-200 flex items-center justify-center shadow-lg"
            >
              <div className="w-16 h-16 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                {cameraError ? <Heart size={32} fill="currentColor" /> : <Camera size={32} />}
              </div>
            </motion.button>
            {cameraError && (
              <p className="text-white/50 text-xs tracking-widest uppercase font-bold">Tap to continue with heart</p>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => setCaptured(null)}
              className="flex-1 px-6 py-4 rounded-xl font-medium bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 active:scale-95"
            >
              {cameraError ? "Back" : "Retake"}
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-xl font-medium bg-gradient-to-r from-rose-400 to-pink-500 text-white active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
