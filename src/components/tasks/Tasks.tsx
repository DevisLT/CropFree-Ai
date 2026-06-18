import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, Plus, X, AlertTriangle, Zap, Shield, Trash2, Calendar, ListTodo } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";

type Priority = "High" | "Medium" | "Low";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  isCompleted: boolean;
  userId: string;
}

const priorityOrder: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1
};

export default function Tasks() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");

  const fetchTasks = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const fetchedTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      
      fetchedTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setTasks(fetchedTasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), { isCompleted: !currentStatus });
      setTasks(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t);
        return updated.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      });
      toast.success(currentStatus ? t('toast_marked_incomplete') : t('toast_task_completed'));
    } catch (e) {
      console.error(e);
      toast.error(t('toast_task_update_failed'));
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const taskData = {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        isCompleted: false,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "tasks"), taskData);
      const newTask = { id: docRef.id, ...taskData } as Task;
      
      setTasks(prev => [newTask, ...prev].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));

      setNewTitle("");
      setNewDesc("");
      setNewPriority("Medium");
      setIsAdding(false);
      toast.success(t('toast_task_created'));
    } catch (e) {
      console.error(e);
      toast.error(t('toast_task_save_failed'));
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success(t('toast_task_deleted'));
    } catch (e) {
      console.error(e);
      toast.error(t('toast_task_delete_failed'));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
      <div className="w-24 h-1 bg-brand/10 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-1/2 h-full bg-brand"
        />
      </div>
      <p className="font-semibold text-slate-500 text-xs">{t('loading_task_planner')}</p>
    </div>
  );

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 font-sans text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
         <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{t('daily_routine_planner')}</span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('farming_checklist_tasks')}</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xl">
              {t('tasks_intro_desc')}
            </p>
         </div>
         <button 
           onClick={() => setIsAdding(!isAdding)}
           className="px-4 py-2 bg-brand text-white hover:bg-brand-deep rounded-lg text-xs font-bold shadow-soft transition-colors flex items-center gap-1.5 self-start"
         >
           {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
           {isAdding ? t('close_form') : t('create_task')}
         </button>
      </header>

      {/* Add Task Form with Drawer-like spacing */}
      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            onSubmit={handleAddTask}
            className="premium-card p-5 bg-white border border-[#EAEFED] rounded-xl shadow-soft space-y-4"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('task_title')}</label>
                  <input 
                    type="text" 
                    placeholder={t('task_title_placeholder') || "Enter task title"} 
                    className="w-full bg-slate-50 border border-[#EAEFED] rounded-lg p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-brand focus:border-brand transition-all outline-none"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pt-2">{t('task_desc')}</label>
                  <textarea 
                    placeholder={t('task_desc_placeholder') || "Enter short details"} 
                    className="w-full bg-slate-50 border border-[#EAEFED] rounded-lg p-3 text-xs font-semibold text-slate-600 placeholder:text-slate-400 focus:ring-1 focus:ring-brand focus:border-brand transition-all min-h-[90px] outline-none"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('task_priority')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["High", "Medium", "Low"] as Priority[]).map(p => {
                        const activeColors = {
                          High: "bg-rose-50 border-rose-200 text-rose-700",
                          Medium: "bg-amber-50 border-amber-200 text-amber-700",
                          Low: "bg-slate-50 border-slate-200 text-slate-600"
                        };
                        const isSelected = newPriority === p;

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewPriority(p)}
                            className={`py-2 p-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all text-center ${
                              isSelected ? `${activeColors[p]} font-extrabold ring-1 ring-offset-0 ring-[#EAEFED]` : "bg-white border-[#EAEFED] text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-brand flex-shrink-0" />
                    <p className="text-[10.5px] font-semibold text-slate-500 leading-normal">
                      {t('priority_helper_text')}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-1.5 bg-brand text-white rounded-lg font-bold text-xs hover:bg-brand-deep transition-colors shadow-soft"
                    >
                      {t('save_task')}
                    </button>
                  </div>
                </div>
             </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Progress Card */}
      <div className="premium-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-soft rounded-xl border border-[#EAEFED] bg-white">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-[#EAEFED] flex items-center justify-center relative bg-slate-50 shadow-inner">
               <span className="font-extrabold text-lg text-slate-900 leading-none">{Math.round(progress)}%</span>
            </div>
            <div className="text-left">
               <div className="flex items-center gap-1.5">
                 <Shield className="w-3.5 h-3.5 text-brand" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('checklist_progress_status')}</span>
               </div>
               <h3 className="text-sm font-bold text-slate-950 mt-0.5">{t('farming_efficiency')}</h3>
               <p className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                 {completedCount} / {tasks.length} {t('tasks_completed')}
               </p>
            </div>
         </div>
         <div className="w-full sm:w-1/3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
         </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length > 0 ? tasks.map((t, i) => {
          const badgeColor = t.priority === "High" ? "bg-rose-50 text-rose-700 border-rose-100" :
                             t.priority === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                             "bg-slate-50 text-slate-500 border-slate-100";
          return (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={`p-4 bg-white border rounded-xl shadow-soft flex items-center justify-between gap-4 transition-all ${
                t.isCompleted ? "border-slate-100 bg-slate-50/50 opacity-60" : "border-[#EAEFED] hover:border-brand/40"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button 
                  onClick={() => toggleTask(t.id, t.isCompleted)}
                  className="mt-0.5 text-slate-400 hover:text-brand transition-colors flex-shrink-0"
                >
                  {t.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-brand" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-350" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`text-xs font-bold leading-snug truncate ${t.isCompleted ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {t.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wide border ${badgeColor}`}>
                      {t.priority}
                    </span>
                  </div>
                  {t.description && (
                    <p className={`text-[11px] font-medium leading-relaxed ${t.isCompleted ? "text-slate-400" : "text-slate-500"}`}>
                      {t.description}
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleDeleteTask(t.id)}
                className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-350 hover:text-rose-500 flex items-center justify-center flex-shrink-0 transition-colors border border-transparent hover:border-rose-100"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        }) : (
          <div className="py-12 text-center border-dashed border border-slate-250 bg-white rounded-xl">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-lg mx-auto mb-3">
                <ListTodo className="w-5 h-5 text-brand" />
              </div>
             <h4 className="text-base font-bold mb-1 text-slate-900 font-sans">{t('no_tasks_title')}</h4>
             <p className="text-slate-500 text-xs font-semibold max-w-xs mx-auto mb-4 leading-normal">
               {t('no_tasks_desc')}
             </p>
             <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-deep transition-colors">
               {t('create_first_task')}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
