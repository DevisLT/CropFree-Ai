import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, Search, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, RefreshCcw, Info, Activity, Zap, X } from "lucide-react";
import { aiService, CropDiagnosis } from "../../services/aiService";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import { useLanguage } from "../../contexts/LanguageContext";

import toast from "react-hot-toast";

export default function CropDoctor() {
  const { t, locale, isRTL } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CropDiagnosis | null>(null);
  const [showGuided, setShowGuided] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveDiagnosisToHistory = async () => {
    if (!result || !image || isSaving) return;
    setIsSaving(true);
    const path = "diagnoses";
    try {
      await addDoc(collection(db, path), {
        ...result,
        userId: auth.currentUser?.uid,
        imageUrl: image,
        createdAt: serverTimestamp(),
      });
      toast.success(t("diagnosis_saved") || "Diagnosis saved to history.");
      setResult(null);
      setImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToTracker = async () => {
    if (!result || !image || isSaving) return;
    setIsSaving(true);
    
    const path = "crops";
    try {
      const defaultPractices = [
        "Consistent Moisture Regulation",
        "Strategic Pruning of Affected Areas",
        "Bio-Nutrient Supplementation",
        "Soil PH Optimization",
        "Protective Mulching Protocol"
      ];

      const recoverySteps = [
        ...result.recommendedActions.map(text => ({ text, type: "directive" })),
        ...defaultPractices.map(text => ({ text, type: "practice" }))
      ].map(step => ({
        ...step,
        completed: false,
        completedAt: null
      }));

      await addDoc(collection(db, path), {
        userId: auth.currentUser?.uid,
        name: result.cropName,
        disease: result.mostLikelyDiagnosis,
        imageUrl: image,
        status: "Inspecting",
        progress: 0,
        recoverySteps: recoverySteps,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast.success(t("crop_saved") || "Crop moved to recovery tracker.");
      setResult(null);
      setImage(null);
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, path, auth);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-24 relative min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center">
      {!result && !isAnalyzing ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center w-full px-2"
        >
          <div className="premium-card w-full p-12 md:p-24 text-center relative overflow-hidden group rounded-[64px] border border-white/60">
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-brand to-accent opacity-30" />
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            
            {image ? (
              <div className="relative group cursor-pointer mb-12 inline-block w-full max-w-xl" onClick={() => fileInputRef.current?.click()}>
                <img src={image} className="max-h-[400px] md:max-h-[600px] w-full mx-auto rounded-[48px] object-cover shadow-2xl border-4 border-white" alt="Preview" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-deep-green/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px] flex items-center justify-center backdrop-blur-md">
                  <RefreshCcw className="text-white w-20 h-20 animate-spin-slow" />
                </div>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 md:w-64 md:h-64 bg-brand/5 backdrop-blur-xl border-4 border-dashed border-brand/20 rounded-[48px] flex items-center justify-center mx-auto mb-12 hover:border-brand/60 transition-all cursor-pointer group btn-press shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-brand/5 rounded-[48px] animate-pulse" />
                <Camera className="w-16 h-16 md:w-24 md:h-24 text-brand group-hover:scale-110 transition-transform relative z-10" />
              </button>
            )}

            <div className="max-w-3xl mx-auto">
              <h3 className="text-4xl md:text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-tight text-deep-green">
                {image ? "Genetic Sample Captured." : "Botanical Diagnostic Nexus."}
              </h3>
              <p className="text-slate-500 font-medium mb-16 text-xl md:text-2xl leading-relaxed">
                {image ? "Neural interface calibrated. Ready to initiate molecular scanning sequence." : "Submit a high-resolution visual of the concern. Our neural networks will determine the biological state with precision."}
              </p>

              {image && (
                <button 
                  onClick={analyze}
                  className="w-full py-8 bg-deep-green text-white rounded-full font-black text-xl shadow-[0_25px_50px_rgba(8,28,21,0.2)] btn-press flex items-center justify-center gap-6 group hover:scale-105 active:scale-95 transition-all"
                >
                  Initiate Molecular Scan <Search className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 w-full">
            <div className="p-10 bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/60 flex items-start gap-8 shadow-2xl group hover:bg-white/60 transition-all">
               <div className="w-16 h-16 rounded-[24px] bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
                  <Info className="w-8 h-8 text-brand" />
               </div>
               <div>
                  <span className="font-black text-[11px] uppercase tracking-[0.6em] text-brand block mb-2">Sensor Calibration</span>
                  <p className="text-lg font-bold text-slate-500 leading-relaxed">Align primary radiance at 45° to minimize chromatic aberration and highlight saturation.</p>
               </div>
            </div>
            <div className="p-10 bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/60 flex items-start gap-8 shadow-2xl group hover:bg-white/60 transition-all">
               <div className="w-16 h-16 rounded-[24px] bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:-rotate-12 transition-transform">
                  <Activity className="w-8 h-8 text-accent" />
               </div>
               <div>
                  <span className="font-black text-[11px] uppercase tracking-[0.6em] text-accent block mb-2">Neural Engine V5</span>
                  <p className="text-lg font-bold text-slate-500 leading-relaxed">Live uplink active. Cross-referencing 1.2M+ vegetative datasets across global biomes.</p>
               </div>
            </div>
          </div>
        </motion.div>
      ) : isAnalyzing ? (
        <div className="premium-card p-16 md:p-32 text-center flex flex-col items-center rounded-[80px] shadow-2xl relative overflow-hidden border border-white/60 bg-white/40 backdrop-blur-3xl">
           <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-brand to-transparent top-0 animate-scanning shadow-[0_0_20px_#00ff88]" />
           
           <div className="w-56 h-56 md:w-80 md:h-80 relative mb-16 p-2 bg-gradient-to-br from-brand/20 to-accent/20 rounded-[64px]">
              <div className="absolute inset-0 bg-brand/5 animate-pulse rounded-[64px]" />
              {image && <img src={image} className="w-full h-full object-cover rounded-[56px] opacity-40 grayscale" alt="Scanning" referrerPolicy="no-referrer" />}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute inset-0 border-t-4 border-brand/40 rounded-[64px]"
              />
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-[4px] bg-brand shadow-[0_0_40px_#00ff88] z-10"
              />
           </div>
           
           <h2 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-deep-green uppercase leading-none">Scanning...</h2>
           <p className="text-slate-500 font-bold text-xl md:text-3xl max-w-2xl mx-auto leading-relaxed px-4">
             Decoding molecular signatures and biological latency patterns within the genetic matrix.
           </p>

           <div className="mt-16 flex gap-5">
             {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ 
                   scale: [1, 1.8, 1],
                   backgroundColor: ["#E2E8F0", "#2D6A4F", "#E2E8F0"]
                 }}
                 transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                 className="w-5 h-5 rounded-full"
               />
             ))}
           </div>
        </div>
      ) : result && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12 md:space-y-20 px-2"
        >
          <div className="premium-card overflow-hidden rounded-[64px] border-white/60 shadow-2xl bg-white/40 backdrop-blur-3xl">
            <div className={`p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 ${result.severity === 'Critical' ? 'bg-rose-500/5' : 'bg-brand/5'}`}>
               <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 text-center md:text-left">
                  <div className={`w-28 h-28 md:w-36 md:h-36 rounded-[40px] flex items-center justify-center shadow-2xl border-4 border-white ${result.severity === 'Critical' ? 'bg-rose-500 text-white' : 'bg-deep-green text-white'}`}>
                     {result.severity === 'Critical' ? <AlertTriangle className="w-14 h-14 md:w-20 md:h-20" /> : <ShieldCheck className="w-14 h-14 md:w-20 md:h-20" />}
                  </div>
                  <div>
                     <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 mb-4 block">{t("diagnosis_found")}</span>
                  <h2 className="text-5xl md:text-7xl lg:text-9xl font-black text-deep-green tracking-tighter leading-none uppercase">{result.mostLikelyDiagnosis}</h2>
                  </div>
               </div>
               <div className={`text-${isRTL ? 'left' : 'right'}`}>
                  <span className="text-[11px] font-black block text-slate-400 uppercase tracking-[0.4em] mb-4">CONFIDENCE: {result.confidenceLevel}</span>
                  <span className={`px-10 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] border shadow-lg ${
                    result.severity === 'High' || result.severity === 'Critical' ? 'bg-rose-500 text-white border-rose-600' : 'bg-brand text-white border-brand-dark'
                  }`}>
                    {result.severity} PRIORITY
                  </span>
               </div>
            </div>

            <div className="p-10 md:p-24">
               <div className="mb-20 md:mb-32">
                  <h4 className="font-black text-xs md:text-sm uppercase tracking-[0.5em] text-brand mb-10 flex items-center gap-6">
                     <div className="w-12 h-[2px] bg-brand" /> Observation Summary
                  </h4>
                  <div className="p-10 md:p-16 bg-white/40 rounded-[48px] border border-white shadow-inner">
                    <p className="text-2xl md:text-4xl font-bold text-slate-600 leading-relaxed">
                      "{result.interpretation}"
                    </p>
                  </div>
               </div>

               <p className="text-3xl md:text-5xl font-black text-deep-green leading-tight mb-24 md:mb-36 border-l-8 border-brand pl-12 md:pl-20">
                 {result.explanation}
               </p>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-32">
                  <div className="space-y-16 md:space-y-24">
                    <div>
                      <h4 className="font-black text-xs md:text-sm uppercase tracking-[0.5em] text-slate-400 mb-10">
                         Biological Markers Identified
                      </h4>
                      <ul className="space-y-6 md:space-y-8">
                         {result.observedSymptoms.map((s, i) => (
                           <li key={i} className="text-xl md:text-2xl font-bold text-slate-500 flex items-start gap-8 p-8 md:p-10 bg-white/40 rounded-[32px] border border-white transition-all hover:bg-white hover:scale-105 duration-700 group cursor-default">
                              <CheckCircle className="w-8 h-8 text-brand mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" /> 
                              <span>{s}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-black text-xs md:text-sm uppercase tracking-[0.5em] text-slate-400 mb-10">
                         Genetic Variance Vectors
                      </h4>
                      <div className="flex flex-wrap gap-4 md:gap-6 mb-20 md:mb-32">
                        {result.possibleConditions.map((c, i) => (
                          <span key={i} className="px-10 py-5 bg-white border border-brand/20 rounded-[24px] text-sm md:text-base font-black text-deep-green shadow-xl tracking-tight">
                            {c}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-black text-xs md:text-sm uppercase tracking-[0.5em] text-accent mb-10">
                         Biosphere Safeguards
                      </h4>
                      <ul className="space-y-6 md:space-y-8">
                         {result.preventionTips?.map((tip, i) => (
                           <li key={i} className="text-sm md:text-base font-bold text-slate-400 flex items-start gap-8 p-8 md:p-10 bg-accent/5 rounded-[32px] border border-accent/10">
                              <ShieldCheck className="w-7 h-7 text-accent mt-1 flex-shrink-0" /> 
                              <span>{tip}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-deep-green rounded-[64px] p-12 md:p-20 border border-white/5 shadow-2xl relative overflow-hidden h-fit">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-brand/20 rounded-full blur-[100px] pointer-events-none" />
                     <h4 className="text-3xl md:text-5xl font-black mb-16 tracking-tighter text-white uppercase">Treatment Matrix</h4>
                     <div className="space-y-10 md:space-y-16 relative z-10">
                        {result.recommendedActions.slice(0, 4).map((step, i) => (
                          <div key={i} className="flex gap-10 group">
                             <div className="w-16 h-16 bg-white/10 text-brand rounded-[24px] flex items-center justify-center text-3xl font-black flex-shrink-0 border border-white/10 group-hover:bg-brand group-hover:text-deep-green group-hover:scale-110 transition-all duration-700">
                                {i + 1}
                             </div>
                             <p className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed group-hover:text-white transition-colors duration-700">{step}</p>
                          </div>
                        ))}
                     </div>
                     <button 
                       onClick={() => setShowGuided(true)}
                       className="w-full mt-20 py-8 bg-white text-deep-green rounded-full font-black flex items-center justify-center gap-6 text-xl md:text-2xl hover:bg-brand hover:scale-105 active:scale-95 transition-all shadow-2xl group"
                     >
                       Explore Full Roadmap <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform duration-700" />
                     </button>
                  </div>
               </div>
            </div>
            
            <div className="p-10 md:p-20 bg-brand/5 border-t border-brand/10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="flex items-center gap-10 text-center md:text-left flex-col md:flex-row">
                 <div className="w-20 h-20 bg-brand text-white rounded-[32px] flex items-center justify-center shadow-2xl rotate-12">
                   <Activity className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                   <p className="text-2xl md:text-4xl text-deep-green font-black uppercase tracking-widest leading-none">{t("recovery_journal")}</p>
                   <span className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[11px]">Biological Synchronization</span>
                 </div>
               </div>
               <button 
                 onClick={saveToTracker}
                 className="w-full md:w-auto px-16 py-8 bg-deep-green text-white rounded-full font-black transition-all shadow-2xl btn-press text-xl uppercase tracking-widest hover:scale-105 active:scale-95"
               >
                 {t("start_monitoring")}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <button 
               onClick={() => { setResult(null); setImage(null); }}
               className="py-8 bg-white/20 border-4 border-dashed border-slate-200 rounded-[48px] text-slate-400 font-black uppercase tracking-[0.4em] hover:bg-white hover:text-brand hover:border-brand transition-all flex items-center justify-center gap-6 text-sm btn-press group"
            >
               <RefreshCcw className="w-7 h-7 group-hover:rotate-180 transition-transform duration-1000" /> NEW BIOSAMPLE
            </button>

            <button 
               onClick={saveDiagnosisToHistory}
               disabled={isSaving}
               className="py-8 bg-deep-green text-white rounded-[48px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 text-sm btn-press shadow-2xl border-4 border-brand"
            >
               {isSaving ? <RefreshCcw className="w-7 h-7 animate-spin" /> : <CheckCircle className="w-7 h-7" />} 
               COMMIT TO DATABASE
            </button>
          </div>
        </motion.div>
      )}

      {/* Guided Steps Modal */}
      <AnimatePresence>
        {showGuided && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 overflow-y-auto">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowGuided(false)}
               className="fixed inset-0 bg-deep-green/60 backdrop-blur-3xl"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 100 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 100 }}
               className="relative bg-white w-full max-w-4xl rounded-[80px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border-4 border-white"
            >
               <div className="p-12 md:p-24">
                 <div className="flex items-center justify-between mb-20">
                   <div>
                     <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand mb-4 block">Sequence Analysis</span>
                     <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-deep-green leading-none">Treatment Flow.</h2>
                   </div>
                   <button onClick={() => setShowGuided(false)} className="p-6 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-[32px] text-slate-400 transition-all btn-press shadow-xl">
                     <X className="w-8 h-8" />
                   </button>
                 </div>
                 
                 <div className="space-y-12 md:space-y-16">
                   {result.recommendedActions.map((step, i) => (
                      <div key={i} className="flex gap-10 items-start group">
                        <div className="w-20 h-20 bg-slate-50 group-hover:bg-deep-green text-slate-300 group-hover:text-brand rounded-[32px] flex items-center justify-center font-black text-4xl flex-shrink-0 shadow-lg border border-slate-100 transition-all duration-700">
                           {i + 1}
                        </div>
                        <div className="pt-4">
                           <p className="text-2xl md:text-3xl font-bold text-slate-500 leading-relaxed group-hover:text-deep-green group-hover:translate-x-4 transition-all duration-700">{step}</p>
                           {i === 0 && (
                             <div className="flex items-center gap-4 mt-6 p-3 bg-brand/5 rounded-full w-fit px-8 border border-brand/20">
                                <div className="w-3 h-3 bg-brand rounded-full animate-pulse shadow-[0_0_15px_#00ff88]" />
                                <span className="text-[11px] font-black text-brand uppercase tracking-[0.4em]">Critical Initialization</span>
                             </div>
                           )}
                        </div>
                      </div>
                   ))}
                 </div>

                 <button 
                    onClick={() => setShowGuided(false)}
                    className="w-full mt-24 md:mt-32 py-8 bg-deep-green text-white rounded-full font-black text-xl md:text-2xl shadow-2xl btn-press uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all"
                 >
                    Acknowledge & Implement
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
