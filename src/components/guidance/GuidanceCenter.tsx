import React from "react";
import { BookOpen, PlayCircle, HelpCircle, FileText, ChevronRight, Zap, Search, MessageSquare, Compass } from "lucide-react";

export default function GuidanceCenter() {
   const sections = [
    { 
      title: "Interactive Tutorials", 
      description: "Visual protocols to master the biometric monitoring platform.",
      icon: PlayCircle, 
      color: "bg-slate-50 text-slate-400 group-hover:text-brand",
      items: ["Initialization Guide", "Tracker Deployment", "Neural Synchronization"]
    },
    { 
      title: "Botanical Almanac", 
      description: "A comprehensive digital library of known biological anomalies.",
      icon: BookOpen, 
      color: "bg-slate-50 text-slate-400 group-hover:text-brand",
      items: ["Rice Pathogens", "Maize Nutrition Deficiencies", "Wheat & Grain Rust"]
    },
    { 
      title: "Scanning Precision", 
      description: "Master high-fidelity agricultural documentation protocols.",
      icon: Zap, 
      color: "bg-slate-50 text-slate-400 group-hover:text-brand",
      items: ["Photon Optimization", "Symptom Tracking", "Environmental Context"]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <header className="flex flex-col items-center text-center px-4 mb-20">
         <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-10 border border-slate-100 rotate-6 shadow-inner group hover:rotate-0 transition-transform duration-500">
           <Compass className="w-10 h-10 text-brand" />
         </div>
         <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-slate-950">Resource Hub.</h2>
         <p className="text-slate-500 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed opacity-80">
            "Biometric knowledge is the primary yield enhancer. Precision science for the modern grower."
         </p>
         
         <div className="mt-16 w-full max-w-2xl relative group">
            <div className="absolute inset-0 bg-brand/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white rounded-[32px] border border-slate-50 flex items-center p-3 shadow-2xl shadow-slate-900/5">
              <div className="pl-6 pr-4">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <input 
                type="text" 
                placeholder="Query database for pathogens, tips, or protocols..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-black text-slate-950 placeholder:text-slate-300 py-4"
              />
              <button className="bg-slate-950 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                Execute Search
              </button>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {sections.map((section, i) => (
          <div key={i} className="bg-white p-10 flex flex-col h-full rounded-[48px] border-none shadow-premium hover:shadow-brand/10 transition-all duration-700 group cursor-pointer">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-10 border border-slate-50 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:bg-brand/10 ${section.color}`}>
               <section.icon className="w-8 h-8 transition-colors" />
            </div>
            <h3 className="text-3xl font-black mb-4 tracking-tighter text-slate-950 leading-tight">{section.title}</h3>
            <p className="text-slate-400 font-bold text-xs mb-10 leading-relaxed opacity-70">"{section.description}"</p>
            
            <div className="space-y-4 flex-1">
               {section.items.map((item, j) => (
                 <button key={j} className="w-full text-left p-4 bg-slate-50 hover:bg-white rounded-[20px] transition-all text-[11px] font-black text-slate-500 hover:text-slate-950 uppercase tracking-widest flex items-center justify-between group/item border border-transparent hover:border-slate-100 shadow-sm hover:shadow-xl">
                    {item} <ChevronRight className="w-4 h-4 text-brand opacity-0 group-hover/item:opacity-100 translate-x-2 group-hover/item:translate-x-0 transition-all" />
                 </button>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
        {/* FAQ Banner */}
        <div className="p-12 bg-slate-950 text-white flex flex-col justify-between rounded-[48px] relative overflow-hidden group border-none shadow-2xl shadow-slate-950/20">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[100px]" />
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/5 rounded-[24px] border border-white/5 flex items-center justify-center mb-10">
                  <HelpCircle className="w-8 h-8 text-white/40" />
              </div>
              <h4 className="text-4xl font-black tracking-tighter mb-4 leading-tight">Common<br />Anomalies.</h4>
              <p className="text-white/30 text-sm font-bold mb-12 uppercase tracking-widest">Billing, privacy, and technical directives.</p>
           </div>
           <button className="relative z-10 w-fit px-10 py-6 bg-white text-slate-950 rounded-[28px] font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl">
              Knowledge Base <FileText className="w-5 h-5 text-brand" />
           </button>
        </div>

        {/* AI Expert Banner */}
        <div className="p-12 bg-white border border-brand/5 flex flex-col justify-between rounded-[48px] relative overflow-hidden group shadow-premium hover:shadow-brand/20 transition-all duration-700">
           <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-brand/5 rounded-full blur-[100px]" />
           <div className="relative z-10">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-[24px] shadow-inner flex items-center justify-center mb-10">
                  <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-black tracking-tighter mb-4 leading-tight text-slate-950">Expert<br />Liaison.</h4>
              <p className="text-slate-400 text-sm font-bold mb-12 uppercase tracking-widest">Request specialized analysis for complex phenotypes.</p>
           </div>
           <button className="relative z-10 w-fit px-10 py-6 bg-brand text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand/20">
              Uplink to Expert <ChevronRight className="w-5 h-5 text-emerald-200" />
           </button>
        </div>
      </div>
    </div>
  );
}
