import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, MessageSquare, Sparkles, TrendingUp, Droplets, Sun, Wind, ArrowRight, ShieldCheck, Cpu, Terminal, Activity } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Coach() {
  const { t } = useLanguage();
  const [activeInsight, setActiveInsight] = useState(0);

  const insights = [
    {
      title: "Atmospheric Optimization",
      value: "+12.4%",
      metric: "Projected Yield Expansion",
      description: "Current high-pressure systems in the North-East sector indicate a prime window for nitrogen-rich bio-seeding protocols.",
      icon: Wind,
      color: "text-brand",
      bg: "bg-brand/10"
    },
    {
      title: "Resource Efficiency",
      value: "89/100",
      metric: "Neural Integrity Index",
      description: "Hydration vectors are currently synchronized with the 72-hour precipitation forecast, reducing waste by 22% compared to last cycle.",
      icon: Droplets,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "Plantation Health",
      value: "Stable",
      metric: "Gene-Matrix Status",
      description: "Infrared terminal data across 'Zone Alpha' confirms cellular stability and optimal chlorophyll density in recent canopy scans.",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-20 py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-[2px] w-16 bg-brand/30" />
            <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Neural Farming Hub</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-deep-green leading-none drop-shadow-sm uppercase">Coach.</h2>
          <p className="text-slate-500 text-lg md:text-2xl font-medium mt-10 leading-relaxed max-w-4xl">
            "Direct interface with our recursive AI engine. Real-time decision synthesis for the modern botanical architect."
          </p>
        </div>
        <div className="flex items-center gap-4 px-10 py-5 bg-white border border-brand/10 rounded-full shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-x-0 bottom-0 h-1 bg-brand animate-pulse" />
           <Cpu className="w-6 h-6 text-brand" />
           <span className="text-[11px] font-black uppercase tracking-[0.5em] text-deep-green">Engine: V9.4-PRO</span>
        </div>
      </header>

      {/* AI Chat Interface Mockup/Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Main Insights Panel */}
        <div className="xl:col-span-8 space-y-12">
          <div className="premium-card p-12 md:p-20 bg-deep-green text-white relative overflow-hidden rounded-[80px] shadow-2xl border-none">
             <div className="absolute top-0 right-0 w-80 h-80 bg-brand/30 rounded-full blur-[120px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
             
             <div className="relative z-10 flex flex-col md:flex-row gap-16">
               <div className="flex-1 space-y-12">
                 <div className="space-y-4">
                   <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand block">Current Recommendation</span>
                   <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-8">Execute Bio-Sync Sequence.</h3>
                   <p className="text-white/60 text-lg md:text-2xl font-medium leading-relaxed max-w-2xl">
                     "Neural scans detect early nitrogen deficiency in the South-East quadrant. Recommend immediate application of V-3 formulation to prevent yield loss."
                   </p>
                 </div>
                 
                 <div className="flex flex-wrap gap-8">
                   <button className="px-16 py-8 bg-brand text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(45,106,79,0.3)] border-4 border-white/20">
                     Deploy Drones
                   </button>
                   <button className="px-16 py-8 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all border-2 border-white/10">
                     Analyze Alternatives
                   </button>
                 </div>
               </div>
               
               <div className="w-full md:w-80 flex flex-col justify-between p-10 bg-white/5 rounded-[56px] border border-white/10 backdrop-blur-3xl shadow-inner">
                 <div className="space-y-8">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">RISK DELTA</span>
                     <span className="text-brand font-black">LOW</span>
                   </div>
                   <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black text-white tracking-tighter">94%</span>
                      <TrendingUp className="w-8 h-8 text-brand" />
                   </div>
                   <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                     Success probability based on current atmospheric telemetry.
                   </p>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full mt-10 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "94%" }}
                     transition={{ duration: 2, ease: "easeOut" }}
                     className="h-full bg-brand shadow-[0_0_15px_#00ff88]"
                   />
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {insights.map((insight, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="premium-card p-12 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[64px] shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-10">
                    <insight.icon className={`w-10 h-10 ${insight.color} opacity-20 group-hover:opacity-100 transition-opacity duration-700`} />
                  </div>
                  <div className="space-y-8 relative z-10">
                    <div>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 block">{insight.title}</span>
                      <div className="flex items-baseline gap-6">
                        <span className="text-5xl font-black text-deep-green tracking-tighter leading-none">{insight.value}</span>
                        <span className="text-sm font-black text-slate-300 uppercase tracking-widest">{insight.metric}</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-slate-500 leading-relaxed border-l-4 border-brand/20 pl-8">
                       "{insight.description}"
                    </p>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>

        {/* AI Assistant Log / Feed */}
        <div className="xl:col-span-4 space-y-12">
           <div className="premium-card p-12 bg-white/40 border-4 border-white backdrop-blur-3xl rounded-[64px] shadow-2xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                       <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-[13px] font-black uppercase tracking-[0.5em] text-deep-green">Telemetry Log</h4>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_#00ff88]" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">LIVE</span>
                 </div>
              </div>

              <div className="space-y-8 flex-1 overflow-y-auto px-2 custom-scrollbar">
                {[
                  { time: "09:42", msg: "Thermal scan of Base 4 confirmed 3% increase in transpiration rates.", type: "system" },
                  { time: "10:15", msg: "PH sensors in Grid-Beta reporting optimal mineral saturation.", type: "success" },
                  { time: "11:05", msg: "Strategic fertilization window opening in 14 hours.", type: "alert" },
                  { time: "11:30", msg: "Neural Engine re-calibrating for North-Sector wind shifts.", type: "system" }
                ].map((log, i) => (
                  <div key={i} className="flex gap-6 group">
                     <span className="text-[11px] font-black text-brand tabular-nums shrink-0 mt-1 tracking-widest">{log.time}</span>
                     <p className="text-sm font-bold text-slate-500 leading-relaxed group-hover:text-deep-green transition-colors">
                        {log.msg}
                     </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100">
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                       <MessageSquare className="h-6 w-6 text-brand opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    <input 
                       disabled
                       placeholder="ASK THE NEURAL ENGINE..." 
                       className="w-full pl-20 pr-8 py-8 bg-white border border-slate-100 rounded-[32px] text-xs font-black uppercase tracking-[0.3em] text-deep-green placeholder:text-slate-200 shadow-inner focus:border-brand transition-all cursor-not-allowed"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-6">
                       <div className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-300 tracking-widest">
                          PRO ONLY
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="premium-card p-12 bg-accent text-white rounded-[56px] shadow-2xl relative overflow-hidden group border-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[50px] pointer-events-none group-hover:scale-150 transition-all duration-1000" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-6">
                    <Terminal className="w-7 h-7 text-white/50" />
                    <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/60">Systems Advice</span>
                 </div>
                 <p className="text-2xl font-bold leading-relaxed">
                   "Agricultural complexity is reduced through binary optimization. Trust the neural sequence."
                 </p>
                 <ArrowRight className="w-10 h-10 ml-auto opacity-20 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-700" />
              </div>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-20">
         <div className="flex items-center gap-8 text-slate-300 font-black uppercase tracking-[0.8em] text-[12px]">
            <Sparkles className="w-6 h-6 text-brand" />
            Bio-Intelligence Uplink Optimized
         </div>
      </div>
    </div>
  );
}
