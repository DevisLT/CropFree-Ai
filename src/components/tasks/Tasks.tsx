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
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4 md:py-8 px-2 md:px-0">
      <div className="flex items-center justify-between mb-4 md:mb-8">
         <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Daily Tasks</h2>
            <p className="text-sm md:text-base text-neutral-500">Actionable steps generated from your crop diagnoses.</p>
         </div>
      </div>

      {/* Progress Card */}
      <div className="premium-card p-6 md:p-8 bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
         <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-brand/20 flex items-center justify-center relative flex-shrink-0`}>
               <svg className="w-16 h-16 md:w-20 md:h-20 rotate-[-90deg]">
                  <circle 
                    cx={32} cy={32} r={28}
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    className="text-white/10" 
                    transform="scale(1.25)"
                  />
                  <motion.circle 
                    cx={32} cy={32} r={28}
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeDasharray="176"
                    initial={{ strokeDashoffset: 176 }}
                    animate={{ strokeDashoffset: 176 - (176 * progress / 100) }}
                    className="text-brand" 
                    transform="scale(1.25)"
                  />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center font-black text-base md:text-xl">{Math.round(progress)}%</span>
            </div>
            <div>
               <h3 className="text-lg md:text-xl font-bold">Treatment Completion</h3>
               <p className="text-white/50 text-xs md:text-sm">{completedCount} of {tasks.length} tasks finished</p>
            </div>
         </div>
         <button className="w-full sm:w-auto px-6 py-3 bg-white text-neutral-900 rounded-xl md:rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
            Generate New Tasks
         </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
         {tasks.length > 0 ? tasks.map((task, i) => (
           <motion.div 
             key={task.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.05 }}
             onClick={() => toggleTask(task.id, task.isCompleted)}
             className={`premium-card p-4 md:p-6 flex items-center gap-4 md:gap-6 cursor-pointer transition-all ${
               task.isCompleted ? 'opacity-60 bg-neutral-50 border-neutral-100 grayscale hover:grayscale-0' : 'hover:border-brand/40 shadow-xl shadow-neutral-100'
             }`}
           >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                task.isCompleted ? 'bg-success text-white' : 'border-2 border-neutral-200 text-neutral-200 group-hover:border-brand group-hover:text-brand'
              }`}>
                 {task.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                 <h4 className={`font-bold transition-all ${task.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>{task.title}</h4>
                 <p className="text-sm text-neutral-500">{task.description}</p>
              </div>
              <ArrowRight className={`w-4 h-4 transition-all ${task.isCompleted ? 'opacity-0' : 'text-neutral-200'}`} />
           </motion.div>
         )) : (
            <div className="premium-card p-10 md:p-20 text-center flex flex-col items-center border-dashed border-2 border-neutral-200 bg-neutral-50/50">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
                  <ListTodo className="w-8 h-8 md:w-10 md:h-10 text-neutral-200" />
               </div>
               <h3 className="text-xl font-black mb-2">Clean Slate</h3>
               <p className="text-neutral-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">No pending tasks. Your crops are up to date! Generate new tasks after a fresh scan.</p>
            </div>
         )}
      </div>
    </div>
  );
}
