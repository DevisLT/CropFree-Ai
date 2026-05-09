import React from "react";
import { BookOpen, PlayCircle, HelpCircle, FileText, ChevronRight, Zap, Search, MessageSquare, Compass, Terminal, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function GuidanceCenter() {
   const sections = [
    { 
      title: "Neural Tutorials", 
      description: "Visual protocols to master the biometric monitoring platform.",
      icon: PlayCircle, 
      color: "bg-brand/10 text-brand",
      items: ["Initialization Sequence", "Tracker Deployment", "Neural Synchronization"]
    },
    { 
      title: "Biological Almanac", 
      description: "A comprehensive digital library of known biological anomalies.",
      icon: BookOpen, 
      color: "bg-accent/10 text-accent",
      items: ["Rice Pathogens", "Maize Nutrition Deficiencies", "Wheat & Grain Rust"]
    },
    { 
      title: "Scanning Precision", 
      description: "Master high-fidelity agricultural documentation protocols.",
      icon: Zap, 
      color: "bg-brand/10 text-brand",
      items: ["Photon Optimization", "Symptom Tracking", "Environmental Context"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 md:px-12 space-y-24">
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto">
         <motion.div 
           initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
           animate={{ opacity: 1, scale: 1, rotate: 6 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-12 border border-white/10 shadow-2xl group hover:rotate-0 transition-transform duration-700 relative"
         >
           <div className="absolute inset-0 bg-brand/5 blur-2xl rounded-full" />
           <Compass className="w-12 h-12 text-brand relative z-10" />
         </motion.div>
         
         <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-brand/30" />
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand">Central Information Repository</span>
            <div className="h-[1px] w-12 bg-brand/30" />
         </div>

         <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 text-white leading-none uppercase">Intelligence.</h2>
         <p className="text-slate-500 text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed max-w-3xl">
            "Knowledge is the primary catalyst for planetary restoration. Access the full spectrum of biometric data."
         </p>
         
         <div className="mt-20 w-full relative group">
            <div className="absolute -inset-4 bg-brand/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-white/5 rounded-[40px] border border-white/5 flex items-center p-4 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="pl-8 pr-6">
                <Search className="w-8 h-8 text-slate-700 group-focus-within:text-brand transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Query database for pathogens, tips, or protocols..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-black text-white placeholder:text-slate-800 py-6 uppercase tracking-tight"
              />
              <button className="bg-brand text-slate-950 px-12 py-6 rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_#00ff8840] relative overflow-hidden group/btn">
                <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                <span className="relative z-10">Execute Query</span>
              </button>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {sections.map((section, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            className="premium-card p-12 flex flex-col h-full rounded-[48px] border border-white/5 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-12 border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${section.color}`}>
               <section.icon className="w-10 h-10" />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tighter text-white leading-tight uppercase">{section.title}</h3>
            <p className="text-slate-500 font-bold text-sm mb-12 leading-relaxed">"{section.description}"</p>
            
            <div className="space-y-4 flex-1">
               {section.items.map((item, j) => (
                 <button key={j} className="w-full text-left p-6 bg-white/5 hover:bg-white/10 rounded-[20px] transition-all text-xs font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] flex items-center justify-between group/item border border-white/5 hover:border-brand/20 shadow-xl">
                    {item} <ChevronRight className="w-5 h-5 text-brand opacity-0 group-hover/item:opacity-100 translate-x-4 group-hover/item:translate-x-0 transition-all" />
                 </button>
               ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Support Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20">
        {/* FAQ Banner */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-16 bg-slate-900 border border-white/5 flex flex-col justify-between rounded-[48px] relative overflow-hidden group shadow-2xl"
        >
           <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full blur-[120px] opacity-20 pointer-events-none" />
           <div className="relative z-10">
              <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mb-12 shadow-2xl">
                  <HelpCircle className="w-10 h-10 text-slate-500" />
              </div>
              <h4 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-white uppercase">Common<br />Anomalies.</h4>
              <p className="text-slate-500 text-[10px] font-black mb-16 uppercase tracking-[0.5em]">Protocol assistance & infrastructure support.</p>
           </div>
           <button className="relative z-10 w-fit px-12 py-8 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-6 hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              Knowledge Base <Terminal className="w-6 h-6 text-brand" />
           </button>
        </motion.div>

        {/* AI Expert Banner */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-16 bg-white/5 border border-white/5 flex flex-col justify-between rounded-[48px] relative overflow-hidden group shadow-2xl backdrop-blur-3xl"
        >
           <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[150px] opacity-20 pointer-events-none" />
           <div className="relative z-10">
              <div className="w-20 h-20 bg-brand/20 text-brand rounded-3xl shadow-2xl flex items-center justify-center mb-12 border border-brand/20">
                  <MessageSquare className="w-10 h-10" />
              </div>
              <h4 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-white uppercase">Expert<br />Liaison.</h4>
              <p className="text-slate-500 text-[10px] font-black mb-16 uppercase tracking-[0.5em]">Direct uplink to specialized agricultural nodes.</p>
           </div>
           <button className="relative z-10 w-fit px-12 py-8 bg-brand text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-6 hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(0,255,136,0.2)] group/btn relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
              Uplink Connection <Zap className="w-6 h-6" />
           </button>
        </motion.div>
      </div>

      <div className="flex flex-col items-center py-12">
        <div className="flex items-center gap-4 mb-4">
           <Shield className="w-5 h-5 text-brand" />
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Verified Information Node: 782-Sigma</p>
        </div>
        <div className="w-1 h-32 bg-gradient-to-b from-brand to-transparent opacity-20" />
      </div>
    </div>
  );
}
