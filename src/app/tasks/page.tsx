
"use client";

import { useState, useEffect } from "react";
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
  Image as ImageIcon 
} from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import Link from "next/link";

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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubPoints = onSnapshot(doc(db, "userProfiles", user), (doc) => {
      setPoints(doc.data()?.points || 0);
    });
    return () => {
      unsubTasks();
      unsubPoints();
    };
  }, [user]);

  const handleCreate = async () => {
    if (!title || !desc || !user || !partner) return;
    const isSnow = user.toLowerCase() === 'snow';
    
    if (isSnow && points < 100) {
      alert("Not enough points! Snow needs 100 pts to assign a task.");
      return;
    }

    try {
      if (isSnow) {
        await updateDoc(doc(db, "userProfiles", user), { points: increment(-100) });
      }

      await addDoc(collection(db, "tasks"), {
        title,
        description: desc,
        rewardPoints: isSnow ? 0 : Number(reward),
        assignedBy: user,
        assignedTo: partner,
        status: "pending",
        timestamp: serverTimestamp()
      });

      setView('list');
      setTitle(''); setDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    if (!selectedTask || !user) return;
    try {
      await updateDoc(doc(db, "tasks", selectedTask.id), {
        status: "completed",
        submissionText: proof,
        completedAt: serverTimestamp()
      });
      await updateDoc(doc(db, "userProfiles", user), { points: increment(selectedTask.rewardPoints) });
      setView('list');
      setProof('');
    } catch (err) {
      console.error(err);
    }
  };

  const displayedTasks = tasks.filter(t => 
    filter === 'mine' ? t.assignedTo === user : t.assignedBy === user
  );

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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
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
                  <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
                  <div className="flex justify-between items-center mt-2 border-t pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <User size={14} /> {task.assignedBy}
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs">
                      <Trophy size={14} /> {task.rewardPoints} pts
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button 
               whileTap={{ scale: 0.9 }}
               onClick={() => setView('create')}
               className="fixed bottom-6 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <Plus size={28} />
            </motion.button>
          </div>
        </>
      )}

      {view === 'create' && (
        <div className="flex flex-col h-screen bg-white">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800">New Task</h2>
            <button onClick={() => setView('list')} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
          </div>
          <form className="p-4 space-y-6 overflow-y-auto pb-24">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Task Title</label>
              <input className="w-full p-4 rounded-xl bg-slate-50 outline-none" placeholder="e.g., Wash the dishes" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea className="w-full p-4 rounded-xl bg-slate-50 outline-none h-40" placeholder="Details..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            {user?.toLowerCase() !== 'snow' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reward Points</label>
                <input type="number" className="w-full p-4 rounded-xl bg-slate-50 outline-none" value={reward} onChange={e => setReward(Number(e.target.value))} />
              </div>
            )}
            {user?.toLowerCase() === 'snow' && (
              <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm">
                As Snow, assigning this task costs a 100 point fee.
              </div>
            )}
          </form>
          <div className="p-4 border-t sticky bottom-0 bg-white">
            <button onClick={handleCreate} className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold">Assign Task</button>
          </div>
        </div>
      )}

      {view === 'detail' && selectedTask && (
        <div className="flex flex-col h-screen bg-slate-50">
          <div className="bg-white p-4 flex items-center gap-3 border-b sticky top-0 z-10">
            <button onClick={() => setView('list')} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
            <span className="font-bold text-lg truncate flex-1">{selectedTask.title}</span>
            <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{selectedTask.rewardPoints} pts</div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Description</h3>
               <p className="text-slate-700 leading-relaxed text-base">{selectedTask.description}</p>
            </div>
            {selectedTask.status === 'completed' && (
               <div className="bg-emerald-50 rounded-2xl p-6 text-center">
                 <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                 <h3 className="font-bold text-emerald-800">Completed!</h3>
                 <p className="text-sm text-emerald-600 mt-2">"{selectedTask.submissionText}"</p>
               </div>
            )}
            {selectedTask.status === 'pending' && selectedTask.assignedTo === user && (
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Upload size={20} className="text-rose-500"/> Submission</h3>
                <textarea 
                  className="w-full p-4 bg-white border rounded-2xl outline-none min-h-[120px]" 
                  placeholder="Note about completion..." 
                  value={proof} 
                  onChange={e => setProof(e.target.value)}
                />
              </div>
            )}
          </div>
          {selectedTask.status === 'pending' && selectedTask.assignedTo === user && (
            <div className="p-4 bg-white border-t sticky bottom-0">
              <button onClick={handleComplete} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold">Submit & Claim</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
