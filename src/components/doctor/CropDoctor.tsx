import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, Search, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, RefreshCcw, Info, Activity, Zap } from "lucide-react";
import { aiService, CropDiagnosis } from "../../services/aiService";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import { useLanguage } from "../../contexts/LanguageContext";

export default function CropDoctor() {
  const { t, locale, isRTL } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CropDiagnosis | null>(null);
  const [showGuided, setShowGuided] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const diagnosis = await aiService.diagnoseCrop(image, "image/jpeg", locale);
      setResult(diagnosis);
      
      const path = "diagnoses";
      try {
        await addDoc(collection(db, path), {
          ...diagnosis,
          userId: auth.currentUser?.uid,
          imageUrl: image,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path, auth);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToTracker = async () => {
    if (!result || !image) return;
    const path = "crops";
    try {
      await addDoc(collection(db, path), {
        userId: auth.currentUser?.uid,
        name: result.cropName,
        disease: result.mostLikelyDiagnosis,
        imageUrl: image,
        status: "Stable",
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, path, auth);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-12 relative min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-brand)_0%,_transparent_70%)]" />
      </div>

      {!result && !isAnalyzing ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center w-full px-2"
        >
          <div className="glass w-full p-8 md:p-16 text-center relative overflow-hidden group rounded-[32px] md:rounded-[48px] border-white/50 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500 opacity-20" />
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            
            {image ? (
              <div className="relative group cursor-pointer mb-6 md:mb-10 inline-block w-full max-w-sm" onClick={() => fileInputRef.current?.click()}>
                <img src={image} className="max-h-[300px] md:max-h-[400px] w-full mx-auto rounded-2xl md:rounded-[32px] object-cover shadow-2xl ring-4 md:ring-8 ring-white/50" alt="Preview" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-[32px] flex items-center justify-center backdrop-blur-sm">
                  <RefreshCcw className="text-white w-10 md:w-12 h-10 md:h-12 animate-spin-slow" />
                </div>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 md:w-32 md:h-32 bg-white/50 backdrop-blur-xl border-2 md:border-4 border-dashed border-neutral-200 rounded-[32px] md:rounded-[44px] flex items-center justify-center mx-auto mb-6 md:mb-8 hover:border-brand/40 transition-all cursor-pointer group btn-press shadow-inner ring-1 ring-neutral-100"
              >
                <Camera className="w-10 h-10 md:w-12 md:h-12 text-neutral-300 group-hover:text-brand transition-colors" />
              </button>
            )}

            <div className="max-w-md mx-auto">
              <h3 className="text-2xl md:text-4xl font-black mb-3 tracking-tighter leading-tight dark:text-white">
                {image ? t("great_shot") || "Great shot." : t("check_crops_title") || "Let's check your crops."}
              </h3>
              <p className="text-neutral-500 font-medium mb-8 md:mb-12 relaxed dark:text-neutral-400">
                {image ? t("ready_opinion") || "Ready for an expert opinion? Our AI is standing by." : t("capture_photo_tip") || "Capture a clear photo of the leaves or stem. We'll identify any issues in seconds."}
              </p>

              {image && (
                <button 
                  onClick={analyze}
                  className="w-full py-4 md:py-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-[20px] md:rounded-[24px] font-black text-base md:text-lg shadow-2xl shadow-neutral-900/20 btn-press flex items-center justify-center gap-4 group"
                >
                  {t("confirm_analyze") || "Confirm & Analyze"} <Search className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-125 transition-transform" />
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-12 w-full">
            <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md rounded-[28px] md:rounded-[32px] border border-white/60 flex items-start gap-4 md:gap-5 shadow-sm group hover:bg-white/60 transition-colors">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] md:rounded-[18px] bg-sky-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Info className="w-5 h-5 md:w-6 md:h-6 text-sky-600" />
               </div>
               <div>
                  <span className="font-black text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Optical Tip</span>
                  <span className="text-sm md:text-base font-bold text-neutral-600 leading-snug">Ensure indirect, bright light for maximum diagnostic precision.</span>
               </div>
            </div>
            <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md rounded-[28px] md:rounded-[32px] border border-white/60 flex items-start gap-4 md:gap-5 shadow-sm group hover:bg-white/60 transition-colors">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] md:rounded-[18px] bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
               </div>
               <div>
                  <span className="font-black text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">AI Detail</span>
                  <span className="text-sm md:text-base font-bold text-neutral-600 leading-snug">Our models are trained on 10M+ healthy vs diseased samples.</span>
               </div>
            </div>
          </div>
        </motion.div>
      ) : isAnalyzing ? (
        <div className="glass p-10 md:p-20 text-center flex flex-col items-center rounded-[32px] md:rounded-[50px] shadow-2xl relative overflow-hidden">
           {/* Scanning Effect Overlay */}
           <div className="absolute inset-x-0 h-[20%] bg-gradient-to-b from-transparent via-brand/10 to-transparent top-0 animate-scanning" />
           
           <div className="w-24 h-24 md:w-32 md:h-32 relative mb-6 md:mb-10 overflow-hidden rounded-full ring-4 md:ring-8 ring-brand/5">
              {image && <img src={image} className="w-full h-full object-cover blur-sm opacity-50" alt="Scanning" referrerPolicy="no-referrer" />}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 border-t-2 md:border-t-4 border-brand rounded-full"
              />
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-1 bg-brand shadow-[0_0_20px_rgba(79,70,229,1)] z-10"
              />
           </div>
           
           <h2 className="text-2xl md:text-4xl font-black mb-3 tracking-tighter dark:text-white">{t("scanning")}</h2>
           <p className="text-neutral-500 font-bold text-sm md:text-lg max-w-sm mx-auto leading-relaxed italic dark:text-neutral-400">
             {t("identifying_patterns") || "\"Identifying patterns invisible to the human eye. Almost there.\""}
           </p>

           <div className="mt-8 flex gap-2">
             {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0.2 }}
                 animate={{ opacity: 1 }}
                 transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2, repeatType: "reverse" }}
                 className="w-3 h-3 bg-brand rounded-full"
               />
             ))}
           </div>
        </div>
      ) : result && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-10 px-2"
        >
          {/* Result Card */}
          <div className="glass overflow-hidden rounded-[32px] md:rounded-[50px] border-white/50 shadow-2xl">
            <div className={`p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 ${result.severity === 'Critical' ? 'bg-rose-50/50' : 'bg-brand/5'}`}>
               <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[20px] md:rounded-[30px] flex items-center justify-center shadow-lg ${result.severity === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-brand/10 text-brand'}`}>
                     {result.severity === 'Critical' ? <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" /> : <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />}
                  </div>
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-1 md:mb-2 block">{t("diagnosis_found")}</span>
                     <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">{result.mostLikelyDiagnosis}</h2>
                  </div>
               </div>
               <div className={`text-${isRTL ? 'left' : 'right'}`}>
                  <span className="text-[10px] font-black block text-neutral-400 uppercase tracking-widest mb-2 whitespace-nowrap">{t("confidence")}: {result.confidenceLevel}</span>
                  <span className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest ${
                    result.severity === 'High' || result.severity === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {result.severity}
                  </span>
               </div>
            </div>

            <div className="p-6 md:p-12">
               <div className="mb-8 md:mb-12">
                  <h4 className="font-black text-[10px] md:text-sm uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-3">
                     <Search className="w-4 h-4 text-brand" /> Expert Observation
                  </h4>
                  <p className="text-sm md:text-lg font-medium text-neutral-700 leading-relaxed bg-white/40 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white">
                    {result.interpretation}
                  </p>
               </div>

               <p className="text-base md:text-xl font-bold text-neutral-700 leading-relaxed mb-8 md:mb-12 italic border-l-4 border-brand pl-4 md:pl-6">
                 "{result.explanation}"
               </p>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-8 md:space-y-10">
                    <div>
                      <h4 className="font-black text-[10px] md:text-sm uppercase tracking-widest text-neutral-400 mb-4 md:mb-6 flex items-center gap-3">
                         <Activity className="w-4 h-4 text-brand" /> Symptoms Observed
                      </h4>
                      <ul className="space-y-3 md:space-y-4">
                         {result.observedSymptoms.map((s, i) => (
                           <li key={i} className="text-sm md:text-lg font-bold text-neutral-600 flex items-start gap-4 p-3 md:p-4 bg-white/40 rounded-xl md:rounded-2xl border border-white transition-all hover:bg-white/80">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> 
                              <span>{s}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-black text-[10px] md:text-sm uppercase tracking-widest text-neutral-400 mb-4 md:mb-6 flex items-center gap-3">
                         <Zap className="w-4 h-4 text-amber-500" /> Possible Conditions
                      </h4>
                      <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10">
                        {result.possibleConditions.map((c, i) => (
                          <span key={i} className="px-3 md:px-5 py-2 md:py-3 bg-white/60 border border-white rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black text-neutral-700 shadow-sm">
                            {c}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-black text-[10px] md:text-sm uppercase tracking-widest text-neutral-400 mb-4 md:mb-6 flex items-center gap-3">
                         <ShieldCheck className="w-4 h-4 text-emerald-500" /> Prevention Tips
                      </h4>
                      <ul className="space-y-3 md:space-y-4">
                         {result.preventionTips?.map((tip, i) => (
                           <li key={i} className="text-[11px] md:text-sm font-bold text-neutral-500 flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-emerald-50/30 rounded-xl md:rounded-2xl border border-emerald-100/50">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> 
                              <span>{tip}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-neutral-900 rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group h-fit">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-[60px]" />
                     <h4 className="text-xl md:text-2xl font-black mb-6 md:mb-8 tracking-tight">Recommended Actions</h4>
                     <div className="space-y-6 md:space-y-8 relative z-10">
                        {result.recommendedActions.slice(0, 4).map((step, i) => (
                          <div key={i} className="flex gap-4 md:gap-6 group">
                             <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 text-white rounded-xl md:rounded-2xl flex items-center justify-center text-[10px] md:text-sm font-black flex-shrink-0 border border-white/10 group-hover:bg-brand group-hover:border-brand transition-all">
                                {i + 1}
                             </div>
                             <p className="text-sm md:text-base text-neutral-300 font-medium leading-relaxed group-hover:text-white transition-colors">{step}</p>
                          </div>
                        ))}
                     </div>
                     <button 
                       onClick={() => setShowGuided(true)}
                       className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-white text-neutral-900 rounded-[18px] md:rounded-[22px] font-black flex items-center justify-center gap-3 text-xs md:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                     >
                       Begin Recovery Guide <ArrowRight className="w-4 h-4 text-brand" />
                     </button>
                  </div>
               </div>
            </div>
            
            <div className="p-6 md:p-10 bg-brand/5 border-t border-brand/10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                   <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                 </div>
                 <p className="text-sm md:text-base text-neutral-800 font-bold italic">{t("recovery_journal")}</p>
               </div>
               <button 
                 onClick={saveToTracker}
                 className="w-full md:w-auto px-10 py-4 bg-brand text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-xl shadow-brand/20 btn-press"
               >
                 {t("start_monitoring")}
               </button>
            </div>
          </div>

          <button 
             onClick={() => { setResult(null); setImage(null); }}
             className="w-full py-4 md:py-6 glass border-2 border-dashed border-neutral-200 rounded-3xl md:rounded-[40px] text-neutral-400 font-black uppercase tracking-widest hover:bg-white hover:text-brand hover:border-brand/40 transition-all flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-xs btn-press"
          >
             <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" /> {t("another_specimen")}
          </button>
        </motion.div>
      )}

      {/* Guided Steps Modal */}
      <AnimatePresence>
        {showGuided && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowGuided(false)}
               className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 100 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 100 }}
               className="relative bg-white w-full max-w-2xl rounded-[32px] md:rounded-[50px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
               <div className="p-8 md:p-12">
                 <div className="flex items-center justify-between mb-8 md:mb-12">
                   <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2 block">Step-By-Step</span>
                     <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Full Treatment Path</h2>
                   </div>
                   <button onClick={() => setShowGuided(false)} className="p-3 md:p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl md:rounded-[24px] transition-colors btn-press">
                     <X className="w-5 h-5 md:w-6 md:h-6" />
                   </button>
                 </div>
                 
                 <div className="space-y-6 md:space-y-10">
                   {result.recommendedActions.map((step, i) => (
                      <div key={i} className="flex gap-4 md:gap-8 items-start group">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-brand/10 group-hover:bg-brand text-brand group-hover:text-white rounded-xl md:rounded-[24px] flex items-center justify-center font-black text-base md:text-2xl flex-shrink-0 shadow-lg shadow-brand/5 border border-brand/5 transition-all duration-300">
                          {i + 1}
                        </div>
                        <div className="pt-1 md:pt-2">
                           <p className="text-base md:text-xl font-bold text-neutral-800 leading-relaxed group-hover:scale-[1.02] origin-left transition-transform duration-300">{step}</p>
                           {i === 0 && (
                             <div className="flex items-center gap-2 mt-2 md:mt-3 p-1.5 md:p-2 bg-emerald-50 rounded-lg md:rounded-xl w-fit">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Crucial Priority</span>
                             </div>
                           )}
                        </div>
                      </div>
                   ))}
                 </div>

                 <button 
                    onClick={() => setShowGuided(false)}
                    className="w-full mt-10 md:mt-16 py-4 md:py-6 bg-neutral-900 text-white rounded-[20px] md:rounded-[30px] font-black text-base md:text-lg shadow-2xl shadow-neutral-900/20 btn-press uppercase tracking-widest"
                 >
                    Acknowledge & Start
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>; }
