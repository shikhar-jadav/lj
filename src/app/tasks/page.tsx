
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { 
  CheckCircle, 
  Trophy, 
  Plus, 
  X, 
  Coins, 
  User, 
  ChevronLeft, 
  Upload,
  Image as ImageIcon,
  Film,
  Music,
  FileIcon,
  Loader2
} from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from "@/firebase/non-blocking-updates";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function TasksPage() {
  const { user, partner } = useSoulAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filter, setFilter] = useState<'mine' | 'assigned'>('mine');
  const [points, setPoints] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reward, setReward] = useState(50);
  const [proof, setProof] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPoints = onSnapshot(doc(db, "userProfiles", user), (doc) => {
      if (doc.exists()) {
        setPoints(doc.data()?.points || 0);
      }
    });

    return () => {
      unsubTasks();
      unsubPoints();
    };
  }, [user]);

  const handleCreate = () => {
    if (!title || !desc || !user || !partner) return;
    
    // Only Shikhar can trigger task creation in this specific logic
    if (user.toLowerCase() !== 'shikhar') return;

    const taskData = {
      title,
      description: desc,
      rewardPoints: Number(reward),
      assignedById: user,
      assignedToId: partner,
      status: "pending",
      assignedAt: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    addDocumentNonBlocking(collection(db, "tasks"), taskData);

    setView('list');
    setTitle(''); 
    setDesc('');
  };

  const handleComplete = async () => {
    if (!selectedTask || !user) return;
    
    setIsUploading(true);
    let mediaUrl = "";

    try {
      if (selectedFile) {
        const fileRef = ref(storage, `tasks/${selectedTask.id}/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedFile);
        mediaUrl = await getDownloadURL(snapshot.ref);
      }

      const taskRef = doc(db, "tasks", selectedTask.id);
      const userRef = doc(db, "userProfiles", user);
      const transactionsRef = collection(db, "userProfiles", user, "pointTransactions");

      // 1. Update Task Status
      updateDocumentNonBlocking(taskRef, {
        status: "completed",
        submissionText: proof,
        submissionImageUrl: mediaUrl,
        completedAt: new Date().toISOString()
      });

      // 2. Increment User Points
      updateDocumentNonBlocking(userRef, { 
        points: increment(selectedTask.rewardPoints),
        updatedAt: new Date().toISOString()
      });

      // 3. Create Transaction Record for History
      addDocumentNonBlocking(transactionsRef, {
        userId: user,
        amount: selectedTask.rewardPoints,
        type: "task_reward",
        description: `Completed: ${selectedTask.title}`,
        relatedTaskId: selectedTask.id,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Task Completed!",
        description: `You earned ${selectedTask.rewardPoints} points.`,
      });

      setView('list');
      setProof('');
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to complete task:", err);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not save your proof. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const displayedTasks = tasks.filter(t => 
    filter === 'mine' ? t.assignedToId === user : t.assignedById === user
  );

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon size={24} />;
    if (file.type.startsWith('video/')) return <Film size={24} />;
    if (file.type.startsWith('audio/')) return <Music size={24} />;
    return <FileIcon size={24} />;
  };

  const renderMedia = (url: string) => {
    if (!url) return null;
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg')) {
      return <video src={url} controls className="w-full rounded-xl mt-4 bg-black aspect-video" />;
    }
    if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('.m4a')) {
      return <audio src={url} controls className="w-full mt-4" />;
    }
    return <img src={url} alt="Proof" className="w-full rounded-xl mt-4 object-cover shadow-md" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {view === 'list' && (
        <>
          <Navigation />
          <div className="pt-16 h-full flex flex-col">
            <div className="bg-white p-6 pb-4 rounded-b-3xl shadow-sm z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                   <h2 className="text-2xl font-bold text-slate-800">Hello, {user}</h2>
                   <p className="text-sm text-slate-400">Ready for some love?</p>
                </div>
                <Link href="/points" className="flex flex-col items-end">
                   <div className="text-2xl font-black text-yellow-500 flex items-center gap-1">
                     {points} <Trophy size={20} className="text-yellow-400" />
                   </div>
                   <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Balance</span>
                </Link>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setFilter('mine')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${filter === 'mine' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
                >
                  My Tasks
                </button>
                <button 
                  onClick={() => setFilter('assigned')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${filter === 'assigned' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
                >
                  Given Tasks
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 text-slate-900">
              {displayedTasks.map(task => (
                <motion.div
                  key={task.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedTask(task); setView('detail'); }}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-l-[6px] cursor-pointer flex flex-col gap-2 ${task.status === 'completed' ? 'border-emerald-400' : 'border-orange-400'}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{task.title}</h4>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {task.status}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                  <div className="flex justify-between items-center mt-2 border-t pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <User size={14} /> {task.assignedById}
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs">
                      <Trophy size={14} /> {task.rewardPoints} pts
                    </div>
                  </div>
                </motion.div>
              ))}
              {displayedTasks.length === 0 && (
                <div className="text-center py-20 text-slate-300 italic">No tasks here yet.</div>
              )}
            </div>

            {user?.toLowerCase() === 'shikhar' && (
              <motion.button 
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setView('create')}
                 className="fixed bottom-6 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center z-20"
              >
                <Plus size={28} />
              </motion.button>
            )}
          </div>
        </>
      )}

      {view === 'create' && (
        <div className="flex flex-col h-screen bg-white">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800">New Task</h2>
            <button onClick={() => setView('list')} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto pb-24">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Task Title</label>
              <input 
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-rose-400 focus:bg-white outline-none transition-all text-slate-900" 
                placeholder="e.g., Wash the dishes" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-rose-400 focus:bg-white outline-none h-40 text-slate-900" 
                placeholder="Details..." 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reward Points</label>
              <input 
                type="number" 
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-rose-400 focus:bg-white outline-none text-slate-900" 
                value={reward} 
                onChange={e => setReward(Number(e.target.value))} 
              />
            </div>
          </div>
          <div className="p-4 border-t sticky bottom-0 bg-white">
            <button 
              onClick={handleCreate} 
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
            >
              Assign Task
            </button>
          </div>
        </div>
      )}

      {view === 'detail' && selectedTask && (
        <div className="flex flex-col h-screen bg-slate-50">
          <div className="bg-white p-4 flex items-center gap-3 border-b sticky top-0 z-10 shadow-sm">
            <button onClick={() => setView('list')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full"><ChevronLeft size={24} /></button>
            <span className="font-bold text-lg truncate flex-1 text-slate-900">{selectedTask.title}</span>
            <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{selectedTask.rewardPoints} pts</div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-100">
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Description</h3>
               <p className="text-slate-800 leading-relaxed text-base">{selectedTask.description}</p>
            </div>
            
            {selectedTask.status === 'completed' && (
               <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
                 <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                 <h3 className="font-bold text-emerald-800">Completed!</h3>
                 <p className="text-sm text-emerald-600 mt-2 italic">"{selectedTask.submissionText}"</p>
                 {renderMedia(selectedTask.submissionImageUrl)}
               </div>
            )}

            {selectedTask.status === 'pending' && selectedTask.assignedToId === user && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-slate-800"><Upload size={20} className="text-rose-500"/> Proof of Completion</h3>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*,audio/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-rose-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-rose-50 hover:border-rose-300 transition-all bg-white overflow-hidden"
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2 text-rose-500">
                        {getFileIcon(selectedFile)}
                        <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-rose-50 rounded-full text-rose-300">
                          <ImageIcon size={24} />
                        </div>
                        <span className="text-sm font-medium">Add Image, Video, or Audio</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800">Completion Note</h3>
                  <textarea 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none min-h-[120px] focus:ring-2 focus:ring-rose-200 text-slate-900" 
                    placeholder="Tell your love about the task..." 
                    value={proof} 
                    onChange={e => setProof(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedTask.status === 'pending' && selectedTask.assignedToId === user && (
            <div className="p-4 bg-white border-t sticky bottom-0">
              <button 
                onClick={handleComplete} 
                disabled={isUploading || !proof}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Uploading...
                  </>
                ) : (
                  'Submit & Claim'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
