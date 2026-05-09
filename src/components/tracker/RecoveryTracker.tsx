import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Plus, Search, Calendar, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, Trash2, ArrowLeft, CheckCircle, Camera, RefreshCcw, X, ShieldCheck, Activity } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { aiService } from "../../services/aiService";

export default function RecoveryTracker() {
  const { t, locale } = useLanguage();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [revalidationResult, setRevalidationResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUpdatingStep, setIsUpdatingStep] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const fetchCrops = async () => {
    if (!auth.currentUser) return;
    const path = "crops";
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setCrops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path, auth);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "crops", id));
      toast.success(t("crop_removed_toast") || "Molecular signature purged from nexus.");
      setCrops(prev => prev.filter(c => c.id !== id));
      if (selectedCrop?.id === id) setSelectedCrop(null);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed: Database isolation error.");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStep = async (cropId: string, stepIndex: number) => {
    const crop = crops.find(c => c.id === cropId);
    if (!crop || isUpdatingStep !== null) return;

    if (stepIndex > 0 && !crop.recoverySteps[stepIndex - 1].completed) {
      toast.error(t("step_sequential_error") || "Biological error: Initiate previous phase first.");
      return;
    }

    if (crop.recoverySteps[stepIndex].completed && stepIndex < crop.recoverySteps.length - 1 && crop.recoverySteps[stepIndex + 1].completed) {
      toast.error(t("step_undo_error") || "Nexus synchronization lock: Subsequent phases active.");
      return;
    }

    setIsUpdatingStep(stepIndex);
    const newSteps = [...crop.recoverySteps];
    const isCompleting = !newSteps[stepIndex].completed;
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      completed: isCompleting,
      completedAt: isCompleting ? new Date().toISOString() : null
    };

    const completedCount = newSteps.filter(s => s.completed).length;
    const progress = Math.round((completedCount / newSteps.length) * 100);
    const status = progress === 100 ? "Validating" : progress > 0 ? "In Recovery" : "Diagnosed";

    try {
      await updateDoc(doc(db, "crops", cropId), {
        recoverySteps: newSteps,
        progress,
        status,
        updatedAt: serverTimestamp()
      });
      
      setLastSaved(new Date());
      setCrops(prev => prev.map(c => c.id === cropId ? { ...c, recoverySteps: newSteps, progress, status } : c));
      if (selectedCrop?.id === cropId) {
        setSelectedCrop({ ...selectedCrop, recoverySteps: newSteps, progress, status });
      }
      
      if (isCompleting) {
        toast.success(t("step_completed_toast") || "Action vector updated.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Sync failure.");
    } finally {
      setIsUpdatingStep(null);
    }
  };

  const handleRevalidate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCrop) return;

    setIsRevalidating(true);
    setRevalidationResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const diagnosis = await aiService.diagnoseCrop(base64, "image/jpeg", locale);
        const isHealthy = diagnosis.severity === "Low" || diagnosis.mostLikelyDiagnosis.toLowerCase().includes("healthy");
        
        setRevalidationResult({
          isHealthy,
          diagnosis: diagnosis.mostLikelyDiagnosis,
          severity: diagnosis.severity,
          explanation: diagnosis.explanation
        });

        if (isHealthy) {
          await updateDoc(doc(db, "crops", selectedCrop.id), {
            status: "Recovered",
            updatedAt: serverTimestamp()
          });
          toast.success(t("recovery_confirmed") || "Great news! Biological restoration confirmed.");
        } else {
          toast.error(t("recovery_still_infected") || "Biological markers still present.");
        }

        fetchCrops();
      } catch (error) {
        console.error(error);
        toast.error("Process error.");
      } finally {
        setIsRevalidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-12">
      <div className="w-40 h-2 bg-brand/10 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-1/2 h-full bg-brand shadow-[0_0_20px_#2D6A4F]"
        />
      </div>
      <p className="font-black text-brand uppercase tracking-[0.6em] text-slate-400">Accessing Neural Archive...</p>
    </div>
  );

  if (selectedCrop) {
    return (
      <div className="max-w-7xl mx-auto space-y-16 py-12 px-6">
        <button 
          onClick={() => { setSelectedCrop(null); setRevalidationResult(null); }}
          className="flex items-center gap-6 text-slate-400 hover:text-deep-green font-black uppercase tracking-[0.6em] text-[12px] transition-all group mb-12"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-3 transition-transform" /> {t("back_to_list") || "Return to Matrix"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          <div className="space-y-16">
            <div className="relative aspect-square md:aspect-video rounded-[64px] overflow-hidden shadow-2xl group border-4 border-white group">
               <img src={selectedCrop.imageUrl} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[6s] grayscale-[0.3] group-hover:grayscale-0" alt={selectedCrop.name} />
               <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-deep-green via-deep-green/40 to-transparent flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-4 h-4 bg-brand rounded-full animate-pulse shadow-[0_0_15px_#00ff88]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] whitespace-nowrap">Active Telemetry Link</span>
</div>
<h2 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter mb-6 leading-none drop-shadow-xl">{selectedCrop.name}</h2>
<div className="flex items-center gap-6">
  <span className="px-8 py-3 bg-white text-deep-green text-xs font-black uppercase tracking-[0.4em] rounded-full shadow-2xl border-2 border-brand">
    {selectedCrop.disease}
  </span>
</div>
               </div>
            </div>

            <div className="premium-card p-12 md:p-20 rounded-[64px] flex flex-col md:flex-row items-center justify-between gap-12 bg-white/40 backdrop-blur-3xl border-4 border-white shadow-2xl">
               <div className="text-center md:text-left">
                 <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 mb-4 block">Biological Vitality Output</span>
                 <div className="flex items-baseline gap-6 border-b-4 border-brand/10 pb-4">
                   <h3 className="text-7xl md:text-9xl font-black text-deep-green tracking-tighter leading-none">{selectedCrop.progress}</h3>
<span className="text-3xl md:text-4xl font-black text-brand">%</span>
</div>
</div>
<div className="w-full md:w-[50%] space-y-8">
<div className="w-full h-4 bg-white border-2 border-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
   <motion.div 
     initial={{ width: 0 }}
     animate={{ width: `${selectedCrop.progress}%` }}
     className="h-full bg-brand rounded-full shadow-[0_0_30px_rgba(45,106,79,0.3)] transition-all duration-[2s]"
   />
</div>
<p className="text-slate-400 text-sm font-bold uppercase tracking-[0.4em] text-right">
   {selectedCrop.status === 'Recovered' ? "Biological restoration complete." : selectedCrop.progress > 0 ? "Genetic trend ascending." : "Status: Biosphere Quarantine."}
</p>
               </div>
            </div>

            {selectedCrop.progress === 100 && selectedCrop.status !== 'Recovered' && (
              <div className="premium-card p-16 md:p-24 rounded-[64px] bg-white text-deep-green border-4 border-brand shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
                 <div className="flex items-center gap-6 mb-8 text-brand">
                    <AlertCircle className="w-10 h-10 animate-bounce" />
                    <span className="text-[12px] font-black uppercase tracking-[0.7em]">VERIFICATION MANDATORY</span>
</div>
<h4 className="text-4xl md:text-5xl lg:text-7xl font-black mb-10 tracking-tighter leading-tight uppercase">Revalidation Scan.</h4>
<p className="text-slate-400 text-xl font-medium mb-16 leading-relaxed border-l-4 border-brand/20 pl-8">
   "Input a high-resolution visual specimen to confirm systemic eradiction of targeted pathogens across the biological nexus."
</p>
                 
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleRevalidate} />
                 
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isRevalidating}
                   className="w-full py-10 bg-deep-green text-white rounded-full font-black shadow-2xl flex items-center justify-center gap-8 hover:scale-105 active:scale-95 transition-all text-xl uppercase tracking-[0.4em] border-4 border-white"
                 >
                   {isRevalidating ? <RefreshCcw className="w-8 h-8 animate-spin" /> : <Camera className="w-10 h-10" />}
                   Execute Bio-Scan
                 </button>

                 {revalidationResult && (
                   <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-16 p-12 rounded-[48px] border-4 shadow-2xl backdrop-blur-3xl ${revalidationResult.isHealthy ? 'bg-brand/10 border-brand' : 'bg-rose-50 border-rose-500'}`}
                   >
                     <div className="flex items-center gap-8 mb-8 text-center md:text-left">
                        <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-xl ${revalidationResult.isHealthy ? 'bg-brand text-white border-4 border-white' : 'bg-rose-500 text-white border-4 border-white'}`}>
                          {revalidationResult.isHealthy ? <CheckCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                        </div>
                        <p className="text-3xl font-black uppercase tracking-tighter text-deep-green">{revalidationResult.isHealthy ? "Biolife Synchronized" : "Markers Detected"}</p>
</div>
<p className="text-xl font-medium text-slate-500 leading-relaxed border-t border-slate-200 mt-8 pt-8">
   "{revalidationResult.explanation}"
</p>
                   </motion.div>
                 )}
              </div>
            )}
          </div>

          {/* Recovery Checklist */}
          <div className="space-y-16">
             <div className="premium-card p-12 md:p-20 rounded-[80px] bg-white/40 backdrop-blur-3xl border-4 border-white shadow-2xl flex flex-col h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12">
                   {lastSaved && (
                     <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-brand bg-white border-2 border-brand/20 px-8 py-3 rounded-full shadow-xl">
                        <ShieldCheck className="w-6 h-6" /> Hub SYNCED
                     </div>
                   )}
                </div>

                <div className="mb-16">
                   <div className="flex items-center gap-6 mb-6">
   <div className="w-3 h-3 bg-brand rounded-full shadow-[0_0_15px_#00ff88]" />
   <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Neural Directive Hub</span>
</div>
<h3 className="text-5xl md:text-7xl font-black text-deep-green tracking-tighter leading-none uppercase">Restoration.</h3>
                </div>
  
                <div className="space-y-6 flex-1">
                  {selectedCrop.recoverySteps?.map((step: any, i: number) => {
                    const isLocked = i > 0 && !selectedCrop.recoverySteps[i - 1].completed;
                    const isNext = i === 0 || (selectedCrop.recoverySteps[i - 1].completed && !step.completed);
                    
                    return (
                      <div 
                        key={i}
                        onClick={() => !isLocked && toggleStep(selectedCrop.id, i)}
                        className={`group flex items-start gap-10 p-8 rounded-[48px] border-4 transition-all duration-1000 relative overflow-hidden ${
                          step.completed 
                          ? "bg-slate-50 border-slate-100 grayscale opacity-40 shadow-inner" 
                          : isLocked
                          ? "bg-white/50 border-white/50 opacity-20 cursor-not-allowed scale-[0.98]"
                          : isNext
                          ? "bg-white border-brand shadow-2xl ring-4 ring-brand/10 cursor-pointer hover:scale-[1.02]"
                          : "bg-white/60 border-white/60 hover:border-brand/40 cursor-pointer"
                        }`}
                      >
                        <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center font-black text-4xl flex-shrink-0 transition-all duration-1000 border-4 ${
                          step.completed 
                            ? "bg-slate-200 text-slate-400 border-slate-300" 
                            : isLocked 
                            ? "bg-slate-100 text-slate-200 border-slate-200" 
                            : isNext 
                            ? "bg-brand text-white border-white animate-pulse shadow-[0_0_30px_#00ff8840]" 
                            : "bg-white text-slate-300 border-slate-100"
                        }`}>
                          {isUpdatingStep === i ? (
                            <RefreshCcw className="w-8 h-8 animate-spin" />
                          ) : step.completed ? (
                            <CheckCircle2 className="w-10 h-10" />
                          ) : (
                            <span>{i + 1}</span>
                          )}
</div>
<div className="pt-4 flex-1">
<div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
  <p className={`text-2xl md:text-3xl font-black leading-tight tracking-tight ${step.completed ? 'text-slate-300 line-through' : 'text-deep-green'}`}>
     {step.text}
  </p>
  {step.type && (
    <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-full border-2 w-fit ${step.type === 'practice' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-brand/10 text-brand border-brand/20'}`}>
      {step.type === 'practice' ? 'Protocol' : 'Action Vector'}
    </span>
  )}
</div>
{step.completed && (
  <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-4 flex items-center gap-4 leading-none">
    <div className="w-8 h-[2px] bg-slate-200" /> SYNCED {format(new Date(step.completedAt), "MMM dd, HH:mm")}
  </p>
)}
{isNext && !step.completed && (
  <p className="text-[12px] font-black text-brand uppercase tracking-[0.5em] mt-4 animate-pulse flex items-center gap-4">
    <Activity className="w-5 h-5" /> Execute Sequence Now
  </p>
)}
                        </div>
                      </div>
                    );
                  })}
                </div>
  
                <div className="mt-20 p-12 bg-white rounded-[48px] border-4 border-slate-100 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group shadow-inner">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[50px] pointer-events-none" />
                   <div className="w-24 h-24 rounded-[32px] bg-brand text-white flex items-center justify-center flex-shrink-0 animate-pulse shadow-2xl border-4 border-white rotate-12">
                      <TrendingUp className="w-12 h-12" />
                   </div>
                   <div className="text-center md:text-left">
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.7em] mb-4 block">Bio-Telemetry Matrix</span>
                      <p className="text-3xl font-black text-deep-green leading-tight uppercase tracking-tight">
                        {selectedCrop.status === 'Recovered' ? "Target parameters nominal." : selectedCrop.progress > 0 ? "Expansion phase active." : "Sequence lock: Awaiting Input."}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-20 py-12 px-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
         <div>
            <div className="flex items-center gap-6 mb-6">
              <div className="h-[2px] w-16 bg-brand/30" />
              <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Botanical Genetic Nexus</span>
            </div>
            <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-none text-deep-green drop-shadow-sm uppercase">Archive.</h2>
            <p className="text-slate-500 text-xl md:text-4xl font-medium max-w-4xl mt-12 leading-relaxed">
              "Mapping thermal gradients and restorative milestones in real-time. Synthesizing the evolution from biological pathogen to botanical prosperity."
            </p>
         </div>
         <div className="flex items-center gap-8 text-slate-400 font-black uppercase tracking-[0.6em] text-[11px]">
           <div className="w-2.5 h-2.5 bg-brand rounded-full shadow-[0_0_15px_#00ff88]" /> Uplink Live
         </div>
      </header>

      {/* Search Hub */}
      <div className="relative group max-w-5xl">
         <div className="absolute inset-y-0 left-0 pl-12 flex items-center pointer-events-none">
            <Search className="h-10 w-10 text-brand/20 group-focus-within:text-brand transition-all duration-700" />
         </div>
         <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER BIOSIGNATURES..."
            className="block w-full pl-28 pr-12 py-12 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[64px] text-deep-green font-black text-3xl md:text-5xl focus:ring-4 focus:ring-brand focus:bg-white focus:border-brand transition-all shadow-2xl placeholder:text-slate-200 placeholder:tracking-tighter"
         />
         {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-12 flex items-center"
            >
              <X className="h-10 w-10 text-slate-200 hover:text-rose-500 transition-colors" />
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
        {filteredCrops.length > 0 ? filteredCrops.map((crop, i) => (
          <motion.div 
            key={crop.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedCrop(crop)}
            className={`premium-card group p-6 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[64px] shadow-2xl transition-all duration-1000 cursor-pointer flex flex-col hover:border-brand hover:scale-[1.03] ${
              i % 3 === 1 ? 'lg:translate-y-24' : i % 3 === 2 ? 'lg:translate-y-12' : ''
            }`}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[56px] mb-12 border-4 border-white group">
               <img src={crop.imageUrl} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-150 grayscale-[0.5] group-hover:grayscale-0" alt={crop.name} referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-deep-green/80 via-transparent to-transparent" />
               <div className="absolute top-10 left-10">
                  <div className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl border-2 flex items-center gap-4 shadow-2xl ${
                    crop.status === 'Recovered' ? 'bg-brand text-white border-white' : 
                    crop.status === 'Validating' ? 'bg-accent text-white border-white' : 
                    'bg-white/10 text-white border-white/20'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${crop.status === 'Recovered' ? 'bg-white' : crop.status === 'Validating' ? 'bg-white' : 'bg-brand'}`} />
                    {crop.status}
                  </div>
               </div>
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   setConfirmDeleteId(crop.id);
                 }}
                 className="absolute top-10 right-10 w-16 h-16 bg-white/20 backdrop-blur-3xl border-2 border-white/20 rounded-[28px] flex items-center justify-center text-white hover:bg-rose-500 hover:border-rose-500 transition-all shadow-2xl"
               >
                 <Trash2 className="w-8 h-8" />
               </button>
            </div>
            
            <AnimatePresence>
               {confirmDeleteId === crop.id && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 z-50 bg-deep-green/95 backdrop-blur-3xl rounded-[64px] flex flex-col items-center justify-center p-16 text-center"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <div className="w-32 h-32 bg-rose-500/20 rounded-[48px] flex items-center justify-center mb-10 border-4 border-rose-500/30 animate-pulse">
                     <AlertCircle className="w-16 h-16 text-rose-500" />
                   </div>
                   <h5 className="text-white font-black text-5xl tracking-tighter mb-6 uppercase">Purge?</h5>
                   <p className="text-slate-400 text-sm font-black mb-16 leading-relaxed uppercase tracking-[0.6em]">Molecular signature erasure.</p>
                   <div className="flex flex-col gap-5 w-full">
                      <button 
                        onClick={() => handleDelete(crop.id)}
                        disabled={isDeleting === crop.id}
                        className="py-8 bg-rose-500 text-white rounded-full font-black text-sm uppercase tracking-[0.5em] hover:scale-105 transition-all shadow-2xl border-4 border-white"
                      >
                        {isDeleting === crop.id ? "Erasing..." : "Confirm Purge"}
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="py-6 text-white/40 hover:text-white font-black text-sm uppercase tracking-[0.5em] transition-all underline"
                      >
                        Abort Protocol
                      </button>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
            
            <div className="px-10 pb-16 flex-1 flex flex-col justify-between">
               <div className="space-y-8">
                  <div className="flex items-start justify-between gap-6">
                    <h4 className="text-5xl md:text-7xl font-black text-deep-green tracking-tighter leading-none group-hover:text-brand transition-all drop-shadow-sm uppercase">{crop.name}</h4>
                    <div className="w-20 h-20 bg-white rounded-[32px] border-4 border-slate-50 flex items-center justify-center text-slate-100 group-hover:bg-brand group-hover:text-white group-hover:border-white transition-all shadow-xl group-hover:rotate-12">
                       <TrendingUp className="w-10 h-10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="h-[2px] w-12 bg-brand/30" />
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em]">{crop.disease}</span>
                  </div>
                  
                  <div className="space-y-6 pt-10">
                     <div className="flex items-center justify-between font-black">
                        <span className="text-[12px] text-slate-400 uppercase tracking-[0.5em]">Restoration State</span>
                        <span className="text-5xl text-deep-green tracking-tight">{crop.progress}%</span>
                     </div>
                     <div className="w-full bg-white h-4 rounded-full overflow-hidden p-1 border-2 border-slate-50 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${crop.progress}%` }}
                          className="h-full rounded-full transition-all duration-[2s] bg-brand shadow-[0_0_20px_#00ff8840]"
                        />
                     </div>
                  </div>
               </div>

               <div className="mt-20 pt-12 border-t-2 border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white rounded-[28px] flex items-center justify-center border-2 border-slate-50 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity">
                       <Calendar className="w-7 h-7 text-slate-300" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Index-Delta</span>
                        <span className="text-lg font-black text-deep-green uppercase tracking-tighter">{format(crop.createdAt.toDate(), "MMM dd, yyyy")}</span>
                     </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.2, x: 10 }}
                    className="w-20 h-20 rounded-[32px] bg-deep-green text-white flex items-center justify-center shadow-2xl relative overflow-hidden border-4 border-white group/btn"
                  >
                     <div className="absolute inset-0 bg-brand opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                     <ChevronRight className="w-10 h-10 relative z-10" />
                  </motion.button>
               </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-48 text-center flex flex-col items-center premium-card rounded-[80px] border-4 border-white bg-white/40 backdrop-blur-3xl shadow-2xl group relative overflow-hidden md:mx-12">
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[150px] group-hover:bg-brand/10 transition-all duration-[4s]" />
             <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-[64px] flex items-center justify-center mb-16 rotate-12 shadow-2xl border-4 border-slate-50 group-hover:rotate-0 transition-all duration-1000">
                <Leaf className="w-20 h-20 md:w-32 md:h-32 text-brand animate-pulse" />
             </div>
             <h3 className="text-5xl md:text-8xl lg:text-[10rem] font-black mb-10 tracking-tighter text-deep-green uppercase leading-none">{t("empty_tracker") || "Archive Latent."}</h3>
<p className="text-slate-400 text-xl md:text-4xl font-medium mb-20 max-w-2xl mx-auto leading-relaxed px-12">
  "Initialize restoration sequences within the matrix to populate this biological archive."
</p>
             <div className="flex gap-10">
                <div className="w-4 h-4 rounded-full bg-brand animate-ping shadow-[0_0_20px_#00ff88]" />
                <div className="w-4 h-4 rounded-full bg-slate-200" />
                <div className="w-4 h-4 rounded-full bg-slate-100" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
