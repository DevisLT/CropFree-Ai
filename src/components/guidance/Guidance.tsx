import React from "react";
import { motion } from "motion/react";
import { Shield, Bug, Search, Activity, Droplets, Thermometer, Database, Zap, Sparkles, ArrowUpRight, CheckCircle2, ChevronRight, Layout, Globe, Microscope } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Guidance() {
  const { t } = useLanguage();

  const gridItems = [
    { label: "Pest Migration", value: "Minimal", trend: "-5%", status: "Nominal", icon: Bug, color: "text-brand" },
    { label: "Ground Saturation", value: "Optimal", trend: "+2%", status: "Balanced", icon: Droplets, color: "text-accent" },
    { label: "Thermal Density", value: "24°C", trend: "Stable", status: "Nominal", icon: Thermometer, color: "text-emerald-500" },
    { label: "Bio-Waste Index", value: "Low", trend: "-12%", status: "Efficient", icon: Activity, color: "text-brand" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-20 py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-[2px] w-16 bg-brand/30" />
            <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Planetary Biosecurity</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-deep-green leading-none drop-shadow-sm uppercase">Guidance.</h2>
          <p className="text-slate-500 text-lg md:text-2xl font-medium mt-10 leading-relaxed max-w-4xl">
            "High-resolution biosecurity monitoring. Defending genetic integrity through real-time molecular surveillance."
          </p>
        </div>
        <div className="w-24 h-24 bg-brand/10 border-4 border-white rounded-[32px] flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-all duration-700">
           <Shield className="w-12 h-12 text-brand" />
        </div>
      </header>

      {/* Feature Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
         {/* Soil Analysis Profile */}
         <div className="xl:col-span-8">
            <div className="premium-card p-12 md:p-24 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[80px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
               <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
               
               <div className="relative z-10 flex flex-col lg:flex-row gap-16 md:gap-24">
                  <div className="flex-1">
                     <div className="flex items-center gap-6 mb-8">
                        <Microscope className="w-8 h-8 text-brand" />
                        <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand">Genetic Matrix Diagnostic</span>
                     </div>
                     <h3 className="text-3xl md:text-6xl font-black text-deep-green tracking-tighter mb-12 uppercase leading-none">Soil Profile.</h3>
                     <p className="text-lg md:text-2xl font-bold text-slate-500 leading-relaxed mb-16 opacity-80">
                       "Detailed structural analysis of the lithosphere. Synchronizing mineral density with planetary growth cycles."
                     </p>
                     
                     <div className="grid grid-cols-2 gap-12 mt-12">
                        {[
                          { label: "NITROGEN", val: "High" },
                          { label: "PH LEVEL", val: "6.8" },
                          { label: "POTASSIUM", val: "Optimal" },
                          { label: "MINERALS", val: "Rich" }
                        ].map((m, i) => (
                          <div key={i} className="space-y-4 border-l-4 border-brand/20 pl-8">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m.label}</span>
                             <p className="text-2xl font-black text-deep-green">{m.val}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="w-full lg:w-96 space-y-12">
                     <div className="p-10 bg-deep-green rounded-[56px] border-4 border-white shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-[40px] pointer-events-none" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-6 block">Neural Score</span>
                        <div className="flex items-baseline gap-4 mb-8">
                           <span className="text-6xl font-black tracking-tighter leading-none">92</span>
                           <span className="text-xl font-black text-brand">PT</span>
                        </div>
                        <p className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] leading-tight">
                          BIOSYSTEMS INTEGRITY RATING
                        </p>
                     </div>
                     <div className="p-10 bg-white border border-brand/10 rounded-[56px] shadow-xl group">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand mb-6 block">Next Sync</span>
                        <div className="flex items-center justify-between">
                           <p className="text-3xl font-black text-deep-green uppercase tracking-tighter">14 JUN</p>
                           <Zap className="w-8 h-8 text-brand animate-pulse" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Mini Metrics */}
         <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-12">
            {gridItems.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05 }}
                className="premium-card p-10 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[56px] shadow-2xl group flex flex-col justify-between"
              >
                 <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl ${item.color} bg-white shadow-xl flex items-center justify-center border border-slate-100 group-hover:rotate-12 transition-transform duration-700`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">{item.label}</span>
                       <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{item.trend} DELTA</span>
                    </div>
                 </div>
                 <div>
                    <h4 className="text-4xl font-black text-deep-green tracking-tighter leading-none mb-4 uppercase">{item.value}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">{item.status} Status</span>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Pest Detection Detailed Section */}
      <section className="space-y-12">
         <div className="flex items-end justify-between px-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand block">Tactical Matrix</span>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-deep-green leading-none uppercase">Pest Surveillance.</h3>
            </div>
            <button className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 hover:text-brand transition-all flex items-center gap-4 group pb-4 border-b border-transparent hover:border-brand">
               Expanded Log <ArrowUpRight className="w-7 h-7 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
            {[
              { name: "APHID CLUSTERS", risk: "Low", area: "Sector B4", time: "2h ago", icon: Database },
              { name: "FUNGAL LATENCY", risk: "Elevated", area: "Global Axis", time: "Live", icon: Shield },
              { name: "ROOT VECTOR", risk: "Neutral", area: "Hydro-Hub", time: "12h ago", icon: Activity }
            ].map((p, i) => (
              <div key={i} className="premium-card p-12 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[64px] shadow-2xl flex flex-col justify-between group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-brand/10 transition-all duration-1000" />
                 <div className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Bio-Marker Capture</span>
                       <div className={`w-3 h-3 rounded-full animate-pulse shadow-glow ${p.risk === 'Elevated' ? 'bg-rose-500 shadow-rose-500/40' : 'bg-brand'}`} />
                    </div>
                    <h5 className="text-2xl font-black text-deep-green tracking-tighter uppercase leading-none">{p.name}</h5>
                    <div className="flex items-center gap-6 border-b border-slate-100 pb-8">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">{p.area}</p>
                       <span className="opacity-20 text-slate-400">|</span>
                       <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">{p.time}</p>
                    </div>
                 </div>
                 <div className="mt-12 flex items-center justify-between relative z-10">
                    <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${p.risk === 'Elevated' ? 'text-rose-500' : 'text-brand'}`}>
                      {p.risk} Priority
                    </span>
                    <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl group-hover:bg-deep-green group-hover:text-white transition-all duration-700">
                       <ChevronRight className="w-6 h-6" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <div className="flex items-center justify-center py-20">
         <div className="flex items-center gap-8 text-slate-300 font-black uppercase tracking-[0.8em] text-[12px]">
            <Sparkles className="w-6 h-6 text-brand" />
            Planetary Surveillance Active
         </div>
      </div>
    </div>
  );
}
