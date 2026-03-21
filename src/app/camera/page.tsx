
"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { storage, db } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
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
    } catch (err) {
      setError("Please allow camera access to continue 📸");
    }
  };

  const captureImage = () => {
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
      console.error(err);
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
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover transform -scale-x-100" 
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white/80">
                <p>{error}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pb-8 px-4 flex flex-col gap-4">
        {!captured ? (
          <div className="flex justify-center">
             <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={captureImage}
              className="w-20 h-20 bg-white rounded-full border-4 border-rose-200 flex items-center justify-center shadow-lg"
            >
              <div className="w-16 h-16 bg-rose-500 rounded-full border-2 border-white" />
            </motion.button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => setCaptured(null)}
              className="flex-1 px-6 py-4 rounded-xl font-medium bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 active:scale-95"
            >
              Retake
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
