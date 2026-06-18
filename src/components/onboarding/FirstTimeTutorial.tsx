import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, ShieldCheck, Sparkles, Search, Activity, ListChecks, ChevronRight, ChevronLeft, Check, Compass, Cpu, HelpCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface FirstTimeTutorialProps {
  onComplete: () => void;
}

export default function FirstTimeTutorial({ onComplete }: FirstTimeTutorialProps) {
  const [slideIndex, setSlideIndex] = useState(0); // 0 = Welcome, 1..4 = Steps, 5 = Completion
  const { t } = useLanguage();

  const handleNext = () => {
    setSlideIndex((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    setSlideIndex(5); // Skip directly to completion
  };

  // Modern Agritech icons and graphics represent each step
  const renderSlideIllustration = (index: number) => {
    switch (index) {
      case 1:
        return (
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            {/* Pulsing radar circle background */}
            <motion.div 
              animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-brand/20 blur-xl"
            />
            <div className="relative w-36 h-36 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl overflow-hidden">
              <Search className="w-16 h-16 text-brand" />
              {/* Green holographic laser horizontal scan line effect */}
              <motion.div 
                animate={{ y: ["-100%", "280%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_12px_#2ECC71] top-10"
              />
            </div>
            <div className="absolute -bottom-2 bg-brand/10 border border-brand/20 px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-brand">
              AI Scanning Matrix
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-2 border border-dashed border-white/10 rounded-full"
            />
            {/* Timeline connectors and checkpoints */}
            <div className="relative flex flex-col justify-between w-40 h-28 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-brand/20 border border-brand flex items-center justify-center text-[8px] text-brand font-bold">1</div>
                <div className="h-px flex-1 bg-white/10" />
                <div className="w-3.5 h-3.5 rounded-full bg-brand/20 border border-brand flex items-center justify-center text-[8px] text-brand font-bold">2</div>
                <div className="h-px flex-1 bg-white/10" />
                <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center text-[9px] text-slate-950 font-bold">✓</div>
              </div>
              <div className="text-left space-y-1">
                <p className="text-[10px] font-semibold text-white truncate">Treatment sequence</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "25%" }}
                    animate={{ width: "85%" }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 4 }}
                    className="h-full bg-brand rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 bg-brand/10 border border-[#2ECC71]/20 px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-brand">
              Track Healing Paths
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-brand/5 blur-2xl" />
            <div className="relative w-40 p-4 rounded-xl bg-[#0F141C] border border-[#2ECC71]/20 shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Cpu className="w-3.5 h-3.5 text-brand" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Farming Coach</span>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[11px] font-bold text-white">Suggested Practice</p>
                <p className="text-[9px] font-medium text-slate-400 leading-tight">Apply bio-mulch during moisture dips to preserve soil temperature.</p>
              </div>
              <div className="flex justify-end">
                <span className="text-[8px] bg-brand/15 text-brand px-1.5 py-0.5 rounded font-black uppercase">Adaptive</span>
              </div>
            </div>
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-4 right-4 bg-brand rounded-lg p-1.5 border border-white/20 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            </motion.div>
          </div>
        );
      case 4:
        return (
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <div className="absolute inset-5 border border-[#2ECC71]/10 rounded-xl" />
            <div className="relative w-40 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 text-left">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block font-mono">Primary Indicators</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/5 p-1 px-2 rounded-md">
                   <p className="text-[7px] text-slate-400 font-bold font-mono">HEALTH %</p>
                   <p className="text-xs font-bold text-brand">98.4%</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-1 px-2 rounded-md">
                   <p className="text-[7px] text-slate-400 font-bold font-mono">SOIL PH</p>
                   <p className="text-xs font-bold text-[#C8A96B]">6.5</p>
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="w-3/4 h-full bg-brand" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0E1116] text-slate-200 flex items-center justify-center p-4 overflow-y-auto font-sans selection:bg-brand/10 selection:text-brand">
      {/* Premium subtle backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[10%] top-[15%] w-[400px] h-[400px] rounded-full bg-[#2ECC71]/4 blur-3xl" />
        <div className="absolute right-[10%] bottom-[15%] w-[450px] h-[450px] rounded-full bg-[#0B3D2E]/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#2ECC71_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <AnimatePresence mode="wait">
        {slideIndex === 0 && (
          /* Welcome Screen */
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.4 }}
            className="relative max-w-xl w-full p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] shadow-[0_24px_50px_rgba(0,0,0,0.4)] text-center space-y-8"
          >
            {/* Glowing Logo */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#2ECC71]/15 blur-xl animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#0B3D2E] flex items-center justify-center shadow-lg border border-white/20">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.3em] block">{t("tutorial_tag")}</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
                {t("tutorial_title").split("Smart Agritech AI")[0]}<span className="text-[#2ECC71]">Smart Agritech AI</span>{t("tutorial_title").split("Smart Agritech AI")[1]}
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md mx-auto">
                {t("tutorial_desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <button
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-xl bg-brand text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#52E28F] transition-all duration-200 shadow-lg shadow-brand/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 order-reverse sm:order-last"
              >
                {t("tutorial_get_started")}
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3.5 px-6 rounded-xl bg-white/[0.04] text-slate-400 border border-white/[0.05] hover:border-white/10 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                {t("tutorial_skip_intro")}
              </button>
            </div>
            
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
               {t("tutorial_ready_yields")}
            </div>
          </motion.div>
        )}

        {/* Wizard Multi-Step Slide (1 to 4) */}
        {slideIndex >= 1 && slideIndex <= 4 && (
          <motion.div
            key={`slide-${slideIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative max-w-xl w-full p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] shadow-[0_24px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between min-h-[460px]"
          >
            {/* Header progress info */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
              <span className="text-brand">{t("tutorial_system_guidance")}</span>
              <span>{t("tutorial_slide")} {slideIndex} {t("tutorial_of")} 4</span>
            </div>

            {/* Render Slide Illustration Graphic */}
            <div className="py-6">
              {renderSlideIllustration(slideIndex)}
            </div>

            {/* Slide Text Content */}
            <div className="text-center space-y-2 mt-2">
              {slideIndex === 1 && (
                <>
                  <h3 className="text-xl font-bold text-white">{t("tutorial_disease_title")}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {t("tutorial_disease_desc")}
                  </p>
                </>
              )}
              {slideIndex === 2 && (
                <>
                  <h3 className="text-xl font-bold text-white">{t("tutorial_recovery_title")}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {t("tutorial_recovery_desc")}
                  </p>
                </>
              )}
              {slideIndex === 3 && (
                <>
                  <h3 className="text-xl font-bold text-white">{t("tutorial_smart_title")}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {t("tutorial_smart_desc")}
                  </p>
                </>
              )}
              {slideIndex === 4 && (
                <>
                  <h3 className="text-xl font-bold text-white">{t("tutorial_dashboard_title")}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {t("tutorial_dashboard_desc")}
                  </p>
                </>
              )}
            </div>

            {/* Navigation buttons and progress indicators */}
            <div className="border-t border-white/[0.04] pt-6 mt-8 flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 text-slate-400 hover:text-white transition-all duration-200 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("tutorial_prev_btn")}
              </button>

              {/* Step indicator dots */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      slideIndex === step ? "w-6 bg-brand" : "w-1.5 bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2.5 px-4 rounded-xl bg-brand text-slate-950 hover:bg-[#52E28F] transition-all duration-200 flex items-center gap-1 text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/10"
              >
                {t("tutorial_next_btn")}
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Completion Screen */}
        {slideIndex === 5 && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative max-w-xl w-full p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] shadow-[0_24px_50px_rgba(0,0,0,0.4)] text-center space-y-8"
          >
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#2ECC71]/20 blur-2xl animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-lg border border-white/20">
                <Check className="w-8 h-8 text-slate-950 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.3em] block">{t("tutorial_calib_complete_tag")}</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {t("tutorial_calib_complete_title")}
              </h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                {t("tutorial_calib_complete_desc")}
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-4 rounded-xl bg-brand hover:bg-[#52E28F] text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-brand/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {t("tutorial_enter_dashboard_btn")}
              <Compass className="w-4 h-4 text-slate-950" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
