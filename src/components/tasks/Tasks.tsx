import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle, ListTodo, Archive, ArrowRight, Activity } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser?.uid));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), { isCompleted: !currentStatus });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="flex items-end justify-between px-4">
         <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-2 block">Agricultural Workflow</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950">Directives.</h2>
            <p className="text-slate-500 text-sm md:text-lg font-medium mt-2">"Precision steps calculated for your field's biological recovery."</p>
         </div>
      </div>

      {/* Progress Card */}
      <div className="premium-card p-10 bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-950/20 border-none relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[100px]" />
         <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
            <div className={`w-24 h-24 rounded-[40px] border-4 border-white/10 flex items-center justify-center relative flex-shrink-0 bg-white/5`}>
               <svg className="w-24 h-24 rotate-[-90deg] absolute inset-0">
                  <circle 
                    cx={48} cy={48} r={42}
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    className="text-white/5" 
                  />
                  <motion.circle 
                    cx={48} cy={48} r={42}
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray="264"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * progress / 100) }}
                    className="text-brand" 
                  />
               </svg>
               <span className="relative z-10 font-black text-2xl tracking-tighter">{Math.round(progress)}%</span>
            </div>
            <div className="text-center sm:text-left">
               <h3 className="text-2xl font-black tracking-tight">Biological Progress</h3>
               <p className="text-white/30 text-xs font-black uppercase tracking-widest mt-1">{completedCount} of {tasks.length} Protocol units complete</p>
            </div>
         </div>
         <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10">
            Sync New Directives
         </button>
      </div>

      {/* Task List */}
      <div className="space-y-6">
         {tasks.length > 0 ? tasks.map((task, i) => (
           <motion.div 
             key={task.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             onClick={() => toggleTask(task.id, task.isCompleted)}
             className={`premium-card p-8 flex items-center gap-8 cursor-pointer transition-all border-none ${
               task.isCompleted ? 'bg-slate-50 opacity-40 grayscale' : 'bg-white shadow-premium hover:shadow-brand/20 group'
             }`}
           >
              <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center transition-all ${
                task.isCompleted ? 'bg-brand text-white shadow-xl' : 'bg-slate-50 border border-slate-100 text-slate-300 group-hover:bg-brand/10 group-hover:text-brand ring-brand/20'
              }`}>
                 {task.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 bg-slate-300 rounded-full group-hover:bg-brand" />}
              </div>
              <div className="flex-1">
                 <h4 className={`text-xl font-black tracking-tighter transition-all ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-950'}`}>{task.title}</h4>
                 <p className="text-sm font-medium text-slate-500 mt-1">{task.description}</p>
              </div>
              <ArrowRight className={`w-5 h-5 transition-all ${task.isCompleted ? 'opacity-0' : 'text-brand opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}`} />
           </motion.div>
         )) : (
            <div className="p-20 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-10 border border-slate-100 rotate-12">
                  <ListTodo className="w-10 h-10 text-slate-100" />
               </div>
               <h3 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">Protocol Clear.</h3>
               <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">No active directives found. Biology is currently within nominal parameters.</p>
            </div>
         )}
      </div>
    </div>
  );
}
